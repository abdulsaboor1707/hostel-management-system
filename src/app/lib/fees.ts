import { pool } from "@/app/lib/db";

export async function getFees() {
  const result = await pool.query(`
    SELECT
      f.fee_id,
      f.resident_id,
      r.first_name,
      r.last_name,
      f.fee_month,
      f.amount,
      COALESCE(SUM(p.amount_paid), 0) AS total_paid,
      f.amount - COALESCE(SUM(p.amount_paid), 0) AS balance,
      f.due_date,
      CASE
        WHEN COALESCE(SUM(p.amount_paid), 0) = 0
          THEN 'unpaid'
        WHEN COALESCE(SUM(p.amount_paid), 0) < f.amount
          THEN 'partial'
        ELSE 'paid'
      END AS calculated_status
    FROM fees f
    JOIN residents r
      ON r.resident_id = f.resident_id
    LEFT JOIN payments p
      ON p.fee_id = f.fee_id
    GROUP BY
      f.fee_id,
      f.resident_id,
      r.first_name,
      r.last_name,
      f.fee_month,
      f.amount,
      f.due_date
    ORDER BY f.fee_month DESC, r.first_name, r.last_name
  `);

  return result.rows;
}

export async function getFeeGenerationPreview(month: string) {
  const match = month.match(/^(\d{4})-(\d{2})$/);

  if (!match) {
    throw new Error("Please select a valid fee month.");
  }

  const year = Number(match[1]);
  const monthNumber = Number(match[2]);

  if (
    !Number.isInteger(year) ||
    year < 1 ||
    year > 9999 ||
    monthNumber < 1 ||
    monthNumber > 12
  ) {
    throw new Error("Please select a valid fee month.");
  }

  const result = await pool.query(
    `
    WITH month_bounds AS (
      SELECT
        make_date($1::int, $2::int, 1) AS first_day,
        (
          make_date($1::int, $2::int, 1)
          + INTERVAL '1 month'
          - INTERVAL '1 day'
        )::date AS last_day,
        EXTRACT(
          DAY FROM (
            make_date($1::int, $2::int, 1)
            + INTERVAL '1 month'
            - INTERVAL '1 day'
          )
        )::int AS days_in_month
    ),
    allocation_days AS (
      SELECT
        ra.resident_id,
        ra.allocation_id,
        ra.monthly_fee,
        (
          LEAST(
            COALESCE(ra.vacation_date, mb.last_day),
            mb.last_day
          )
          - GREATEST(ra.allocation_date, mb.first_day)
          + 1
        )::int AS eligible_days,
        mb.days_in_month,
        mb.first_day
      FROM room_allocations ra
      CROSS JOIN month_bounds mb
      WHERE ra.allocation_date <= mb.last_day
        AND (
          ra.vacation_date IS NULL
          OR ra.vacation_date >= mb.first_day
        )
        AND ra.monthly_fee IS NOT NULL
    ),
    resident_charges AS (
      SELECT
        resident_id,
        SUM(eligible_days)::int AS eligible_days,


       FLOOR(
  SUM(
    monthly_fee * eligible_days::numeric
    / days_in_month
  )
)::integer AS calculated_amount,

        STRING_AGG(
          DISTINCT monthly_fee::text,
          ', ' ORDER BY monthly_fee::text
        ) AS monthly_rates
      FROM allocation_days
      GROUP BY resident_id
    )
    SELECT
      r.resident_id,
      r.first_name,
      r.last_name,
      rc.eligible_days,
      rc.monthly_rates,
      rc.calculated_amount,
      f.fee_id AS existing_fee_id,
      f.amount AS existing_fee_amount,
      CASE
        WHEN f.fee_id IS NOT NULL THEN 'already_exists'
        ELSE 'new_fee'
      END AS generation_status
    FROM resident_charges rc
    INNER JOIN residents r
      ON r.resident_id = rc.resident_id
    CROSS JOIN month_bounds mb
    LEFT JOIN fees f
      ON f.resident_id = rc.resident_id
      AND f.fee_month = mb.first_day
    ORDER BY r.first_name, r.last_name
    `,
    [year, monthNumber],
  );

  return result.rows;
}

export async function generateMonthlyFees(month: string) {
  const match = month.match(/^(\d{4})-(\d{2})$/);

  if (!match) {
    throw new Error("Please select a valid fee month.");
  }

  const year = Number(match[1]);
  const monthNumber = Number(match[2]);

  if (
    !Number.isInteger(year) ||
    year < 1 ||
    year > 9999 ||
    monthNumber < 1 ||
    monthNumber > 12
  ) {
    throw new Error("Please select a valid fee month.");
  }

  const feeMonth = `${year}-${String(monthNumber).padStart(2, "0")}-01`;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Serialize fee generation for the selected month.
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [
      feeMonth,
    ]);

    // Recalculate eligible charges directly from the database.
    const result = await client.query(
      `
      WITH month_bounds AS (
        SELECT
          make_date($1::int, $2::int, 1) AS first_day,
          (
            make_date($1::int, $2::int, 1)
            + INTERVAL '1 month'
            - INTERVAL '1 day'
          )::date AS last_day,
          EXTRACT(
            DAY FROM (
              make_date($1::int, $2::int, 1)
              + INTERVAL '1 month'
              - INTERVAL '1 day'
            )
          )::int AS days_in_month
      ),
      allocation_days AS (
        SELECT
          ra.resident_id,
          ra.allocation_id,
          ra.monthly_fee,
          (
            LEAST(
              COALESCE(ra.vacation_date, mb.last_day),
              mb.last_day
            )
            - GREATEST(ra.allocation_date, mb.first_day)
            + 1
          )::int AS eligible_days,
          mb.days_in_month
        FROM room_allocations ra
        CROSS JOIN month_bounds mb
        WHERE ra.allocation_date <= mb.last_day
          AND (
            ra.vacation_date IS NULL
            OR ra.vacation_date >= mb.first_day
          )
          AND ra.monthly_fee IS NOT NULL
      ),
      resident_charges AS (
        SELECT
          resident_id,
          CASE
            WHEN COUNT(*) = 1 THEN MIN(allocation_id)
            ELSE NULL
          END AS allocation_id,
          SUM(eligible_days)::int AS eligible_days,
          FLOOR(
            SUM(
              monthly_fee * eligible_days::numeric
              / days_in_month
            )
          )::integer AS amount
        FROM allocation_days
        GROUP BY resident_id
      )
      SELECT
        resident_id,
        allocation_id,
        eligible_days,
        amount
      FROM resident_charges
      ORDER BY resident_id
      `,
      [year, monthNumber],
    );

    let generatedCount = 0;
    let totalGenerated = 0;

    for (const row of result.rows) {
      const insertResult = await client.query(
        `
        INSERT INTO fees (
          resident_id,
          allocation_id,
          fee_month,
          amount,
          due_date,
          status,
          description
        )
        VALUES ($1, $2, $3, $4, $3, 'unpaid', $5)
        ON CONFLICT (resident_id, fee_month) DO NOTHING
        RETURNING fee_id
        `,
        [
          row.resident_id,
          row.allocation_id,
          feeMonth,
          row.amount,
          `Monthly fee for ${feeMonth}`,
        ],
      );

      if (insertResult.rowCount && insertResult.rowCount > 0) {
        generatedCount++;
        totalGenerated += Number(row.amount);
      }
    }

    await client.query("COMMIT");

    return {
      generatedCount,
      skippedCount: result.rows.length - generatedCount,
      totalGenerated,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

import { pool } from "@/app/lib/db";

export async function getFeesForPayment() {
  const result = await pool.query(`
    SELECT
      f.fee_id,
      f.resident_id,
      r.first_name,
      r.last_name,
      TO_CHAR(f.fee_month, 'YYYY-MM-DD') AS fee_month,
      f.amount,
      COALESCE(SUM(p.amount_paid), 0) AS total_paid,
      f.amount - COALESCE(SUM(p.amount_paid), 0) AS balance
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
      f.amount
    HAVING
      f.amount - COALESCE(SUM(p.amount_paid), 0) > 0
    ORDER BY
      f.fee_month DESC,
      r.first_name,
      r.last_name
  `);

  return result.rows.map((row) => ({
    fee_id: Number(row.fee_id),
    resident_id: Number(row.resident_id),
    first_name: row.first_name as string,
    last_name: row.last_name as string,
    fee_month: String(row.fee_month),
    amount: Number(row.amount),
    total_paid: Number(row.total_paid),
    balance: Number(row.balance),
  }));
}

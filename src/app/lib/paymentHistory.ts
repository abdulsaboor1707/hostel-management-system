import { pool } from "@/app/lib/db";

function normalizeDate(value: Date | string): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return value.slice(0, 10);
}

export async function getPaymentHistory() {
  const result = await pool.query(`
    SELECT
      p.payment_id,
      p.fee_id,
      p.amount_paid,
      p.payment_date,
      p.payment_method,
      p.notes,
      r.first_name,
      r.last_name,
      f.fee_month
    FROM payments p
    JOIN fees f
      ON f.fee_id = p.fee_id
    JOIN residents r
      ON r.resident_id = f.resident_id
    ORDER BY
      p.payment_date DESC,
      p.payment_id DESC
  `);

  return result.rows.map((row) => ({
    ...row,
    payment_id: Number(row.payment_id),
    fee_id: Number(row.fee_id),
    amount_paid: Number(row.amount_paid),
    payment_date: normalizeDate(row.payment_date),
    fee_month: normalizeDate(row.fee_month),
  }));
}

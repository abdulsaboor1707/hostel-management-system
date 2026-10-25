import { pool } from "@/app/lib/db";

export async function getDashboardData() {
  // 1. Get resident statistics.
  const residentStatsResult = await pool.query(`
    SELECT
      COUNT(*)::int AS total_residents,
      COUNT(*) FILTER (
        WHERE status = 'active'
      )::int AS active_residents,
      COUNT(*) FILTER (
        WHERE status = 'inactive'
      )::int AS inactive_residents
    FROM residents
  `);

  // 2. Get financial statistics, including expenses.
  const financialStatsResult = await pool.query(`
    SELECT
      COALESCE(
        (SELECT SUM(amount) FROM fees), 0
      ) AS total_fees,

      COALESCE(
        (SELECT SUM(amount_paid) FROM payments), 0
      ) AS total_collected,

      COALESCE(
        (SELECT SUM(amount) FROM fees), 0
      ) -
      COALESCE(
        (SELECT SUM(amount_paid) FROM payments), 0
      ) AS outstanding_balance,

      COALESCE(
        (SELECT SUM(amount) FROM expenses), 0
      ) AS total_expenses
  `);

  // 3. Get recent resident registrations.
  const recentResidentsResult = await pool.query(`
    SELECT
      resident_id,
      first_name,
      last_name,
      admission_date,
      status
    FROM residents
    ORDER BY resident_id DESC
    LIMIT 5
  `);

  // 4. Get recent payments.
  const recentPaymentsResult = await pool.query(`
    SELECT
      p.payment_id,
      p.amount_paid,
      p.payment_date,
      p.payment_method,
      r.first_name,
      r.last_name
    FROM payments p
    JOIN fees f
      ON f.fee_id = p.fee_id
    JOIN residents r
      ON r.resident_id = f.resident_id
    ORDER BY p.payment_date DESC, p.payment_id DESC
    LIMIT 5
  `);

  const residentStats = residentStatsResult.rows[0];
  const financialStats = financialStatsResult.rows[0];

  return {
    stats: {
      totalResidents: Number(residentStats.total_residents),
      activeResidents: Number(residentStats.active_residents),
      inactiveResidents: Number(residentStats.inactive_residents),
      totalFees: Number(financialStats.total_fees),
      totalCollected: Number(financialStats.total_collected),
      outstandingBalance: Number(financialStats.outstanding_balance),
      totalExpenses: Number(financialStats.total_expenses),
    },

    recentResidents: recentResidentsResult.rows.map((resident) => ({
      ...resident,
      resident_id: Number(resident.resident_id),
      admission_date:
        resident.admission_date instanceof Date
          ? resident.admission_date.toISOString().slice(0, 10)
          : String(resident.admission_date).slice(0, 10),
    })),

    recentPayments: recentPaymentsResult.rows.map((payment) => ({
      ...payment,
      payment_id: Number(payment.payment_id),
      amount_paid: Number(payment.amount_paid),
      payment_date:
        payment.payment_date instanceof Date
          ? payment.payment_date.toISOString().slice(0, 10)
          : String(payment.payment_date).slice(0, 10),
    })),
  };
}

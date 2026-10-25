import { pool } from "@/app/lib/db";

export async function getExpenses() {
  const result = await pool.query(`
    SELECT
      e.expense_id,
      e.expense_date,
      e.amount,
      e.description,
      e.payment_method,
      e.paid_to,
      ec.category_name
    FROM expenses e
    JOIN expense_categories ec
      ON e.category_id = ec.category_id
    ORDER BY e.expense_date DESC, e.expense_id DESC
  `);

  return result.rows;
}

export async function getMonthlyFinancialComparison() {
  const result = await pool.query(`
    WITH months AS (
      SELECT generate_series(
        date_trunc('month', CURRENT_DATE) - INTERVAL '11 months',
        date_trunc('month', CURRENT_DATE),
        INTERVAL '1 month'
      ) AS month_start
    ),
    monthly_income AS (
      SELECT
        date_trunc('month', payment_date) AS month_start,
        SUM(amount_paid) AS income
      FROM payments
      WHERE payment_date >=
        date_trunc('month', CURRENT_DATE) - INTERVAL '11 months'
      GROUP BY date_trunc('month', payment_date)
    ),
    monthly_expenses AS (
      SELECT
        date_trunc('month', expense_date) AS month_start,
        SUM(amount) AS expenses
      FROM expenses
      WHERE expense_date >=
        date_trunc('month', CURRENT_DATE) - INTERVAL '11 months'
      GROUP BY date_trunc('month', expense_date)
    )
    SELECT
      TO_CHAR(m.month_start, 'Mon YYYY') AS month,
      COALESCE(i.income, 0) AS income,
      COALESCE(e.expenses, 0) AS expenses
    FROM months m
    LEFT JOIN monthly_income i
      ON i.month_start = m.month_start
    LEFT JOIN monthly_expenses e
      ON e.month_start = m.month_start
    ORDER BY m.month_start
  `);

  return result.rows.map((row) => ({
    month: row.month,
    income: Number(row.income),
    expenses: Number(row.expenses),
  }));
}

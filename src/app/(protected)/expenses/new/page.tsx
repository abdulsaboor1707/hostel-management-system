import { requireAdmin } from "@/app/lib/auth";
import { pool } from "@/app/lib/db";
import ExpenseForm from "./ExpenseForm";

export default async function NewExpensePage() {
  await requireAdmin();

  const result = await pool.query(`
    SELECT category_id, category_name
    FROM expense_categories
    WHERE status = 'active'
    ORDER BY category_name
  `);

  const categories = result.rows.map((category) => ({
    category_id: Number(category.category_id),
    category_name: String(category.category_name),
  }));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add Expense</h1>

        <p className="mt-1 text-sm text-gray-600">
          Enter the details of a hostel expense.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        {categories.length === 0 ? (
          <p className="text-sm text-gray-600">
            No active expense categories are available. Please activate or add a
            category before recording an expense.
          </p>
        ) : (
          <ExpenseForm categories={categories} />
        )}
      </div>
    </div>
  );
}

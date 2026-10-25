import Link from "next/link";
import { requireAdmin } from "@/app/lib/auth";
import { getExpenses, getMonthlyFinancialComparison } from "@/app/lib/expenses";
import FinancialComparisonChart from "./FinancialComparisonChart";

const currencyFormatter = new Intl.NumberFormat("en-PK", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatDate(date: string | Date) {
  const expenseDate = new Date(date);

  const day = String(expenseDate.getUTCDate()).padStart(2, "0");
  const month = String(expenseDate.getUTCMonth() + 1).padStart(2, "0");
  const year = expenseDate.getUTCFullYear();

  return `${day}-${month}-${year}`;
}

export default async function ExpensesPage() {
  await requireAdmin();

  const expenses = await getExpenses();
  const chartData = await getMonthlyFinancialComparison();

  const totalExpenses = expenses.reduce(
    (total: number, expense: { amount: string | number }) =>
      total + Number(expense.amount),
    0,
  );

  return (
    <div className="space-y-6">
      {/* Page Heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="mt-1 text-sm text-gray-600">
            View and manage hostel expenses.
          </p>
        </div>

        <Link
          href="/expenses/new"
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Add Expense
        </Link>
      </div>

      {/* Total Expenses Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-gray-600">
          Total Recorded Expenses
        </p>

        <p className="mt-2 text-2xl font-bold text-gray-900">
          Rs. {currencyFormatter.format(totalExpenses)}
        </p>

        <p className="mt-1 text-sm text-gray-500">
          {expenses.length} {expenses.length === 1 ? "expense" : "expenses"}{" "}
          recorded
        </p>
      </div>

      {/* Financial Comparison Chart */}
      <FinancialComparisonChart data={chartData} />

      {/* Expenses Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">All Expenses</h2>
          <p className="mt-1 text-sm text-gray-500">
            A list of all recorded hostel expenses.
          </p>
        </div>

        {expenses.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="font-medium text-gray-900">No expenses found</p>
            <p className="mt-1 text-sm text-gray-500">
              Click Add Expense to record your first expense.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-600">
                <tr>
                  <th className="whitespace-nowrap px-5 py-4">Date</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Description</th>
                  <th className="px-5 py-4">Paid To</th>
                  <th className="px-5 py-4">Payment Method</th>
                  <th className="whitespace-nowrap px-5 py-4 text-right">
                    Amount (Rs.)
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {expenses.map(
                  (expense: {
                    expense_id: number;
                    expense_date: string | Date;
                    category_name: string;
                    description: string | null;
                    paid_to: string | null;
                    payment_method: string | null;
                    amount: string | number;
                  }) => (
                    <tr key={expense.expense_id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-5 py-4 text-gray-700">
                        {formatDate(expense.expense_date)}
                      </td>

                      <td className="px-5 py-4 font-medium text-gray-900">
                        {expense.category_name}
                      </td>

                      <td className="max-w-xs px-5 py-4 text-gray-700">
                        {expense.description || "—"}
                      </td>

                      <td className="px-5 py-4 text-gray-700">
                        {expense.paid_to || "—"}
                      </td>

                      <td className="px-5 py-4 text-gray-700">
                        {expense.payment_method || "—"}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-right font-medium text-gray-900">
                        {currencyFormatter.format(Number(expense.amount))}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

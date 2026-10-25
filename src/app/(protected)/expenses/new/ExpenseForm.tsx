"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { addExpense, type ExpenseState } from "@/app/actions/expenseActions";

type ExpenseCategory = {
  category_id: number;
  category_name: string;
};

type ExpenseFormProps = {
  categories: ExpenseCategory[];
};

const initialState: ExpenseState = {
  success: false,
  message: "",
};

export default function ExpenseForm({ categories }: ExpenseFormProps) {
  const router = useRouter();

  const [state, formAction, isPending] = useActionState(
    addExpense,
    initialState,
  );

  // Redirect to the expenses listing after a successful save.
  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        router.push("/expenses");
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [state.success, router]);

  // Get today's date in YYYY-MM-DD format.
  const today = new Date();

  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  return (
    <form action={formAction} className="space-y-6">
      {/* Success or error message */}
      {state.message && (
        <div
          role="status"
          className={`rounded-lg border p-4 text-sm ${
            state.success
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {state.success
            ? "Expense added successfully. Redirecting to expenses listing..."
            : state.message}
        </div>
      )}

      {/* Expense Category */}
      <div>
        <label
          htmlFor="category_id"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Expense Category <span className="text-red-500">*</span>
        </label>

        <select
          id="category_id"
          name="category_id"
          required
          defaultValue=""
          disabled={isPending || state.success}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          <option value="" disabled>
            Select a category
          </option>

          {categories.map((category) => (
            <option key={category.category_id} value={category.category_id}>
              {category.category_name}
            </option>
          ))}
        </select>
      </div>

      {/* Expense Date and Amount */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="expense_date"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Expense Date <span className="text-red-500">*</span>
          </label>

          <input
            id="expense_date"
            name="expense_date"
            type="date"
            required
            defaultValue={todayString}
            disabled={isPending || state.success}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div>
          <label
            htmlFor="amount"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Amount (Rs.) <span className="text-red-500">*</span>
          </label>

          <input
            id="amount"
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            required
            placeholder="e.g. 35000.00"
            disabled={isPending || state.success}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
      </div>

      {/* Paid To and Payment Method */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="paid_to"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Paid To
          </label>

          <input
            id="paid_to"
            name="paid_to"
            type="text"
            maxLength={150}
            placeholder="e.g. K-Electric"
            disabled={isPending || state.success}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div>
          <label
            htmlFor="payment_method"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Payment Method
          </label>

          <select
            id="payment_method"
            name="payment_method"
            defaultValue=""
            disabled={isPending || state.success}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="">Select payment method</option>
            <option value="Cash">Cash</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Cheque">Cheque</option>
            <option value="Online">Online</option>
            <option value="JazzCash">JazzCash</option>
            <option value="Easypaisa">Easypaisa</option>
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Description
        </label>

        <textarea
          id="description"
          name="description"
          rows={4}
          maxLength={255}
          placeholder="Enter details about this expense..."
          disabled={isPending || state.success}
          className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        <p className="mt-1 text-xs text-gray-500">Maximum 255 characters.</p>
      </div>

      {/* Buttons */}
      <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end">
        <Link
          href="/expenses"
          className={`inline-flex items-center justify-center rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 ${
            isPending || state.success ? "pointer-events-none opacity-50" : ""
          }`}
        >
          Cancel
        </Link>

        <button
          type="submit"
          disabled={isPending || state.success}
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save Expense"}
        </button>
      </div>
    </form>
  );
}

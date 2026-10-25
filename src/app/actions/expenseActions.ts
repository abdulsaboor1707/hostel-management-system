"use server";

import { requireAdmin } from "@/app/lib/auth";
import { pool } from "@/app/lib/db";
import { revalidatePath } from "next/cache";

export type ExpenseState = {
  success: boolean;
  message: string;
};

export async function addExpense(
  _previousState: ExpenseState,
  formData: FormData,
): Promise<ExpenseState> {
  await requireAdmin();

  const categoryId = Number(formData.get("category_id"));
  const expenseDate = String(formData.get("expense_date") ?? "");
  const amountValue = String(formData.get("amount") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const paymentMethod = String(formData.get("payment_method") ?? "");
  const paidTo = String(formData.get("paid_to") ?? "").trim();

  const amount = Number(amountValue);

  if (
    !Number.isInteger(categoryId) ||
    categoryId <= 0 ||
    !expenseDate ||
    !amountValue ||
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    return {
      success: false,
      message: "Please provide a valid category, date, and amount.",
    };
  }

  // Validate the calendar date, not just its format.
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(expenseDate);

  if (!dateMatch) {
    return {
      success: false,
      message: "Please select a valid expense date.",
    };
  }

  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);
  const parsedDate = new Date(Date.UTC(year, month - 1, day));

  if (
    parsedDate.getUTCFullYear() !== year ||
    parsedDate.getUTCMonth() !== month - 1 ||
    parsedDate.getUTCDate() !== day
  ) {
    return {
      success: false,
      message: "Please select a valid expense date.",
    };
  }

  const allowedPaymentMethods = [
    "Cash",
    "Bank Transfer",
    "Cheque",
    "Online",
    "JazzCash",
    "Easypaisa",
  ];

  if (paymentMethod && !allowedPaymentMethods.includes(paymentMethod)) {
    return {
      success: false,
      message: "Please select a valid payment method.",
    };
  }

  if (description.length > 255 || paidTo.length > 150) {
    return {
      success: false,
      message: "Description or Paid To exceeds the allowed length.",
    };
  }

  try {
    const categoryResult = await pool.query(
      `SELECT category_id
       FROM expense_categories
       WHERE category_id = $1
         AND status = 'active'`,
      [categoryId],
    );

    if (categoryResult.rowCount === 0) {
      return {
        success: false,
        message: "Please select an active expense category.",
      };
    }

    await pool.query(
      `INSERT INTO expenses (
         category_id,
         expense_date,
         amount,
         description,
         payment_method,
         paid_to
       )
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        categoryId,
        expenseDate,
        amount,
        description || null,
        paymentMethod || null,
        paidTo || null,
      ],
    );

    revalidatePath("/expenses");

    return {
      success: true,
      message: "Expense added successfully.",
    };
  } catch (error) {
    console.error("Add expense failed:", error);

    return {
      success: false,
      message: "Unable to save the expense. Please try again.",
    };
  }
}

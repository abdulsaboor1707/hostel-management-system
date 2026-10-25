"use server";
import { requireAdmin } from "@/app/lib/auth";
import { pool } from "@/app/lib/db";
import { revalidatePath } from "next/cache";

type PaymentState = {
  success: boolean;
  message: string;
};

export async function recordPayment(
  previousState: PaymentState,
  formData: FormData,
): Promise<PaymentState> {
  await requireAdmin();
  const feeId = Number(formData.get("fee_id"));
  const amountPaid = Number(formData.get("amount_paid"));
  const paymentDate = String(formData.get("payment_date") ?? "");
  const paymentMethod = String(formData.get("payment_method") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();

  // Validate required fields.
  if (
    !Number.isInteger(feeId) ||
    feeId <= 0 ||
    !Number.isFinite(amountPaid) ||
    amountPaid <= 0 ||
    !paymentDate ||
    !paymentMethod
  ) {
    return {
      success: false,
      message: "Please enter valid payment details.",
    };
  }

  const allowedMethods = [
    "cash",
    "bank_transfer",
    "online",
    "cheque",
    "JazzCash",
    "Easypaisa",
  ];

  if (!allowedMethods.includes(paymentMethod)) {
    return {
      success: false,
      message: "Please select a valid payment method.",
    };
  }

  // Validate the date format and actual calendar date.
  const dateMatch = paymentDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!dateMatch) {
    return {
      success: false,
      message: "Please enter a valid payment date.",
    };
  }

  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);

  const dateObject = new Date(Date.UTC(year, month - 1, day));

  if (
    dateObject.getUTCFullYear() !== year ||
    dateObject.getUTCMonth() !== month - 1 ||
    dateObject.getUTCDate() !== day
  ) {
    return {
      success: false,
      message: "Please enter a valid payment date.",
    };
  }

  // Use a transaction to protect the outstanding balance.
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const feeResult = await client.query(
      `SELECT amount
   FROM fees
   WHERE fee_id = $1
   FOR UPDATE`,
      [feeId],
    );

    if (feeResult.rowCount === 0) {
      await client.query("ROLLBACK");

      return {
        success: false,
        message: "The selected fee was not found.",
      };
    }

    const paidResult = await client.query(
      `SELECT COALESCE(SUM(amount_paid), 0) AS total_paid
   FROM payments
   WHERE fee_id = $1`,
      [feeId],
    );

    const feeAmount = Number(feeResult.rows[0].amount);
    const totalPaid = Number(paidResult.rows[0].total_paid);
    const balance = feeAmount - totalPaid;

    if (amountPaid > balance + 0.000001) {
      await client.query("ROLLBACK");

      return {
        success: false,
        message: `Payment exceeds the outstanding balance of ${balance.toFixed(2)}.`,
      };
    }

    await client.query(
      `INSERT INTO payments
        (
          fee_id,
          amount_paid,
          payment_date,
          payment_method,
          notes
        )
       VALUES ($1, $2, $3, $4, $5)`,
      [feeId, amountPaid, paymentDate, paymentMethod, notes || null],
    );

    await client.query("COMMIT");

    revalidatePath("/fees");

    return {
      success: true,
      message: "Payment recorded successfully.",
    };
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("Payment rollback failed:", rollbackError);
    }

    console.error("Failed to record payment:", error);

    return {
      success: false,
      message: "Could not record the payment. Please try again.",
    };
  } finally {
    client.release();
  }
}

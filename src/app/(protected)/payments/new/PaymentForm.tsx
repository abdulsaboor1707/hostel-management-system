"use client";

import { useActionState, useState } from "react";
import { recordPayment } from "@/app/actions/pamentActions";

type Fee = {
  fee_id: number;
  resident_id: number;
  first_name: string;
  last_name: string;
  fee_month: string;
  amount: number;
  total_paid: number;
  balance: number;
};

type Props = {
  fees: Fee[];
};

const initialState = {
  success: false,
  message: "",
};

function formatAmount(amount: number) {
  return amount.toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function formatMonth(date: string) {
  const value = String(date ?? "").slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return "Unknown month";
  }

  const year = Number(match[1]);
  const month = Number(match[2]);

  if (month < 1 || month > 12) {
    return "Unknown month";
  }

  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function PaymentForm({ fees }: Props) {
  const [state, formAction, pending] = useActionState(
    recordPayment,
    initialState,
  );

  const [selectedFeeId, setSelectedFeeId] = useState(
    fees[0]?.fee_id.toString() ?? "",
  );

  const selectedFee = fees.find(
    (fee) => fee.fee_id.toString() === selectedFeeId,
  );

  return (
    <div className="max-w-2xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h1 className="mb-2 text-2xl font-bold text-gray-800">Record Payment</h1>

      <p className="mb-6 text-sm text-gray-600">
        Record a payment against a resident&apos;s outstanding fee.
      </p>

      {fees.length === 0 ? (
        <div className="rounded-md bg-green-50 p-4 text-green-800">
          There are no outstanding fees to pay.
        </div>
      ) : (
        <form action={formAction} className="space-y-5">
          <div>
            <label
              htmlFor="fee_id"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Resident and fee
            </label>

            <select
              id="fee_id"
              name="fee_id"
              value={selectedFeeId}
              onChange={(event) => setSelectedFeeId(event.target.value)}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            >
              {fees.map((fee) => (
                <option key={fee.fee_id} value={fee.fee_id}>
                  {fee.first_name} {fee.last_name} —{" "}
                  {formatMonth(fee.fee_month)} (Fee #{fee.fee_id})
                </option>
              ))}
            </select>
          </div>

          {selectedFee && (
            <div className="grid grid-cols-1 gap-3 rounded-md bg-gray-50 p-4 sm:grid-cols-3">
              <div>
                <p className="text-sm text-gray-500">Fee amount</p>
                <p className="font-semibold">
                  Rs. {formatAmount(selectedFee.amount)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Already paid</p>
                <p className="font-semibold text-green-700">
                  Rs. {formatAmount(selectedFee.total_paid)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Outstanding</p>
                <p className="font-semibold text-red-700">
                  Rs. {formatAmount(selectedFee.balance)}
                </p>
              </div>
            </div>
          )}

          <div>
            <label
              htmlFor="amount_paid"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Amount received (Rs.)
            </label>

            <input
              id="amount_paid"
              name="amount_paid"
              type="number"
              min="0.01"
              max={selectedFee?.balance}
              step="0.01"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="Enter amount received"
            />

            <p className="mt-1 text-xs text-gray-500">
              You cannot pay more than the outstanding balance.
            </p>
          </div>

          <div>
            <label
              htmlFor="payment_date"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Payment date
            </label>

            <input
              id="payment_date"
              name="payment_date"
              type="date"
              defaultValue={new Date().toISOString().slice(0, 10)}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label
              htmlFor="payment_method"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Payment method
            </label>

            <select
              id="payment_method"
              name="payment_method"
              defaultValue="cash"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank transfer</option>
              <option value="online">Online payment</option>
              <option value="cheque">Cheque</option>
              <option value="JazzCash">JazzCash</option>
              <option value="Easypaisa">Easypaisa</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="notes"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Notes (optional)
            </label>

            <textarea
              id="notes"
              name="notes"
              rows={3}
              maxLength={1000}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="Enter payment remarks, if any"
            />
          </div>

          {state.message && (
            <div
              role="status"
              className={`rounded-md p-3 text-sm ${
                state.success
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              {state.message}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Recording Payment..." : "Record Payment"}
          </button>
        </form>
      )}
    </div>
  );
}

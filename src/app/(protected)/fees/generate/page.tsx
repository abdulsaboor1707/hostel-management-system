"use client";

import { useState } from "react";
import {
  generateFeesAction,
  previewFeesAction,
} from "@/app/actions/feeGenerationActions";

type PreviewRow = {
  resident_id: number;
  first_name: string;
  last_name: string;
  eligible_days: number;
  monthly_rates: string;
  calculated_amount: string | number;
  existing_fee_id: number | null;
  existing_fee_amount: string | number | null;
  generation_status: "new_fee" | "already_exists";
};

function formatAmount(amount: number | string | null) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(Math.floor(Number(amount ?? 0)));
}

export default function GenerateFeesPage() {
  const currentDate = new Date();

  const defaultMonth = `${currentDate.getFullYear()}-${String(
    currentDate.getMonth() + 1,
  ).padStart(2, "0")}`;

  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [rows, setRows] = useState<PreviewRow[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [hasPreview, setHasPreview] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const newFees = rows.filter((row) => row.generation_status === "new_fee");

  const existingFees = rows.filter(
    (row) => row.generation_status === "already_exists",
  );

  async function handlePreview() {
    setLoading(true);
    setMessage("");
    setHasPreview(false);

    try {
      const result = await previewFeesAction(selectedMonth);

      if (result.success) {
        setRows(result.rows);
        setHasPreview(true);
      } else {
        setRows([]);
        setMessage(result.message);
      }
    } catch (error) {
      console.error("Preview error:", error);
      setRows([]);
      setMessage("Could not preview fees.");
    } finally {
      setLoading(false);
    }
  }

  function handleGenerate() {
    if (newFees.length === 0) {
      return;
    }

    setShowConfirmModal(true);
  }

  async function confirmGenerate() {
    setShowConfirmModal(false);
    setGenerating(true);
    setMessage("");

    try {
      const result = await generateFeesAction(selectedMonth);

      if (result.success) {
        await handlePreview();

        // Set the message after refreshing the preview
        // so that handlePreview() does not clear it.
        setMessage(result.message);
      } else {
        setMessage(result.message);
      }
    } catch (error) {
      console.error("Generation error:", error);
      setMessage("Could not generate monthly fees.");
    } finally {
      setGenerating(false);
    }
  }

  const totalNewAmount = newFees.reduce(
    (total, row) => total + Number(row.calculated_amount ?? 0),
    0,
  );

  return (
    <main className="p-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Generate Monthly Fees</h1>

        <p className="mt-1 text-sm text-gray-500">
          Preview and generate monthly fee records for residents.
        </p>
      </div>

      {/* Month Selection */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div>
            <label
              htmlFor="fee-month"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Fee Month
            </label>

            <input
              id="fee-month"
              type="month"
              value={selectedMonth}
              onChange={(event) => {
                setSelectedMonth(event.target.value);
                setHasPreview(false);
                setRows([]);
                setMessage("");
              }}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button
            type="button"
            onClick={handlePreview}
            disabled={loading || generating}
            className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Loading Preview..." : "Preview Fees"}
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="mt-6 rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          {message}
        </div>
      )}

      {/* Preview */}
      {hasPreview && (
        <div className="mt-6">
          {/* Summary Cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Residents</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {rows.length}
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">New Fees</p>
              <p className="mt-1 text-2xl font-bold text-green-600">
                {newFees.length}
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Already Exist</p>
              <p className="mt-1 text-2xl font-bold text-gray-600">
                {existingFees.length}
              </p>
            </div>
          </div>

          {/* New Fee Total */}
          {newFees.length > 0 && (
            <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-5">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div>
                  <p className="text-sm font-medium text-green-800">
                    New fees to be generated
                  </p>

                  <p className="text-sm text-green-700">
                    {newFees.length} fee record
                    {newFees.length === 1 ? "" : "s"}
                  </p>
                </div>

                <p className="text-xl font-bold text-green-800">
                  {formatAmount(totalNewAmount)}
                </p>
              </div>
            </div>
          )}

          {/* Preview Table */}
          {rows.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500">
              No residents found for this month.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left">Resident</th>
                    <th className="px-4 py-3 text-right">Eligible Days</th>
                    <th className="px-4 py-3 text-right">Monthly Rate</th>
                    <th className="px-4 py-3 text-right">Calculated Fee</th>
                    <th className="px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.resident_id}
                      className="border-t border-gray-200"
                    >
                      <td className="px-4 py-3">
                        {row.first_name} {row.last_name}
                      </td>

                      <td className="px-4 py-3 text-right">
                        {row.eligible_days}
                      </td>

                      <td className="px-4 py-3 text-right">
                        {row.monthly_rates
                          .split(", ")
                          .map((rate) => formatAmount(rate))
                          .join(", ")}
                      </td>

                      <td className="px-4 py-3 text-right font-medium">
                        {formatAmount(row.calculated_amount)}
                      </td>

                      <td className="px-4 py-3">
                        {row.generation_status === "new_fee" ? (
                          <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                            New Fee
                          </span>
                        ) : (
                          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                            Already Exists
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Generate Button */}
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating || loading || newFees.length === 0}
              className="rounded-md bg-green-600 px-5 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {generating ? "Generating Fees..." : "Generate Fees"}
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="generate-fees-title"
        >
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            {/* Modal Header */}
            <div className="mb-4">
              <h2
                id="generate-fees-title"
                className="text-xl font-semibold text-gray-900"
              >
                Generate Monthly Fees
              </h2>

              <p className="mt-2 text-sm text-gray-600">
                Are you sure you want to generate fees for{" "}
                <span className="font-semibold text-gray-900">
                  {selectedMonth}
                </span>
                ?
              </p>

              <p className="mt-3 text-sm text-gray-500">
                This will create fee records for residents who do not already
                have a fee record for this month.
              </p>
            </div>

            {/* Modal Summary */}
            <div className="mb-6 rounded-lg bg-gray-50 p-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">New fee records</span>

                <span className="font-medium text-gray-900">
                  {newFees.length}
                </span>
              </div>

              <div className="mt-2 flex justify-between text-sm">
                <span className="text-gray-500">Total amount</span>

                <span className="font-semibold text-gray-900">
                  {formatAmount(totalNewAmount)}
                </span>
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={generating}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmGenerate}
                disabled={generating}
                className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {generating ? "Generating..." : "Generate Fees"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

import { getFees } from "@/app/lib/fees";
import Link from "next/link";

export default async function FeesPage() {
  const fees = await getFees();

  function formatDate(value: string | Date) {
    return new Date(value).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  }

  function formatAmount(value: string | number) {
    return Number(value).toLocaleString("en-PK", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    });
  }

  return (
    <main className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Fees Management</h1>

        <Link
          href="/fees/generate"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Generate Monthly Fees
        </Link>
      </div>

      {fees.length === 0 ? (
        <p className="text-gray-500">No fee records found.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">Resident</th>
                <th className="px-4 py-3 text-left">Fee Month</th>
                <th className="px-4 py-3 text-right">Fee Amount</th>
                <th className="px-4 py-3 text-right">Paid</th>
                <th className="px-4 py-3 text-right">Balance</th>
                <th className="px-4 py-3 text-left">Due Date</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {fees.map((fee) => (
                <tr key={fee.fee_id} className="border-t border-gray-200">
                  <td className="px-4 py-3">
                    {fee.first_name} {fee.last_name}
                  </td>

                  <td className="px-4 py-3">{formatDate(fee.fee_month)}</td>

                  <td className="px-4 py-3 text-right">
                    Rs. {formatAmount(fee.amount)}
                  </td>

                  <td className="px-4 py-3 text-right">
                    Rs. {formatAmount(fee.total_paid)}
                  </td>

                  <td className="px-4 py-3 text-right">
                    Rs. {formatAmount(fee.balance)}
                  </td>

                  <td className="px-4 py-3">{formatDate(fee.due_date)}</td>

                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        fee.calculated_status === "paid"
                          ? "bg-green-100 text-green-800"
                          : fee.calculated_status === "partial"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {fee.calculated_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

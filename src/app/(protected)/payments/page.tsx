import { getPaymentHistory } from "@/app/lib/paymentHistory";

function formatAmount(amount: number) {
  return amount.toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function formatDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);

  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatMonth(date: string) {
  const [year, month] = date.split("-").map(Number);

  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default async function PaymentsPage() {
  const payments = await getPaymentHistory();

  const totalReceived = payments.reduce(
    (total, payment) => total + payment.amount_paid,
    0,
  );

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Payment History
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              View all payments recorded for residents.
            </p>
          </div>

          <a
            href="/payments/new"
            className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          >
            + Record Payment
          </a>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">Total Payments Recorded</p>
            <p className="mt-2 text-2xl font-bold text-gray-800">
              {payments.length}
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">Total Amount Received</p>
            <p className="mt-2 text-2xl font-bold text-green-700">
              Rs. {formatAmount(totalReceived)}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                {[
                  "Payment ID",
                  "Resident",
                  "Fee Month",
                  "Amount Received",
                  "Payment Date",
                  "Method",
                  "Notes",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {payments.map((payment) => (
                <tr key={payment.payment_id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    {payment.payment_id}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-800">
                    {payment.first_name} {payment.last_name}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    {formatMonth(payment.fee_month)}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-green-700">
                    Rs. {formatAmount(payment.amount_paid)}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    {formatDate(payment.payment_date)}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    {payment.payment_method || "-"}
                  </td>

                  <td className="max-w-xs px-4 py-3 text-sm text-gray-600">
                    {payment.notes || "-"}
                  </td>
                </tr>
              ))}

              {payments.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-gray-500"
                  >
                    No payments have been recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

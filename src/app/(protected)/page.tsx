import Link from "next/link";
import { getDashboardData } from "@/app/lib/dashboard";

function formatAmount(amount: number) {
  return amount.toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function formatDate(date: string) {
  const [year, month, day] = date.slice(0, 10).split("-").map(Number);

  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default async function DashboardPage() {
  const { stats, recentResidents, recentPayments } = await getDashboardData();

  const comparisonMax = Math.max(stats.totalCollected, stats.totalExpenses, 1);

  const collectedPercentage = (stats.totalCollected / comparisonMax) * 100;

  const expensesPercentage = (stats.totalExpenses / comparisonMax) * 100;

  const cards = [
    {
      title: "Total Residents",
      value: stats.totalResidents.toLocaleString("en-PK"),
      description: "All registered residents",
      color: "border-blue-500",
      valueColor: "text-blue-700",
      href: "/residents",
    },
    {
      title: "Active Residents",
      value: stats.activeResidents.toLocaleString("en-PK"),
      description: "Residents with active status",
      color: "border-green-500",
      valueColor: "text-green-700",
      href: "/residents",
    },
    {
      title: "Inactive Residents",
      value: stats.inactiveResidents.toLocaleString("en-PK"),
      description: "Residents with inactive status",
      color: "border-gray-400",
      valueColor: "text-gray-700",
      href: "/residents",
    },
    {
      title: "Total Fees",
      value: `Rs. ${formatAmount(stats.totalFees)}`,
      description: "Total fees generated",
      color: "border-purple-500",
      valueColor: "text-purple-700",
      href: "/fees",
    },
    {
      title: "Total Collected",
      value: `Rs. ${formatAmount(stats.totalCollected)}`,
      description: "Payments received",
      color: "border-emerald-500",
      valueColor: "text-emerald-700",
      href: "/payments",
    },
    {
      title: "Outstanding Balance",
      value: `Rs. ${formatAmount(stats.outstandingBalance)}`,
      description: "Fees minus payments received",
      color: "border-red-500",
      valueColor: "text-red-700",
      href: "/fees",
    },
    {
      title: "Total Expenses",
      value: `Rs. ${formatAmount(stats.totalExpenses)}`,
      description: "All recorded hostel expenses",
      color: "border-orange-500",
      valueColor: "text-orange-700",
      href: "/expenses",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Dashboard heading */}
        <section>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Student Boy&apos;s Hostel Dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            Overview of residents, fees, payments, and expenses.
          </p>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Quick Actions
          </h2>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/residents/new"
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
            >
              + Add Resident
            </Link>

            <Link
              href="/residents"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              View Residents
            </Link>

            <Link
              href="/rooms"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              View Rooms
            </Link>

            <Link
              href="/fees"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              View Fees
            </Link>

            <Link
              href="/payments/new"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              + Record Payment
            </Link>

            <Link
              href="/payments"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Payment History
            </Link>

            <Link
              href="/expenses/new"
              className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm font-medium text-orange-800 transition hover:bg-orange-100"
            >
              + Add Expense
            </Link>

            <Link
              href="/expenses"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              View Expenses
            </Link>
          </div>
        </section>

        {/* Statistics cards */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-800">Overview</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className={`rounded-xl border border-gray-200 border-l-4 ${card.color} bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}
              >
                <p className="text-sm font-medium text-gray-500">
                  {card.title}
                </p>

                <p
                  className={`mt-3 break-words text-2xl font-bold ${card.valueColor}`}
                >
                  {card.value}
                </p>

                <p className="mt-2 text-sm text-gray-500">{card.description}</p>

                <p className="mt-4 text-xs font-medium text-blue-600">
                  View details →
                </p>
              </Link>
            ))}

            {/* Fees Collected vs Expenses comparison card */}
            <div className="rounded-xl border border-gray-200 border-l-4 border-l-indigo-500 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-gray-500">
                Fees Collected vs Expenses
              </p>

              <p className="mt-2 text-lg font-bold text-gray-900">
                Financial Comparison
              </p>

              {/* Fees collected */}
              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-green-700">
                    Fees Collected
                  </span>

                  <span className="text-sm font-semibold text-gray-800">
                    Rs. {formatAmount(stats.totalCollected)}
                  </span>
                </div>

                <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-green-500 transition-all"
                    style={{ width: `${collectedPercentage}%` }}
                  />
                </div>
              </div>

              {/* Expenses */}
              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-orange-700">
                    Expenses
                  </span>

                  <span className="text-sm font-semibold text-gray-800">
                    Rs. {formatAmount(stats.totalExpenses)}
                  </span>
                </div>

                <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-orange-500 transition-all"
                    style={{ width: `${expensesPercentage}%` }}
                  />
                </div>
              </div>

              {/* Difference */}
              <div className="mt-5 border-t border-gray-100 pt-4">
                <p className="text-xs text-gray-500">
                  Collected minus expenses
                </p>

                <p
                  className={`mt-1 text-xl font-bold ${
                    stats.totalCollected - stats.totalExpenses >= 0
                      ? "text-green-700"
                      : "text-red-700"
                  }`}
                >
                  Rs. {formatAmount(stats.totalCollected - stats.totalExpenses)}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Recent activity */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Residents */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Recent Residents
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Latest resident registrations
                </p>
              </div>

              <Link
                href="/residents"
                className="shrink-0 text-sm font-medium text-blue-600 hover:underline"
              >
                View all
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Resident
                    </th>
                    <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Admission
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {recentResidents.map((resident) => (
                    <tr
                      key={resident.resident_id}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        <Link
                          href={`/residents/${resident.resident_id}`}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          {resident.first_name} {resident.last_name}
                        </Link>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                        {formatDate(resident.admission_date)}
                      </td>

                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            resident.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {resident.status}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {recentResidents.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-10 text-center text-sm text-gray-500"
                      >
                        No residents registered yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Payments */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Recent Payments
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Latest payments received
                </p>
              </div>

              <Link
                href="/payments"
                className="shrink-0 text-sm font-medium text-blue-600 hover:underline"
              >
                View all
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Resident
                    </th>
                    <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Amount
                    </th>
                    <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {recentPayments.map((payment) => (
                    <tr
                      key={payment.payment_id}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-800">
                        {payment.first_name} {payment.last_name}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-semibold text-green-700">
                        Rs. {formatAmount(payment.amount_paid)}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                        {formatDate(payment.payment_date)}
                      </td>
                    </tr>
                  ))}

                  {recentPayments.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-10 text-center text-sm text-gray-500"
                      >
                        No payments recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

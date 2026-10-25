import { redirect } from "next/navigation";
import { getSession } from "@/app/lib/auth";
import { getResidentDetails } from "@/app/lib/residentDetails";
import LogoutButton from "../components/LogoutButton";
function formatDate(date: string | Date | null) {
  if (!date) return "-";

  const value =
    date instanceof Date
      ? date.toISOString().slice(0, 10)
      : String(date).slice(0, 10);

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) return "-";

  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatMonth(date: string | Date | null) {
  if (!date) return "-";

  const value =
    date instanceof Date
      ? date.toISOString().slice(0, 10)
      : String(date).slice(0, 10);

  const [year, month] = value.split("-").map(Number);

  if (!year || !month) return "-";

  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatAmount(amount: number) {
  return amount.toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string | number | null;
}) {
  return (
    <div className="border-b border-gray-100 py-3">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 break-words font-medium text-gray-800">
        {value === null || value === "" ? "-" : value}
      </p>
    </div>
  );
}

export default async function MyDetailsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "resident" || session.residentId === null) {
    redirect("/unauthorized");
  }

  if (session.mustChangePassword) {
    redirect("/change-password");
  }

  // Load records only for the resident linked to this session.
  const resident = await getResidentDetails(session.residentId);

  if (!resident || resident.status !== "active") {
    redirect("/login");
  }

  const activeAllocation = resident.allocations.find(
    (allocation) => allocation.allocation_status === "active",
  );

  const totalFees = resident.fees.reduce((total, fee) => total + fee.amount, 0);

  const totalPaid = resident.fees.reduce(
    (total, fee) => total + fee.total_paid,
    0,
  );

  const totalBalance = resident.fees.reduce(
    (total, fee) => total + fee.balance,
    0,
  );

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Details</h1>
            <p className="mt-1 text-sm text-gray-500">
              View your personal information, room history, and financial
              records.
            </p>
          </div>

          <LogoutButton />
        </div>

        {/* Profile */}
        <section className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {resident.profile_picture ? (
              <img
                src={resident.profile_picture}
                alt={`${resident.first_name} ${resident.last_name}`}
                className="h-28 w-28 rounded-lg border border-gray-200 object-cover"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-lg bg-gray-100 text-sm text-gray-400">
                No photo
              </div>
            )}

            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {resident.first_name} {resident.last_name}
              </h2>

              <p className="mt-1 text-gray-600">
                Resident ID: {resident.resident_id}
              </p>

              <span className="mt-3 inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                Active
              </span>
            </div>
          </div>
        </section>

        {/* Personal information */}
        <section className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-gray-800">
            Personal Information
          </h2>

          <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
            <Detail label="First Name" value={resident.first_name} />
            <Detail label="Last Name" value={resident.last_name} />
            <Detail label="Father's Name" value={resident.father_name} />
            <Detail label="CNIC" value={resident.cnic} />
            <Detail
              label="Mobile Number"
              value={
                resident.phone
                  ? String(resident.phone).replace(
                      /^(\d{4})-?(\d{7})$/,
                      "$1-$2",
                    )
                  : null
              }
            />
            <Detail label="Address" value={resident.address} />
            <Detail
              label="Admission Date"
              value={formatDate(resident.admission_date)}
            />
            <Detail
              label="Account Created"
              value={formatDate(resident.created_at)}
            />
          </div>
        </section>

        {/* Current room */}
        <section className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Current Room Allocation
          </h2>

          {activeAllocation ? (
            <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
              <Detail label="Room Name" value={activeAllocation.room_name} />
              <Detail
                label="Monthly Fee"
                value={`Rs. ${formatAmount(activeAllocation.monthly_fee)}`}
              />
              <Detail label="Room Capacity" value={activeAllocation.capacity} />
              <Detail
                label="Allocation Date"
                value={formatDate(activeAllocation.allocation_date)}
              />
              <Detail
                label="Allocation Status"
                value={activeAllocation.allocation_status}
              />
            </div>
          ) : (
            <p className="rounded-md bg-yellow-50 p-4 text-sm text-yellow-800">
              You currently have no active room allocation.
            </p>
          )}
        </section>

        {/* Room history */}
        <section className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Room Allocation History
          </h2>

          {resident.allocations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      "Room",
                      "Monthly Fee",
                      "Allocation Date",
                      "Vacation Date",
                      "Status",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {resident.allocations.map((allocation) => (
                    <tr key={allocation.allocation_id}>
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-800">
                        {allocation.room_name}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        Rs. {formatAmount(allocation.monthly_fee)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        {formatDate(allocation.allocation_date)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        {formatDate(allocation.vacation_date)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${
                            allocation.allocation_status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {allocation.allocation_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              No room allocation history is available.
            </p>
          )}
        </section>

        {/* Fee history */}
        <section className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Fee History
          </h2>

          <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Total Fees</p>
              <p className="mt-1 text-xl font-bold text-gray-800">
                Rs. {formatAmount(totalFees)}
              </p>
            </div>

            <div className="rounded-lg bg-green-50 p-4">
              <p className="text-sm text-gray-500">Total Paid</p>
              <p className="mt-1 text-xl font-bold text-green-700">
                Rs. {formatAmount(totalPaid)}
              </p>
            </div>

            <div className="rounded-lg bg-red-50 p-4">
              <p className="text-sm text-gray-500">Outstanding Balance</p>
              <p className="mt-1 text-xl font-bold text-red-700">
                Rs. {formatAmount(totalBalance)}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "Fee Month",
                    "Fee Amount",
                    "Paid",
                    "Balance",
                    "Due Date",
                    "Status",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {resident.fees.map((fee) => (
                  <tr key={fee.fee_id}>
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-800">
                      {formatMonth(fee.fee_month)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      Rs. {formatAmount(fee.amount)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-green-700">
                      Rs. {formatAmount(fee.total_paid)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-red-700">
                      Rs. {formatAmount(fee.balance)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      {formatDate(fee.due_date)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
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

                {resident.fees.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-sm text-gray-500"
                    >
                      No fee records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Payment history */}
        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold text-gray-800">
            Payment History
          </h2>

          <p className="mb-4 text-sm text-gray-500">
            Individual payments recorded against your fees.
          </p>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "Payment ID",
                    "Fee Month",
                    "Payment Date",
                    "Amount Received",
                    "Payment Method",
                    "Notes",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {resident.payments.map((payment) => (
                  <tr key={payment.payment_id}>
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-800">
                      {payment.payment_id}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      {formatMonth(payment.fee_month)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      {formatDate(payment.payment_date)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-green-700">
                      Rs. {formatAmount(payment.amount_paid)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      {payment.payment_method || "-"}
                    </td>
                    <td className="max-w-xs px-4 py-3 text-sm text-gray-600">
                      {payment.notes || "-"}
                    </td>
                  </tr>
                ))}

                {resident.payments.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-sm text-gray-500"
                    >
                      No payments have been recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

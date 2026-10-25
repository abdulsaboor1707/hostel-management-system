import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/app/lib/auth";
import { getRoomById, getRoomResidents } from "@/app/lib/rooms";

type RoomDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatAmount(amount: number) {
  return amount.toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export default async function RoomDetailsPage({
  params,
}: RoomDetailsPageProps) {
  await requireAdmin();

  const { id } = await params;
  const roomId = Number(id);

  if (!Number.isInteger(roomId) || roomId <= 0) {
    notFound();
  }

  const room = await getRoomById(roomId);

  if (!room) {
    notFound();
  }

  const residents = await getRoomResidents(roomId);

  const occupiedBeds = residents.length;
  const availableBeds = Math.max(0, room.capacity - occupiedBeds);

  return (
    <main className="space-y-6 p-8">
      <div>
        <Link
          href="/rooms"
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          &larr; Back to Rooms
        </Link>

        <h1 className="mt-3 text-2xl font-bold text-gray-900">Room Details</h1>

        <p className="mt-1 text-sm text-gray-500">
          Information and current residents of {room.room_name}.
        </p>
      </div>

      {/* Room information */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold text-gray-900">
          Room Information
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-sm text-gray-500">Room ID</p>
            <p className="mt-1 font-semibold text-gray-900">{room.room_id}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Room Name</p>
            <p className="mt-1 font-semibold text-gray-900">{room.room_name}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Monthly Fee</p>
            <p className="mt-1 font-semibold text-gray-900">
              Rs. {formatAmount(Number(room.monthly_fee))}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Total Capacity</p>
            <p className="mt-1 font-semibold text-gray-900">{room.capacity}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Occupied Beds</p>
            <p className="mt-1 font-semibold text-blue-700">{occupiedBeds}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Available Beds</p>
            <p
              className={`mt-1 font-semibold ${
                availableBeds > 0 ? "text-green-700" : "text-red-700"
              }`}
            >
              {availableBeds}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Room Status</p>
            <span
              className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-medium ${
                room.status === "active"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {room.status}
            </span>
          </div>
        </div>

        <div className="mt-6 border-t border-gray-100 pt-5">
          <Link
            href={`/rooms/${room.room_id}/edit`}
            className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Edit Room
          </Link>
        </div>
      </section>

      {/* Current residents */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Current Residents
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Residents currently allocated to this room.
            </p>
          </div>

          <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
            {residents.length} resident(s)
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-600">
              <tr>
                <th className="px-5 py-4">Resident ID</th>
                <th className="px-5 py-4">Resident Name</th>
                <th className="px-5 py-4">Father Name</th>
                <th className="px-5 py-4">Phone</th>
                <th className="px-5 py-4">Allocation Date</th>
                <th className="px-5 py-4">Details</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {residents.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-8 text-center text-gray-500"
                  >
                    No residents are currently allocated to this room.
                  </td>
                </tr>
              ) : (
                residents.map((resident) => (
                  <tr key={resident.resident_id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">{resident.resident_id}</td>

                    <td className="px-5 py-4 font-medium text-gray-900">
                      {resident.first_name} {resident.last_name}
                    </td>

                    <td className="px-5 py-4">{resident.father_name ?? "-"}</td>

                    <td className="px-5 py-4">
                      {resident.phone
                        ? resident.phone.replace(/^(\d{4})-?(\d{7})$/, "$1-$2")
                        : "-"}
                    </td>

                    <td className="px-5 py-4">
                      {resident.allocation_date
                        ? new Date(resident.allocation_date).toLocaleDateString(
                            "en-PK",
                          )
                        : "-"}
                    </td>

                    <td className="px-5 py-4">
                      <Link
                        href={`/residents/${resident.resident_id}`}
                        className="inline-block rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

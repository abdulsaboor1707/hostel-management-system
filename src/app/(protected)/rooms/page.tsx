import Link from "next/link";
import { requireAdmin } from "@/app/lib/auth";
import { getRooms } from "@/app/lib/rooms";

function formatAmount(amount: number) {
  return amount.toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export default async function RoomsPage() {
  await requireAdmin();

  const rooms = await getRooms();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Rooms</h1>

        <p className="mt-1 text-sm text-gray-500">
          View room capacity, occupancy, fees, and status.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-600">
              <tr>
                <th className="px-5 py-4">Room ID</th>
                <th className="px-5 py-4">Room Name</th>
                <th className="px-5 py-4 text-right">Monthly Fee</th>
                <th className="px-5 py-4 text-center">Capacity</th>
                <th className="px-5 py-4 text-center">Occupied</th>
                <th className="px-5 py-4 text-center">Available</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {rooms.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-10 text-center text-gray-500"
                  >
                    No rooms found.
                  </td>
                </tr>
              ) : (
                rooms.map((room) => (
                  <tr key={room.room_id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 font-medium text-gray-900">
                      {room.room_id}
                    </td>

                    <td className="px-5 py-4 text-gray-700">
                      {room.room_name}
                    </td>

                    <td className="px-5 py-4 text-right text-gray-700">
                      Rs. {formatAmount(room.monthly_fee)}
                    </td>

                    <td className="px-5 py-4 text-center">{room.capacity}</td>

                    <td className="px-5 py-4 text-center">
                      {room.occupied_beds}
                    </td>

                    <td className="px-5 py-4 text-center">
                      <span
                        className={
                          room.available_beds > 0
                            ? "font-semibold text-green-700"
                            : "font-semibold text-red-700"
                        }
                      >
                        {room.available_beds}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          room.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {room.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <Link
                          href={`/rooms/${room.room_id}`}
                          className="font-medium text-purple-600 hover:text-purple-800"
                        >
                          Details
                        </Link>

                        <Link
                          href={`/rooms/${room.room_id}/residents`}
                          className="font-medium text-green-600 hover:text-green-800"
                        >
                          View Residents
                        </Link>

                        <Link
                          href={`/rooms/${room.room_id}/edit`}
                          className="font-medium text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-sm text-gray-500">Total rooms: {rooms.length}</p>
    </div>
  );
}

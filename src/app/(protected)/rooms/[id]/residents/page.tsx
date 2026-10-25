import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/app/lib/auth";
import { getRoomById, getRoomResidents } from "@/app/lib/rooms";

type RoomResidentsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function RoomResidentsPage({
  params,
}: RoomResidentsPageProps) {
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

  return (
    <main className="space-y-6 p-8">
      <div>
        <Link
          href="/rooms"
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          &larr; Back to Rooms
        </Link>

        <h1 className="mt-3 text-2xl font-bold text-gray-900">
          Residents of {room.room_name}
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Room ID: {room.room_id} | Occupied residents: {residents.length}
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border-b p-3">Picture</th>
              <th className="border-b p-3">Resident Name</th>
              <th className="border-b p-3">Father Name</th>
              <th className="border-b p-3">Phone</th>
              <th className="border-b p-3">Allocation Date</th>
              <th className="border-b p-3">Status</th>
              <th className="border-b p-3">Details</th>
            </tr>
          </thead>

          <tbody>
            {residents.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">
                  No residents are currently allocated to this room.
                </td>
              </tr>
            ) : (
              residents.map((resident) => (
                <tr key={resident.resident_id} className="hover:bg-gray-50">
                  <td className="border-b p-3">
                    {resident.profile_picture ? (
                      <Image
                        src={resident.profile_picture}
                        alt={`${resident.first_name} ${resident.last_name}`}
                        width={40}
                        height={40}
                        className="h-10 w-10 object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center bg-gray-200 text-xs text-gray-500">
                        No photo
                      </div>
                    )}
                  </td>

                  <td className="border-b p-3">
                    {resident.first_name} {resident.last_name}
                  </td>

                  <td className="border-b p-3">
                    {resident.father_name ?? "-"}
                  </td>

                  <td className="border-b p-3">
                    {resident.phone
                      ? resident.phone.replace(/^(\d{4})-?(\d{7})$/, "$1-$2")
                      : "-"}
                  </td>

                  <td className="border-b p-3">
                    {resident.allocation_date
                      ? new Date(resident.allocation_date).toLocaleDateString(
                          "en-PK",
                        )
                      : "-"}
                  </td>

                  <td className="border-b p-3">{resident.status}</td>

                  <td className="border-b p-3">
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
    </main>
  );
}

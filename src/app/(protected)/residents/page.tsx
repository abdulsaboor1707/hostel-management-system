import { getResidents } from "@/app/lib/residents";
import Image from "next/image";

export default async function ResidentsPage() {
  const residents = await getResidents();

  return (
    <main className="p-8">
      <h1 className="mb-6 text-2xl font-bold">Residents</h1>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-3 text-left">Picture</th>
              <th className="border p-3 text-left">Resident Name</th>
              <th className="border p-3 text-left">Father Name</th>
              <th className="border p-3 text-left">Phone</th>
              <th className="border p-3 text-left">Status</th>
              <th className="border p-3 text-left">Details</th>
            </tr>
          </thead>

          <tbody>
            {residents.map((resident) => (
              <tr key={resident.resident_id}>
                <td className="border px-4 py-3">
                  {resident.profile_picture ? (
                    <Image
                      src={resident.profile_picture}
                      alt={`${resident.first_name} ${resident.last_name}`}
                      width={40}
                      height={40}
                      className="h-10 w-10  object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center  bg-gray-200 text-xs text-gray-500">
                      No photo
                    </div>
                  )}
                </td>

                <td className="border p-3">
                  {resident.first_name}&nbsp;{resident.last_name}
                </td>
                <td className="border p-3">{resident.father_name ?? "-"}</td>

                <td className="border p-3">
                  {resident.phone
                    ? resident.phone.replace(/^(\d{4})-?(\d{7})$/, "$1-$2")
                    : "-"}
                </td>

                <td className="border p-3">{resident.status}</td>
                <td className="border p-3">
                  {/* <button
                    type="button"
                    disabled
                    className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white opacity-60"
                  >
                    Details
                  </button> */}

                  <a
                    href={`/residents/${resident.resident_id}`}
                    className="inline-block rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Details
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

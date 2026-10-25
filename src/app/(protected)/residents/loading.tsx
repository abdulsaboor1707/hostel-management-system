export default function ResidentsLoading() {
  const skeletonRows = Array.from({ length: 5 });

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
            {skeletonRows.map((_, index) => (
              <tr key={index}>
                {/* Picture */}
                <td className="border px-4 py-3">
                  <div className="h-10 w-10 animate-pulse rounded bg-gray-200" />
                </td>

                {/* Resident Name */}
                <td className="border p-3">
                  <div className="h-4 w-36 animate-pulse rounded bg-gray-200" />
                </td>

                {/* Father Name */}
                <td className="border p-3">
                  <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
                </td>

                {/* Phone */}
                <td className="border p-3">
                  <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
                </td>

                {/* Status */}
                <td className="border p-3">
                  <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
                </td>

                {/* Details */}
                <td className="border p-3">
                  <div className="h-8 w-16 animate-pulse rounded bg-gray-200" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

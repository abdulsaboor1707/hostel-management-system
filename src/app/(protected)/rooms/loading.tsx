export default function RoomsLoading() {
  const skeletonRows = Array.from({ length: 5 });

  return (
    <main className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="h-8 w-40 animate-pulse rounded bg-gray-200" />

        <div className="h-10 w-32 animate-pulse rounded-md bg-gray-200" />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-3 text-left">Room Number</th>
              <th className="border p-3 text-left">Room Name</th>
              <th className="border p-3 text-left">Monthly Fee</th>
              <th className="border p-3 text-left">Capacity</th>
              <th className="border p-3 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {skeletonRows.map((_, index) => (
              <tr key={index}>
                {Array.from({ length: 5 }).map((_, columnIndex) => (
                  <td key={columnIndex} className="border px-4 py-4">
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

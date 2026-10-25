export default function FeesLoading() {
  const skeletonRows = Array.from({ length: 5 });

  return (
    <main className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />

        <div className="h-10 w-44 animate-pulse rounded-md bg-gray-200" />
      </div>

      {/* Skeleton summary cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="rounded-lg border border-gray-200 p-5">
            <div className="mb-3 h-4 w-28 animate-pulse rounded bg-gray-200" />
            <div className="h-7 w-36 animate-pulse rounded bg-gray-200" />
          </div>
        ))}
      </div>

      {/* Skeleton fees table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-3 text-left">Resident</th>
              <th className="border p-3 text-left">Fee Month</th>
              <th className="border p-3 text-left">Amount</th>
              <th className="border p-3 text-left">Paid</th>
              <th className="border p-3 text-left">Balance</th>
              <th className="border p-3 text-left">Due Date</th>
              <th className="border p-3 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {skeletonRows.map((_, index) => (
              <tr key={index}>
                {Array.from({ length: 7 }).map((_, columnIndex) => (
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

export default function ExpensesLoading() {
  const skeletonRows = Array.from({ length: 5 });

  return (
    <main className="space-y-6 p-8">
      {/* Page heading and Add Expense button */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />

        <div className="h-10 w-36 animate-pulse rounded-md bg-gray-200" />
      </div>

      {/* Total Expenses card */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-3 h-4 w-32 animate-pulse rounded bg-gray-200" />
        <div className="h-8 w-40 animate-pulse rounded bg-gray-200" />
      </div>

      {/* Financial comparison chart placeholder */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-2 h-6 w-64 animate-pulse rounded bg-gray-200" />
        <div className="mb-6 h-4 w-80 max-w-full animate-pulse rounded bg-gray-200" />

        <div className="flex h-64 items-end justify-around gap-4">
          {Array.from({ length: 12 }).map((_, index) => (
            <div
              key={index}
              className="flex flex-1 items-end justify-center gap-1"
            >
              <div
                className="w-2 animate-pulse rounded-t bg-gray-200 sm:w-3"
                style={{
                  height: `${35 + ((index * 17) % 55)}%`,
                }}
              />
              <div
                className="w-2 animate-pulse rounded-t bg-gray-300 sm:w-3"
                style={{
                  height: `${25 + ((index * 23) % 50)}%`,
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Expenses table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-3 text-left">Date</th>
              <th className="border p-3 text-left">Category</th>
              <th className="border p-3 text-left">Description</th>
              <th className="border p-3 text-left">Amount</th>
              <th className="border p-3 text-left">Actions</th>
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

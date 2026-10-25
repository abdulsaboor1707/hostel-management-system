import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md rounded-xl bg-white p-8 text-center shadow">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>

        <p className="mt-3 text-gray-600">
          You do not have permission to access this page.
        </p>

        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
        >
          Return to Dashboard
        </Link>
      </div>
    </main>
  );
}

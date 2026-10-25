import { getSession } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import ManagementHeader from "@/app/components/ManagementHeader";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Residents must change their initial password first.
  if (session.role === "resident" && session.mustChangePassword) {
    redirect("/change-password");
  }

  // Residents must not access the administration area.
  if (session.role !== "admin") {
    redirect("/unauthorized");
  }

  return (
    <div className="app-shell">
      <ManagementHeader />

      <main className="app-main">
        {children}
      </main>
    </div>
  );
}

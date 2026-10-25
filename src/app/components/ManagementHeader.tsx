import Link from "next/link";
import { getSession } from "@/app/lib/auth";
import LogoutButton from "./LogoutButton";

export default async function ManagementHeader() {
  const session = await getSession();

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <div className="app-header-top">
          <Link href="/" className="app-brand">
            <span className="app-brand-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M5 21V5.5A1.5 1.5 0 0 1 6.5 4h11A1.5 1.5 0 0 1 19 5.5V21M3 21h18M9 8h2m2 0h2m-6 4h2m2 0h2m-6 4h2m2 0h2m-5 5v-3h4v3" />
              </svg>
            </span>
            <span>
              <span className="app-brand-name">Student Boy&apos;s Hostel</span>
              <span className="app-brand-caption">HOSTEL MANAGEMENT</span>
            </span>
          </Link>

          <div className="app-user">
            <div className="app-user-avatar" aria-hidden="true">
              {session?.fullName?.trim().charAt(0).toUpperCase() || "A"}
            </div>
            <div className="app-user-details">
              <span className="app-user-name">{session?.fullName}</span>
              <span className="app-user-role">{session?.role}</span>
            </div>
            <LogoutButton />
          </div>
        </div>

        <nav className="app-nav" aria-label="Main navigation">
          <Link href="/" className="app-nav-link">
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="3" width="6" height="6" rx="1.5" />
              <rect x="11" y="3" width="6" height="6" rx="1.5" />
              <rect x="3" y="11" width="6" height="6" rx="1.5" />
              <rect x="11" y="11" width="6" height="6" rx="1.5" />
            </svg>
            Dashboard
          </Link>

          <Link href="/residents" className="app-nav-link">
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="6" r="3" />
              <path d="M4.5 17v-1.5a5.5 5.5 0 0 1 11 0V17z" />
            </svg>
            Residents
          </Link>

          <Link href="/rooms" className="app-nav-link">
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
              <path d="m2.5 9 7.5-6 7.5 6v8a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1z" />
              <path d="M8 18v-5h4v5" />
            </svg>
            Rooms
          </Link>

          <Link href="/fees" className="app-nav-link">
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
              <rect x="4" y="2.5" width="12" height="15" rx="2" />
              <path d="M7 7h6M7 10.5h6M7 14h3" />
            </svg>
            Fees
          </Link>

          <Link href="/payments" className="app-nav-link">
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
              <path d="M4 13.5 8 9.5l3 3L16.5 7" />
              <path d="M12.5 7h4v4" />
            </svg>
            Payments
          </Link>

          <Link href="/expenses" className="app-nav-link">
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="7" />
              <path d="M10 6v8M12.5 7.5H9a1.5 1.5 0 0 0 0 3h2a1.5 1.5 0 0 1 0 3H7.5" />
            </svg>
            Expenses
          </Link>
        </nav>
      </div>
    </header>
  );
}

import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="app-brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M5 21V5.5A1.5 1.5 0 0 1 6.5 4h11A1.5 1.5 0 0 1 19 5.5V21M3 21h18M9 8h2m2 0h2m-6 4h2m2 0h2m-6 4h2m2 0h2m-5 5v-3h4v3" />
            </svg>
          </span>
          <span className="app-brand-name">Student Boy&apos;s Hostel</span>
          <span className="app-brand-caption">HOSTEL MANAGEMENT</span>
          <h1>Welcome back</h1>

          <p>Sign in to continue to your dashboard</p>
        </div>

        <LoginForm />

        <p className="auth-footnote">
          Authorized users only
        </p>
      </div>
    </main>
  );
}

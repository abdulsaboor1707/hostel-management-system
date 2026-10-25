import { logoutAction } from "@/app/actions/authActions";

export default function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button type="submit" className="app-logout">
        Logout
      </button>
    </form>
  );
}

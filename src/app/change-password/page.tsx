"use client";

import { useActionState } from "react";
import {
  changePasswordAction,
  type PasswordState,
} from "@/app/actions/passwordActions";

const initialState: PasswordState = {
  success: false,
  message: "",
};

export default function ChangePasswordPage() {
  const [state, formAction, isPending] = useActionState(
    changePasswordAction,
    initialState,
  );

  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          Change Your Password
        </h1>

        <p className="mb-6 text-sm text-gray-600">
          For your security, change your initial password before continuing.
        </p>

        <form action={formAction} className="space-y-5">
          <div>
            <label
              htmlFor="currentPassword"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Current Password
            </label>

            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label
              htmlFor="newPassword"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              New Password
            </label>

            <input
              id="newPassword"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />

            <p className="mt-1 text-xs text-gray-500">
              Use at least 8 characters.
            </p>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Confirm New Password
            </label>

            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          {state.message && (
            <p
              role="alert"
              className={`text-sm ${
                state.success ? "text-green-700" : "text-red-600"
              }`}
            >
              {state.message}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Changing Password..." : "Change Password"}
          </button>
        </form>
      </div>
    </main>
  );
}

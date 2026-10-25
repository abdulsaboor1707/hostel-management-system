"use server";

import { createSession, destroySession } from "@/app/lib/auth";
import { pool } from "@/app/lib/db";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export type LoginState = {
  success: boolean;
  message: string;
};

export async function loginAction(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return {
      success: false,
      message: "Please enter your username and password.",
    };
  }

  let redirectPath = "/";

  try {
    const result = await pool.query(
      `SELECT
          u.user_id,
          u.username,
          u.password_hash,
          u.full_name,
          u.status AS user_status,
          u.resident_id,
          u.must_change_password,
          r.role_name,
          r.status AS role_status,
          res.status AS resident_status
       FROM users u
       JOIN roles r
         ON r.role_id = u.role_id
       LEFT JOIN residents res
         ON res.resident_id = u.resident_id
       WHERE u.username = $1
       LIMIT 1`,
      [username],
    );

    if (result.rowCount === 0) {
      return {
        success: false,
        message: "Invalid username or password.",
      };
    }

    const user = result.rows[0];

    if (
      user.user_status !== "active" ||
      user.role_status !== "active" ||
      !["admin", "resident"].includes(user.role_name)
    ) {
      return {
        success: false,
        message: "Your account is inactive or does not have an allowed role.",
      };
    }

    // A resident must have a linked, active resident record.
    if (user.role_name === "resident") {
      if (
        user.resident_id === null ||
        user.resident_id === undefined ||
        user.resident_status !== "active"
      ) {
        return {
          success: false,
          message: "Your resident account is inactive or unavailable.",
        };
      }
    }

    // Verify the password.
    if (
      typeof user.password_hash !== "string" ||
      !user.password_hash ||
      !(await bcrypt.compare(password, user.password_hash))
    ) {
      return {
        success: false,
        message: "Invalid username or password.",
      };
    }

    // Choose the destination according to the user's role and account state.
    if (user.role_name === "resident") {
      redirectPath = user.must_change_password
        ? "/change-password"
        : "/my-details";
    }

    await createSession({
      userId: Number(user.user_id),
      username: user.username,
      fullName: user.full_name,
      role: user.role_name,
      residentId:
        user.role_name === "resident" ? Number(user.resident_id) : null,
      mustChangePassword:
        user.role_name === "resident" && user.must_change_password === true,
    });
  } catch (error) {
    console.error("Login failed:", error);

    return {
      success: false,
      message: "Unable to log in right now. Please try again.",
    };
  }

  redirect(redirectPath);
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}

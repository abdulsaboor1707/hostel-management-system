"use server";

import { getSession } from "@/app/lib/auth";
import { pool } from "@/app/lib/db";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export type PasswordState = {
  success: boolean;
  message: string;
};

export async function changePasswordAction(
  _previousState: PasswordState,
  formData: FormData,
): Promise<PasswordState> {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "resident" || session.residentId === null) {
    redirect("/unauthorized");
  }

  if (!session.mustChangePassword) {
    redirect("/my-details");
  }

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!currentPassword || !newPassword || !confirmPassword) {
    return {
      success: false,
      message: "Please fill in all password fields.",
    };
  }

  if (newPassword.length < 8) {
    return {
      success: false,
      message: "Your new password must be at least 8 characters long.",
    };
  }

  if (newPassword.length > 128) {
    return {
      success: false,
      message: "Your new password must not exceed 128 characters.",
    };
  }

  if (newPassword !== confirmPassword) {
    return {
      success: false,
      message: "The new password and confirmation do not match.",
    };
  }

  if (currentPassword === newPassword) {
    return {
      success: false,
      message: "Your new password must differ from your current password.",
    };
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Lock the account row while checking and changing its password.
    const result = await client.query(
      `SELECT password_hash, resident_id, must_change_password
       FROM users
       WHERE user_id = $1
         AND status = 'active'
       FOR UPDATE`,
      [session.userId],
    );

    if (result.rowCount === 0) {
      await client.query("ROLLBACK");
      redirect("/login");
    }

    const user = result.rows[0];

    if (
      Number(user.resident_id) !== session.residentId ||
      user.must_change_password !== true
    ) {
      await client.query("ROLLBACK");
      redirect("/my-details");
    }

    const residentResult = await client.query(
      `SELECT resident_id
       FROM residents
       WHERE resident_id = $1
         AND status = 'active'
       LIMIT 1`,
      [session.residentId],
    );

    if (residentResult.rowCount === 0) {
      await client.query("ROLLBACK");
      redirect("/login");
    }

    const passwordMatches = await bcrypt.compare(
      currentPassword,
      user.password_hash,
    );

    if (!passwordMatches) {
      await client.query("ROLLBACK");
      return {
        success: false,
        message: "Your current password is incorrect.",
      };
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await client.query(
      `UPDATE users
       SET password_hash = $1,
           must_change_password = FALSE,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2`,
      [passwordHash, session.userId],
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Password change failed:", error);

    return {
      success: false,
      message: "Unable to change your password. Please try again.",
    };
  } finally {
    client.release();
  }

  redirect("/my-details");
}

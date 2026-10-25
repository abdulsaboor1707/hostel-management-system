import "server-only";

import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { pool } from "@/app/lib/db";

const secret = process.env.SESSION_SECRET;

if (!secret) {
  throw new Error("SESSION_SECRET is missing from .env");
}

const secretKey = new TextEncoder().encode(secret);

export type SessionUser = {
  userId: number;
  username: string;
  fullName: string;
  role: "admin" | "resident";
  residentId: number | null;
  mustChangePassword: boolean;
};

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({
    userId: user.userId,
    username: user.username,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secretKey);

  const cookieStore = await cookies();

  cookieStore.set("hostel_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("hostel_session")?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secretKey);

    if (
      typeof payload.userId !== "number" ||
      typeof payload.username !== "string"
    ) {
      return null;
    }

    const result = await pool.query(
      `SELECT
         u.user_id,
         u.username,
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
       WHERE u.user_id = $1
         AND u.username = $2
       LIMIT 1`,
      [payload.userId, payload.username],
    );

    if (result.rowCount === 0) return null;

    const user = result.rows[0];

    if (
      user.user_status !== "active" ||
      user.role_status !== "active" ||
      !["admin", "resident"].includes(user.role_name)
    ) {
      return null;
    }

    let residentId: number | null = null;

    if (user.role_name === "resident") {
      if (
        user.resident_id === null ||
        user.resident_id === undefined ||
        user.resident_status !== "active"
      ) {
        return null;
      }

      residentId = Number(user.resident_id);
    }

    return {
      userId: Number(user.user_id),
      username: user.username,
      fullName: user.full_name,
      role: user.role_name as "admin" | "resident",
      residentId,
      mustChangePassword:
        user.role_name === "resident" && user.must_change_password === true,
    };
  } catch (error) {
    console.error("Session verification failed:", error);
    return null;
  }
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete("hostel_session");
}

export async function requireAdmin() {
  const session = await getSession();

  if (!session) redirect("/login");

  if (session.role !== "admin") redirect("/unauthorized");

  return session;
}

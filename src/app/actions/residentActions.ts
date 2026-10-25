"use server";

import { requireAdmin } from "@/app/lib/auth";
import { randomUUID } from "crypto";
import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import { pool } from "@/app/lib/db";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function addResident(
  previousState: { success: boolean; message: string },
  formData: FormData,
) {
  await requireAdmin();

  const firstName = String(formData.get("first_name") ?? "").trim();
  const lastName = String(formData.get("last_name") ?? "").trim();
  const fatherName = String(formData.get("father_name") ?? "").trim();
  const cnic = String(formData.get("cnic") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const admissionDate = String(formData.get("admission_date") ?? "");
  const roomId = Number(formData.get("room_id"));
  const picture = formData.get("profile_picture");

  let picturePath: string | null = null;
  let pictureBuffer: Buffer | null = null;
  let pictureExtension = "";

  // Validate the picture.
  if (picture instanceof File && picture.size > 0) {
    const allowedTypes: Record<string, string> = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
    };

    if (!allowedTypes[picture.type]) {
      return {
        success: false,
        message: "Please upload a JPG, PNG, or WebP image.",
      };
    }

    if (picture.size > 2 * 1024 * 1024) {
      return {
        success: false,
        message: "Picture size must not exceed 2 MB.",
      };
    }

    pictureExtension = allowedTypes[picture.type];
    pictureBuffer = Buffer.from(await picture.arrayBuffer());
  }

  // Validate required fields.
  if (
    !firstName ||
    !lastName ||
    !cnic ||
    !admissionDate ||
    !Number.isInteger(roomId) ||
    roomId <= 0
  ) {
    return {
      success: false,
      message:
        "Please complete all required fields, enter a CNIC, and select a room.",
    };
  }

  // Support CNIC values entered with or without hyphens.
  const cnicDigits = cnic.replace(/\D/g, "");

  if (!/^\d{13}$/.test(cnicDigits)) {
    return {
      success: false,
      message: "Please enter a valid 13-digit CNIC number.",
    };
  }

  // Generate a username base from the resident's first name.
  const usernameBase = firstName
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  if (!usernameBase) {
    return {
      success: false,
      message: "The first name cannot be used to generate a username.",
    };
  }

  // Validate the admission date.
  const dateMatch = admissionDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!dateMatch) {
    return {
      success: false,
      message: "Please enter a valid admission date.",
    };
  }

  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);

  const admissionDateObject = new Date(Date.UTC(year, month - 1, day));

  if (
    admissionDateObject.getUTCFullYear() !== year ||
    admissionDateObject.getUTCMonth() !== month - 1 ||
    admissionDateObject.getUTCDate() !== day
  ) {
    return {
      success: false,
      message: "Please enter a valid admission date.",
    };
  }

  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const chargeableDays = daysInMonth - day + 1;
  const feeMonth = `${year}-${String(month).padStart(2, "0")}-01`;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Find the active resident role.
    const roleResult = await client.query(
      `SELECT role_id
       FROM roles
       WHERE role_name = 'resident'
         AND status = 'active'
       LIMIT 1`,
    );

    if (roleResult.rowCount !== 1) {
      throw new Error("The active resident role was not found.");
    }

    const residentRoleId = roleResult.rows[0].role_id;

    // Prevent concurrent registrations from choosing the same username.
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [
      usernameBase,
    ]);

    // Choose the first available username:
    // ali, ali2, ali3, etc.
    const usernameResult = await client.query(
      `SELECT username
       FROM users
       WHERE username = $1
          OR (
            username ~ $2
          )`,
      [usernameBase, `^${usernameBase}[0-9]+$`],
    );

    const existingUsernames = new Set(
      usernameResult.rows.map((row: { username: string }) =>
        row.username.toLowerCase(),
      ),
    );

    let username = usernameBase;
    let suffix = 2;

    while (existingUsernames.has(username.toLowerCase())) {
      username = `${usernameBase}${suffix}`;
      suffix++;
    }

    // Initial password: first five digits of the CNIC.
    const initialPassword = cnicDigits.slice(0, 5);
    const passwordHash = await bcrypt.hash(initialPassword, 10);

    // Lock the selected room and get its monthly fee.
    const roomResult = await client.query(
      `SELECT room_id, capacity, monthly_fee
       FROM rooms
       WHERE room_id = $1
         AND status = 'active'
       FOR UPDATE`,
      [roomId],
    );

    if (roomResult.rowCount === 0) {
      await client.query("ROLLBACK");

      return {
        success: false,
        message: "The selected room is not available.",
      };
    }

    const capacity = Number(roomResult.rows[0].capacity);
    const monthlyFee = Number(roomResult.rows[0].monthly_fee);

    if (!Number.isFinite(monthlyFee) || monthlyFee < 0) {
      throw new Error("The selected room has an invalid monthly fee.");
    }

    // Check room capacity.
    const allocationResult = await client.query(
      `SELECT COUNT(*)::int AS occupied
       FROM room_allocations
       WHERE room_id = $1
         AND status = 'active'`,
      [roomId],
    );

    const occupied = allocationResult.rows[0].occupied;

    if (occupied >= capacity) {
      await client.query("ROLLBACK");

      return {
        success: false,
        message: "This room is full. Please select another room.",
      };
    }

    // Save the resident picture, if provided.
    if (pictureBuffer) {
      const uploadDirectory = path.join(
        process.cwd(),
        "public",
        "uploads",
        "residents",
      );

      await mkdir(uploadDirectory, { recursive: true });

      const fileName = `${randomUUID()}${pictureExtension}`;
      picturePath = `/uploads/residents/${fileName}`;

      await writeFile(path.join(uploadDirectory, fileName), pictureBuffer, {
        flag: "wx",
      });
    }

    // Register the resident.
    const residentResult = await client.query(
      `INSERT INTO residents
        (
          first_name,
          last_name,
          father_name,
          cnic,
          phone,
          address,
          admission_date,
          status,
          profile_picture
        )
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', $8)
       RETURNING resident_id`,
      [
        firstName,
        lastName,
        fatherName || null,
        cnic,
        phone || null,
        address || null,
        admissionDate,
        picturePath,
      ],
    );

    const residentId = residentResult.rows[0].resident_id;

    // Create the resident's login account.
    await client.query(
      `INSERT INTO users
        (
          username,
          password_hash,
          full_name,
          role_id,
          status,
          resident_id,
          must_change_password
        )
       VALUES ($1, $2, $3, $4, 'active', $5, TRUE)`,
      [
        username,
        passwordHash,
        `${firstName} ${lastName}`,
        residentRoleId,
        residentId,
      ],
    );
    // Allocate the room and save the agreed monthly fee.
    const allocationInsert = await client.query(
      `INSERT INTO room_allocations
    (resident_id, room_id, allocation_date, monthly_fee, status)
   VALUES ($1, $2, $3, $4, 'active')
   RETURNING allocation_id`,
      [residentId, roomId, admissionDate, monthlyFee],
    );

    const allocationId = allocationInsert.rows[0].allocation_id;

    // Calculate the first month's prorated fee.
    // Round to two decimal places for monetary accuracy.
    const firstMonthFee = Math.floor(
      (monthlyFee * chargeableDays) / daysInMonth,
    );

    // Create the first fee record.
    await client.query(
      `INSERT INTO fees
        (
          resident_id,
          allocation_id,
          fee_month,
          amount,
          due_date,
          status,
          description
        )
       VALUES ($1, $2, $3, $4, $5, 'unpaid', $6)`,
      [
        residentId,
        allocationId,
        feeMonth,
        firstMonthFee,
        admissionDate,
        `Prorated fee for ${feeMonth}`,
      ],
    );

    // Commit resident, account, allocation and fee together.
    await client.query("COMMIT");

    revalidatePath("/residents");

    return {
      success: true,
      message:
        `Resident registered successfully. Login username: ${username}. ` +
        "Initial password: the first five digits of the CNIC. " +
        "The resident must change this password on first login.",
    };
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("Transaction rollback failed:", rollbackError);
    }

    // Remove the picture if the database transaction failed.
    if (picturePath) {
      try {
        await unlink(
          path.join(process.cwd(), "public", picturePath.replace(/^\/+/, "")),
        );
      } catch (cleanupError) {
        console.error("Could not remove uploaded picture:", cleanupError);
      }
    }

    console.error("Failed to register resident:", error);

    return {
      success: false,
      message:
        "Could not register the resident, create the login account, or generate the first fee. Check the entered details and try again.",
    };
  } finally {
    client.release();
  }
}

export async function checkCnicExists(cnic: string) {
  await requireAdmin();

  const cnicDigits = cnic.replace(/\D/g, "");

  // Check only when all 13 digits have been entered.
  if (!/^\d{13}$/.test(cnicDigits)) {
    return {
      checked: false,
      exists: false,
      message: "",
    };
  }

  try {
    const result = await pool.query(
      `SELECT 1
       FROM residents
       WHERE REGEXP_REPLACE(cnic, '[^0-9]', '', 'g') = $1
       LIMIT 1`,
      [cnicDigits],
    );

    if (result.rowCount && result.rowCount > 0) {
      return {
        checked: true,
        exists: true,
        message: "This CNIC is already registered.",
      };
    }

    return {
      checked: true,
      exists: false,
      message: "CNIC is available.",
    };
  } catch (error) {
    console.error("Failed to check CNIC:", error);

    return {
      checked: false,
      exists: false,
      message: "Could not check CNIC. Please try again.",
    };
  }
}

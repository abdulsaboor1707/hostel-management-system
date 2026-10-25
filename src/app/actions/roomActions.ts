"use server";

import { pool } from "@/app/lib/db";
import { requireAdmin } from "@/app/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type RoomActionState = {
  error?: string;
};

export async function updateRoom(
  _previousState: RoomActionState,
  formData: FormData,
): Promise<RoomActionState> {
  await requireAdmin();

  // 1. Read form values.
  const roomId = Number(formData.get("room_id"));
  const roomName = String(formData.get("room_name") ?? "").trim();
  const monthlyFeeValue = String(formData.get("monthly_fee") ?? "").trim();
  const capacityValue = String(formData.get("capacity") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();

  const monthlyFee = Number(monthlyFeeValue);
  const capacity = Number(capacityValue);

  // 2. Validate the input.
  if (!Number.isInteger(roomId) || roomId <= 0) {
    return { error: "Invalid room ID." };
  }

  if (!roomName || roomName.length > 100) {
    return {
      error: "Room name is required and must not exceed 100 characters.",
    };
  }

  if (
    monthlyFeeValue === "" ||
    !Number.isFinite(monthlyFee) ||
    monthlyFee < 0
  ) {
    return { error: "Enter a valid monthly fee." };
  }

  if (capacityValue === "" || !Number.isInteger(capacity) || capacity < 1) {
    return {
      error: "Capacity must be a whole number greater than zero.",
    };
  }

  if (!["active", "inactive"].includes(status)) {
    return { error: "Select a valid room status." };
  }

  // 3. Check that the room exists.
  const roomResult = await pool.query(
    `SELECT room_id FROM rooms WHERE room_id = $1`,
    [roomId],
  );

  if (roomResult.rows.length === 0) {
    return { error: "Room not found." };
  }

  // 4. Count current occupants.
  const occupancyResult = await pool.query(
    `
      SELECT COUNT(*)::int AS occupied_beds
      FROM room_allocations
      WHERE room_id = $1
        AND status = 'active'
        AND vacation_date IS NULL
    `,
    [roomId],
  );

  const occupiedBeds = Number(occupancyResult.rows[0].occupied_beds);

  // 5. Prevent capacity from falling below occupancy.
  if (capacity < occupiedBeds) {
    return {
      error: `Capacity cannot be less than the ${occupiedBeds} currently occupied beds.`,
    };
  }

  // 6. Prevent deactivating an occupied room.
  if (status === "inactive" && occupiedBeds > 0) {
    return {
      error:
        "This room cannot be deactivated while residents are allocated to it.",
    };
  }

  // 7. Update the room.
  await pool.query(
    `
      UPDATE rooms
      SET
        room_name = $1,
        monthly_fee = $2,
        capacity = $3,
        status = $4,
        updated_at = NOW()
      WHERE room_id = $5
    `,
    [roomName, monthlyFee, capacity, status, roomId],
  );

  // 8. Refresh the Rooms listing.
  revalidatePath("/rooms");

  // Return to the listing after a successful update.
  redirect("/rooms");
}

import { pool } from "@/app/lib/db";
import { resolve } from "path";

// Used by the resident registration form.
// Returns only active rooms with available beds.
export async function getAvailableRooms() {
  const result = await pool.query(`
    SELECT
      r.room_id,
      r.room_name,
      r.monthly_fee,
      r.capacity,
      r.capacity - COUNT(ra.allocation_id) AS available_beds
    FROM rooms r
    LEFT JOIN room_allocations ra
      ON r.room_id = ra.room_id
      AND ra.status = 'active'
      AND ra.vacation_date IS NULL
    WHERE r.status = 'active'
    GROUP BY
      r.room_id,
      r.room_name,
      r.monthly_fee,
      r.capacity
    HAVING r.capacity - COUNT(ra.allocation_id) > 0
    ORDER BY r.room_name
  `);

  return result.rows;
}

// Used by the Rooms listing page.
// Returns all rooms, including inactive and fully occupied rooms.
export async function getRooms() {
  const result = await pool.query(`
    SELECT
      r.room_id,
      r.room_name,
      r.monthly_fee,
      r.capacity,
      r.status,
      COUNT(ra.allocation_id)::int AS occupied_beds,
      (
        r.capacity - COUNT(ra.allocation_id)
      )::int AS available_beds
    FROM rooms r
    LEFT JOIN room_allocations ra
      ON ra.room_id = r.room_id
      AND ra.status = 'active'
      AND ra.vacation_date IS NULL
    GROUP BY
      r.room_id,
      r.room_name,
      r.monthly_fee,
      r.capacity,
      r.status
    ORDER BY r.room_id
  `);

  return result.rows.map((room) => ({
    ...room,
    room_id: Number(room.room_id),
    monthly_fee: Number(room.monthly_fee),
    capacity: Number(room.capacity),
    occupied_beds: Number(room.occupied_beds),
    available_beds: Number(room.available_beds),
  }));
}

// Used by the Edit Room page to retrieve one room.
export async function getRoomById(roomId: number) {
  const result = await pool.query(
    `
      SELECT
        room_id,
        room_name,
        monthly_fee,
        capacity,
        status
      FROM rooms
      WHERE room_id = $1
    `,
    [roomId],
  );

  if (result.rows.length === 0) {
    return null;
  }

  const room = result.rows[0];

  return {
    ...room,
    room_id: Number(room.room_id),
    monthly_fee: Number(room.monthly_fee),
    capacity: Number(room.capacity),
  };
}

// Get residents currently allocated to a specific room.
export async function getRoomResidents(roomId: number) {
  const result = await pool.query(
    `
      SELECT
        r.resident_id,
        r.first_name,
        r.last_name,
        r.father_name,
        r.phone,
        r.profile_picture,
        r.status,
        ra.allocation_date
      FROM room_allocations ra
      INNER JOIN residents r
        ON r.resident_id = ra.resident_id
      WHERE ra.room_id = $1
        AND ra.status = 'active'
        AND ra.vacation_date IS NULL
      ORDER BY r.first_name, r.last_name
    `,
    [roomId],
  );

  return result.rows;
}

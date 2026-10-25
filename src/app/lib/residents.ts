import { pool } from "@/app/lib/db";

export async function getResidents() {
  const result = await pool.query(`
    SELECT
      resident_id,
      first_name,
      last_name,
      father_name,
      phone,
      status,
      profile_picture
    FROM residents
    ORDER BY resident_id
  `);

  return result.rows;
}

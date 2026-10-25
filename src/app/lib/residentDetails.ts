import { pool } from "@/app/lib/db";

type DateValue = Date | string | null;

type NumericValue = number | string;

type ResidentRow = {
  resident_id: number | string;
  first_name: string;
  last_name: string;
  father_name: string | null;
  cnic: string | null;
  phone: string | null;
  address: string | null;
  admission_date: DateValue;
  status: string;
  profile_picture: string | null;
  created_at: DateValue;
  updated_at: DateValue;
};

type AllocationRow = {
  allocation_id: NumericValue;
  room_id: NumericValue;
  allocation_date: DateValue;
  vacation_date: DateValue;
  allocation_status: string;
  room_name: string;
  monthly_fee: NumericValue;
  capacity: NumericValue;
};

type FeeRow = {
  fee_id: NumericValue;
  fee_month: DateValue;
  amount: NumericValue;
  due_date: DateValue;
  description: string | null;
  total_paid: NumericValue;
  balance: NumericValue;
  calculated_status: string;
};

type PaymentRow = {
  payment_id: NumericValue;
  fee_id: NumericValue;
  amount_paid: NumericValue;
  payment_date: DateValue;
  payment_method: string | null;
  notes: string | null;
  fee_month: DateValue;
};

function normalizeDate(value: DateValue): string | null {
  if (!value) return null;

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return value.slice(0, 10);
}

export async function getResidentDetails(residentId: number) {
  // 1. Get resident information.
  const residentResult = await pool.query<ResidentRow>(
    `
      SELECT
        resident_id,
        first_name,
        last_name,
        father_name,
        cnic,
        phone,
        address,
        admission_date,
        status,
        profile_picture,
        created_at,
        updated_at
      FROM residents
      WHERE resident_id = $1
    `,
    [residentId],
  );

  if (residentResult.rows.length === 0) {
    return null;
  }

  const resident = residentResult.rows[0];

  // 2. Get room allocation history.
  const allocationResult = await pool.query<AllocationRow>(
    `
      SELECT
        ra.allocation_id,
        ra.room_id,
        ra.allocation_date,
        ra.vacation_date,
        ra.status AS allocation_status,
        r.room_name,
        r.monthly_fee,
        r.capacity
      FROM room_allocations ra
      JOIN rooms r
        ON r.room_id = ra.room_id
      WHERE ra.resident_id = $1
      ORDER BY
        ra.allocation_date DESC,
        ra.allocation_id DESC
    `,
    [residentId],
  );

  // 3. Get fee history and calculate each fee's balance.
  const feeResult = await pool.query<FeeRow>(
    `
      SELECT
        f.fee_id,
        f.fee_month,
        f.amount,
        f.due_date,
        f.description,
        COALESCE(SUM(p.amount_paid), 0) AS total_paid,
        f.amount - COALESCE(SUM(p.amount_paid), 0) AS balance,
        CASE
          WHEN COALESCE(SUM(p.amount_paid), 0) = 0
            THEN 'unpaid'
          WHEN COALESCE(SUM(p.amount_paid), 0) < f.amount
            THEN 'partial'
          ELSE 'paid'
        END AS calculated_status
      FROM fees f
      LEFT JOIN payments p
        ON p.fee_id = f.fee_id
      WHERE f.resident_id = $1
      GROUP BY
        f.fee_id,
        f.fee_month,
        f.amount,
        f.due_date,
        f.description
      ORDER BY f.fee_month DESC, f.fee_id DESC
    `,
    [residentId],
  );

  // 4. Get individual payment records.
  const paymentResult = await pool.query<PaymentRow>(
    `
      SELECT
        p.payment_id,
        p.fee_id,
        p.amount_paid,
        p.payment_date,
        p.payment_method,
        p.notes,
        f.fee_month
      FROM payments p
      JOIN fees f
        ON f.fee_id = p.fee_id
      WHERE f.resident_id = $1
      ORDER BY
        p.payment_date DESC,
        p.payment_id DESC
    `,
    [residentId],
  );

  return {
    ...resident,

    resident_id: Number(resident.resident_id),

    allocations: allocationResult.rows.map((allocation) => ({
      ...allocation,
      allocation_id: Number(allocation.allocation_id),
      room_id: Number(allocation.room_id),
      monthly_fee: Number(allocation.monthly_fee),
      capacity: Number(allocation.capacity),
      allocation_date: normalizeDate(allocation.allocation_date),
      vacation_date: normalizeDate(allocation.vacation_date),
    })),

    fees: feeResult.rows.map((fee) => ({
      ...fee,
      fee_id: Number(fee.fee_id),
      amount: Number(fee.amount),
      total_paid: Number(fee.total_paid),
      balance: Number(fee.balance),
      fee_month: normalizeDate(fee.fee_month),
      due_date: normalizeDate(fee.due_date),
    })),

    payments: paymentResult.rows.map((payment) => ({
      ...payment,
      payment_id: Number(payment.payment_id),
      fee_id: Number(payment.fee_id),
      amount_paid: Number(payment.amount_paid),
      payment_date: normalizeDate(payment.payment_date),
      fee_month: normalizeDate(payment.fee_month),
    })),
  };
}

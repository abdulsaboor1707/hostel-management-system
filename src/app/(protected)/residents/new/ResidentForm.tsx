"use client";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { addResident, checkCnicExists } from "@/app/actions/residentActions";

const initialState = {
  success: false,
  message: "",
};

type Room = {
  room_id: number;
  room_name: string;
  monthly_fee: number | string;
  available_beds: number;
};

export default function ResidentForm({ rooms }: { rooms: Room[] }) {
  const [state, formAction, isPending] = useActionState(
    addResident,
    initialState,
  );
  const [cnic, setCnic] = useState("");
  const [phone, setPhone] = useState("");

  const [cnicCheck, setCnicCheck] = useState({
    checked: false,
    exists: false,
    message: "",
  });

  const [checkingCnic, setCheckingCnic] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        router.push("/residents");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [state.success, router]);

  async function handleCnicCheck(value: string) {
    const digits = value.replace(/\D/g, "");

    setCnicCheck({
      checked: false,
      exists: false,
      message: "",
    });

    if (digits.length !== 13) {
      setCheckingCnic(false);
      return;
    }

    setCheckingCnic(true);

    try {
      const result = await checkCnicExists(digits);
      setCnicCheck(result);
    } catch {
      setCnicCheck({
        checked: false,
        exists: false,
        message: "Could not check CNIC. Please try again.",
      });
    } finally {
      setCheckingCnic(false);
    }
  }

  return (
    <form action={formAction} className="space-y-4">
      <fieldset disabled={isPending} className="space-y-4">
        <div>
          <label htmlFor="first_name" className="mb-1 block font-medium">
            First Name
          </label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            required
            className="w-full rounded border p-2"
          />
        </div>

        <div>
          <label htmlFor="last_name" className="mb-1 block font-medium">
            Last Name
          </label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            required
            className="w-full rounded border p-2"
          />
        </div>

        <div>
          <label htmlFor="father_name" className="mb-1 block font-medium">
            Father's Name
          </label>
          <input
            type="text"
            id="father_name"
            name="father_name"
            className="w-full rounded border p-2"
          />
        </div>
        <div>
          <label htmlFor="cnic" className="mb-1 block text-sm font-medium">
            CNIC
          </label>

          <input
            id="cnic"
            name="cnic"
            type="text"
            inputMode="numeric"
            placeholder="11111-1111111-1"
            maxLength={15}
            pattern="[0-9]{5}-[0-9]{7}-[0-9]{1}"
            value={cnic}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "").slice(0, 13);

              let formatted = digits;

              if (digits.length > 5) {
                formatted = digits.slice(0, 5) + "-" + digits.slice(5);
              }

              if (digits.length > 12) {
                formatted =
                  digits.slice(0, 5) +
                  "-" +
                  digits.slice(5, 12) +
                  "-" +
                  digits.slice(12);
              }

              setCnic(formatted);

              // Start checking once all 13 digits are entered.
              void handleCnicCheck(formatted);
            }}
            className="w-full rounded-md border border-gray-300 p-2"
          />

          {checkingCnic && (
            <p className="mt-1 text-sm text-gray-500" role="status">
              Checking CNIC...
            </p>
          )}

          {!checkingCnic && cnicCheck.message && (
            <p
              role="status"
              className={`mt-1 text-sm ${
                cnicCheck.exists
                  ? "text-red-600"
                  : cnicCheck.checked
                    ? "text-green-600"
                    : "text-amber-600"
              }`}
            >
              {cnicCheck.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium">
            Mobile Number
          </label>

          <input
            id="phone"
            name="phone"
            type="text"
            inputMode="numeric"
            placeholder="0333-3333333"
            pattern="[0-9]{4}-[0-9]{7}"
            maxLength={12}
            value={phone}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "").slice(0, 11);

              const formatted =
                digits.length > 4
                  ? `${digits.slice(0, 4)}-${digits.slice(4)}`
                  : digits;

              setPhone(formatted);
            }}
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>

        <div>
          <label htmlFor="address" className="mb-1 block font-medium">
            Address
          </label>
          <textarea
            id="address"
            name="address"
            rows={3}
            className="w-full rounded border p-2"
          />
        </div>

        <div>
          <label htmlFor="admission_date" className="mb-1 block font-medium">
            Admission Date
          </label>
          <input
            type="date"
            id="admission_date"
            name="admission_date"
            required
            className="w-full rounded border p-2"
          />
        </div>
        <div>
          <label
            htmlFor="profile_picture"
            className="mb-1 block text-sm font-medium"
          >
            Resident Picture
          </label>

          <input
            id="profile_picture"
            name="profile_picture"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="block w-full rounded-md border border-gray-300 p-2"
          />

          <p className="mt-1 text-sm text-gray-500">
            Allowed formats: JPG, PNG, WebP. Maximum size: 2 MB.
          </p>
        </div>
        <div>
          <label htmlFor="room_id" className="mb-1 block font-medium">
            Select Room
          </label>

          <select
            id="room_id"
            name="room_id"
            required
            defaultValue=""
            className="w-full rounded border p-2"
          >
            <option value="" disabled>
              Choose a room
            </option>

            {rooms.map((room) => (
              <option key={room.room_id} value={room.room_id}>
                {room.room_name} - Rs.{" "}
                {Number(room.monthly_fee).toLocaleString("en-PK")}
                /month ({room.available_beds} bed(s) available)
              </option>
            ))}
          </select>
        </div>

        {state.message && (
          <p
            role="status"
            className={state.success ? "text-green-700" : "text-red-600"}
          >
            {state.success
              ? "Resident added and room allocated successfully. Redirecting to residents listing..."
              : state.message}
          </p>
        )}

        {isPending && (
          <div
            role="status"
            className="flex items-center gap-3 rounded-md border border-blue-200 bg-blue-50 p-4 text-blue-800"
          >
            <svg
              className="h-5 w-5 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>

            <div>
              <p className="font-medium">
                Saving resident and allocating room...
              </p>
              <p className="text-sm">
                Please wait. Do not submit the form again.
              </p>
            </div>
          </div>
        )}
      </fieldset>
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center gap-2 rounded bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending && (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        )}

        {isPending ? "Saving Resident..." : "Save Resident"}
      </button>
    </form>
  );
}

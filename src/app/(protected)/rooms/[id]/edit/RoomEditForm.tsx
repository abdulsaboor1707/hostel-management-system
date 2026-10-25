"use client";

import Link from "next/link";
import { useActionState } from "react";
import { updateRoom } from "@/app/actions/roomActions";

type Room = {
  room_id: number;
  room_name: string;
  monthly_fee: number;
  capacity: number;
  status: string;
};

export default function RoomEditForm({ room }: { room: Room }) {
  const [state, formAction, isPending] = useActionState(updateRoom, {});

  return (
    <form
      action={formAction}
      className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <input type="hidden" name="room_id" value={room.room_id} />

      {state.error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <label
          htmlFor="room_name"
          className="block text-sm font-medium text-gray-700"
        >
          Room Name
        </label>

        <input
          id="room_name"
          name="room_name"
          type="text"
          defaultValue={room.room_name}
          maxLength={100}
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="monthly_fee"
          className="block text-sm font-medium text-gray-700"
        >
          Monthly Fee (Rs.)
        </label>

        <input
          id="monthly_fee"
          name="monthly_fee"
          type="number"
          min="0"
          step="500"
          defaultValue={room.monthly_fee}
          required
          onChange={(event) => {
            const value = event.target.value;

            if (value !== "" && Number(value) % 500 !== 0) {
              event.target.setCustomValidity(
                "Monthly fee must be a multiple of Rs. 500.",
              );
            } else {
              event.target.setCustomValidity("");
            }
          }}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="capacity"
          className="block text-sm font-medium text-gray-700"
        >
          Room Capacity
        </label>

        <input
          id="capacity"
          name="capacity"
          type="number"
          min="1"
          step="1"
          defaultValue={room.capacity}
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

        <p className="text-xs text-gray-500">
          Capacity cannot be lower than the number of currently occupied beds.
        </p>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="status"
          className="block text-sm font-medium text-gray-700"
        >
          Status
        </label>

        <select
          id="status"
          name="status"
          defaultValue={room.status}
          required
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-5">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Save Changes"}
        </button>

        <Link
          href="/rooms"
          className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

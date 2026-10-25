import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/app/lib/auth";
import { getRoomById } from "@/app/lib/rooms";
import RoomEditForm from "./RoomEditForm";

type EditRoomPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditRoomPage({ params }: EditRoomPageProps) {
  await requireAdmin();

  const { id } = await params;
  const roomId = Number(id);

  if (!Number.isInteger(roomId) || roomId <= 0) {
    notFound();
  }

  const room = await getRoomById(roomId);

  if (!room) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/rooms"
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          &larr; Back to Rooms
        </Link>

        <h1 className="mt-3 text-2xl font-bold text-gray-900">Edit Room</h1>

        <p className="mt-1 text-sm text-gray-500">
          Update the details for {room.room_name}.
        </p>
      </div>

      <RoomEditForm room={room} />
    </div>
  );
}

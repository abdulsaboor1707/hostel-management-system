import { getAvailableRooms } from "@/app/lib/rooms";
import ResidentForm from "./ResidentForm";

export const instant = false;
export default async function NewResidentPage() {
  const rooms = await getAvailableRooms();
  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="mb-6 text-2xl font-bold">Add New Resident</h1>

      <ResidentForm rooms={rooms} />
    </main>
  );
}

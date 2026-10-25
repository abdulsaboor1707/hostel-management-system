import { getFeesForPayment } from "@/app/lib/payments";
import PaymentForm from "./PaymentForm";

export default async function NewPaymentPage() {
  const fees = await getFeesForPayment();

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl">
        <PaymentForm fees={fees} />
      </div>
    </main>
  );
}

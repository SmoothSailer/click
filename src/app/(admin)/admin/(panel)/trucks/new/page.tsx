import { TruckForm } from "@/components/admin/truck-form";

export default function NewTruckPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-ink-950">
        Add a truck
      </h1>
      <p className="mt-1 text-sm text-ink-500">
        Upload the photos first, then fill in the price and the details buyers
        will see.
      </p>

      <div className="mt-6 max-w-3xl">
        <TruckForm />
      </div>
    </div>
  );
}

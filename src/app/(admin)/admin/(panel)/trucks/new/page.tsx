import { TruckForm } from "@/components/admin/truck-form";

export default function NewTruckPage() {
  return (
    <div>
      <h1 className="text-xl font-bold tracking-tight text-ink-950 sm:text-2xl">
        Add a truck
      </h1>
      <p className="mt-1 text-sm text-ink-500">
        Upload the photos first, then fill in the price and the details buyers
        will see.
      </p>

      <div className="mt-5 max-w-3xl sm:mt-6">
        <TruckForm />
      </div>
    </div>
  );
}

import { notFound } from "next/navigation";
import { Suspense } from "react";

import { TruckForm } from "@/components/admin/truck-form";
import { getTruckById } from "@/lib/trucks";

export default function EditTruckPage(props: PageProps<"/admin/trucks/[id]">) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-ink-200/70" />}>
      <EditTruck params={props.params} />
    </Suspense>
  );
}

async function EditTruck({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const truck = await getTruckById(id);

  if (!truck) notFound();

  return (
    <div>
      <h1 className="text-xl font-bold tracking-tight text-ink-950 sm:text-2xl">
        Edit truck
      </h1>
      <p className="mt-1 text-sm text-ink-500">
        {truck.title} &middot; last updated {truck.updatedAt.slice(0, 10)}
      </p>

      <div className="mt-5 max-w-3xl sm:mt-6">
        <TruckForm truck={truck} />
      </div>
    </div>
  );
}

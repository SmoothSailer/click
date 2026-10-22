"use client";

import { useTransition } from "react";

import {
  deleteTruckAction,
  setTruckStatusAction,
} from "@/app/(admin)/admin/actions";
import type { TruckStatus } from "@/lib/types";

export function TruckRowActions({
  id,
  status,
}: {
  id: string;
  status: TruckStatus;
}) {
  const [pending, startTransition] = useTransition();
  const nextStatus: TruckStatus = status === "available" ? "sold" : "available";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(() => setTruckStatusAction(id, nextStatus))
        }
        className="rounded-lg border border-ink-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-ink-700 transition hover:bg-ink-50 disabled:opacity-60"
      >
        {nextStatus === "sold" ? "Mark sold" : "Mark available"}
      </button>

      <button
        type="button"
        disabled={pending}
        onClick={() => {
          const confirmed = window.confirm(
            "Delete this truck? Its photos are deleted from disk too.",
          );
          if (confirmed) {
            startTransition(() => deleteTruckAction(id));
          }
        }}
        className="rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
      >
        Delete
      </button>
    </div>
  );
}

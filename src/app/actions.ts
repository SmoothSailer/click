"use server";

import { updateTag } from "next/cache";

import { getTruckById, recordInquiry, INQUIRY_TAG } from "@/lib/trucks";

/**
 * Records that a buyer tapped "Buy on WhatsApp" so the seller knows which
 * trucks are getting attention. The lookup happens server side, so a client
 * cannot log an inquiry for an arbitrary price or title.
 */
export async function logInquiry(truckId: string): Promise<void> {
  if (!truckId) return;

  const truck = await getTruckById(truckId);
  if (!truck) return;

  await recordInquiry({
    truckId: truck.id,
    truckTitle: truck.title,
    truckPrice: truck.price,
    source: "whatsapp",
  });

  updateTag(INQUIRY_TAG);
}

import { SITE_URL, WHATSAPP_NUMBER } from "./env";
import { formatPrice } from "./format";

export type WhatsAppTruck = {
  title: string;
  price: number;
  currency: string;
  slug: string;
};

/** Prefilled message a buyer sends when they tap "Buy on WhatsApp". */
export function buildWhatsAppMessage(truck: WhatsAppTruck): string {
  const lines = [
    "Hi! I'm interested in this truck listed on your website:",
    "",
    `*${truck.title}*`,
    `Price: ${formatPrice(truck.price, truck.currency)}`,
  ];

  if (SITE_URL) {
    lines.push(`Listing: ${SITE_URL}/trucks/${truck.slug}`);
  }

  lines.push("", "Is it still available? Please share more details.");

  return lines.join("\n");
}

/** Returns a wa.me deep link, or null when no WhatsApp number is configured. */
export function buildWhatsAppLink(truck: WhatsAppTruck): string | null {
  if (!WHATSAPP_NUMBER) return null;
  const message = buildWhatsAppMessage(truck);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/** Generic link used by the header / floating button. */
export function generalWhatsAppLink(): string | null {
  if (!WHATSAPP_NUMBER) return null;
  const message = encodeURIComponent(
    "Hi! I'd like to know more about the trucks you have in stock.",
  );
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
}

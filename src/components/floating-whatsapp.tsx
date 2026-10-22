import { generalWhatsAppLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "./icons";

/** Persistent WhatsApp shortcut shown on every public page. */
export function FloatingWhatsApp() {
  const whatsapp = generalWhatsAppLink();
  if (!whatsapp) return null;

  return (
    <a
      href={whatsapp}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex size-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 transition hover:scale-105 hover:bg-emerald-700"
    >
      <WhatsAppIcon className="size-7" />
    </a>
  );
}

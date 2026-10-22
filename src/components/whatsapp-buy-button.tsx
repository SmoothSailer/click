"use client";

import { useTransition } from "react";

import { logInquiry } from "@/app/actions";
import { buttonWhatsAppClass } from "@/lib/styles";
import { WhatsAppIcon } from "./icons";

export function WhatsAppBuyButton({
  truckId,
  href,
  label = "Buy on WhatsApp",
  size = "md",
}: {
  truckId: string;
  href: string | null;
  label?: string;
  size?: "md" | "lg";
}) {
  const [, startTransition] = useTransition();

  if (!href) {
    return (
      <button
        type="button"
        disabled
        className={`${buttonWhatsAppClass} w-full ${
          size === "lg" ? "py-3 text-base" : ""
        }`}
      >
        <WhatsAppIcon className="size-5" />
        WhatsApp number not configured
      </button>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => {
        // Fire and forget: the shopper should reach WhatsApp immediately.
        startTransition(() => {
          void logInquiry(truckId);
        });
      }}
      className={`${buttonWhatsAppClass} w-full ${
        size === "lg" ? "py-3 text-base" : ""
      }`}
    >
      <WhatsAppIcon className="size-5" />
      {label}
    </a>
  );
}

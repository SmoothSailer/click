import { SITE_NAME } from "@/lib/env";

type LogoMarkProps = {
  className?: string;
};

export function LogoMark({ className }: LogoMarkProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      className={className}
      aria-hidden="true"
    >
      <rect width="40" height="40" rx="11" className="fill-ink-950" />
      <path
        d="M23 5 11 22h6.5L16 35l13-18h-6.8L23 5Z"
        className="fill-accent-400"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type LogoProps = {
  className?: string;
  markClassName?: string;
};

export function Logo({ className, markClassName = "size-9" }: LogoProps) {
  const highlight = "Energy";
  const splitAt = SITE_NAME.indexOf(highlight);
  const head = splitAt > 0 ? SITE_NAME.slice(0, splitAt) : SITE_NAME;
  const tail = splitAt > 0 ? SITE_NAME.slice(splitAt) : "";

  return (
    <span className={`flex items-center gap-2 ${className ?? ""}`}>
      <LogoMark className={`${markClassName} shrink-0`} />
      <span className="text-lg font-bold tracking-tight text-ink-950">
        {head}
        {tail ? <span className="text-accent-600">{tail}</span> : null}
      </span>
    </span>
  );
}

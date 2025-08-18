// components/shared/LocalTime.tsx
"use client";

import * as React from "react";

type Props = {
  iso?: string | null; // ISO from server (or undefined/null)
  locale?: string; // default app locale
  timeZone?: string; // fixed to avoid drift
  options?: Intl.DateTimeFormatOptions; // override format if needed
  fallback?: string; // what to show if iso is missing
};

export function LocalTime({
  iso,
  locale = "es-BO",
  timeZone = "America/La_Paz",
  options = { dateStyle: "short", timeStyle: "medium" },
  fallback = "—",
}: Props) {
  const [text, setText] = React.useState<string>(fallback);

  React.useEffect(() => {
    if (!iso) {
      setText(fallback);
      return;
    }
    try {
      const d = new Date(iso);
      // If iso is invalid, show raw iso
      if (isNaN(d.getTime())) {
        setText(iso);
        return;
      }
      const fmt = new Intl.DateTimeFormat(locale, { ...options, timeZone });
      setText(fmt.format(d));
    } catch {
      setText(iso || fallback);
    }
  }, [iso, locale, timeZone, fallback, options]);

  // Suppress SSR/client differences for this element
  return (
    <time suppressHydrationWarning dateTime={iso ?? undefined}>
      {text}
    </time>
  );
}

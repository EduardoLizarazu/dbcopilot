// components/shared/LocalTime.tsx
"use client";

import * as React from "react";

// new Date(
//   r.feedback.updatedAt._seconds * 1000 + r.feedback.updatedAt._nanoseconds / 1e6
// ).toISOString();

type Props = {
  fb_date?: {
    _seconds: number;
    _nanoseconds: number;
  };
  iso?: string | null; // ISO from server (or undefined/null)
  locale?: string; // default app locale
  timeZone?: string; // fixed to avoid drift
  options?: Intl.DateTimeFormatOptions; // override format if needed
  fallback?: string; // what to show if iso is missing
};

export function LocalTime({
  fb_date,
  iso,
  locale = "es-BO",
  timeZone = "America/La_Paz",
  options = { dateStyle: "short", timeStyle: "medium" },
  fallback = "—",
}: Props) {
  const [text, setText] = React.useState<string>(fallback);

  React.useEffect(() => {
    let isoDate = iso;

    // Convert Firebase timestamp to ISO if fb_date is provided
    if (fb_date) {
      isoDate = new Date(
        fb_date._seconds * 1000 + fb_date._nanoseconds / 1e6
      ).toISOString();
    }

    if (!isoDate) {
      setText(fallback);
      return;
    }

    try {
      const d = new Date(isoDate);
      // If isoDate is invalid, show raw isoDate
      if (isNaN(d.getTime())) {
        setText(isoDate);
        return;
      }
      const fmt = new Intl.DateTimeFormat(locale, { ...options, timeZone });
      setText(fmt.format(d));
    } catch {
      setText(isoDate || fallback);
    }
  }, [fb_date, iso, locale, timeZone, fallback, options]);

  // Suppress SSR/client differences for this element
  return (
    <time suppressHydrationWarning dateTime={iso ?? undefined}>
      {text}
    </time>
  );
}

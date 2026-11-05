"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { partOfDay } from "@/lib/partOfDay";

// "Good morning, Maria". The server sends a first guess (initialPart) so there
// is no blank flash; the browser then corrects it to the user's own time zone.
export default function Greeting({
  firstName,
  initialPart,
  subtitle,
}: {
  firstName: string | null;
  initialPart: string;
  subtitle?: string;
}) {
  const [part, setPart] = useState(initialPart);

  useEffect(() => {
    setPart(partOfDay(new Date().getHours()));
  }, []);

  return (
    <div>
      <h1 className="font-heading text-[28px] font-extrabold leading-tight tracking-[-0.03em] lg:text-[34px]">
        Good {part}
        {firstName ? `, ${firstName}` : ""}
      </h1>
      {subtitle && <p className="mt-1 text-base text-muted">{subtitle}</p>}
      {!firstName && (
        <Link href="/me" className="inline-flex min-h-[44px] items-center text-sm text-you underline">
          Add your name
        </Link>
      )}
    </div>
  );
}

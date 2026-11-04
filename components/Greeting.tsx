"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// "Good morning, Maria". Time of day is computed in the browser so it
// matches the user's own time zone.
export default function Greeting({ firstName }: { firstName: string | null }) {
  const [part, setPart] = useState<string | null>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    setPart(hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening");
  }, []);

  return (
    <div>
      <h1 className="min-h-[28px] font-heading text-[22px] leading-7">
        {part ? `Good ${part}${firstName ? `, ${firstName}` : ""}` : " "}
      </h1>
      {!firstName && (
        <Link href="/me" className="text-sm text-green underline">
          Add your name
        </Link>
      )}
    </div>
  );
}

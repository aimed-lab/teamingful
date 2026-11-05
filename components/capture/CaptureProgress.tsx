"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { shellClass, TopBar } from "./CaptureShell";
import ReadingState from "./ReadingState";

function localDate() {
  return new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

// Shown at /capture/[id] while the capture is being read, or after the reading failed.
// The files are safe in storage, so "Try again" only repeats the reading.
export default function CaptureProgress({
  id,
  status,
  error,
  hasPhotos,
}: {
  id: string;
  status: "reading" | "failed";
  error: string | null;
  hasPhotos: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [slow, setSlow] = useState(false);

  // While reading: check again every couple of seconds. Offer a retry after a minute.
  useEffect(() => {
    if (status !== "reading" || busy) return;
    const poll = setInterval(() => router.refresh(), 2500);
    const late = setTimeout(() => setSlow(true), 60_000);
    return () => {
      clearInterval(poll);
      clearTimeout(late);
    };
  }, [status, busy, router]);

  async function retry() {
    setBusy(true);
    try {
      await fetch(`/api/capture/${id}/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ localDate: localDate() }),
      });
    } catch {
      // the page will show the failed state again
    }
    setBusy(false);
    setSlow(false);
    router.refresh();
  }

  if (busy || (status === "reading" && !slow)) {
    return (
      <div className={shellClass()}>
        <TopBar />
        <ReadingState messages={[...(hasPhotos ? ["Reading the card..."] : []), "Listening to your note...", "Finding promises..."]} />
      </div>
    );
  }

  return (
    <div className={shellClass()}>
      <TopBar />
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-heading text-2xl font-extrabold">
          {status === "failed" ? "We could not read that" : "This is taking longer than usual"}
        </h1>
        <p className="max-w-sm text-white/70">
          {status === "failed" && error ? error : "Your photos and notes are safe."} Try again, or start over.
        </p>
        <button
          onClick={retry}
          className="min-h-[52px] w-full max-w-xs rounded-full bg-you font-medium text-white hover:bg-you/90"
        >
          Try again
        </button>
        <Link href="/capture" className="flex min-h-[44px] items-center text-white/70 underline underline-offset-4">
          Start over
        </Link>
      </div>
    </div>
  );
}

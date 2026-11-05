"use client";

import { useEffect, useState } from "react";
import TeamMark from "../TeamMark";

// Calm progress screen while the AI reads. Cycles through short messages.
export default function ReadingState({ messages }: { messages: string[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % messages.length), 2500);
    return () => clearInterval(t);
  }, [messages.length]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center text-white">
      <div className="soft-pulse">
        <TeamMark size="xl" />
      </div>
      <p className="font-heading text-xl font-semibold" role="status" aria-live="polite">
        {messages[i]}
      </p>
      <p className="text-sm text-white/60">This usually takes a few seconds.</p>
    </div>
  );
}

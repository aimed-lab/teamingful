"use client";

import { useRef, useState } from "react";
import { HOW_STEPS, StepCard } from "./HowSteps";

// The three step cards. Phone: swipeable row (no scrollbar) with three dots.
// Laptop: three columns, dots hidden.
export default function StepCarousel() {
  const row = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);

  function onScroll() {
    const el = row.current;
    if (!el) return;
    const card = el.children[0] as HTMLElement | undefined;
    if (!card) return;
    const step = card.offsetWidth + 16; // card width + gap-4
    setCurrent(Math.min(HOW_STEPS.length - 1, Math.max(0, Math.round(el.scrollLeft / step))));
  }

  return (
    <>
      <div
        ref={row}
        onScroll={onScroll}
        className="no-scrollbar -mx-4 mt-3 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0"
      >
        {HOW_STEPS.map((step) => (
          <StepCard
            key={step.label}
            step={step}
            className="w-[82%] shrink-0 snap-start p-4 sm:p-5 lg:w-auto lg:p-4"
          />
        ))}
      </div>
      <div className="mt-2 flex justify-center gap-2 lg:hidden" aria-hidden="true">
        {HOW_STEPS.map((step, i) => (
          <span
            key={step.label}
            className={`h-2 w-2 rounded-full ${i === current ? "bg-you" : "bg-line"}`}
          />
        ))}
      </div>
    </>
  );
}

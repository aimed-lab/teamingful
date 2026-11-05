"use client";

import { useState } from "react";
import { EventFormFields } from "./EventForm";

// A button that opens the event form right below it.
// variant: "ink" (default), "secondary" (white with border), "white" (for dark cards).
export default function StartEventButton({
  label,
  variant = "ink",
  icon,
}: {
  label: string;
  variant?: "ink" | "secondary" | "white";
  icon?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const styles = {
    ink: "btn",
    secondary: "btn-secondary",
    white:
      "inline-flex min-h-[44px] items-center justify-center rounded-full bg-white px-5 font-medium text-ink hover:bg-paper",
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className={`${styles[variant]} gap-2`}
      >
        {icon}
        {label}
      </button>
      {open && <EventFormFields className="card mt-4 w-full p-4 text-ink" />}
    </>
  );
}

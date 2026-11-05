"use client";

import { useState } from "react";
import { startEvent } from "@/app/actions";

// Local date as YYYY-MM-DD (not UTC), so "today" is right in the user's time zone.
function localToday() {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

// The form itself. Only the name is required.
export function EventFormFields({ className = "" }: { className?: string }) {
  const [startsOn, setStartsOn] = useState(localToday);

  return (
    <form action={startEvent} className={`space-y-3 text-left ${className}`}>
      <input name="name" required placeholder="Event name" className="input" />
      <input name="location" placeholder="Location (optional)" className="input" />
      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm text-muted">
          Starts
          <input
            name="starts_on"
            type="date"
            value={startsOn}
            onChange={(e) => setStartsOn(e.target.value)}
            className="input mt-1"
          />
        </label>
        <label className="text-sm text-muted">
          Ends (optional)
          <input name="ends_on" type="date" className="input mt-1" />
        </label>
      </div>
      <button className="btn w-full">Start event</button>
    </form>
  );
}

// "Going to an event?" row that opens the form.
export default function EventForm() {
  return (
    <details className="card">
      <summary className="flex min-h-[44px] cursor-pointer items-center px-4 text-muted">
        Going to an event?&nbsp;
        <span className="font-medium text-you">Start event mode</span>
      </summary>
      <EventFormFields className="border-t border-line p-4" />
    </details>
  );
}

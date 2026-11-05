import type { Metadata } from "next";
import EmptyState from "@/components/EmptyState";
import { CalendarIcon } from "@/components/Icons";
import StartEventButton from "@/components/StartEventButton";

export const metadata: Metadata = { title: "Events · Teamingful" };

export default function EventsPage() {
  return (
    <EmptyState
      icon={<CalendarIcon />}
      title="Your events"
      text="Turn on event mode at a conference and every person you meet gets tagged with it."
    >
      <div className="mt-6 flex flex-col items-center">
        <StartEventButton label="Start event mode" />
      </div>
    </EmptyState>
  );
}


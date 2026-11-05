import type { Metadata } from "next";
import EmptyState from "@/components/EmptyState";
import { ChecklistIcon } from "@/components/Icons";

export const metadata: Metadata = { title: "Promises · Teamingful" };

export default function PromisesPage() {
  return (
    <EmptyState
      icon={<ChecklistIcon />}
      title="Nothing promised yet"
      text="When you or someone else says they'll do something, it shows up here with a date, so nothing slips."
      action={{ label: "Capture a meeting", href: "/capture" }}
    />
  );
}


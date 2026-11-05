import type { Metadata } from "next";
import EmptyState from "@/components/EmptyState";
import { TeamsIcon } from "@/components/Icons";

export const metadata: Metadata = { title: "Teams · Teamingful" };

export default function TeamsPage() {
  return (
    <EmptyState
      icon={<TeamsIcon />}
      title="Your teams will live here"
      text="Every person you capture becomes a team of two, with what each of you promised."
      action={{ label: "Capture someone", href: "/capture" }}
    />
  );
}


import type { Metadata } from "next";
import SignInForm from "@/components/SignInForm";
import TeamMark from "@/components/TeamMark";
import { CameraIcon, ChecklistIcon, LinkIcon } from "@/components/Icons";

export const metadata: Metadata = { title: "Sign in · Teamingful" };

const POINTS = [
  { icon: <CameraIcon size={20} />, text: "Capture a card, badge or slide in seconds" },
  { icon: <ChecklistIcon size={20} />, text: "See who promised what, on both sides" },
  { icon: <LinkIcon size={20} />, text: "Share slides with a link, no app needed" },
];

export default function SignInPage() {
  return (
    <main className="min-h-screen lg:grid lg:grid-cols-2">
      {/* Green side: compact on phone, full half on laptop */}
      <section className="bg-ink px-6 py-8 text-white lg:flex lg:flex-col lg:justify-between lg:p-16">
        <div>
          <div className="lg:hidden">
            <TeamMark size="md" />
          </div>
          <div className="hidden lg:block">
            <TeamMark size="xl" />
          </div>
          <h1 className="mt-4 max-w-md font-heading text-3xl font-extrabold leading-[1.05] tracking-[-0.03em] lg:mt-8 lg:text-[44px]">
            Every handshake becomes a team.
          </h1>
          <p className="mt-2 max-w-md text-white/70 lg:mt-4">
            Snap a business card or say a few words. Teamingful turns the meeting into a
            team of two and keeps your promises for you.
          </p>
        </div>

        <ul className="hidden space-y-4 lg:block">
          {POINTS.map((p) => (
            <li key={p.text} className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-card bg-white/10 text-white/70">
                {p.icon}
              </span>
              <span>{p.text}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex justify-center px-6 py-10 lg:items-center">
        <SignInForm />
      </section>
    </main>
  );
}

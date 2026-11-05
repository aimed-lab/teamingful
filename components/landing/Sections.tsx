import Link from "next/link";
import { HOW_STEPS, StepCard } from "@/components/HowSteps";
import { FlaskIcon, LockIcon, MailIcon } from "@/components/Icons";
import PromisePill from "@/components/PromisePill";

// The sections of the landing page below the hero, in order.

const wrap = "mx-auto w-full max-w-[1160px] px-6 lg:px-8";
const spacing = "py-14 lg:py-24";

export function TrustStrip() {
  return (
    <div className="border-y border-line">
      <div className={`${wrap} flex flex-col gap-2 py-5 text-sm text-muted lg:flex-row lg:justify-between`}>
        <p>Built at UAB&apos;s Systems Pharmacology AI Research Center</p>
        <p>Reads cards, badges, slides and posters</p>
        <p>Private by default</p>
      </div>
    </div>
  );
}

export function HowItWorks() {
  return (
    <section id="how" className={`${wrap} ${spacing} scroll-mt-16`}>
      <h2 className="text-3xl font-extrabold tracking-[-0.03em] lg:text-5xl">
        Under a minute, start to finish
      </h2>
      <div className="mt-8 grid gap-5 lg:mt-12 lg:grid-cols-3">
        {HOW_STEPS.map((step) => (
          <StepCard key={step.label} step={step} />
        ))}
      </div>
    </section>
  );
}

export function Comparison() {
  return (
    <section className="border-y border-line bg-white">
      <div className={`${wrap} ${spacing}`}>
        <h2 className="max-w-2xl text-3xl font-extrabold tracking-[-0.03em] lg:text-5xl">
          Contacts sit in a list. Teams get things done.
        </h2>
        <p className="mt-4 max-w-2xl text-base text-muted lg:text-lg">
          Card scanners save a name only you can see. A Teamingful team is a small shared space
          where both sides can see what was promised and what&apos;s been sent.
        </p>
        <div className="mt-8 grid gap-5 lg:mt-12 lg:grid-cols-2">
          <div className="rounded-card border border-line bg-paper p-6">
            <p className="text-sm text-muted">Contact app</p>
            <p className="mt-3 text-lg font-semibold">Ana Lee</p>
            <p className="text-muted">ana.lee@northfield.bio</p>
            <p className="mt-6 text-sm text-muted">Saved Nov 4. Never opened again.</p>
          </div>
          <div className="rounded-card border-2 border-team bg-white p-6">
            <p className="text-sm font-medium text-team-text">Teamingful</p>
            <p className="mt-3 text-lg font-semibold">Jake and Ana</p>
            <ul className="mt-3 space-y-2">
              <li className="flex items-center gap-2">
                <PromisePill who="shared">✓</PromisePill> Slides sent Friday
              </li>
              <li className="flex items-center gap-2">
                <PromisePill who="shared">✓</PromisePill> Intro to Rohit made
              </li>
              <li className="flex items-center gap-2">
                <PromisePill who="them">○</PromisePill> Dataset from Ana
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export function PhoneAndLaptop() {
  const rows = [
    { text: "5 follow-up emails written", action: "Review" },
    { text: "2 promises due tomorrow", action: "See" },
    { text: "Sam Patel shares your CFDE work", action: "Open" },
  ];
  return (
    <section className={`${wrap} ${spacing} grid items-center gap-10 lg:grid-cols-2 lg:gap-16`}>
      <div>
        <h2 className="text-3xl font-extrabold tracking-[-0.03em] lg:text-5xl">
          Capture on your phone. Finish on your laptop.
        </h2>
        <p className="mt-4 max-w-md text-base text-muted lg:text-lg">
          Each evening you get a debrief, with follow-up emails already written from your own
          notes. Add the slides, read it over, send.
        </p>
      </div>
      <div className="card p-6 lg:order-first">
        <p className="text-sm text-muted">Tuesday at BIO Partnering</p>
        <p className="mt-1 font-heading text-3xl font-extrabold tracking-[-0.03em]">
          7 people. 9 promises.
        </p>
        <ul className="mt-4 divide-y divide-line">
          {rows.map((r) => (
            <li key={r.text} className="flex items-center justify-between gap-4 py-3">
              <span>{r.text}</span>
              <span className="font-medium text-you">{r.action}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Privacy() {
  const items = [
    {
      icon: <LockIcon />,
      title: "Private by default",
      text: "Your voice notes and photos are only yours. You choose what goes on the shared team.",
    },
    {
      icon: <MailIcon />,
      title: "Never sends for you",
      text: "Follow-ups open in your own email so you can read them first.",
    },
    {
      icon: <FlaskIcon />,
      title: "Knows the science",
      text: "Links the people you meet to their papers through ORCID and PubMed.",
    },
  ];
  return (
    <section id="privacy" className="scroll-mt-16 border-y border-line bg-white">
      <div className={`${wrap} ${spacing} grid gap-8 lg:grid-cols-3 lg:gap-12`}>
        {items.map((i) => (
          <div key={i.title}>
            <span className="flex h-11 w-11 items-center justify-center rounded-card bg-you-light text-you">
              {i.icon}
            </span>
            <h3 className="mt-4 text-xl">{i.title}</h3>
            <p className="mt-2 text-muted">{i.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ForLabs() {
  return (
    <section id="labs" className={`${wrap} ${spacing} scroll-mt-16`}>
      <h2 className="text-3xl font-extrabold tracking-[-0.03em] lg:text-5xl">
        Running a lab or a meeting?
      </h2>
      <p className="mt-4 max-w-xl text-base text-muted lg:text-lg">
        Teamingful will soon let a lab or an event give everyone a shared space for the people
        they meet. Tell us what you need.
      </p>
      <a
        href="mailto:smartdrugdiscovery@gmail.com?subject=Teamingful%20for%20labs"
        className="btn-secondary mt-6"
      >
        Get in touch
      </a>
    </section>
  );
}

export function ClosingBand() {
  return (
    <section className="bg-ink text-white">
      <div
        className={`${wrap} flex flex-col items-start gap-6 py-14 lg:flex-row lg:items-center lg:justify-between lg:py-20`}
      >
        <div>
          <h2 className="max-w-xl text-3xl font-extrabold tracking-[-0.03em] lg:text-5xl">
            Your next conference, followed through.
          </h2>
          <p className="mt-3 text-white/70">Free during early access.</p>
        </div>
        <Link
          href="/signin"
          className="inline-flex min-h-[44px] w-full items-center justify-center rounded-full bg-white px-6 font-medium text-ink hover:bg-paper lg:w-auto"
        >
          Start free
        </Link>
      </div>
    </section>
  );
}

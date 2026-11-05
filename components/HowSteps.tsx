import { LinkIcon } from "./Icons";

// The three "how it works" cards, shared by the landing page and the Today
// screen so the app and the landing feel like one product.

// A small dark phone screen with a light badge framed in mint.
function BadgeMini() {
  const corner = "absolute h-4 w-4 border-[#7FE0AD]";
  return (
    <div className="flex min-h-44 items-center justify-center rounded-2xl bg-[#0b0d10] px-5 py-6">
      <div className="relative w-full max-w-40">
        <div className="w-full max-w-40 rounded-lg bg-paper px-3 py-3 text-ink">
          <p className="text-sm font-semibold">Ana Lee</p>
          <p className="text-xs text-muted">Northfield Bio</p>
          <p className="mt-2 text-xs text-muted">BIO Partnering</p>
        </div>
        <span className={`${corner} -left-2 -top-2 border-l-2 border-t-2`} />
        <span className={`${corner} -right-2 -top-2 border-r-2 border-t-2`} />
        <span className={`${corner} -bottom-2 -left-2 border-b-2 border-l-2`} />
        <span className={`${corner} -bottom-2 -right-2 border-b-2 border-r-2`} />
      </div>
    </div>
  );
}

function ConfirmMini() {
  return (
    <div className="flex min-h-44 flex-col justify-center gap-2 rounded-2xl bg-paper p-3 text-[13px] leading-snug">
      <div className="rounded-xl border border-line bg-white px-3 py-2">Ana Lee, Northfield Bio</div>
      <div className="rounded-xl bg-you-light px-3 py-2 text-you">You: send slides, Friday</div>
      <div className="rounded-xl bg-them-light px-3 py-2 text-them-text">Ana: trial dataset</div>
    </div>
  );
}

function ShareMini() {
  return (
    <div className="flex min-h-44 min-w-0 flex-col items-center justify-center gap-3 rounded-2xl bg-paper p-3">
      <div className="flex w-full min-w-0 items-center gap-2 rounded-xl border border-line bg-white px-3 py-3 text-[13px]">
        <span className="shrink-0 text-team-text">
          <LinkIcon size={18} />
        </span>
        <span className="min-w-0 truncate">teamingful.com/t/jake-ana</span>
      </div>
      <p className="text-sm text-muted">Opens in any browser</p>
    </div>
  );
}

export const HOW_STEPS = [
  {
    label: "1. Capture",
    title: "Point at the badge",
    art: <BadgeMini />,
    text: "Or hold to talk: “She wants our slides.”",
  },
  {
    label: "2. Confirm",
    title: "Check what we found",
    art: <ConfirmMini />,
    text: "Tap anything to fix it.",
  },
  {
    label: "3. Share",
    title: "Send them the team",
    art: <ShareMini />,
    text: "They see the slides and promises, no app needed.",
  },
];

export function StepCard({ step, className = "p-5" }: { step: (typeof HOW_STEPS)[number]; className?: string }) {
  return (
    <div className={`card ${className}`}>
      <p className="text-sm text-muted">{step.label}</p>
      <h3 className="mt-1 text-xl">{step.title}</h3>
      <div className="mt-4">{step.art}</div>
      <p className="mt-4 text-muted">{step.text}</p>
    </div>
  );
}

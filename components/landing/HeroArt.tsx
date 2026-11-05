import Image from "next/image";
import PromisePill from "@/components/PromisePill";
import TeamMark from "@/components/TeamMark";
import { CAPTURE, HERO } from "@/lib/landingImages";
import { u } from "@/lib/u";

// The hero picture: photo, phone, a mini team page and floating chips.
// Everything is sized in "design pixels" (u) so the whole composition
// scales to the width of its column and never scrolls sideways.

type Pos = { left?: number; top?: number; width?: number; height?: number };

const place = (p: Pos): React.CSSProperties => ({
  position: "absolute",
  left: p.left === undefined ? undefined : u(p.left),
  top: p.top === undefined ? undefined : u(p.top),
  width: p.width === undefined ? undefined : u(p.width),
  height: p.height === undefined ? undefined : u(p.height),
});

function Canvas({
  base,
  height,
  className,
  children,
}: {
  base: number;
  height: number;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={className}
      style={{ containerType: "inline-size", width: "100%", maxWidth: base, aspectRatio: `${base} / ${height}` }}
    >
      <div
        style={
          {
            "--u": `calc(100cqw / ${base})`,
            position: "relative",
            width: "100%",
            height: "100%",
          } as React.CSSProperties
        }
      >
        {children}
      </div>
    </div>
  );
}

// Quiet field of thin overlapping circle outlines, centered behind the group.
function GroupField({ base, height }: { base: number; height: number }) {
  const cx = base / 2;
  const cy = height / 2;
  return (
    <svg
      viewBox={`0 0 ${base} ${height}`}
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
      fill="none"
    >
      <circle cx={cx - 70} cy={cy - 30} r={170} stroke="#2F5BFF" strokeOpacity="0.22" />
      <circle cx={cx + 40} cy={cy - 30} r={170} stroke="#FFB627" strokeOpacity="0.4" />
      <circle cx={cx - 10} cy={cy + 70} r={150} stroke="#17A267" strokeOpacity="0.28" />
    </svg>
  );
}

// Quiet field of thin overlapping circle outlines (phone layout).
function CircleField({ base, height }: { base: number; height: number }) {
  return (
    <svg
      viewBox={`0 0 ${base} ${height}`}
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
      fill="none"
    >
      <circle cx={base * 0.18} cy={height * 0.3} r={base * 0.22} stroke="#2F5BFF" strokeOpacity="0.22" />
      <circle cx={base * 0.34} cy={height * 0.3} r={base * 0.22} stroke="#FFB627" strokeOpacity="0.4" />
      <circle cx={base * 0.8} cy={height * 0.78} r={base * 0.2} stroke="#17A267" strokeOpacity="0.28" />
      <circle cx={base * 0.94} cy={height * 0.64} r={base * 0.14} stroke="#2F5BFF" strokeOpacity="0.2" />
      <circle cx={base * 0.58} cy={height * 0.96} r={base * 0.12} stroke="#FFB627" strokeOpacity="0.35" />
    </svg>
  );
}

function Photo({ pos }: { pos: Pos }) {
  return (
    <div style={{ ...place(pos), borderRadius: u(24), overflow: "hidden" }} className="bg-line">
      <Image
        src={HERO}
        alt="Two researchers exchanging a business card at a conference"
        fill
        priority
        sizes="(min-width: 1024px) 440px, 90vw"
        className="object-cover"
      />
    </div>
  );
}

// The drawn capture screen (used when capture.jpg is missing).
// k scales it for the smaller phone frame.
function DrawnCapture({ k }: { k: number }) {
  const s = (n: number) => u(n * k);
  const corner = (pos: React.CSSProperties) => (
    <span
      style={{
        position: "absolute",
        width: s(14),
        height: s(14),
        borderColor: "#7FE0AD",
        borderStyle: "solid",
        borderWidth: 0,
        ...pos,
      }}
    />
  );
  return (
    <div className="relative h-full w-full" style={{ background: "#0b0d10" }}>
      <div style={{ position: "absolute", left: "11%", right: "11%", top: "18%", height: s(66) }}>
        <div
          className="flex flex-col justify-center bg-paper text-ink"
          style={{ height: "100%", borderRadius: s(5), padding: s(7) }}
        >
          <span style={{ fontSize: s(9.5), fontWeight: 600, lineHeight: 1.2 }}>Ana Lee, PhD</span>
          <span style={{ fontSize: s(7), lineHeight: 1.3 }} className="text-muted">
            Director, Biostatistics
          </span>
          <span style={{ fontSize: s(7), lineHeight: 1.3 }} className="text-muted">
            Northfield Bio
          </span>
        </div>
        <div style={{ position: "absolute", inset: s(-5) }}>
          {corner({ left: 0, top: 0, borderLeftWidth: 2, borderTopWidth: 2 })}
          {corner({ right: 0, top: 0, borderRightWidth: 2, borderTopWidth: 2 })}
          {corner({ left: 0, bottom: 0, borderLeftWidth: 2, borderBottomWidth: 2 })}
          {corner({ right: 0, bottom: 0, borderRightWidth: 2, borderBottomWidth: 2 })}
        </div>
      </div>
      <p
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "52%",
          fontSize: s(9),
          textAlign: "center",
          color: "#7FE0AD",
          fontWeight: 500,
        }}
      >
        Card found
      </p>
      <span
        style={{
          position: "absolute",
          left: "50%",
          bottom: s(12),
          width: s(30),
          height: s(30),
          marginLeft: s(-15),
          borderRadius: "9999px",
          border: `${s(2.5)} solid #fff`,
        }}
      />
      <span
        style={{
          position: "absolute",
          left: "50%",
          bottom: s(17),
          width: s(20),
          height: s(20),
          marginLeft: s(-10),
          borderRadius: "9999px",
          background: "#fff",
        }}
      />
    </div>
  );
}

function PhoneFrame({ pos, k, captureOk }: { pos: Pos; k: number; captureOk: boolean }) {
  return (
    <div
      style={{
        ...place(pos),
        borderRadius: u(28 * k),
        padding: u(6 * k),
        boxShadow: "0 12px 32px rgba(18,20,24,.25)",
      }}
      className="bg-ink"
    >
      <div className="relative h-full w-full overflow-hidden" style={{ borderRadius: u(22 * k) }}>
        {captureOk ? (
          <Image
            src={CAPTURE}
            alt="A phone capturing a business card"
            fill
            sizes="150px"
            className="object-cover"
          />
        ) : (
          <DrawnCapture k={k} />
        )}
      </div>
    </div>
  );
}

// A real mini team page. k scales it (1 = small, 1.28 = hero size on laptop).
function TeamCard({ pos, k = 1 }: { pos: Pos; k?: number }) {
  const s = (n: number) => u(n * k);
  const row = (text: string, who: "me" | "them", pill: string) => (
    <div className="flex items-center justify-between" style={{ gap: s(6), paddingTop: s(5), paddingBottom: s(5) }}>
      <span style={{ fontSize: s(11) }}>{text}</span>
      <PromisePill who={who} style={{ fontSize: s(9.5), padding: `${s(2)} ${s(7)}`, whiteSpace: "nowrap" }}>
        {pill}
      </PromisePill>
    </div>
  );
  return (
    <div
      className="border border-line bg-white"
      style={{ ...place(pos), borderRadius: s(18), padding: s(13), boxShadow: "0 12px 32px rgba(18,20,24,.12)" }}
    >
      <div className="flex items-center" style={{ gap: s(9) }}>
        <TeamMark me="JK" them="AL" style={{ height: s(24), width: s(38.4) }} />
        <div className="min-w-0">
          <p className="font-heading font-semibold" style={{ fontSize: s(13), lineHeight: 1.2 }}>
            Jake and Ana
          </p>
          <p className="text-muted" style={{ fontSize: s(10) }}>
            Met at BIO Partnering
          </p>
        </div>
      </div>
      <div style={{ marginTop: s(8) }} className="divide-y divide-line">
        {row("Send the talk slides", "me", "You, Fri")}
        {row("Share the trial dataset", "them", "Ana")}
        {row("Intro to Rohit", "me", "You")}
      </div>
      <div
        className="bg-team-light text-team-text"
        style={{ marginTop: s(8), borderRadius: s(10), padding: `${s(6)} ${s(9)}`, fontSize: s(10), lineHeight: 1.3 }}
      >
        AI in Medicine talk.pdf, shared with Ana
      </div>
    </div>
  );
}

// Floating chip. Fades and rises once on load (see .chip-in in globals.css).
function Chip({
  dot,
  children,
  pos,
  delay,
}: {
  dot: string;
  children: React.ReactNode;
  pos: Pos;
  delay: number;
}) {
  return (
    <div className="chip-in" style={{ ...place(pos), animationDelay: `${delay}ms` }}>
      <div
        className="inline-flex items-center whitespace-nowrap bg-white shadow-chip"
        style={{ gap: u(7), borderRadius: u(14), padding: `${u(8)} ${u(12)}`, fontSize: u(11.5), fontWeight: 500 }}
      >
        <span style={{ width: u(8), height: u(8), borderRadius: "9999px", background: dot }} />
        {children}
      </div>
    </div>
  );
}

export default function HeroArt({ heroOk, captureOk }: { heroOk: boolean; captureOk: boolean }) {
  return (
    <>
      {/* Laptop and tablet composition: one tight group, centered.
          Group coordinates are offset by (30, 10) inside the canvas. */}
      <Canvas base={520} height={560} className="mx-auto hidden w-full md:block">
        <GroupField base={520} height={560} />
        {heroOk && <Photo pos={{ left: 80, top: 0, width: 440, height: 340 }} />}
        <TeamCard pos={{ left: 140, top: 50, width: 320 }} k={1.28} />
        <PhoneFrame pos={{ left: 30, top: 264, width: 150, height: 290 }} k={1} captureOk={captureOk} />
        <Chip dot="#FFB627" pos={{ left: 156, top: 14 }} delay={0}>
          Ana promised the trial dataset
        </Chip>
        <Chip dot="#17A267" pos={{ left: 318, top: 264 }} delay={150}>
          Slides shared with Ana
        </Chip>
        <Chip dot="#2F5BFF" pos={{ left: 196, top: 500 }} delay={300}>
          Follow-up email ready
        </Chip>
      </Canvas>

      {/* Phone composition: smaller canvas, two chips */}
      <Canvas base={360} height={430} className="mx-auto md:hidden">
        <CircleField base={360} height={430} />
        {heroOk && <Photo pos={{ left: 28, top: 150, width: 332, height: 240 }} />}
        <PhoneFrame pos={{ left: 0, top: 225, width: 112, height: 200 }} k={0.75} captureOk={captureOk} />
        <TeamCard pos={{ left: 112, top: 0, width: 248 }} />
        <Chip dot="#FFB627" pos={{ left: 126, top: 340 }} delay={0}>
          Ana promised the trial dataset
        </Chip>
        <Chip dot="#17A267" pos={{ left: 150, top: 292 }} delay={150}>
          Slides shared with Ana
        </Chip>
      </Canvas>
    </>
  );
}

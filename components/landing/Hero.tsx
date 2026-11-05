import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { CAPTURE, HERO } from "@/lib/landingImages";
import HeroArt from "./HeroArt";

// True when the photo exists in /public. Missing photos fall back to drawn art.
function exists(publicPath: string) {
  return fs.existsSync(path.join(process.cwd(), "public", publicPath));
}

export default function Hero() {
  return (
    <section className="mx-auto grid w-full max-w-[1160px] items-center gap-10 px-6 pb-14 pt-8 lg:grid-cols-2 lg:gap-12 lg:px-8 lg:pb-24 lg:pt-16">
      <div>
        <span className="inline-flex items-center rounded-full bg-team-light px-3 py-1.5 text-sm font-medium text-team-text">
          Made for conferences
        </span>
        <h1 className="mt-5 font-heading text-[40px] font-extrabold leading-none tracking-[-0.03em] lg:text-[64px]">
          Every handshake becomes a team.
        </h1>
        <p className="mt-5 max-w-[440px] text-base text-muted lg:text-lg">
          Snap their badge or say a few words. Teamingful writes down who you met and what each
          of you promised, then gives you both one shared place to follow through.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link href="/signin" className="btn w-full sm:w-auto">
            Start free
          </Link>
          <a href="#how" className="btn-secondary w-full sm:w-auto">
            See how it works
          </a>
        </div>
        <p className="mt-4 text-sm text-muted">
          Free during early access. Works in your phone&apos;s browser.
        </p>
      </div>

      <HeroArt heroOk={exists(HERO)} captureOk={exists(CAPTURE)} />
    </section>
  );
}

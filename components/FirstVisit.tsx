import Link from "next/link";
import { CameraIcon } from "./Icons";
import StepCarousel from "./StepCarousel";

// Shown on Today until the first team exists.
// Same three cards as the landing page. Phone: swipeable row, one card at a time
// with a peek of the next. Laptop: three columns.
export default function FirstVisit() {
  return (
    <div>
      <h2 className="text-lg">How your first team happens</h2>
      <StepCarousel />

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start">
        <Link
          href="/capture"
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-you px-5 font-medium text-white hover:bg-you/90"
        >
          <CameraIcon size={20} />
          Capture your first meeting
        </Link>
      </div>
    </div>
  );
}

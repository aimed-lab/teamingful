// The "team of two" mark: two overlapping circles.
// Left = me (green). Right = them (partner-green, white ring).
// For teams of 3 or more, the right circle shows the member count.

const SIZES = {
  sm: { circle: "h-7 w-7 text-[10px]", overlap: "-ml-2" },
  md: { circle: "h-10 w-10 text-sm", overlap: "-ml-3" },
  lg: { circle: "h-16 w-16 text-xl", overlap: "-ml-5" },
};

type Props = {
  me: string; // my initials
  them: string; // their initials
  count?: number; // total people in the team; 3+ shows the number
  size?: "sm" | "md" | "lg";
};

export default function TeamMark({ me, them, count = 2, size = "md" }: Props) {
  const s = SIZES[size];
  const circle = `flex ${s.circle} items-center justify-center rounded-full font-heading font-medium text-white`;

  return (
    <div className="flex shrink-0 items-center">
      <span className={`${circle} bg-green`}>{me}</span>
      <span
        className={`${circle} ${s.overlap} bg-partner-green ring-2 ring-white`}
      >
        {count >= 3 ? count : them}
      </span>
    </div>
  );
}

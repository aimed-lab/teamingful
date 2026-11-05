// The team mark: two overlapping circles.
// Left = you (blue). Right = them (marigold). The overlap (the lens) = the team (green).
// Initials: white on blue, ink on marigold. For teams of 3+ the right circle shows the count.
// Leave me/them empty for the plain logo mark.
import { useId } from "react";

const HEIGHTS = { sm: 28, md: 40, lg: 64, xl: 96 };

type Props = {
  me?: string; // my initials
  them?: string; // their initials
  count?: number; // total people in the team; 3+ shows the number
  size?: "sm" | "md" | "lg" | "xl";
  style?: React.CSSProperties; // e.g. to size the mark with CSS instead of `size`
};

export default function TeamMark({ me = "", them = "", count = 2, size = "md", style }: Props) {
  const clipId = useId();
  const h = HEIGHTS[size];
  const fontSize = 12;

  return (
    <svg
      width={(h * 64) / 40}
      height={h}
      viewBox="0 0 64 40"
      className="shrink-0"
      style={style}
      role="img"
      aria-label="Team mark"
    >
      <defs>
        <clipPath id={clipId}>
          <circle cx="44" cy="20" r="20" />
        </clipPath>
      </defs>
      <circle cx="20" cy="20" r="20" fill="#2F5BFF" />
      <circle cx="44" cy="20" r="20" fill="#FFB627" />
      <circle cx="20" cy="20" r="20" fill="#17A267" clipPath={`url(#${clipId})`} />
      {me && (
        <text x="11" y="24.5" textAnchor="middle" fontSize={fontSize} fontWeight="600" className="fill-white font-heading">
          {me}
        </text>
      )}
      {(them || count >= 3) && (
        <text x="53" y="24.5" textAnchor="middle" fontSize={fontSize} fontWeight="600" className="fill-ink font-heading">
          {count >= 3 ? count : them}
        </text>
      )}
    </svg>
  );
}

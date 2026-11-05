import { ImageResponse } from "next/og";

// The team mark on a white square, drawn at any size (used for the PNG app icons).
// rounded = rounded corners (manifest icons). Apple icons stay square; iOS rounds them itself.
export function appIcon(size: number, rounded = true) {
  const w = size * 0.78; // mark width
  const h = w * (40 / 64);
  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          background: "#ffffff",
          borderRadius: rounded ? size * 0.22 : 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width={w} height={h} viewBox="0 0 64 40">
          <defs>
            <clipPath id="lens">
              <circle cx="44" cy="20" r="20" />
            </clipPath>
          </defs>
          <circle cx="20" cy="20" r="20" fill="#2F5BFF" />
          <circle cx="44" cy="20" r="20" fill="#FFB627" />
          <circle cx="20" cy="20" r="20" fill="#17A267" clipPath="url(#lens)" />
        </svg>
      </div>
    ),
    { width: size, height: size }
  );
}

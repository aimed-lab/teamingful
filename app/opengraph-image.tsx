import { ImageResponse } from "next/og";

export const alt = "Teamingful: every handshake becomes a team";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Social preview image: the mark and the headline on paper.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#F7F8FA",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 90,
        }}
      >
        <svg width={200} height={125} viewBox="0 0 64 40">
          <defs>
            <clipPath id="lens">
              <circle cx="44" cy="20" r="20" />
            </clipPath>
          </defs>
          <circle cx="20" cy="20" r="20" fill="#2F5BFF" />
          <circle cx="44" cy="20" r="20" fill="#FFB627" />
          <circle cx="20" cy="20" r="20" fill="#17A267" clipPath="url(#lens)" />
        </svg>
        <div
          style={{
            marginTop: 40,
            fontSize: 96,
            fontWeight: 800,
            letterSpacing: -3,
            lineHeight: 1,
            color: "#121418",
          }}
        >
          Every handshake becomes a team.
        </div>
        <div style={{ marginTop: 28, fontSize: 36, color: "#5F6878" }}>teamingful.com</div>
      </div>
    ),
    size
  );
}

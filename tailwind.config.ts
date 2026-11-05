import type { Config } from "tailwindcss";

// Brand tokens. See docs/brand.md.
// Color means who: blue = you, marigold = them, green = shared / the team.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#121418", // text, primary buttons, dark panels
        paper: "#F7F8FA", // page background
        line: "#E4E7EC", // borders
        muted: "#5F6878", // secondary text
        you: { DEFAULT: "#2F5BFF", light: "#EAF0FF" },
        // Never put white text on marigold. Use text-them-text on them-light.
        them: { DEFAULT: "#FFB627", light: "#FFF4DA", text: "#8A5A00" },
        team: { DEFAULT: "#17A267", light: "#E4F6EC", text: "#0D6B43" },
      },
      borderRadius: {
        card: "16px",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "sans-serif"],
        sans: ["var(--font-body)", "sans-serif"],
      },
      boxShadow: {
        chip: "0 8px 24px rgba(18,20,24,.08)",
      },
    },
  },
  plugins: [],
};

export default config;

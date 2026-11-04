import type { Config } from "tailwindcss";

// Design tokens for Teamingful. Use these names in every screen.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        green: {
          DEFAULT: "#1A5632", // primary
          dark: "#0f3a21",
          light: "#e4ece6",
        },
        "partner-green": "#5d8a6c",
        surface: "#f3f1ea",
        page: "#fbfaf7",
        line: "#e2dfd6",
        ink: "#1c1f1d",
        muted: "#6b6f6c",
        amber: "#c48a1c", // needs follow-up
      },
      borderRadius: {
        card: "12px",
        btn: "11px",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "sans-serif"],
        sans: ["var(--font-body)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

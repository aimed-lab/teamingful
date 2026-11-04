import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Teamingful",
    short_name: "Teamingful",
    description: "Everyone you meet, as teams.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbfaf7",
    theme_color: "#1A5632",
    // Placeholder icon (two overlapping circles). Replace with real PNGs later.
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}

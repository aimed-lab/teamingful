import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist } from "next/font/google";
import "./globals.css";

const heading = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["600", "800"],
  variable: "--font-heading",
});

const body = Geist({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

const TITLE = "Teamingful: every handshake becomes a team";
const DESCRIPTION =
  "Snap their badge or say a few words. Teamingful writes down who you met and what each of you promised, then gives you both one shared place to follow through.";

export const metadata: Metadata = {
  metadataBase: new URL("https://teamingful.com"),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, siteName: "Teamingful", type: "website" },
};

export const viewport: Viewport = {
  themeColor: "#F7F8FA",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}

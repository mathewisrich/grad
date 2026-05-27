import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:1999");

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Kelly Files: Guess who is a good boy?",
  description:
    "464 graduation pictures, password-protected, just for Kelly. 🐶 roof roof roof.",
  applicationName: "Kelly Files",
  robots: { index: false, follow: false },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Kelly Files",
    title: "Kelly Files: Guess who is a good boy?",
    description:
      "464 graduation pictures, password-protected, just for Kelly. 🐶 roof roof roof.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kelly Files: Guess who is a good boy?",
    description:
      "464 graduation pictures, password-protected, just for Kelly. 🐶 roof roof roof.",
  },
  icons: {
    icon: [{ url: "/favicon.ico" }],
    apple: [{ url: "/shayla.png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#08060d",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-ink text-cream font-sans antialiased">
        {children}
      </body>
    </html>
  );
}

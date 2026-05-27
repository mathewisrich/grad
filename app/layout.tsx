import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kelly & Mathew · Graduation",
  description: "Our graduation pictures. For Kelly. Password required.",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-ink text-cream font-sans">
        {children}
      </body>
    </html>
  );
}

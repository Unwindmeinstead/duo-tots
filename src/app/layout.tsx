import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import { ClientShell } from "@/components/client-shell";
import "./globals.css";

const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin"], weight: ["400", "700", "800", "900"] });

export const metadata: Metadata = {
  title: "DuoTots — Visual Learning",
  description: "Duolingo-style vocabulary app for young learners.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#58cc02",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${nunito.variable} h-full antialiased`}>
      <body className="min-h-full" style={{ fontFamily: "var(--font-nunito), system-ui, sans-serif" }}>
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}

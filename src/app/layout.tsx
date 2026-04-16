import type { Metadata, Viewport } from "next";
import { ClientShell } from "@/components/client-shell";
import "./globals.css";

// Using local font stack to avoid network dependency on Google Fonts
const sans = {
  variable: "--font-sans",
  className: "font-sans",
};

export const metadata: Metadata = {
  title: "DuoTots — Visual Learning",
  description: "Premium vocabulary app for young learners.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ede4d3",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full font-sans antialiased">
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}

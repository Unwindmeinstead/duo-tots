import type { Metadata, Viewport } from "next";
import { ClientShell } from "@/components/client-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "DuoTots — Visual Learning",
  description:
    "Photoreal vocabulary learning for toddlers: real-life pictures, tap-to-hear words, and playful practice across 27 topics.",
  applicationName: "DuoTots",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DuoTots",
  },
  openGraph: {
    type: "website",
    siteName: "DuoTots",
    title: "DuoTots — Visual Learning",
    description:
      "Photoreal vocabulary learning for toddlers: real-life pictures, tap-to-hear words, and playful practice across 27 topics.",
    images: [{ url: "/icon-512.png", width: 512, height: 512, alt: "DuoTots" }],
  },
  twitter: {
    card: "summary",
    title: "DuoTots — Visual Learning",
    description:
      "Photoreal vocabulary learning for toddlers: real-life pictures, tap-to-hear words, and playful practice across 27 topics.",
    images: ["/icon-512.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1D5CD6",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full font-sans antialiased">
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}

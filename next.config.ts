import type { NextConfig } from "next";
import withPWA, { runtimeCaching } from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    runtimeCaching: [
      ...runtimeCaching,
      {
        urlPattern: /^https:\/\/upload\.wikimedia\.org\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "duotots-images",
          expiration: {
            maxEntries: 120,
            maxAgeSeconds: 60 * 60 * 24 * 30,
          },
        },
      },
      {
        urlPattern: /^https:\/\/media\.api\.dictionaryapi\.dev\/.*/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "duotots-audio",
          expiration: {
            maxEntries: 120,
            maxAgeSeconds: 60 * 60 * 24 * 30,
          },
        },
      },
    ],
  },
  fallbacks: {
    document: "/~offline",
  },
})(nextConfig);

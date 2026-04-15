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
        hostname: "en.wikipedia.org",
      },
      {
        protocol: "https",
        hostname: "pixabay.com",
      },
      {
        protocol: "https",
        hostname: "cdn.pixabay.com",
      },
      {
        protocol: "https",
        hostname: "static.vecteezy.com",
      },
      {
        protocol: "https",
        hostname: "images.vecteezy.com",
      },
      {
        protocol: "https",
        hostname: "www.vecteezy.com",
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
        urlPattern: /^https:\/\/(upload\.wikimedia\.org|pixabay\.com|cdn\.pixabay\.com|static\.vecteezy\.com|images\.vecteezy\.com|www\.vecteezy\.com)\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "duotots-images",
          expiration: {
            maxEntries: 400,
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
            maxEntries: 400,
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

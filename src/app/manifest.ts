import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DuoTots Visual Vocab",
    short_name: "DuoTots",
    description: "Visual vocabulary learning app for toddlers.",
    start_url: "/",
    display: "standalone",
    background_color: "#ede4d3",
    theme_color: "#ede4d3",
    icons: [
      {
        src: "/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
      },
      {
        src: "/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
      },
      {
        src: "/icon-maskable.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}

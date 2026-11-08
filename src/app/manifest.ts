import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DuoTots Visual Vocab",
    short_name: "DuoTots",
    description: "Visual vocabulary learning app for toddlers.",
    start_url: "/",
    display: "standalone",
    background_color: "#F9C235",
    theme_color: "#F9C235",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

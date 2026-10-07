import type { MetadataRoute } from "next";

/** Installable PWA (no service worker) — home screen icon + standalone shell. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "TutorHub",
    short_name: "TutorHub",
    description:
      "Schedule, invoices, and monthly reports for a solo private tutor.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#465fff",
    icons: [
      {
        src: "/pwa/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/pwa/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/pwa/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

import { MetadataRoute } from "next"
import { sharedMetadata } from "./shared-metadata"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HINSELL | Smarter Electronic Commerce",
    short_name: "HINSELL",
    description: sharedMetadata.openGraph.description,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1a1a1a",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  }
}

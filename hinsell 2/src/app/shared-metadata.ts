import { env } from "env.mjs"

export const sharedMetadata = {
  metadataBase: new URL(env.LIVE_URL || "https://commerce.hinsell.com"),
  openGraph: {
    title: "HINSELL | Smarter Electronic Commerce",
    description: "HINSELL is an advanced e-commerce platform tailored for modern retailers, powered by AI and built on Next.js.",
    images: ["/opengraph-image.jpg"],
  },
  twitter: {
    card: "summary_large_image" as const,
    title: "HINSELL | Smarter Electronic Commerce",
    description: "Experience HINSELL – your intelligent commerce solution for high-performance online stores.",
    creator: "@hinsell_commerce",
    images: ["/opengraph-image.jpg"],
  },
}

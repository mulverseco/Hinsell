import { sharedMetadata } from "../shared-metadata"
import { Metadata } from "next"
import Script from "next/script"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import { Suspense } from "react"
import { Toaster } from "sonner"
import { FlagValues } from "@/components/flag-values"
import { ThirdParties } from "@/components/third-parties"
import { mobileInlineScript } from "@/components/navbar/mobile-inline-script"
export const revalidate = 86400

export const metadata: Metadata = {
  metadataBase: sharedMetadata.metadataBase,
  title: "Hinsell Enterprise Commerce | Mulverse",
  description: sharedMetadata.openGraph.description,
  openGraph: sharedMetadata.openGraph,
  twitter: sharedMetadata.twitter,
  verification: {
    google: "google",
    yandex: "yandex",
    yahoo: "yahoo",
  },
  generator: "mohamed",
  applicationName: "Hinsell",
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="@container">
        <NuqsAdapter>
          <Script id="mobileMegaMenuLogic" strategy="lazyOnload">{`${mobileInlineScript}`}</Script>
          {children}
          {/* <Modals /> */}
          <Toaster position="bottom-left"/>
          <Suspense>
            <FlagValues />
          </Suspense>
          <ThirdParties/>
        </NuqsAdapter>
      </body>
    </html>
  )
}

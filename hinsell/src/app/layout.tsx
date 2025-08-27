import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { getServerLocale } from "@/utils/language-utils"
import { Providers } from "./providers"
import { sharedMetadata } from "./shared-metadata"

export const metadata: Metadata = {
  metadataBase: sharedMetadata.metadataBase,
  description: sharedMetadata.openGraph.description,
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getServerLocale()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Providers locale={locale}>
          {children}
        </Providers>
      </body>
    </html>
  )
}

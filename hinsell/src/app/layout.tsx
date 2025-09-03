import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { getServerLocale } from "@/utils/language-utils"
import { Providers } from "./providers"
import { sharedMetadata } from "./shared-metadata"
import { auth } from "@/core/auth"

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
const session = await auth()
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Providers locale={locale} session={session}>
          {children}
        </Providers>
      </body>
    </html>
  )
}

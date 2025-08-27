
import type React from "react"
import { Header } from "@/features/landing/header"
import { Footer } from "@/features/landing/footer"
import { itemsList } from "@/core/generated/actions/items";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const results = await itemsList({})
  return (
    <>
     <Header />
     {children}
     <Footer />
    </>
  )
}

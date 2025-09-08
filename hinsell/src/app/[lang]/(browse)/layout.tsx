
import type React from "react"
import { Header } from "@/components/header/header"
import { Footer } from "@/features/landing/footer"
import { itemGroupsList } from "@/core/generated/actions/itemGroups";
import { storeGroupsList } from "@/core/generated/actions/storeGroups";
import { NuqsAdapter } from "nuqs/adapters/next/app"
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
   const [itemGroupsData, storeGroupsData] = await Promise.all([itemGroupsList({}), storeGroupsList({})])
  return (
    <NuqsAdapter>
     <Header initialItemGroups={itemGroupsData.data || []} initialStoreGroups={storeGroupsData.data || []} />
     <main className="mt-24">
     {children}
     </main>
     <Footer initialItemGroups={itemGroupsData.data || []} initialStoreGroups={storeGroupsData.data || []} />
    </NuqsAdapter>
  )
}

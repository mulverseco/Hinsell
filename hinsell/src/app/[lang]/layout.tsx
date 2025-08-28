
import type React from "react"
import { Header } from "@/components/header/header"
import { Footer } from "@/features/landing/footer"
import { itemGroupsList } from "@/core/generated/actions/itemGroups";
import { storeGroupsList } from "@/core/generated/actions/storeGroups";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
   const [itemGroupsData, storeGroupsData] = await Promise.all([itemGroupsList({}), storeGroupsList({})])
  return (
    <>
     <Header initialItemGroups={itemGroupsData.data || []} initialStoreGroups={storeGroupsData.data || []} />
     {children}
     <Footer initialItemGroups={itemGroupsData.data || []} initialStoreGroups={storeGroupsData.data || []} />
    </>
  )
}

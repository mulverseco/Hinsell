"use client"

import { ItemGroup } from "@/core/generated/schemas"
import { NavigationBar } from "./navigation-bar"
import { useItemGroupsList } from "@/core/generated/hooks/itemGroups"



interface NavigationBarProps {
  initialItemGroups : ItemGroup[] | null
}

export function NavigationBarWrapper({initialItemGroups}:NavigationBarProps) {
  const { data: itemGroups } = useItemGroupsList(undefined, undefined, { initialData: initialItemGroups ?? undefined})
  
  return <NavigationBar ItemGroups={itemGroups} />
}

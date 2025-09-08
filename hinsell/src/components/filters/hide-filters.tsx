"use client"

import { Button } from "@/components/ui/button"
import { Filter } from "lucide-react"


export const HideFilters = () => {
  // const set = useFilterStore((s) => s.set)
  // const status = useFilterStore((s) => s.status)

  return (
    <Button
      onClick={() => {
        if (status === "hidden") {
          // set("visible")
          return
        }

        // set("hidden")
      }}
      className="hidden items-center gap-2 bg-transparent text-base font-normal text-black transition-colors lg:flex"
    >
      <span>{status === "hidden" ? "Show" : "Hide"} filters</span>
      <Filter/>
    </Button>
  )
}

"use client"

import { useOffersList } from "@/core/generated/hooks/offers"
import { cn } from "@/utils/cn"
import Link from "next/link"

export function AnnouncementBar({ className }: { className?: string }) {
  const { data: offers } = useOffersList(undefined, "-created_at", {
    enabled: true,
    refetchInterval: 300000,
  })

  const activeOffer = offers?.data?.[2]
  console.log("activeOffer : ",activeOffer)
  console.log("offers : ",offers)


  return (
    <div
      className={cn(
        "flex h-[40px] w-full items-center justify-center text-nowrap bg-gradient-to-t from-white to-[#fce26a] text-center text-base/[25px] text-black",
        className,
      )}
    >
      {activeOffer?.name || ""}
      <Link prefetch={false} href={activeOffer?.slug || "#"} className="ml-2 underline hover:no-underline">
        Shop now
      </Link>
    </div>
  )
}

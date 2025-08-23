"use client"

import { useOffersList } from "@/core/generated/hooks/offers"
import { cn } from "@/utils/cn"
import Link from "next/link"

export function AnnouncementBar({ className }: { className?: string }) {
  const {
    data: offers,
    isLoading,
    error,
  } = useOffersList(undefined, "-created_at", {
    enabled: true,
    refetchInterval: 300000,
  })

  const activeOffer = offers?.results?.[0]
  console.log("activeOffer : ", activeOffer)
  console.log("offers : ", offers)

  // Fallback content
  const defaultContent = {
    text: "Sale 50% OFF",
    ctaText: "Shop Now",
    ctaHref: "/search",
  }

  const content = activeOffer
    ? {
        text: activeOffer.title || activeOffer.description || "Special Offer Available",
        ctaText: activeOffer.cta_text || "Shop Now",
        ctaHref: activeOffer.cta_url || "/search",
      }
    : defaultContent

  if (error) {
    console.warn("Failed to load offers for announcement bar:", error)
  }

  return (
    <div
      className={cn(
        "flex h-[40px] w-full items-center justify-center text-nowrap bg-gradient-to-t from-white to-[#fce26a] text-center text-base/[25px] text-black",
        className,
      )}
    >
      {isLoading ? (
        <>
          <span className="animate-pulse">Loading offers...</span>
        </>
      ) : (
        <>
          {content.text}
          <Link prefetch={false} href={content.ctaHref} className="ml-2 underline hover:no-underline">
            {content.ctaText}
          </Link>
        </>
      )}
    </div>
  )
}

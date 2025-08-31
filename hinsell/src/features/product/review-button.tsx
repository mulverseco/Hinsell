"use client"

import { CTAButton } from "@/components/shared/cta-button"
import { useQueryState } from "nuqs"

type ReviewButtonProps = {
  productId: string
}

export const ReviewButton = ({ productId }: ReviewButtonProps) => {
  const [_, setPid] = useQueryState("pid")

  return (
    <CTAButton
      variant="outline"
      size="sm"
      className="bg-white transition-all hover:bg-gray-100 active:scale-[0.98]"
      onClick={() => {
        setPid(productId)
      }}
    >
      Leave a Review
    </CTAButton>
  )
}

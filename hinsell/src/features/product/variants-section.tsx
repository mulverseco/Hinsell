"use client"


import { Variant } from "./variant"
import { cn } from "@/lib/utils"
import { Item } from "@/core/generated/schemas"


interface VariantsSectionProps {
  variants: any[]
  className?: string
  combination: Item | undefined
  handle: string
}

export function VariantsSection({ variants, className, handle, combination }: VariantsSectionProps) {
  // const combinations = getAllCombinations(variants)
  // const cart = useCartStore((s) => s.cart)

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <p className="text-center text-sm text-neutral-500 md:text-left">Select variant</p>
      <div className="relative flex w-full flex-wrap justify-center gap-2 md:justify-start">
        {combinations.map((singleCombination) => {
          const cartItem = cart?.items.find((item) => item.merchandise.id === singleCombination?.id)

          const variant = variants.find((v) => v.id === singleCombination.id)

          const optionsForUrl: Record<string, string> = {}
          if (variant?.selectedOptions) {
            variant.selectedOptions.forEach((option) => {
              optionsForUrl[option.name] = option.value
            })
          }

          return (
            <Variant
              cartItem={cartItem}
              key={singleCombination.id}
              href={optionsForUrl || ""}
              singleCombination={singleCombination}
              isActive={singleCombination.id === combination?.id}
            />
          )
        })}
      </div>
    </div>
  )
}

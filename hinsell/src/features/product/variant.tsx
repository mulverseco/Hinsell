import { Item } from "@/core/generated/schemas"
import { cn } from "@/lib/utils"
import Link from "next/link"

type VariantProps = {
  singleCombination: Item | undefined
  isActive: boolean
  href: string
  cartItem: any | undefined
}

export function Variant({ singleCombination, isActive, href, cartItem }: VariantProps) {
  const quantityAvailable = singleCombination?.variants?.[0].minimum_order_quantity ?? 0
  const quantityInCart = cartItem?.quantity ?? 0

  const availableForSale = singleCombination?.variants?.[0].minimum_order_quantity
  const isOutOfStock = quantityAvailable <= quantityInCart || !availableForSale

  return (
    <Link
      href={href}
      prefetch={false}
      scroll={false}
      className={cn(
        "relative flex h-[40px] min-w-[80px] cursor-pointer items-center justify-center rounded-md border border-black bg-white p-1.5 text-[11px] font-medium transition-colors hover:bg-neutral-800 hover:text-white",
        { "bg-neutral-800 text-white": isActive },
        { "stroke-black opacity-80 hover:bg-transparent hover:text-black": isOutOfStock }
      )}
    >
      {singleCombination?.name}
      {isOutOfStock && (
        <svg className={"absolute inset-0 block size-full"}>
          <line x1="0" y1="100%" x2="100%" y2="0"></line>
        </svg>
      )}
    </Link>
  )
}

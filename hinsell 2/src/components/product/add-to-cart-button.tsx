"use client"

import { useState } from "react"
import { toast } from "sonner"


import { Button } from "components/ui/button"
import { BagIcon } from "components/icons/bag-icon"

import { cn } from "utils/cn"
import { getCookie } from "utils/get-cookie"
import type { Combination } from "utils/product-options-utils"

import { useAddProductStore } from "stores/add-product-store"
import { useCartStore } from "stores/cart-store"

import { COOKIE_CART_ID } from "constants/index"
import { Item } from "@/core/generated/schemas"

export function AddToCartButton({
  className,
  product,
  combination,
}: {
  className?: string
  product: Item
  combination: Combination | any | undefined
}) {
  const [isPending, setIsPending] = useState(false)
  const setProduct = useAddProductStore((s) => s.setProduct)
  const clean = useAddProductStore((s) => s.clean)
  const cart = useCartStore((s) => s.cart)
  const refresh = useCartStore((s) => s.refresh)
  const setCheckoutReady = useCartStore((s) => s.setCheckoutReady)

 

  const handleClick = async () => {
    if (!product?.id) return
    setIsPending(true)
    setTimeout(() => {
      setProduct({ product, combination })
      setIsPending(false)
    }, 300)

    setTimeout(() => clean(), 4500)

    setCheckoutReady(false)
    // const res = await addCartItem(null, combination.id, product.id)

    // if (!res.ok) toast.error("Out of stock")

    setCheckoutReady(true)
    refresh()
  }


  return (
    <Button
      onClick={handleClick}
      disabled={isPending }
      variant="default"
      className={cn(
        "mx-auto w-full rounded-md p-10 py-4 transition-all hover:bg-black/85 md:w-full md:rounded-md md:py-4",
        className
      )}
    >
      <BagIcon className="mr-2 size-5 text-white" />
      Add to Bag
    </Button>
  )
}

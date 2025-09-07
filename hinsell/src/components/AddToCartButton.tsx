"use client"

import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ItemUnit, ItemVariant } from "@/core/generated/schemas"
import { useECommerceStore } from "@/core/store"

interface AddToCartButtonProps {
  variant: ItemVariant
  quantity: number
  selectedUnit?: ItemUnit
  disabled?: boolean
  className?: string
}

export function AddToCartButton({ variant, quantity, selectedUnit, disabled, className }: AddToCartButtonProps) {
  const { addToCart, checkAvailability } = useECommerceStore()

  const isOutOfStock = !checkAvailability(variant.id!, quantity)
  const isDisabled = disabled || isOutOfStock || !selectedUnit

  const handleAddToCart = () => {
    if (!selectedUnit || !variant.id) {
      console.warn("Missing required data for adding to cart")
      return
    }

    try {
      addToCart(variant, quantity, selectedUnit)
      console.log("Successfully added to cart:", { variant: variant.id, quantity })
    } catch (error) {
      console.error("Failed to add to cart:", error)
    }
  }

  return (
    <Button onClick={handleAddToCart} disabled={isDisabled} className={cn("flex items-center gap-2", className)}>
      <ShoppingCart className="h-4 w-4" />
      {isOutOfStock ? "Out of Stock" : "Add to Cart"}
    </Button>
  )
}

"use client"

import { useState } from "react"
import { ShoppingBag, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Item, ItemVariant } from "@/core/generated/schemas"
import { useCartStore } from "@/core/store"
import { cn } from "@/lib/utils"


interface AddToCartButtonProps {
  item: Item
  variant: ItemVariant
  selectedSize?: string
  selectedColor?: string
  className?: string
  size?: "sm" | "default" | "lg"
  disabled?: boolean
}

export function AddToCartButton({
  item,
  variant,
  selectedSize,
  selectedColor,
  className,
  size = "default",
  disabled = false,
}: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  const addToCart = useCartStore((state) => state.addItem)

  const handleAddToCart = async () => {
    if (disabled || isAdding) return

    setIsAdding(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 300))

      addToCart(item, variant, {
        size: selectedSize,
        color: selectedColor,
      })

      setJustAdded(true)
      setTimeout(() => setJustAdded(false), 2000)
    } catch (error) {
      console.error("Failed to add item to cart:", error)
    } finally {
      setIsAdding(false)
    }
  }

  const buttonText = justAdded ? "ADDED!" : isAdding ? "ADDING..." : "ADD TO CART"
  const ButtonIcon = justAdded ? Check : isAdding ? Loader2 : ShoppingBag

  return (
    <Button
      onClick={handleAddToCart}
      disabled={disabled || isAdding}
      size={size}
      className={cn(
        "transition-all duration-200 bg-primary hover:bg-primary/90 text-primary-foreground font-medium",
        justAdded && "bg-green-600 hover:bg-green-700",
        className,
      )}
    >
      <ButtonIcon className={cn("h-4 w-4 mr-2", isAdding && "animate-spin")} />
      {buttonText}
    </Button>
  )
}

"use client"
import { useState } from "react"
import { Star, Heart, Share2, Truck, Shield, RotateCcw, ChevronRight, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Item, ItemVariant } from "@/core/generated/schemas"
import { useWishlistStore } from "@/core/store"
import { AddToCartButton } from "@/components/add-to-cart-button"


interface ItemInfoProps {
  item: Item
}

export function ItemInfo({ item }: ItemInfoProps) {
  const [selectedVariant, setSelectedVariant] = useState<ItemVariant>(item.variants![0])
  const [selectedSize, setSelectedSize] = useState<string>("4Y")
  const [quantity, setQuantity] = useState(1)

  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore()

  const isWishlisted = isInWishlist(item.id!)
  const price = selectedVariant ? Number.parseFloat(selectedVariant.sales_price || "0") : 0
  const originalPrice = selectedVariant?.wholesale_price ? Number.parseFloat(selectedVariant.wholesale_price) : null

  const availableSizes = ["4Y (98-104 cm)", "5Y (104-110 cm)", "6Y (110-116 cm)", "7Y (116-122 cm)", "8Y (122-128 cm)"]

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeFromWishlist(item.id!)
    } else {
      addToWishlist(item)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span
            className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-sm shadow-sm"
            style={{ backgroundColor: "#7c3aed", color: "#ffffff" }}
          >
            Trends
          </span>
          <span className="text-sm text-muted-foreground">{item.name}</span>
          <Share2 className="h-4 w-4 text-muted-foreground ml-auto cursor-pointer" />
        </div>

        <p className="text-xs text-muted-foreground">CODE: {item?.id}</p>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "h-4 w-4",
                i < Math.floor(Number(item.average_rating || 0))
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground/30",
              )}
            />
          ))}
        </div>
        <span className="text-sm text-muted-foreground">({item.review_count} Reviews)</span>
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">From</span>
          <span className="text-2xl font-bold text-destructive">${price.toFixed(2)}</span>
          {originalPrice && originalPrice > price && (
            <span className="text-sm text-muted-foreground line-through">${originalPrice.toFixed(2)}</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Pay now or in 4 payments of $1.68 <span className="underline">Klarna</span>
        </p>
      </div>

      <div className="flex items-center gap-2 bg-accent p-2 rounded">
        <div className="bg-orange-500 text-white px-2 py-0.5 rounded text-xs font-medium">#7 Bestseller</div>
        <span className="text-xs text-accent-foreground">in Young Girls Sweatshirts</span>
        <div className="flex items-center ml-auto">
          <div className="flex -space-x-1">
            <div className="w-5 h-5 bg-muted rounded-full border border-background"></div>
            <div className="w-5 h-5 bg-muted-foreground/50 rounded-full border border-background"></div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground ml-1" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Size</span>
          <button className="text-xs text-primary underline flex items-center gap-1">
            <Info className="h-3 w-3" />
            Size Guide
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {availableSizes.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={cn(
                "p-2 border rounded text-xs text-center transition-colors",
                selectedSize === size
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-muted-foreground",
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-sm font-medium">Qty.</span>
        <div className="flex items-center border border-border rounded w-fit">
          <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 hover:bg-muted text-sm">
            -
          </button>
          <span className="px-4 py-2 border-x border-border text-sm">{quantity}</span>
          <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2 hover:bg-muted text-sm">
            +
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <AddToCartButton item={item} variant={item?.variants} className="w-full" />
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleWishlistToggle} className="flex-1 border-border bg-transparent">
            <Heart className={cn("h-4 w-4 mr-2", isWishlisted && "fill-current")} />
            {isWishlisted ? "Saved" : "Save"}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">Earn up to 6 SHEIN Points calculated at checkout.</p>
      </div>

      <div className="space-y-3 pt-4 border-t border-border">
        <div className="space-y-2">
          <p className="text-sm font-medium">Shipping to Puerto Rico</p>
          <div className="flex items-center gap-2 text-sm text-green-600">
            <Truck className="h-4 w-4" />
            <span>Free Shipping (Orders ≥ $49.00)</span>
            <Info className="h-3 w-3 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RotateCcw className="h-4 w-4" />
            <span>Return Policy</span>
            <Info className="h-3 w-3 text-muted-foreground" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Shopping Security</span>
              <Info className="h-3 w-3 text-muted-foreground" />
            </div>
            <span className="text-xs text-muted-foreground">1/2 &gt;</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="text-green-500">✓</span> Safe Payments
            </span>
            <span className="flex items-center gap-1">
              <span className="text-green-500">✓</span> Secure Logistics
            </span>
            <span className="flex items-center gap-1">
              <span className="text-green-500">✓</span> Customer Service
            </span>
          </div>
        </div>
      </div>

      <div className="bg-muted p-3 rounded space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
            <span className="text-xs font-bold text-green-600">M</span>
          </div>
          <span className="text-sm font-medium">Sold by Promise Kids Marketplace</span>
        </div>
        <p className="text-xs text-muted-foreground">Ships from Promise Kids Marketplace</p>
        <button className="text-xs text-primary underline">To report this seller and/or product &gt;</button>
      </div>
    </div>
  )
}

"use client"
import { useState } from "react"
import { Star, Heart, Share2, Truck, Shield, RotateCcw, ChevronRight, Info, Tag, Zap, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

import { useWishlistStore } from "@/core/store"
import { AddToCartButton } from "@/components/add-to-cart-button"
import { Item, ItemVariant } from "@/core/generated/schemas"

interface EnhancedItemInfoProps {
  item: Item
}

export function ItemInfo({ item }: EnhancedItemInfoProps) {
  const [selectedVariant, setSelectedVariant] = useState<ItemVariant>(item.variants?.[0] || ({} as ItemVariant))
  const [selectedSize, setSelectedSize] = useState<string>("4Y")
  const [quantity, setQuantity] = useState(1)

  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore()

  const isWishlisted = isInWishlist(item.id!)
  const price = selectedVariant ? Number.parseFloat(selectedVariant.sales_price || "0") : 0
  const originalPrice = selectedVariant?.wholesale_price ? Number.parseFloat(selectedVariant.wholesale_price) : null

  const getBadges = () => {
    const badges = []

    if (item.is_popular === "true") {
      badges.push({ text: "Popular", variant: "secondary", icon: TrendingUp })
    }

    if (item.is_best_selling === "true") {
      badges.push({ text: `#${item.group_ranking || 1} Bestseller`, variant: "destructive", icon: Star })
    }

    if (item.is_low_stock === "true") {
      badges.push({ text: "Low Stock", variant: "outline", icon: Zap })
    }

    return badges
  }

  const activeOffers = Array.isArray(item.active_offers) ? item.active_offers : []
  const activeCoupons = Array.isArray(item.active_coupons) ? item.active_coupons : []

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeFromWishlist(item.id!)
    } else {
      addToWishlist(item)
    }
  }

  const getDiscountPercentage = () => {
    if (activeOffers.length > 0) {
      const offer = activeOffers[0] as any
      return offer.discount_percentage ? Number.parseFloat(offer.discount_percentage) : null
    }
    return null
  }

  const discountPercentage = getDiscountPercentage()

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          {getBadges().map((badge, index) => (
            <Badge key={index} variant={badge.variant as any} className="flex items-center gap-1 ">
              <badge.icon className="h-3 w-3" />
              {badge.text}
            </Badge>
          ))}
          <span className="text-sm text-muted-foreground">{item.name}</span>
          <Share2 className="h-4 w-4 text-muted-foreground ml-auto cursor-pointer" />
        </div>

        <p className="text-xs text-muted-foreground">CODE: {item.id}</p>
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
        <span className="text-sm text-muted-foreground">
          ({item.review_count || 0} Reviews) • {Number(item.average_rating || 0).toFixed(1)} stars
        </span>
      </div>

      {activeOffers.length > 0 && (
        <div className="rounded-sm w-full p-4 inline-block">
          {activeOffers.map((offer: any, index) => (
            <div key={index} className="text-sm">
              <p className="font-medium">{offer.name}</p>
              {offer.description && <p className="text-xs mt-1">{offer.description}</p>}
              {offer.campaign && <p className="text-xs mt-1 italic">Campaign: {offer.campaign.name}</p>}
            </div>
          ))}
        </div>
      )}

      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">From</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-destructive">${price.toFixed(2)}</span>
            {originalPrice && originalPrice > price && (
              <span className="text-sm text-muted-foreground line-through">${originalPrice.toFixed(2)}</span>
            )}
            {discountPercentage && (
              <Badge variant="destructive" className="text-xs">
                -{discountPercentage}% OFF
              </Badge>
            )}
          </div>
        </div>

        {activeCoupons.length > 0 && (
          <div className="text-xs text-green-600">
            <span>💳 Use coupon: </span>
            {activeCoupons.map((coupon: any, index) => (
              <span key={index} className="font-medium">
                {coupon.code} ({coupon.coupon_type === "percentage" ? `${coupon.value}% off` : `$${coupon.value} off`})
              </span>
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Pay now or in 4 payments of ${(price / 4).toFixed(2)} <span className="underline">Klarna</span>
        </p>
      </div>

      {item.group_ranking && Number(item.group_ranking) <= 10 && (
        <div className="flex items-center gap-2 bg-accent p-2 rounded">
          <div className="bg-orange-500 text-white px-2 py-0.5 rounded text-xs font-medium">
            #{item.group_ranking} Bestseller
          </div>
          <span className="text-xs text-accent-foreground">in {item.item_group_name}</span>
          <div className="flex items-center ml-auto">
            <div className="flex -space-x-1">
              <div className="w-5 h-5 bg-muted rounded-full border border-background"></div>
              <div className="w-5 h-5 bg-muted-foreground/50 rounded-full border border-background"></div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground ml-1" />
          </div>
        </div>
      )}

      {item.current_stock && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Stock:</span>
          <span className={cn("font-medium", item.is_low_stock === "true" ? "text-orange-600" : "text-green-600")}>
            {item.current_stock} units available
            {item.is_low_stock === "true" && " (Low Stock!)"}
          </span>
        </div>
      )}

      {/* Size selection - keeping existing logic */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Size</span>
          <button className="text-xs text-primary underline flex items-center gap-1">
            <Info className="h-3 w-3" />
            Size Guide
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {item.variants?.map((variant, index) => (
            <button
              key={variant.id || index}
              onClick={() => setSelectedVariant(variant)}
              className={cn(
                "p-2 border rounded text-xs text-center transition-colors",
                selectedVariant?.id === variant.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-muted-foreground",
              )}
            >
              {variant.attributes?.size || `Variant ${index + 1}`}
            </button>
          )) ||
            // Fallback to hardcoded sizes if no variants
            ["4Y (98-104 cm)", "5Y (104-110 cm)", "6Y (110-116 cm)", "7Y (116-122 cm)", "8Y (122-128 cm)"].map(
              (size) => (
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
              ),
            )}
        </div>
      </div>

      {/* <div className="space-y-2">
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
      </div> */}

      <div className="space-y-3">
        <AddToCartButton item={item} variant={selectedVariant} className="w-full" />
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
            <span className="text-xs font-bold text-green-600">
              {(item.brand || item.manufacturer || "Store")?.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="text-sm font-medium">
            Sold by {item.brand || item.manufacturer || "Promise Kids Marketplace"}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Ships from {item.brand || item.manufacturer || "Promise Kids Marketplace"}
        </p>
        <button className="text-xs text-primary underline">To report this seller and/or product &gt;</button>
      </div>
    </div>
  )
}

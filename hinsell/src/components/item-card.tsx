"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Heart, Star, Info } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { ItemMedia } from "./item-media"
import { Item, ItemVariant, ItemUnit } from "@/core/generated/schemas"
import { AddToCartButton } from "./AddToCartButton"

interface ItemCardProps {
  item: Item
  variant?: "default" | "compact" | "featured"
  className?: string
  href?: string
  onAddToCart?: (item: Item, variant?: ItemVariant) => void
  onToggleFavorite?: (item: Item) => void
  isFavorited?: boolean
  is_best_selling?: string
}

export function ItemCard({
  item,
  variant = "default",
  href,
  className,
  onAddToCart,
  onToggleFavorite,
  isFavorited = false,
  is_best_selling = "false",
}: ItemCardProps) {
  const [selectedVariant, setSelectedVariant] = useState<ItemVariant | undefined>(item.variants?.[0])
  const [selectedUnit, setSelectedUnit] = useState<ItemUnit | undefined>(
    
  )

  const price = selectedVariant?.sales_price || selectedVariant?.standard_cost
  const originalPrice = selectedVariant?.wholesale_price
  const hasDiscount = originalPrice && price && Number.parseFloat(originalPrice) > Number.parseFloat(price)

  const productUrl = href || `/product/${item.id || item.name?.toLowerCase().replace(/\s+/g, "-")}`

  const handleAddToCart = () => {
    onAddToCart?.(item, selectedVariant)
  }

  const handleToggleFavorite = () => {
    onToggleFavorite?.(item)
  }

  if (variant === "compact") {
    return (
      <Link href={productUrl} className="block">
        <div
          className={cn(
            "relative overflow-hidden max-w-xs",
            "bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-2xl",
            className,
          )}
        >
          <div className="relative aspect-square overflow-hidden rounded-t-2xl">
            <ItemMedia images={item.media} />
          </div>

          <div className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 text-sm leading-tight line-clamp-2">{item.name}</h3>
                {price && (
                  <p className="text-lg font-bold text-gray-900 mt-1">${Number.parseFloat(price).toFixed(0)}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full bg-gray-100 hover:bg-gray-200 flex-shrink-0"
              >
                <Info className="h-4 w-4 text-gray-600" />
              </Button>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <div
      className={cn(
        "group relative overflow-hidden",
        "bg-transparent rounded-3xl",
        variant === "featured" && "ring-1 ring-primary/20",
        className,
      )}
    >
      <Link href={productUrl} className="block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-gradient-to-br from-gray-50 to-gray-100 cursor-pointer">
          <ItemMedia images={item.media} />

          {is_best_selling && (
            <div className="absolute top-6 left-6">
              <Badge className="bg-black text-white text-xs font-semibold px-4 py-2 rounded-full border-0 shadow-xl backdrop-blur-sm">
                Best Seller
              </Badge>
            </div>
          )}

          {hasDiscount && (
            <div className="absolute top-6 right-6">
              <Badge className="bg-red-500 text-white text-xs font-semibold px-4 py-2 rounded-full border-0 shadow-xl backdrop-blur-sm">
                {Math.round(
                  ((Number.parseFloat(originalPrice!) - Number.parseFloat(price!)) /
                    Number.parseFloat(originalPrice!)) *
                    100,
                )}
                % OFF
              </Badge>
            </div>
          )}

          <div className="absolute top-6 right-6 z-10" style={{ marginTop: hasDiscount ? "3rem" : "0" }}>
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full shadow-xl border-0"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleToggleFavorite()
              }}
            >
              <Heart
                className={cn(
                  "h-4 w-4 transition-colors",
                  isFavorited ? "fill-red-500 text-red-500" : "text-gray-600 hover:text-red-500",
                )}
              />
            </Button>
          </div>
        </div>
      </Link>

      <div className="absolute bottom-6 left-6 right-6 bg-white/98 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 transition-all duration-500 hover:bg-white hover:shadow-3xl hover:scale-[1.02]">
        <div className="p-6 space-y-3">
          <div className="space-y-2">
            {item.brand && <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">{item.brand}</p>}

            <Link href={productUrl}>
              <h3 className="font-bold text-gray-900 text-xl leading-tight line-clamp-1 tracking-tight hover:text-gray-700 transition-colors cursor-pointer">
                {item.name}
              </h3>
            </Link>

            {item.description && (
              <p className="text-sm text-gray-600 leading-relaxed line-clamp-1 font-light">{item.description}</p>
            )}
          </div>

          {item.average_rating && Number.parseFloat(item.average_rating) >= 4.0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-semibold text-gray-900">{item.average_rating}</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-baseline gap-2">
              {price && (
                <span className="text-2xl font-bold text-gray-900 tracking-tight">
                  ${Number.parseFloat(price).toFixed(0)}
                </span>
              )}
              {hasDiscount && originalPrice && (
                <span className="text-sm text-gray-400 line-through font-light">
                  ${Number.parseFloat(originalPrice).toFixed(0)}
                </span>
              )}
            </div>

            {selectedVariant && selectedUnit ? (
              <AddToCartButton
                variant={selectedVariant}
                quantity={1}
                className={cn(
                  "gap-2 font-medium tracking-wide bg-gray-900 hover:bg-gray-800 text-white rounded-full px-6 py-2.5 shadow-lg border-0",
                )}
              />
            ) : (
              <Button
                className="gap-2 font-medium tracking-wide bg-gray-200 text-gray-500 rounded-full px-6 py-2.5 cursor-not-allowed border-0"
                disabled
              >
                Cart disabled
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
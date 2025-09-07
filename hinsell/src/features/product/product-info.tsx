"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { Heart, Minus, Plus, Star, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import { ProductOffers } from "./product-offers"
import { ItemUnit, ItemVariant } from "@/core/generated/schemas"
import { useECommerceStore } from "@/core/store"
import { AddToCartButton } from "@/components/AddToCartButton"


interface ProductInfoProps {
  name: string
  price: number
  originalPrice?: number
  rating: number
  reviewCount: number
  description: string
  shortDescription?: string
  colors: ItemVariant[]
  sizes: ItemVariant[]
  units: ItemUnit[]
  inStock: boolean
  freeShipping?: boolean
  specifications?: Record<string, string>
  shippingInfo?: string
  returnPolicy?: string
  offers?: Array<{
    id: string
    type: "discount" | "bestseller" | "membership" | "shipping" | "custom"
    title: string
    description?: string
    icon?: React.ReactNode
    variant?: "default" | "secondary" | "destructive" | "outline"
    className?: string
  }>
}

export function ProductInfo({
  name,
  price,
  originalPrice,
  rating,
  reviewCount,
  description,
  shortDescription,
  colors,
  sizes,
  units = [],
  inStock,
  freeShipping = false,
  specifications = {},
  shippingInfo = "Free shipping on orders over $49",
  returnPolicy = "30-day return policy",
  offers = [],
}: ProductInfoProps) {
  const [selectedColor, setSelectedColor] = useState(colors[0]?.id || "")
  const [selectedSize, setSelectedSize] = useState(sizes[0]?.id || "")
  const [selectedUnit, setSelectedUnit] = useState(units[0]?.id || "")
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)

  const { checkAvailability } = useECommerceStore()

  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0

  const colorVariants = colors.filter((v) => v.attributes?.color)
  const sizeVariants = sizes.filter((v) => v.attributes?.size)

  const selectedVariant = useMemo(() => {
    if (selectedColor && selectedSize) {
      return colors.find((c) => c.id === selectedColor) || sizes.find((s) => s.id === selectedSize)
    }
    return colors.find((c) => c.id === selectedColor) || sizes.find((s) => s.id === selectedSize)
  }, [selectedColor, selectedSize, colors, sizes])

  const selectedUnitObject = units.find((u) => u.id === selectedUnit)

  const isAvailable = selectedVariant ? checkAvailability(selectedVariant.id!, quantity) : false

  return (
    <div className="space-y-6">
      {/* Product Title and Rating */}
      <div className="space-y-3 flex gap-2">
        <h1 className="text-2xl font-bold leading-tight md:text-2xl text-balance">{name}</h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-4 w-4",
                  i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground",
                )}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">({reviewCount.toLocaleString()})</span>
        </div>
      </div>
        {offers.length > 0 && <ProductOffers offers={offers} />}

      {/* Price */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold text-primary">${price.toFixed(2)}</span>
          {originalPrice && (
            <>
              <span className="text-lg text-muted-foreground line-through">${originalPrice.toFixed(2)}</span>
              <Badge variant="destructive" className="text-xs font-bold">
                -{discount}%
              </Badge>
            </>
          )}
        </div>
        {freeShipping && (
          <div className="flex items-center gap-1 text-sm text-green-600 font-medium">
            <Truck className="h-4 w-4" />
            <span>{shippingInfo}</span>
          </div>
        )}
      </div>

      <Separator />

      {/* Color Selection */}
      {colorVariants.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">Color:</span>
            <span className="text-sm text-muted-foreground">
              {colorVariants.find((c) => c.id === selectedColor)?.attributes?.color}
            </span>
          </div>
          <div className="flex gap-2">
            {colorVariants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => setSelectedColor(variant.id || "")}
                className={cn(
                  "h-10 w-10 rounded-md border-2 transition-all duration-200 hover:scale-105",
                  selectedColor === variant.id
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-muted hover:border-muted-foreground",
                )}
                style={{ backgroundColor: variant.attributes?.color || "#000" }}
                title={variant.attributes?.color}
              />
            ))}
          </div>
        </div>
      )}

      {/* Size Selection */}
      {sizeVariants.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">Size:</span>
            <button className="text-sm text-primary hover:underline font-medium">Size Guide</button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {sizeVariants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => setSelectedSize(variant.id || "")}
                className={cn(
                  "border rounded-md py-2 px-3 text-sm font-medium transition-all duration-200 hover:scale-105",
                  selectedSize === variant.id
                    ? "border-primary bg-primary text-primary-foreground shadow-md"
                    : "border-muted hover:border-muted-foreground hover:bg-muted/50",
                )}
              >
                {variant.attributes?.size}
              </button>
            ))}
          </div>
          {!isAvailable && selectedVariant && <p className="text-sm text-destructive font-medium">⚠️ Out of stock</p>}
        </div>
      )}

      {/* Unit Selection */}
      {units.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">Unit:</span>
            <span className="text-sm text-muted-foreground">{selectedUnitObject?.name}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {units.map((unit) => (
              <button
                key={unit.id}
                onClick={() => setSelectedUnit(unit.id || "")}
                className={cn(
                  "border rounded-md py-2 px-3 text-sm font-medium transition-all duration-200 hover:scale-105",
                  selectedUnit === unit.id
                    ? "border-primary bg-primary text-primary-foreground shadow-md"
                    : "border-muted hover:border-muted-foreground hover:bg-muted/50",
                )}
              >
                {unit.name}
                {unit.unit_price && (
                  <div className="text-xs opacity-75">${Number.parseFloat(unit.unit_price).toFixed(2)}</div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
            className="w-16 text-center"
            min={1}
          />
          <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-3">
          {selectedVariant && selectedUnitObject ? (
            <AddToCartButton
              variant={selectedVariant}
              quantity={quantity}
              selectedUnit={selectedUnitObject}
              disabled={!inStock || !isAvailable}
              className="flex-1 font-bold"
            />
          ) : (
            <Button className="flex-1" disabled>
              {!selectedVariant ? "SELECT OPTIONS" : !selectedUnitObject ? "SELECT UNIT" : "OUT OF STOCK"}
            </Button>
          )}
          <Button
            variant={"outline"}
            size={"icon"}
            onClick={() => setIsWishlisted(!isWishlisted)}
            className={cn("shrink-0 transition-colors", isWishlisted && "text-red-500 border-red-500 bg-red-50")}
          >
            <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">Earn up to 10 points calculated at checkout.</p>
      </div>

      <Separator />

      <Accordion type="multiple" className="w-full">
        <AccordionItem value="description">
          <AccordionTrigger className="text-left">Description</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {shortDescription && <p className="text-sm text-muted-foreground leading-relaxed">{shortDescription}</p>}
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {Object.keys(specifications).length > 0 && (
          <AccordionItem value="specifications">
            <AccordionTrigger className="text-left">Specifications</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {Object.entries(specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{key}:</span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        <AccordionItem value="shipping">
          <AccordionTrigger className="text-left">Shipping & Returns</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-green-600" />
                <span className="text-sm">{shippingInfo}</span>
              </div>
              <p className="text-sm text-muted-foreground">{returnPolicy}</p>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>🔒 Shopping Security</p>
                <p>📦 Fast Shipping Available</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import { Heart, Minus, Plus, ShoppingCart, Star, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CTAButton } from "@/components/shared/cta-button"

import { cn } from "@/lib/utils"
import { ItemVariant } from "@/core/generated/schemas"
import { ProductOffers } from "./product-offers"


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
  inStock,
  freeShipping = false,
  specifications = {},
  shippingInfo = "Free shipping on orders over $49",
  returnPolicy = "30-day return policy",
  offers = [],
}: ProductInfoProps) {
  const [selectedColor, setSelectedColor] = useState(colors[0]?.id || "")
  const [selectedSize, setSelectedSize] = useState(sizes[0]?.id || "")
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)

  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Product Title and Rating */}
      <div className="space-y-3">
        <p className="text-2xl font-bold leading-tight md:text-2xl text-balance flex items-center gap-2 flex-wrap">
          {name}
          <div className="flex items-center gap-1">
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
        </p>

        {offers.length > 0 && <ProductOffers offers={offers} />}
      </div>

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
      {colors.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">Color:</span>
            <span className="text-sm text-muted-foreground">{colors.find((c) => c.id === selectedColor)?.color}</span>
          </div>
          <div className="flex gap-2">
            {colors.map((color) => (
              <button
                key={color.id}
                onClick={() => setSelectedColor(color.id || "")}
                className={cn(
                  "h-10 w-10 rounded-md border-2 transition-all duration-200 hover:scale-105",
                  selectedColor === color.id
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-muted hover:border-muted-foreground",
                )}
                style={{ backgroundColor: color.color || "#000" }}
                title={color.color}
              />
            ))}
          </div>
        </div>
      )}

      {/* Size Selection */}
      {sizes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">Size:</span>
            <button className="text-sm text-primary hover:underline font-medium">Size Guide</button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {sizes.map((size) => (
              <button
                key={size.id}
                onClick={() => setSelectedSize(size.id || "")}
                className={cn(
                  "border rounded-md py-2 px-3 text-sm font-medium transition-all duration-200 hover:scale-105",
                  selectedSize === size.id
                    ? "border-primary bg-primary text-primary-foreground shadow-md"
                    : "border-muted hover:border-muted-foreground hover:bg-muted/50",
                )}
              >
                {size.size}
              </button>
            ))}
          </div>
          {!inStock && <p className="text-sm text-destructive font-medium">⚠️ Almost sold out</p>}
        </div>
      )}

      {/* Quantity and Add to Cart */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="font-medium">Quantity:</span>
          <div className="flex items-center border rounded-md">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="h-8 w-8 hover:bg-muted"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setQuantity(quantity + 1)}
              className="h-8 w-8 hover:bg-muted"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="flex gap-3">
          <CTAButton className="flex-1 font-bold" icon={<ShoppingCart className="h-4 w-4" />} disabled={!inStock}>
            {inStock ? "ADD TO CART" : "OUT OF STOCK"}
          </CTAButton>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsWishlisted(!isWishlisted)}
            className={cn("shrink-0 transition-colors", isWishlisted && "text-red-500 border-red-500 bg-red-50")}
          >
            <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">Earn up to 10 SHEIN Points calculated at checkout.</p>
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
                <p>📦 Warehouse1 to Puerto Rico</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

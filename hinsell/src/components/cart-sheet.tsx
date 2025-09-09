"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Plus, Minus, ShoppingBag, Trash2 } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { useCartStore } from "@/core/store"

export function CartSheet() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, getTotalItems, getTotalPrice, clearCart } = useCartStore()

  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})

  const totalItems = getTotalItems()
  const totalPrice = getTotalPrice()
  const shipping = totalPrice > 50 ? 0 : 5.99
  const finalTotal = totalPrice + shipping

  const handleImageError = (itemId: string) => {
    setImageErrors((prev) => ({ ...prev, [itemId]: true }))
  }

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    updateQuantity(itemId, newQuantity)
  }

  return (
    <Sheet open={isOpen} onOpenChange={closeCart}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="relative">
          <ShoppingBag className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-destructive rounded-full">
              {totalItems}
            </span>
          )}
          <span className="">{totalPrice}</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg  p-4">
        <SheetHeader className="space-y-2.5 pr-6">
          <SheetTitle className="text-left flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Shopping Cart
            {totalItems > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {totalItems} {totalItems === 1 ? "item" : "items"}
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription className="text-left">
            {totalItems === 0 ? "Your cart is empty" : `Review your items and checkout when ready`}
          </SheetDescription>
        </SheetHeader>

        {totalItems === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
            <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium text-lg mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-6">Discover our amazing products and add them to your cart</p>
            <Button onClick={closeCart} className="w-full max-w-xs">
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto py-4">
              <div className="space-y-4">
                {items.map((cartItem) => {
                  const primaryImage = cartItem.item.media?.[0] || cartItem.variant.media?.[0]
                  const price = Number.parseFloat(cartItem.variant.sales_price || "0")
                  const itemTotal = price * cartItem.quantity

                  return (
                    <div key={cartItem.id} className="flex gap-3 p-3 bg-card rounded-lg">
                      {/* Product Image */}
                      <div className="relative w-16 h-16 bg-muted rounded-md overflow-hidden flex-shrink-0">
                        {primaryImage && !imageErrors[cartItem.id] ? (
                          <Image
                            src={primaryImage.file || "/placeholder.svg?height=64&width=64"}
                            alt={primaryImage.alt_text || cartItem.item.name}
                            fill
                            className="object-cover"
                            onError={() => handleImageError(cartItem.id)}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-xs text-muted-foreground">N/A</div>
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/product/${cartItem.item.id || cartItem.item.slug}`}
                          onClick={closeCart}
                          className="block"
                        >
                          <h4 className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors">
                            {cartItem.item.name}
                          </h4>
                        </Link>

                        {/* Variant Details */}
                        <div className="flex gap-2 mt-1">
                          {cartItem.selectedSize && (
                            <Badge variant="outline" className="text-xs">
                              Size: {cartItem.selectedSize}
                            </Badge>
                          )}
                          {cartItem.selectedColor && (
                            <Badge variant="outline" className="text-xs">
                              {cartItem.selectedColor}
                            </Badge>
                          )}
                        </div>

                        {/* Price and Quantity */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6 bg-transparent"
                              onClick={() => handleQuantityChange(cartItem.id, cartItem.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-medium min-w-[2ch] text-center">{cartItem.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6 bg-transparent"
                              onClick={() => handleQuantityChange(cartItem.id, cartItem.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">${itemTotal.toFixed(2)}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-destructive"
                              onClick={() => removeItem(cartItem.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Cart Summary */}
            <div className="border-t pt-4 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span className={cn(shipping === 0 && "text-green-600")}>
                    {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                {shipping > 0 && <p className="text-xs text-muted-foreground">Free shipping on orders over $50</p>}
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button className="w-full" size="lg">
                  Checkout
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 bg-transparent" onClick={closeCart}>
                    Continue Shopping
                  </Button>
                  <Button
                    variant="ghost"
                    className="flex-1 text-destructive hover:text-destructive"
                    onClick={clearCart}
                  >
                    Clear Cart
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

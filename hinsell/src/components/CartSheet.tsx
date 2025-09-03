// components/CartSheet.tsx
import * as React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Minus, Plus, ShoppingCart } from 'lucide-react';
import { useECommerceStore } from '@/core/store';

import Image from 'next/image'; 
import { Badge } from './ui/badge';
const CartSheet: React.FC = () => {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    calculateTotal,
    clearCart,
    currentCurrency,
  } = useECommerceStore();

  const subtotal = calculateTotal();
  const currencySymbol = currentCurrency?.symbol || '$';

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="relative gap-2">
          <ShoppingCart className="h-4 w-4" />
          <span className="hidden lg:inline">{subtotal || 0}</span>
          {cartItems.length > 0 && (
            <Badge variant={"outline"} className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs">
               {cartItems.length}
            </Badge>
           )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Your Cart</SheetTitle>
        </SheetHeader>
        <div className="mt-4 flex flex-col h-full">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mb-4" />
              <p>Your cart is empty.</p>
              <p className="text-sm">Add items to get started!</p>
            </div>
          ) : (
            <>
              <ul className="flex-1 overflow-y-auto space-y-4">
                {cartItems.map((item) => (
                  <li key={item.id} className="flex items-start gap-4 border-b pb-4">
                    {item.extra_attributes?.imageUrl ? ( // Assuming media URL in extra_attributes; adjust to your MediaSchema
                      <Image
                        src={item.extra_attributes.imageUrl}
                        alt={item.code || 'Item image'}
                        width={80}
                        height={80}
                        className="rounded-md object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-muted rounded-md flex items-center justify-center">
                        <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium">{item.code} - {item.size || ''} {item.color || ''}</h3>
                      <p className="text-sm text-muted-foreground">
                        {currencySymbol}{item.sales_price} per {item.selectedUnit.name}
                      </p>
                      <div className="flex items-center mt-2 gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id!, Math.max(1, item.quantity - 1))}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id!, parseInt(e.target.value, 10) || 1)}
                          className="w-16 text-center"
                          min={1}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id!, item.quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromCart(item.id!)}
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-5 w-5 text-destructive" />
                    </Button>
                  </li>
                ))}
              </ul>
              <div className="mt-4 border-t pt-4">
                <div className="flex justify-between text-lg font-medium">
                  <span>Subtotal</span>
                  <span>{currencySymbol}{subtotal}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Shipping and taxes calculated at checkout.</p>
                <div className="mt-4 space-y-2">
                  <Button className="w-full" onClick={() => {/* Route to checkout page */}}>
                    Proceed to Checkout
                  </Button>
                  <Button variant="outline" className="w-full" onClick={clearCart}>
                    Clear Cart
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;
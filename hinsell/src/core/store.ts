import { create } from "zustand"
import { persist } from "zustand/middleware"
import { Item, ItemVariant } from "./generated/schemas"


export interface CartItem {
  id: string
  item: Item
  variant: ItemVariant
  quantity: number
  selectedSize?: string
  selectedColor?: string
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  addItem: (item: Item, variant: ItemVariant, options?: { size?: string; color?: string }) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

interface WishlistStore {
  items: Item[]
  addItem: (item: Item) => void
  removeItem: (id: string) => void
  isInWishlist: (id: string) => boolean
  clearWishlist: () => void
}

interface AppStore extends CartStore, WishlistStore {}

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Cart state
      items: [],
      isOpen: false,

      // Cart actions
      addItem: (item, variant, options = {}) => {
        const cartItemId = `${item.id}-${variant.id}-${options.size || ""}-${options.color || ""}`
        const existingItem = get().items.find((cartItem) => cartItem.id === cartItemId)

        if (existingItem) {
          set((state) => ({
            items: state.items.map((cartItem) =>
              cartItem.id === cartItemId ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem,
            ),
          }))
        } else {
          const newCartItem: CartItem = {
            id: cartItemId,
            item,
            variant,
            quantity: 1,
            selectedSize: options.size,
            selectedColor: options.color,
          }
          set((state) => ({ items: [...state.items, newCartItem] }))
        }

        // Auto-open cart when item is added
        set({ isOpen: true })
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }))
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
          return
        }

        set((state) => ({
          items: state.items.map((item) => (item.id === id ? { ...item, quantity } : item)),
        }))
      },

      clearCart: () => set({ items: [] }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      getTotalPrice: () => {
        return get().items.reduce((total, cartItem) => {
          const price = Number.parseFloat(cartItem.variant.sales_price || "0")
          return total + price * cartItem.quantity
        }, 0)
      },

      // Wishlist state (extending the same store)
      items: [], // This will be overridden by wishlist items

      // Wishlist actions
      addItem: (item) => {
        const isAlreadyInWishlist = get().isInWishlist(item.id!)
        if (!isAlreadyInWishlist) {
          set((state) => ({ items: [...((state as any).wishlistItems || []), item] }))
        }
      },

      removeItem: (id) => {
        set((state) => ({
          items: ((state as any).wishlistItems || []).filter((item: Item) => item.id !== id),
        }))
      },

      isInWishlist: (id) => {
        return ((get() as any).wishlistItems || []).some((item: Item) => item.id === id)
      },

      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: "shein-store",
      partialize: (state) => ({
        items: state.items,
        wishlistItems: (state as any).wishlistItems || [],
      }),
    },
  ),
)

// Separate stores for better organization
export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item, variant, options = {}) => {
        const cartItemId = `${item.id}-${variant.id}-${options.size || ""}-${options.color || ""}`
        const existingItem = get().items.find((cartItem) => cartItem.id === cartItemId)

        if (existingItem) {
          set((state) => ({
            items: state.items.map((cartItem) =>
              cartItem.id === cartItemId ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem,
            ),
          }))
        } else {
          const newCartItem: CartItem = {
            id: cartItemId,
            item,
            variant,
            quantity: 1,
            selectedSize: options.size,
            selectedColor: options.color,
          }
          set((state) => ({ items: [...state.items, newCartItem] }))
        }

        set({ isOpen: true })
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }))
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
          return
        }

        set((state) => ({
          items: state.items.map((item) => (item.id === id ? { ...item, quantity } : item)),
        }))
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      getTotalPrice: () => {
        return get().items.reduce((total, cartItem) => {
          const price = Number.parseFloat(cartItem.variant.sales_price || "0")
          return total + price * cartItem.quantity
        }, 0)
      },
    }),
    {
      name: "cart-storage",
    },
  ),
)

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const isAlreadyInWishlist = get().isInWishlist(item.id!)
        if (!isAlreadyInWishlist) {
          set((state) => ({ items: [...state.items, item] }))
        }
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }))
      },

      isInWishlist: (id) => {
        return get().items.some((item) => item.id === id)
      },

      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: "wishlist-storage",
    },
  ),
)

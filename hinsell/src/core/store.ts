import { create } from "zustand"
import { persist, devtools, createJSONStorage } from "zustand/middleware"
import type {
  Currency,
  Item,
  ItemVariant,
  InventoryBalance,
  StoreGroup,
  ItemGroup,
  ItemUnit,
} from "@/core/generated/schemas"

// Define interfaces for each slice
interface CurrencyState {
  currencies: Currency[]
  defaultCurrency: Currency | null
  currentCurrency: Currency | null
  setCurrencies: (currencies: Currency[]) => void
  setDefaultCurrency: (currency: Currency) => void
  setCurrentCurrency: (currency: Currency) => void
  convertAmount: (amount: string, fromCode: string, toCode: string) => string // Simple conversion logic
}

interface ItemState {
  items: Item[]
  itemGroups: ItemGroup[]
  storeGroups: StoreGroup[]
  fetchItems: () => Promise<void> // Example async action to fetch from API
  addItem: (item: Item) => void
  updateItem: (id: string, updates: Partial<Item>) => void
  removeItem: (id: string) => void
  getItemById: (id: string) => Item | undefined
  // Similar for groups...
}

interface InventoryState {
  balances: InventoryBalance[]
  updateBalance: (variantId: string, updates: Partial<InventoryBalance>) => void
  checkAvailability: (variantId: string, quantity: number) => boolean
  reserveQuantity: (variantId: string, quantity: number) => void // Optimistic update
  releaseQuantity: (variantId: string, quantity: number) => void
}

interface CartItem extends ItemVariant {
  quantity: number
  selectedUnit: ItemUnit
  totalPrice: string // Computed
}

interface CartState {
  cartItems: CartItem[]
  addToCart: (variant: ItemVariant, quantity: number, unit: ItemUnit) => void
  removeFromCart: (variantId: string) => void
  updateQuantity: (variantId: string, quantity: number) => void
  calculateTotal: () => string // Integrates with currency
  clearCart: () => void
}

// Combined store type
type ECommerceStore = CurrencyState & ItemState & InventoryState & CartState

// Helper function for currency conversion (simplified; in real app, use a library like Big.js for precision)
const convert = (amount: string, rateFrom: string, rateTo: string): string => {
  const numAmount = Number.parseFloat(amount)
  const numFrom = Number.parseFloat(rateFrom)
  const numTo = Number.parseFloat(rateTo)
  return (numAmount * (numTo / numFrom)).toFixed(2)
}

// Create the store with middleware
export const useECommerceStore = create<ECommerceStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Currency Slice
        currencies: [],
        defaultCurrency: null,
        currentCurrency: null,
        setCurrencies: (currencies) => set({ currencies }),
        setDefaultCurrency: (currency) => set({ defaultCurrency: currency }),
        setCurrentCurrency: (currency) => set({ currentCurrency: currency }),
        convertAmount: (amount, fromCode, toCode) => {
          const from = get().currencies.find((c) => c.code === fromCode)
          const to = get().currencies.find((c) => c.code === toCode)
          if (!from || !to || !from.exchange_rate || !to.exchange_rate) return amount
          return convert(amount, from.exchange_rate, to.exchange_rate)
        },

        // Item Slice
        items: [],
        itemGroups: [],
        storeGroups: [],
        fetchItems: async () => {
          try {
            // Placeholder for API call; in real app, use fetch or axios
            const response = await fetch("/api/items")
            const data: Item[] = await response.json()
            set({ items: data })
          } catch (error) {
            console.error("Failed to fetch items:", error)
            // Optional: Set error state
          }
        },
        addItem: (item) => set((state) => ({ items: [...state.items, item] })),
        updateItem: (id, updates) =>
          set((state) => ({
            items: state.items.map((i) => (i.id === id ? { ...i, ...updates } : i)),
          })),
        removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
        getItemById: (id) => get().items.find((i) => i.id === id),

        // Inventory Slice
        balances: [],
        updateBalance: (variantId, updates) =>
          set((state) => ({
            balances: state.balances.map((b) => (b.variant === variantId ? { ...b, ...updates } : b)),
          })),
        checkAvailability: (variantId, quantity) => {
          const balance = get().balances.find((b) => b.variant === variantId)
          if (!balance || !balance.available_quantity) return false
          return Number.parseFloat(balance.available_quantity) >= quantity
        },
        reserveQuantity: (variantId, quantity) => {
          set((state) => ({
            balances: state.balances.map((b) =>
              b.variant === variantId
                ? {
                    ...b,
                    available_quantity: (Number.parseFloat(b.available_quantity || "0") - quantity).toString(),
                    reserved_quantity: (Number.parseFloat(b.reserved_quantity || "0") + quantity).toString(),
                  }
                : b,
            ),
          }))
        },
        releaseQuantity: (variantId, quantity) => {
          set((state) => ({
            balances: state.balances.map((b) =>
              b.variant === variantId
                ? {
                    ...b,
                    available_quantity: (Number.parseFloat(b.available_quantity || "0") + quantity).toString(),
                    reserved_quantity: (Number.parseFloat(b.reserved_quantity || "0") - quantity).toString(),
                  }
                : b,
            ),
          }))
        },

        // Cart Slice
        cartItems: [],
        addToCart: (variant, quantity, unit) => {
          const { checkAvailability, reserveQuantity, currentCurrency } = get()
          if (!checkAvailability(variant.id!, quantity)) {
            console.warn("Insufficient stock")
            return
          }
          reserveQuantity(variant.id!, quantity)
          const price = variant.sales_price || "0"
          const totalPrice = (Number.parseFloat(price) * quantity).toString()
          const newItem: CartItem = { ...variant, quantity, selectedUnit: unit, totalPrice }
          set((state) => ({ cartItems: [...state.cartItems, newItem] }))
        },
        removeFromCart: (variantId) => {
          const item = get().cartItems.find((i) => i.id === variantId)
          if (item) {
            get().releaseQuantity(variantId, item.quantity)
          }
          set((state) => ({ cartItems: state.cartItems.filter((i) => i.id !== variantId) }))
        },
        updateQuantity: (variantId, newQuantity) => {
          const item = get().cartItems.find((i) => i.id === variantId)
          if (!item) return
          const diff = newQuantity - item.quantity
          if (diff > 0 && !get().checkAvailability(variantId, diff)) {
            console.warn("Insufficient stock")
            return
          }
          if (diff > 0) get().reserveQuantity(variantId, diff)
          else if (diff < 0) get().releaseQuantity(variantId, Math.abs(diff))
          const price = item.sales_price || "0"
          const totalPrice = (Number.parseFloat(price) * newQuantity).toString()
          set((state) => ({
            cartItems: state.cartItems.map((i) =>
              i.id === variantId ? { ...i, quantity: newQuantity, totalPrice } : i,
            ),
          }))
        },
        calculateTotal: () => {
          const { cartItems, currentCurrency, convertAmount } = get()
          return cartItems.reduce((sum, item) => sum + Number.parseFloat(item.totalPrice), 0).toString() // Add conversion if needed: convertAmount(total, 'base', currentCurrency?.code || '');
        },
        clearCart: () => {
          get().cartItems.forEach((item) => get().releaseQuantity(item.id!, item.quantity))
          set({ cartItems: [] })
        },
      }),
      {
        name: "ecommerce-storage", // Persist to localStorage (or AsyncStorage in React Native)
        storage: createJSONStorage(() => localStorage), // Customize for React Native if needed
        partialize: (state) => ({ cartItems: state.cartItems, currentCurrency: state.currentCurrency }), // Only persist cart and currency
      },
    ),
  ),
)

// Usage example in components:
// const { addToCart, cartItems } = useECommerceStore();
// Or select specific: const addToCart = useECommerceStore((state) => state.addToCart);

// For React Native: Replace localStorage with AsyncStorage from @react-native-async-storage/async-storage
// import AsyncStorage from '@react-native-async-storage/async-storage';
// storage: createJSONStorage(() => AsyncStorage)

// This setup is flexible: Easily add more slices/actions.
// Robust: Type-safe, error-handled async, optimistic updates for inventory, persistence for offline support.
// Integrate with TanStack Query for data fetching in fetchItems, etc., to sync with backend.

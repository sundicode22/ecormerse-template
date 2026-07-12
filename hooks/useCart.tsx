"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { notify } from "@/lib/toast"

export interface CartItem {
  id: number
  name: string
  price: number
  image: string
  quantity: number
  selectedSize?: string
  selectedColor?: string
  selectedVariations?: Record<string, string>
  selectedModifiers?: string[]
}

interface CartState {
  cart: CartItem[]
  addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => void
  removeFromCart: (item: CartItem) => void
  updateQuantity: (item: CartItem, quantity: number) => void
  clearCart: () => void
}

function normalizeVariations(item: {
  selectedSize?: string
  selectedColor?: string
  selectedVariations?: Record<string, string>
}) {
  const variations = { ...(item.selectedVariations || {}) }
  if (item.selectedSize && !variations.Size) variations.Size = item.selectedSize
  if (item.selectedColor && !variations.Color) variations.Color = item.selectedColor
  return variations
}

function itemKey(item: {
  id: number
  selectedSize?: string
  selectedColor?: string
  selectedVariations?: Record<string, string>
  selectedModifiers?: string[]
}) {
  const variations = normalizeVariations(item)
  const variationPart = Object.keys(variations)
    .sort()
    .map((key) => `${key}=${variations[key]}`)
    .join("|")
  const modifiersPart = [...(item.selectedModifiers || [])].sort().join("|")
  return `${item.id}::${variationPart}::${modifiersPart}`
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],

      addToCart: (newItem, quantity = 1) => {
        const cart = get().cart
        const normalized: Omit<CartItem, "quantity"> = {
          ...newItem,
          selectedVariations: normalizeVariations(newItem),
          selectedModifiers: [...(newItem.selectedModifiers || [])].sort(),
          selectedSize:
            newItem.selectedSize ||
            newItem.selectedVariations?.Size ||
            newItem.selectedVariations?.size,
          selectedColor:
            newItem.selectedColor ||
            newItem.selectedVariations?.Color ||
            newItem.selectedVariations?.color ||
            newItem.selectedVariations?.Colour,
        }
        const key = itemKey(normalized)
        const existingIndex = cart.findIndex((item) => itemKey(item) === key)

        if (existingIndex > -1) {
          const next = [...cart]
          next[existingIndex] = {
            ...next[existingIndex],
            quantity: next[existingIndex].quantity + quantity,
          }
          set({ cart: next })
          notify.success("Updated bag", `${normalized.name} quantity updated`)
          return
        }

        set({ cart: [...cart, { ...normalized, quantity }] })
        notify.success("Added to bag", normalized.name)
      },

      removeFromCart: (target) => {
        const key = itemKey(target)
        set({
          cart: get().cart.filter((item) => itemKey(item) !== key),
        })
      },

      updateQuantity: (target, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(target)
          return
        }

        const key = itemKey(target)
        set({
          cart: get().cart.map((item) =>
            itemKey(item) === key ? { ...item, quantity } : item
          ),
        })
      },

      clearCart: () => set({ cart: [] }),
    }),
    {
      name: "cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ cart: state.cart }),
    }
  )
)

/** App-facing cart hook — same API as before, backed by Zustand + localStorage. */
export function useCart() {
  const cart = useCartStore((s) => s.cart)
  const addToCart = useCartStore((s) => s.addToCart)
  const removeFromCart = useCartStore((s) => s.removeFromCart)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const clearCart = useCartStore((s) => s.clearCart)

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  )
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0)

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    cartCount,
  }
}

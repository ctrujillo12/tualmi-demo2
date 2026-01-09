import { create } from 'zustand';
import { CartStore, Product, CartItem } from '@/types';

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addItem: (product: Product, size: string, color: string) => {
    const items = get().items;
    const existingItemIndex = items.findIndex(
      item => item.id === product.id && item.selectedSize === size && item.selectedColor === color
    );

    if (existingItemIndex > -1) {
      const newItems = [...items];
      newItems[existingItemIndex].quantity += 1;
      set({ items: newItems });
    } else {
      const newItem: CartItem = {
        ...product,
        quantity: 1,
        selectedSize: size,
        selectedColor: color,
      };
      set({ items: [...items, newItem] });
    }
  },

  removeItem: (id: string, size: string, color: string) => {
    set({
      items: get().items.filter(
        item => !(item.id === id && item.selectedSize === size && item.selectedColor === color)
      ),
    });
  },

  updateQuantity: (id: string, size: string, color: string, quantity: number) => {
    const items = get().items;
    const itemIndex = items.findIndex(
      item => item.id === id && item.selectedSize === size && item.selectedColor === color
    );

    if (itemIndex > -1) {
      const newItems = [...items];
      if (quantity <= 0) {
        get().removeItem(id, size, color);
      } else {
        newItems[itemIndex].quantity = quantity;
        set({ items: newItems });
      }
    }
  },

  clearCart: () => {
    set({ items: [] });
  },

  getTotal: () => {
    return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
  },

  getItemCount: () => {
    return get().items.reduce((count, item) => count + item.quantity, 0);
  },
}));
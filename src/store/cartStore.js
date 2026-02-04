import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const parsePrice = (price) => {
  if (typeof price === 'number') return price;
  const numericValue = parseFloat(String(price).replace(/[^0-9.]/g, ''));
  return isNaN(numericValue) ? 0 : numericValue;
};

export const useCartStore = create(
  persist(
    (set, get) => ({

      cartItems: [],
      userId: null,
      loading: true,

      saveCart: async (items) => {
        try {
          const { userId } = get();
          if (userId) {
            const cartRef = doc(db, 'carts', userId);
            await updateDoc(cartRef, { items });
          } else {
            localStorage.setItem('cart', JSON.stringify(items));
          }
        } catch (error) {
          console.error('Error saving cart:', error);
        }
      },

      getCart: async (userId) => {
        const cartRef = doc(db, 'carts', userId);
        const cartSnap = await getDoc(cartRef);
        return cartSnap.exists() 
          ? (cartSnap.data().items || []).map(item => ({
              ...item,
              price: parsePrice(item.price || item.Price)
            })) 
          : [];
      },

      mergeCarts: async (userId, localItems) => {
        const serverItems = await get().getCart(userId);
        const mergedItems = [...serverItems];
        
        localItems.forEach(localItem => {
          const existingIndex = mergedItems.findIndex(
            item => item.id === localItem.id || 
            (item.Name === localItem.Name && item['Brand Name'] === localItem['Brand Name'])
          );
          
          if (existingIndex >= 0) {
            mergedItems[existingIndex].quantity += localItem.quantity;
          } else {
            mergedItems.push({
              ...localItem,
              price: parsePrice(localItem.price || localItem.Price)
            });
          }
        });
        
        await get().saveCart(mergedItems);
        return mergedItems;
      },

      initializeCart: () => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          try {
            if (user) {
              set({ userId: user.uid, loading: true });
              const serverCart = await get().getCart(user.uid);
              const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
              
              if (localCart.length > 0) {
                const mergedCart = await get().mergeCarts(user.uid, localCart);
                set({ cartItems: mergedCart });
                localStorage.removeItem('cart');
              } else {
                set({ cartItems: serverCart });
              }
            } else {
              set({ userId: null });
              const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
              set({ cartItems: localCart });
            }
          } catch (error) {
            console.error('Auth state error:', error);
          } finally {
            set({ loading: false });
          }
        });
        
        return unsubscribe;
      },

      addToCart: (product) => {
        set((state) => {
          const productId = product.id || `${product.Name}-${product['Brand Name']}`;
          const normalizedProduct = {
            ...product,
            id: productId,
            price: parsePrice(product.price || product.Price),
            quantity: 1
          };

          const existingItem = state.cartItems.find(item => item.id === productId);
          const newItems = existingItem
            ? state.cartItems.map(item =>
                item.id === productId
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              )
            : [...state.cartItems, normalizedProduct];

          get().saveCart(newItems);

          return { cartItems: newItems };
        });
      },

      removeFromCart: (productId) => {
        set((state) => {
          const newItems = state.cartItems.filter(item => item.id !== productId);
          
          get().saveCart(newItems);

          return { cartItems: newItems };
        });
      },

      updateQuantity: (productId, newQuantity) => {
        set((state) => {
          let newItems;
          if (newQuantity < 1) {
            newItems = state.cartItems.filter(item => item.id !== productId);
          } else {
            newItems = state.cartItems.map(item =>
              item.id === productId ? { ...item, quantity: newQuantity } : item
            );
          }

          get().saveCart(newItems);

          return { cartItems: newItems };
        });
      },

      clearCart: () => {
        const { userId } = get();
        const newItems = [];
        set({ cartItems: newItems });
        
        if (userId) {
          const cartRef = doc(db, 'carts', userId);
          updateDoc(cartRef, { items: newItems }).catch(console.error);
        } else {
          localStorage.removeItem('cart');
        }
      },

      get cartTotal() {
        const { cartItems } = get();
        return cartItems.reduce(
          (total, item) => total + (item.price * item.quantity),
          0
        );
      },

      get cartCount() {
        const { cartItems } = get();
        return cartItems.reduce(
          (count, item) => count + item.quantity,
          0
        );
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),

      partialize: (state) => ({
        cartItems: state.cartItems,
        userId: state.userId,
      }),
      skipHydration: false,
    }
  )
);
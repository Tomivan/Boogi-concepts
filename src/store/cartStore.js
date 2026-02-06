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

// Cache configuration
const CART_CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache validity

export const useCartStore = create(
  persist(
    (set, get) => ({
      // State
      cartItems: [],
      userId: null,
      loading: true,
      
      // Cache state
      cache: {
        lastLoaded: null,
        itemsSnapshot: [],
        isValid: false,
        isLoading: false,
        error: null,
      },

      // Check if cache is valid
      isCacheValid: () => {
        const { cache } = get();
        if (!cache.lastLoaded || cache.error) return false;
        
        const cacheAge = Date.now() - new Date(cache.lastLoaded).getTime();
        return cacheAge < CART_CACHE_TTL && cache.isValid;
      },

      // Get cached data if available and valid
      getCachedCart: () => {
        if (get().isCacheValid()) {
          return get().cache.itemsSnapshot;
        }
        return null;
      },

      // Cache the current cart state
      cacheCartState: () => {
        const { cartItems } = get();
        set(state => ({
          cache: {
            ...state.cache,
            lastLoaded: new Date().toISOString(),
            itemsSnapshot: [...cartItems],
            isValid: true,
            error: null,
          }
        }));
      },

      // Invalidate cache (call when cart changes from external source)
      invalidateCache: () => {
        set(state => ({
          cache: {
            ...state.cache,
            isValid: false,
          }
        }));
      },

      // Enhanced save function with cache update
      saveCart: async (items) => {
        try {
          const { userId } = get();
          if (userId) {
            const cartRef = doc(db, 'carts', userId);
            await updateDoc(cartRef, { items });
          } else {
            localStorage.setItem('cart', JSON.stringify(items));
          }
          
          // Update cache after successful save
          get().cacheCartState();
        } catch (error) {
          console.error('Error saving cart:', error);
          // Invalidate cache on error
          set(state => ({
            cache: {
              ...state.cache,
              error: error.message,
              isValid: false,
            }
          }));
        }
      },

      // Enhanced getCart with cache support
      getCart: async (userId, forceRefresh = false) => {
        // Return cached data if valid and not forcing refresh
        if (!forceRefresh) {
          const cached = get().getCachedCart();
          if (cached) {
            return cached;
          }
        }

        // Set loading state
        set(state => ({ 
          cache: { ...state.cache, isLoading: true } 
        }));

        try {
          const cartRef = doc(db, 'carts', userId);
          const cartSnap = await getDoc(cartRef);
          const items = cartSnap.exists() 
            ? (cartSnap.data().items || []).map(item => ({
                ...item,
                price: parsePrice(item.price || item.Price),
                quantity: Number(item.quantity) || 1 // Ensure quantity is number
              })) 
            : [];

          // Update cache
          set(state => ({
            cache: {
              lastLoaded: new Date().toISOString(),
              itemsSnapshot: items,
              isValid: true,
              isLoading: false,
              error: null,
            }
          }));

          return items;
        } catch (error) {
          console.error('Error fetching cart:', error);
          set(state => ({
            cache: {
              ...state.cache,
              isLoading: false,
              error: error.message,
              isValid: false,
            }
          }));
          throw error;
        }
      },

      // Merge carts with cache support
      mergeCarts: async (userId, localItems) => {
        const serverItems = await get().getCart(userId, true); // Force refresh
        const mergedItems = [...serverItems];
        
        localItems.forEach(localItem => {
          const existingIndex = mergedItems.findIndex(
            item => item.id === localItem.id || 
            (item.Name === localItem.Name && item['Brand Name'] === localItem['Brand Name'])
          );
          
          if (existingIndex >= 0) {
            mergedItems[existingIndex].quantity = 
              Number(mergedItems[existingIndex].quantity || 0) + 
              Number(localItem.quantity || 0);
          } else {
            mergedItems.push({
              ...localItem,
              price: parsePrice(localItem.price || localItem.Price),
              quantity: Number(localItem.quantity) || 1
            });
          }
        });
        
        await get().saveCart(mergedItems);
        return mergedItems;
      },

      // Initialize cart with cache optimization
      initializeCart: () => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          try {
            if (user) {
              set({ userId: user.uid, loading: true });
              
              // Try to use cache first for instant UI update
              const cachedItems = get().getCachedCart();
              if (cachedItems) {
                set({ cartItems: cachedItems });
              }
              
              // Then fetch fresh data in background
              const serverCart = await get().getCart(user.uid);
              const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
              
              if (localCart.length > 0) {
                const mergedCart = await get().mergeCarts(user.uid, localCart);
                set({ cartItems: mergedCart });
                localStorage.removeItem('cart');
              } else if (!cachedItems || cachedItems.length !== serverCart.length) {
                // Only update if different from cache
                set({ cartItems: serverCart });
              }
            } else {
              set({ userId: null });
              const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
              // Ensure quantities are numbers
              const parsedCart = localCart.map(item => ({
                ...item,
                quantity: Number(item.quantity) || 1
              }));
              set({ cartItems: parsedCart });
              // Cache the local cart
              get().cacheCartState();
            }
          } catch (error) {
            console.error('Auth state error:', error);
          } finally {
            set({ loading: false });
          }
        });
        
        return unsubscribe;
      },

      // Enhanced cart operations with cache updates
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
                  ? { ...item, quantity: Number(item.quantity) + 1 }
                  : item
              )
            : [...state.cartItems, normalizedProduct];

          // Save and update cache
          get().saveCart(newItems);

          return { cartItems: newItems };
        });
      },

      removeFromCart: (productId) => {
        set((state) => {
          const newItems = state.cartItems.filter(item => item.id !== productId);
          
          // Save and update cache
          get().saveCart(newItems);

          return { cartItems: newItems };
        });
      },

      updateQuantity: (productId, newQuantity) => {
        set((state) => {
          const quantity = Number(newQuantity);
          let newItems;
          
          if (quantity < 1) {
            newItems = state.cartItems.filter(item => item.id !== productId);
          } else {
            newItems = state.cartItems.map(item =>
              item.id === productId ? { ...item, quantity: quantity } : item
            );
          }

          // Save and update cache
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
          updateDoc(cartRef, { items: newItems })
            .then(() => get().cacheCartState())
            .catch(console.error);
        } else {
          localStorage.removeItem('cart');
          get().cacheCartState();
        }
      },

      // Refresh cart data (force update from server)
      refreshCart: async () => {
        const { userId } = get();
        if (!userId) return;
        
        try {
          set({ loading: true });
          const freshCart = await get().getCart(userId, true); // Force refresh
          set({ cartItems: freshCart });
        } catch (error) {
          console.error('Error refreshing cart:', error);
        } finally {
          set({ loading: false });
        }
      },

      // Derived values (computed properties) - optimized
      get cartTotal() {
        const { cartItems } = get();
        if (!cartItems || !Array.isArray(cartItems)) return 0;
        
        return cartItems.reduce(
          (total, item) => total + (Number(item.price) * Number(item.quantity)),
          0
        );
      },

      get cartCount() {
        const { cartItems } = get();
        if (!cartItems || !Array.isArray(cartItems)) return 0;
        
        return cartItems.reduce(
          (count, item) => count + Number(item.quantity),
          0
        );
      },

      // Get cache status for debugging/UI
      get cacheStatus() {
        const { cache } = get();
        return {
          isCached: get().isCacheValid(),
          lastUpdated: cache.lastLoaded,
          itemCount: cache.itemsSnapshot.length,
          isValid: cache.isValid,
          isLoading: cache.isLoading,
          hasError: !!cache.error,
        };
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        cartItems: state.cartItems,
        userId: state.userId,
        cache: state.cache, // Persist cache too
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Ensure proper data types after rehydration
          state.cartItems = (state.cartItems || []).map(item => ({
            ...item,
            quantity: Number(item.quantity) || 1,
            price: parsePrice(item.price)
          }));
          
          // Validate cache after rehydration
          if (state.cache && state.cache.lastLoaded) {
            const cacheAge = Date.now() - new Date(state.cache.lastLoaded).getTime();
            state.cache.isValid = cacheAge < CART_CACHE_TTL && !state.cache.error;
          }
        }
      },
    }
  )
);

// Utility function for debouncing (optional, can be used in components)
export const createDebouncedCartUpdate = (storeMethod, delay = 300) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      storeMethod(...args);
    }, delay);
  };
};
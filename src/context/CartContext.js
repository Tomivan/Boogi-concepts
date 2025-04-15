import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  doc, 
  onSnapshot, 
  updateDoc, 
  arrayRemove 
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { getCart, syncCart, mergeCarts, clearFirebaseCart } from '../firebase/cartService';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Handle auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          setUserId(user.uid);
          // Load user's cart from Firestore
          const serverCart = await getCart(user.uid);
          const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
          
          if (localCart.length > 0) {
            // Merge local cart with server cart
            await mergeCarts(user.uid, localCart);
            const mergedCart = await getCart(user.uid);
            setCartItems(mergedCart);
            localStorage.removeItem('cart');
          } else {
            setCartItems(serverCart);
          }
        } else {
          setUserId(null);
          // Fall back to localStorage when logged out
          const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
          setCartItems(localCart);
        }
      } catch (error) {
        console.error('Error handling auth state change:', error);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync cart changes to appropriate storage
  useEffect(() => {
    if (!cartItems.length || loading) return;

    const syncData = async () => {
      try {
        if (userId) {
          await syncCart(userId, cartItems);
        } else {
          localStorage.setItem('cart', JSON.stringify(cartItems));
        }
      } catch (error) {
        console.error('Error syncing cart:', error);
      }
    };

    const debounceTimer = setTimeout(() => {
      syncData();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [cartItems, userId, loading]);

  // Real-time cart updates for logged-in users
  useEffect(() => {
    if (!userId || loading) return;

    const cartRef = doc(db, 'carts', userId);
    const unsubscribe = onSnapshot(cartRef, (doc) => {
      if (doc.exists()) {
        setCartItems(doc.data().items || []);
      }
    });

    return () => unsubscribe();
  }, [userId, loading]);

  const addToCart = async (product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };
  
  const removeFromCart = async (productId) => {
    if (userId) {
      try {
        const cartRef = doc(db, 'carts', userId);
        await updateDoc(cartRef, {
          items: arrayRemove(...cartItems.filter(item => item.id === productId))
        });
      } catch (error) {
        console.error('Error removing item:', error);
      }
    } else {
      setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    }
  };
  
  const clearCart = async () => {
    try {
      if (userId) {
        await clearFirebaseCart(userId);
      } else {
        localStorage.removeItem('cart');
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }

    // Optimistic update
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );

    // Sync with Firebase if logged in
    if (userId) {
      try {
        await syncCart(userId, cartItems);
      } catch (error) {
        console.error('Error updating quantity:', error);
        // Revert if sync fails
        const originalCart = await getCart(userId);
        setCartItems(originalCart);
      }
    }
  };

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const cartCount = cartItems.reduce(
    (count, item) => count + item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        loading
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
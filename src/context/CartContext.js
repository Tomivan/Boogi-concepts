import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, getDoc, updateDoc, arrayRemove, arrayUnion } from 'firebase/firestore';
import { auth, db } from '../firebase';

const CartContext = createContext();

const parsePrice = (price) => {
  if (typeof price === 'number') return price;
  const numericValue = parseFloat(String(price).replace(/[^0-9.]/g, ''));
  return isNaN(numericValue) ? 0 : numericValue;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Universal save function
  const saveCart = async (items) => {
    try {
      if (userId) {
        // Save to Firestore
        const cartRef = doc(db, 'carts', userId);
        await updateDoc(cartRef, { items });
      } else {
        // Save to localStorage
        localStorage.setItem('cart', JSON.stringify(items));
      }
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  // Firebase operations
  const getCart = async (userId) => {
    const cartRef = doc(db, 'carts', userId);
    const cartSnap = await getDoc(cartRef);
    return cartSnap.exists() ? (cartSnap.data().items || []).map(item => ({
      ...item,
      price: parsePrice(item.price || item.Price)
    })) : [];
  };

  const mergeCarts = async (userId, localItems) => {
    const serverItems = await getCart(userId);
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
    
    await saveCart(mergedItems);
    return mergedItems;
  };

  // Auth and cart sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          setUserId(user.uid);
          const serverCart = await getCart(user.uid);
          const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
          
          if (localCart.length > 0) {
            const mergedCart = await mergeCarts(user.uid, localCart);
            setCartItems(mergedCart);
            localStorage.removeItem('cart');
          } else {
            setCartItems(serverCart);
          }
        } else {
          setUserId(null);
          const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
          setCartItems(localCart);
        }
      } catch (error) {
        console.error('Auth state error:', error);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync cart changes
  useEffect(() => {
    if (loading || cartItems.length === 0) return;
    
    const debounceTimer = setTimeout(() => {
      saveCart(cartItems);
    }, 500);
    
    return () => clearTimeout(debounceTimer);
  }, [cartItems, userId, loading]);

  // Cart operations
  const addToCart = (product) => {
    setCartItems(prevItems => {
      const productId = product.id || `${product.Name}-${product['Brand Name']}`;
      const normalizedProduct = {
        ...product,
        id: productId,
        price: parsePrice(product.price || product.Price),
        quantity: 1
      };

      const existingItem = prevItems.find(item => item.id === productId);
      const newItems = existingItem
        ? prevItems.map(item =>
            item.id === productId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        : [...prevItems, normalizedProduct];

      return newItems;
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => {
      const newItems = prevItems.filter(item => item.id !== productId);
      return newItems;
    });
  };

  const updateQuantity = (productId, newQuantity) => {
    setCartItems(prevItems => {
      if (newQuantity < 1) {
        const newItems = prevItems.filter(item => item.id !== productId);
        return newItems;
      }
      return prevItems.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      );
    });
  };

  const clearCart = () => {
    setCartItems([]);
    if (userId) {
      const cartRef = doc(db, 'carts', userId);
      updateDoc(cartRef, { items: [] });
    } else {
      localStorage.removeItem('cart');
    }
  };

  // Derived values
  const cartTotal = cartItems.reduce(
    (total, item) => total + (item.price * item.quantity),
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
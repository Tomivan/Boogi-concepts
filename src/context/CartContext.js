import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, getDoc, updateDoc, arrayRemove, arrayUnion } from 'firebase/firestore';
import { auth, db } from '../firebase';

const CartContext = createContext();

// Helper function to ensure price is always a number
const parsePrice = (price) => {
  if (typeof price === 'number') return price;
  const numericValue = parseFloat(String(price).replace(/[^0-9.]/g, ''));
  return isNaN(numericValue) ? 0 : numericValue;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Firebase operations
  const getCart = async (userId) => {
    const cartRef = doc(db, 'carts', userId);
    const cartSnap = await getDoc(cartRef);
    return cartSnap.exists() ? (cartSnap.data().items || []).map(item => ({
      ...item,
      price: parsePrice(item.price || item.Price) // Normalize price
    })) : [];
  };

  const syncCart = async (userId, items) => {
    const cartRef = doc(db, 'carts', userId);
    await updateDoc(cartRef, { items });
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
          price: parsePrice(localItem.price || localItem.Price) // Normalize price
        });
      }
    });
    
    await syncCart(userId, mergedItems);
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
            await mergeCarts(user.uid, localCart);
            const mergedCart = await getCart(user.uid);
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

  // Cart operations
  const addToCart = (product) => {
    setCartItems(prevItems => {
      const productId = product.id || `${product.Name}-${product['Brand Name']}`;
      const normalizedProduct = {
        ...product,
        id: productId,
        price: parsePrice(product.price || product.Price), // Ensure numeric price
        quantity: 1
      };

      const existingItem = prevItems.find(item => item.id === productId);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, normalizedProduct];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
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

export const useCart = () => useContext(CartContext);
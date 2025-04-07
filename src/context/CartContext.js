// src/context/CartContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const showSuccessAlert = (title, text) => {
    Swal.fire({
      title,
      text,
      icon: 'success',
      confirmButtonColor: '#4B0082', // Your brand purple
      timer: 2000,
      timerProgressBar: true,
    });
  };

  const addToCart = (product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      let newItems;
      
      if (existingItem) {
        newItems = prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newItems = [...prevItems, { ...product, quantity: 1 }];
        showSuccessAlert('Added to Cart', `${product.name} added to your cart`);
      }
      
      return newItems;
    });
  };

  const removeFromCart = (productId, productName) => {
    setCartItems(prevItems => {
      const itemToRemove = prevItems.find(item => item.id === productId);
      Swal.fire({
        title: 'Remove Item?',
        text: `Are you sure you want to remove ${productName || 'this item'} from your cart?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#4B0082',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, remove it!'
      }).then((result) => {
        if (result.isConfirmed) {
          const newItems = prevItems.filter(item => item.id !== productId);
          setCartItems(newItems);
          showSuccessAlert('Removed', `${productName || 'Item'} removed from cart`);
        }
      });
      return prevItems; // Return unchanged if cancelled
    });
  };

  const updateQuantity = (productId, newQuantity, productName) => {
    if (newQuantity < 1) {
      removeFromCart(productId, productName);
      return;
    }
    
    setCartItems(prevItems => {
      const newItems = prevItems.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      );
      
      // Only show notification if quantity actually changed
      const changedItem = prevItems.find(item => item.id === productId);
      if (changedItem && changedItem.quantity !== newQuantity) {
        showSuccessAlert('Quantity Updated', `${productName} quantity set to ${newQuantity}`);
      }
      
      return newItems;
    });
  };

  const clearCart = () => {
    Swal.fire({
      title: 'Clear Cart?',
      text: 'Are you sure you want to remove all items from your cart?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4B0082',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, clear it!'
    }).then((result) => {
      if (result.isConfirmed) {
        setCartItems([]);
        showSuccessAlert('Cart Cleared', 'All items removed from cart');
      }
    });
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
        cartCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
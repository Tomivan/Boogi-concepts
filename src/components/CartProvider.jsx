import { useEffect } from 'react';
import { useCartStore } from '../store/cartStore';

export const CartProvider = ({ children }) => {
  const initializeCart = useCartStore((state) => state.initializeCart);

  useEffect(() => {
    const unsubscribe = initializeCart();
    
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [initializeCart]);

  return <>{children}</>;
};
'use client';
import { SessionProvider } from 'next-auth/react';
import { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export default function Providers({ children }) {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    // Load from local storage initially
    const saved = localStorage.getItem('bitis_cart');
    if (saved) {
      try { setCartItems(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('bitis_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, size, color) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product === product.id && item.size === size && item.color === color);
      if (existing) {
        return prev.map(item => 
          item.product === product.id && item.size === size && item.color === color
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, {
        product: product.id,
        name: product.name,
        size: size,
        color: color,
        quantity: 1,
        price: product.discount_price || product.price,
        image: product.images[0]
      }];
    });
  };

  const removeFromCart = (productId, size, color) => {
    setCartItems(prev => prev.filter(item => !(item.product === productId && item.size === size && item.color === color)));
  };

  const clearCart = () => setCartItems([]);

  return (
    <SessionProvider>
      <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, setCartItems }}>
        {children}
      </CartContext.Provider>
    </SessionProvider>
  );
}

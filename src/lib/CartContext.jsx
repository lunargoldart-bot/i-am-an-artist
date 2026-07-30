import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);

const CART_KEY = 'iaa_cart';

const loadCart = () => {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

const saveCart = (items) => {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(loadCart());
  }, []);

  const addItem = useCallback((artwork) => {
    setItems((prev) => {
      if (prev.some((i) => i.id === artwork.id)) return prev;
      const next = [...prev, { id: artwork.id, title: artwork.title, price: artwork.price_zmw || artwork.price, image: artwork.image_urls?.[0] || '', artist_name: artwork.artist_name, artist_email: artwork.artist_email }];
      saveCart(next);
      return next;
    });
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== id);
      saveCart(next);
      return next;
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem(CART_KEY);
  }, []);

  const total = items.reduce((sum, i) => sum + (i.price || 0), 0);
  const count = items.length;

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth, API_URL } from './AuthContext';

export interface CartItem {
  id: number | string; // DB id or local book id
  book_id: number;
  quantity: number;
  book?: {
    id: number;
    title: string;
    author?: string;
    cover_url?: string;
    price: number;
    stock: number;
  };
}

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  loading: boolean;
  addToCart: (book: any, quantity?: number) => Promise<void>;
  removeFromCart: (bookId: number, cartItemId?: number | string) => Promise<void>;
  updateQuantity: (bookId: number, quantity: number, cartItemId?: number | string) => Promise<void>;
  clearCart: () => Promise<void>;
  syncCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, token, isAuthenticated } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load cart initially
  useEffect(() => {
    if (isAuthenticated && token) {
      syncCart();
    } else {
      loadLocalCart();
    }
  }, [isAuthenticated, token]);

  const fetchDBCart = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/auth/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setCart(data);
      }
    } catch (err) {
      console.error('Failed to fetch cart from DB', err);
    } finally {
      setLoading(false);
    }
  };

  const loadLocalCart = () => {
    setLoading(true);
    const local = localStorage.getItem('ecliptoon_basket');
    if (local) {
      try {
        setCart(JSON.parse(local));
      } catch (e) {
        console.error('Invalid local cart', e);
        setCart([]);
      }
    } else {
      setCart([]);
    }
    setLoading(false);
  };

  const saveLocalCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('ecliptoon_basket', JSON.stringify(newCart));
  };

  const syncCart = async () => {
    if (!token) return;
    const local = localStorage.getItem('ecliptoon_basket');
    if (local) {
      try {
        const parsed: CartItem[] = JSON.parse(local);
        if (parsed.length > 0) {
          const items = parsed.map(item => ({
            id: item.book_id,
            quantity: item.quantity
          }));
          const res = await fetch(`${API_URL}/auth/cart/sync`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ items })
          });
          if (res.ok) {
            const data = await res.json();
            setCart(data.cart);
            localStorage.removeItem('ecliptoon_basket');
            return;
          }
        }
      } catch (e) {
        console.error('Sync failed', e);
      }
    }
    // If no local items, just fetch DB
    fetchDBCart();
  };

  const addToCart = async (book: any, quantity: number = 1) => {
    if (isAuthenticated && token) {
      try {
        const res = await fetch(`${API_URL}/auth/cart/add`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ book_id: book.id, quantity })
        });
        if (res.ok) {
          await fetchDBCart();
        }
      } catch (err) {
        console.error('Failed to add to DB cart', err);
      }
    } else {
      // Local addition
      const existing = cart.find(i => i.book_id === book.id);
      if (existing) {
        const newCart = cart.map(i => i.book_id === book.id ? { ...i, quantity: i.quantity + quantity } : i);
        saveLocalCart(newCart);
      } else {
        const newItem: CartItem = {
          id: `local_${book.id}`,
          book_id: book.id,
          quantity,
          book: {
            id: book.id,
            title: book.title,
            cover_url: book.cover_url,
            price: book.price,
            stock: book.stock
          }
        };
        saveLocalCart([...cart, newItem]);
      }
    }
  };

  const removeFromCart = async (bookId: number, cartItemId?: number | string) => {
    if (isAuthenticated && token && cartItemId && typeof cartItemId === 'number') {
      try {
        const res = await fetch(`${API_URL}/auth/cart/remove/${cartItemId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          await fetchDBCart();
        }
      } catch (err) {
        console.error('Failed to remove from DB cart', err);
      }
    } else {
      const newCart = cart.filter(i => i.book_id !== bookId);
      saveLocalCart(newCart);
    }
  };

  const updateQuantity = async (bookId: number, quantity: number, cartItemId?: number | string) => {
    if (quantity < 1) return;
    
    if (isAuthenticated && token && cartItemId && typeof cartItemId === 'number') {
      try {
        const res = await fetch(`${API_URL}/auth/cart/update/${cartItemId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ quantity })
        });
        if (res.ok) {
          await fetchDBCart();
        }
      } catch (err) {
        console.error('Failed to update DB cart quantity', err);
      }
    } else {
      const newCart = cart.map(i => i.book_id === bookId ? { ...i, quantity } : i);
      saveLocalCart(newCart);
    }
  };

  const clearCart = async () => {
    if (isAuthenticated && token) {
      try {
        const res = await fetch(`${API_URL}/auth/cart/clear`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          setCart([]);
        }
      } catch (err) {
        console.error('Failed to clear DB cart', err);
      }
    } else {
      setCart([]);
      localStorage.removeItem('ecliptoon_basket');
    }
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, cartCount, loading, addToCart, removeFromCart, updateQuantity, clearCart, syncCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart должен использоваться внутри CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        setCart([]);
        toast.error('Ошибка загрузки корзины. Корзина очищена.');
      }
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch (error) {
      toast.error('Ошибка сохранения корзины.');
    }
  }, [cart]);

  const addToCart = (product, quantity = 1, size) => {
    try {
      setCart(prev => {
        const existing = prev.find(item => item.id === product.id && item.size === size);
        if (existing) {
          return prev.map(item =>
            item.id === product.id && item.size === size
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prev, { ...product, quantity, size }];
      });
    } catch (error) {
      toast.error('Ошибка добавления товара в корзину.');
    }
  };

  const removeFromCart = (productId, size) => {
    try {
      setCart(prev => prev.filter(item => !(item.id === productId && item.size === size)));
    } catch (error) {
      toast.error('Ошибка удаления товара из корзины.');
    }
  };

  const updateQuantity = (productId, quantity, size) => {
    try {
      if (quantity <= 0) {
        removeFromCart(productId, size);
        return;
      }
      setCart(prev =>
        prev.map(item =>
          item.id === productId && item.size === size
            ? { ...item, quantity }
            : item
        )
      );
    } catch (error) {
      toast.error('Ошибка обновления количества товара.');
    }
  };

  const updateSize = (productId, newSize, quantity) => {
    try {
      setCart(prev => {
        const itemToUpdate = prev.find(item => item.id === productId && item.quantity === quantity);
        if (!itemToUpdate) return prev;
        const exists = prev.find(item => item.id === productId && item.size === newSize);
        if (exists) {
          return prev
            .filter(item => !(item.id === productId && item.size === itemToUpdate.size && item.quantity === quantity))
            .map(item =>
              item.id === productId && item.size === newSize
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
        }
        return prev.map(item =>
          item.id === productId && item.size === itemToUpdate.size && item.quantity === quantity
            ? { ...item, size: newSize }
            : item
        );
      });
    } catch (error) {
      toast.error('Ошибка обновления размера товара.');
    }
  };

  const clearCart = () => {
    try {
      setCart([]);
    } catch (error) {
      toast.error('Ошибка очистки корзины.');
    }
  };

  const getCartItemCount = () => cart.reduce((sum, item) => sum + item.quantity, 0);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      updateSize,
      clearCart,
      getCartItemCount,
      total
    }}>
      {children}
    </CartContext.Provider>
  );
}; 
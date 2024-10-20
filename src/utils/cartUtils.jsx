import React from 'react';

export const calculateCartTotals = (cart) => {
  const totalWithDiscount = cart.reduce((sum, item) => sum + (item.onSale ? item.salePrice : item.price) * item.quantity, 0);
  const hasDiscount = cart.some(item => item.onSale);
  return { totalWithDiscount, hasDiscount };
};

export const SuccessModal = ({ message }) => (
  <div className="fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-md flex items-center justify-center">
    <div className="rounded-2xl shadow-2xl bg-white border-2 border-green-400 p-8 w-full text-center animate-fade-in-up flex flex-col items-center">
      <div className="text-3xl font-extrabold text-green-600 mb-2">Заказ оформлен!</div>
      <div className="text-lg text-gray-700 font-medium mb-2">{message}</div>
    </div>
  </div>
); 
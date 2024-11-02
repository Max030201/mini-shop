import { calculateCartTotals, SuccessModal } from '../cartUtils';
import React from 'react';
import { render, screen } from '@testing-library/react';

describe('calculateCartTotals', () => {
  it('возвращает 0 и false для пустой корзины', () => {
    const result = calculateCartTotals([]);
    expect(result).toEqual({ totalWithDiscount: 0, hasDiscount: false });
  });

  it('считает сумму без скидок', () => {
    const cart = [
      { price: 100, quantity: 2, onSale: false },
      { price: 50, quantity: 1, onSale: false }
    ];
    const result = calculateCartTotals(cart);
    expect(result).toEqual({ totalWithDiscount: 250, hasDiscount: false });
  });

  it('считает сумму со скидками', () => {
    const cart = [
      { price: 100, salePrice: 80, quantity: 2, onSale: true },
      { price: 50, quantity: 1, onSale: false }
    ];
    const result = calculateCartTotals(cart);
    expect(result).toEqual({ totalWithDiscount: 210, hasDiscount: true });
  });

  it('считает сумму для смешанной корзины', () => {
    const cart = [
      { price: 100, salePrice: 80, quantity: 1, onSale: true },
      { price: 50, quantity: 2, onSale: false }
    ];
    const result = calculateCartTotals(cart);
    expect(result).toEqual({ totalWithDiscount: 180, hasDiscount: true });
  });

  it('корректно работает, если salePrice не задан у onSale', () => {
    const cart = [
      { price: 100, quantity: 1, onSale: true }
    ];
    const result = calculateCartTotals(cart);
    expect(result.totalWithDiscount).toBeNaN();
    expect(result.hasDiscount).toBe(true);
  });
});

describe('SuccessModal', () => {
  it('рендерит сообщение об успехе', () => {
    render(<SuccessModal message="Тестовое сообщение" />);
    expect(screen.getByText('Заказ оформлен!')).toBeInTheDocument();
    expect(screen.getByText('Тестовое сообщение')).toBeInTheDocument();
  });
}); 
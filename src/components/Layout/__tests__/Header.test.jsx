import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from '../Header';

jest.mock('../../../context/CartContext', () => ({
  useCart: jest.fn(),
}));

const { useCart } = require('../../../context/CartContext');

describe('Header', () => {
  let onCartOpen, onContinueShopping;

  beforeEach(() => {
    onCartOpen = jest.fn();
    onContinueShopping = jest.fn();
  });

  it('рендерится без ошибок (smoke)', () => {
    useCart.mockReturnValue({ getCartItemCount: () => 0 });
    render(<Header onCartOpen={onCartOpen} onContinueShopping={onContinueShopping} showCart={false} />);
    expect(screen.getByText('Mini Shop')).toBeInTheDocument();
  });

  it('рендерит кнопку "Корзина" и вызывает onCartOpen', () => {
    useCart.mockReturnValue({ getCartItemCount: () => 0 });
    render(<Header onCartOpen={onCartOpen} onContinueShopping={onContinueShopping} showCart={false} />);
    const btn = screen.getByText('Корзина').closest('button');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onCartOpen).toHaveBeenCalled();
  });

  it('рендерит badge с количеством, если getCartItemCount > 0', () => {
    useCart.mockReturnValue({ getCartItemCount: () => 5 });
    render(<Header onCartOpen={onCartOpen} onContinueShopping={onContinueShopping} showCart={false} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('не рендерит badge, если getCartItemCount = 0', () => {
    useCart.mockReturnValue({ getCartItemCount: () => 0 });
    render(<Header onCartOpen={onCartOpen} onContinueShopping={onContinueShopping} showCart={false} />);
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('рендерит кнопку "В магазин" и вызывает onContinueShopping', () => {
    useCart.mockReturnValue({ getCartItemCount: () => 3 });
    render(<Header onCartOpen={onCartOpen} onContinueShopping={onContinueShopping} showCart={true} />);
    const btn = screen.getByText('В магазин').closest('button');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onContinueShopping).toHaveBeenCalled();
  });
}); 
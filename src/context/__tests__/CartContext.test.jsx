import React from 'react';
import { render, fireEvent, act, screen } from '@testing-library/react';
import { CartProvider, useCart } from '../CartContext';
import { toast } from 'react-hot-toast';

jest.mock('react-hot-toast', () => ({ toast: { error: jest.fn() } }));

const mockProduct = { id: 1, name: 'Товар', price: 100, size: 'M' };
const mockProduct2 = { id: 2, name: 'Товар2', price: 200, size: 'L' };

function CartTestComponent() {
  const ctx = useCart();
  return (
    <div>
      <div data-testid="cart">{JSON.stringify(ctx.cart)}</div>
      <div data-testid="total">{ctx.total}</div>
      <div data-testid="count">{ctx.getCartItemCount()}</div>
      <button onClick={() => ctx.addToCart(mockProduct, 2, 'M')}>add1</button>
      <button onClick={() => ctx.addToCart(mockProduct, 1, 'M')}>add1more</button>
      <button onClick={() => ctx.addToCart(mockProduct2, 3, 'L')}>add2</button>
      <button onClick={() => ctx.removeFromCart(mockProduct.id, 'M')}>remove1</button>
      <button onClick={() => ctx.updateQuantity(mockProduct.id, 5, 'M')}>update1q</button>
      <button onClick={() => ctx.updateQuantity(mockProduct.id, 0, 'M')}>update1q0</button>
      <button onClick={() => ctx.updateSize(mockProduct.id, 'L', 1)}>update1sizeQ1</button>
      <button onClick={() => ctx.updateSize(mockProduct.id, 'L', 2)}>update1sizeQ2</button>
      <button onClick={() => ctx.updateSize(mockProduct.id, 'M', 2)}>update1sizeToM</button>
      <button onClick={() => ctx.clearCart()}>clear</button>
      <button onClick={() => ctx.addToCart(mockProduct, 2, 'L')}>add1L</button>
    </div>
  );
}

describe('CartContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    console.error.mockRestore();
  });

  it('выбрасывает ошибку, если useCart вызван вне провайдера', () => {
    function TestComponent() {
      useCart();
      return null;
    }
    expect(() => render(<TestComponent />)).toThrow('useCart должен использоваться внутри CartProvider');
  });

  it('инициализирует корзину из localStorage', () => {
    localStorage.setItem('cart', JSON.stringify([{ ...mockProduct, quantity: 2 }]));
    render(
      <CartProvider>
        <CartTestComponent />
      </CartProvider>
    );
    expect(screen.getByTestId('cart').textContent).toContain('"quantity":2');
  });

  it('очищает localStorage при ошибке парсинга и вызывает toast', () => {
    localStorage.setItem('cart', 'not-json');
    render(
      <CartProvider>
        <CartTestComponent />
      </CartProvider>
    );
    expect(screen.getByTestId('cart').textContent).toBe('[]');
    expect(toast.error).toHaveBeenCalledWith('Ошибка загрузки корзины. Корзина очищена.');
  });

  it('addToCart добавляет новый товар', () => {
    render(
      <CartProvider>
        <CartTestComponent />
      </CartProvider>
    );
    act(() => {
      fireEvent.click(screen.getByText('add1'));
    });
    expect(screen.getByTestId('cart').textContent).toContain('"quantity":2');
    expect(screen.getByTestId('cart').textContent).toContain('"id":1');
  });

  it('addToCart увеличивает количество, если товар уже есть', () => {
    render(
      <CartProvider>
        <CartTestComponent />
      </CartProvider>
    );
    act(() => {
      fireEvent.click(screen.getByText('add1'));
      fireEvent.click(screen.getByText('add1more'));
    });
    expect(screen.getByTestId('cart').textContent).toContain('"quantity":3');
  });

  it('removeFromCart удаляет товар по id и size', () => {
    render(
      <CartProvider>
        <CartTestComponent />
      </CartProvider>
    );
    act(() => {
      fireEvent.click(screen.getByText('add1'));
      fireEvent.click(screen.getByText('add2'));
      fireEvent.click(screen.getByText('remove1'));
    });
    expect(screen.getByTestId('cart').textContent).toContain('"id":2');
    expect(screen.getByTestId('cart').textContent).not.toContain('"id":1');
  });

  it('updateQuantity обновляет количество товара', () => {
    render(
      <CartProvider>
        <CartTestComponent />
      </CartProvider>
    );
    act(() => {
      fireEvent.click(screen.getByText('add1'));
      fireEvent.click(screen.getByText('update1q'));
    });
    expect(screen.getByTestId('cart').textContent).toContain('"quantity":5');
  });

  it('updateQuantity удаляет товар, если количество <= 0', () => {
    render(
      <CartProvider>
        <CartTestComponent />
      </CartProvider>
    );
    act(() => {
      fireEvent.click(screen.getByText('add1'));
      fireEvent.click(screen.getByText('update1q0'));
    });
    expect(screen.getByTestId('cart').textContent).not.toContain('id');
  });

  it('updateSize меняет размер товара (quantity совпадает)', () => {
    render(
      <CartProvider>
        <CartTestComponent />
      </CartProvider>
    );
    act(() => {
      fireEvent.click(screen.getByText('add1'));
      fireEvent.click(screen.getByText('update1sizeQ2'));
    });
    expect(screen.getByTestId('cart').textContent).toContain('"size":"L"');
  });

  it('updateSize не меняет, если quantity не совпадает (itemToUpdate не найден)', () => {
    render(
      <CartProvider>
        <CartTestComponent />
      </CartProvider>
    );
    act(() => {
      fireEvent.click(screen.getByText('add1'));
      fireEvent.click(screen.getByText('update1sizeQ1'));
    });
    expect(screen.getByTestId('cart').textContent).toContain('"size":"M"');
  });

  it('updateSize увеличивает количество, если товар с новым размером уже есть (слияние)', () => {
    render(
      <CartProvider>
        <CartTestComponent />
      </CartProvider>
    );
    act(() => {
      fireEvent.click(screen.getByText('add1'));
      fireEvent.click(screen.getByText('add1L'));
      fireEvent.click(screen.getByText('update1sizeQ2'));
    });
    const cart = JSON.parse(screen.getByTestId('cart').textContent);
    expect(cart.length).toBe(1);
    expect(cart[0].size).toBe('L');
    expect(cart[0].quantity).toBe(4);
  });

  it('clearCart очищает корзину', () => {
    render(
      <CartProvider>
        <CartTestComponent />
      </CartProvider>
    );
    act(() => {
      fireEvent.click(screen.getByText('add1'));
      fireEvent.click(screen.getByText('clear'));
    });
    expect(screen.getByTestId('cart').textContent).toBe('[]');
  });

  it('getCartItemCount возвращает сумму quantity', () => {
    render(
      <CartProvider>
        <CartTestComponent />
      </CartProvider>
    );
    act(() => {
      fireEvent.click(screen.getByText('add1'));
      fireEvent.click(screen.getByText('add2'));
    });
    expect(screen.getByTestId('count').textContent).toBe('5');
  });

  it('total возвращает сумму по всем товарам', () => {
    render(
      <CartProvider>
        <CartTestComponent />
      </CartProvider>
    );
    act(() => {
      fireEvent.click(screen.getByText('add1'));
      fireEvent.click(screen.getByText('add2'));
    });
    expect(screen.getByTestId('total').textContent).toBe('800');
  });
}); 
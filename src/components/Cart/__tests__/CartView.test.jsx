import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import CartView from '../CartView';

jest.mock('../../../context/CartContext');
jest.mock('../../../utils/cartUtils', () => {
  const original = jest.requireActual('../../../utils/cartUtils');
  return {
    ...original,
    calculateCartTotals: jest.fn()
  };
});
jest.mock('../CartItem', () => {
  return function MockCartItem({ item }) {
    return (
      <div data-testid="cart-item" data-item-id={item.id}>
        {item.name} - {item.price}₽
      </div>
    );
  };
});
jest.mock('../CheckoutModal', () => {
  return function MockCheckoutModal({ visible, onHide, onSuccess }) {
    if (!visible) return null;
    return (
      <div data-testid="checkout-modal">
        <button onClick={onHide}>Закрыть</button>
        <button onClick={onSuccess}>Успешно</button>
      </div>
    );
  };
});

jest.mock('primereact/panel', () => ({
  Panel: ({ header, children, className }) => (
    <div data-testid="prime-panel" className={className}>
      <div data-testid="panel-header">{header}</div>
      {children}
    </div>
  )
}));

jest.mock('primereact/button', () => ({
  Button: ({ label, onClick, disabled, className, children }) => (
    <button
      data-testid="prime-button"
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {label || children}
    </button>
  )
}));

const mockConfirm = jest.fn();
Object.defineProperty(window, 'confirm', {
  value: mockConfirm,
  writable: true
});

jest.useFakeTimers();

describe('CartView', () => {
  const mockAddToCart = jest.fn();
  const mockClearCart = jest.fn();
  const mockOnClose = jest.fn();
  const mockOnContinueShopping = jest.fn();

  const mockCart = [
    {
      id: 1,
      name: 'Футболка белая',
      price: 1290,
      salePrice: null,
      quantity: 2,
      size: 'M',
      onSale: false
    },
    {
      id: 2,
      name: 'Джинсы',
      price: 2990,
      salePrice: 2392,
      quantity: 1,
      size: 'L',
      onSale: true
    }
  ];

  const mockCartContext = {
    cart: mockCart,
    total: 5570,
    clearCart: mockClearCart
  };

  const mockCartTotals = {
    totalWithDiscount: 4972,
    hasDiscount: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
    const { useCart } = require('../../../context/CartContext');
    const { calculateCartTotals } = require('../../../utils/cartUtils');
    
    useCart.mockReturnValue(mockCartContext);
    calculateCartTotals.mockReturnValue(mockCartTotals);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Пустая корзина', () => {
    beforeEach(() => {
      const { useCart } = require('../../../context/CartContext');
      useCart.mockReturnValue({
        ...mockCartContext,
        cart: []
      });
    });

    it('отображает сообщение о пустой корзине', () => {
      render(<CartView onClose={mockOnClose} onContinueShopping={mockOnContinueShopping} />);
      
      expect(screen.getByText('Ваша корзина пуста')).toBeInTheDocument();
      expect(screen.getByText('Продолжить покупки')).toBeInTheDocument();
    });

    it('вызывает onContinueShopping при клике на кнопку', () => {
      render(<CartView onClose={mockOnClose} onContinueShopping={mockOnContinueShopping} />);
      
      const continueButton = screen.getByText('Продолжить покупки');
      fireEvent.click(continueButton);
      
      expect(mockOnContinueShopping).toHaveBeenCalled();
    });
  });

  describe('Корзина с товарами', () => {
    it('отображает товары в корзине', () => {
      render(<CartView onClose={mockOnClose} onContinueShopping={mockOnContinueShopping} />);
      
      expect(screen.getByText('Корзина (2 товаров)')).toBeInTheDocument();
      expect(screen.getAllByTestId('cart-item')).toHaveLength(2);
    });

    it('отображает итоговую сумму со скидкой', () => {
      render(<CartView onClose={mockOnClose} onContinueShopping={mockOnContinueShopping} />);
      
      expect(screen.getByText('Итого:')).toBeInTheDocument();
      expect(screen.getByText((content) => content.replace(/\s/g, '').includes('4972'))).toBeInTheDocument();
      expect(screen.getByText((content) => content.replace(/\s/g, '').includes('5570'))).toBeInTheDocument();
    });

    it('отображает итоговую сумму без скидки', () => {
      const { calculateCartTotals } = require('../../../utils/cartUtils');
      calculateCartTotals.mockReturnValue({
        totalWithDiscount: 5570,
        hasDiscount: false
      });

      render(<CartView onClose={mockOnClose} onContinueShopping={mockOnContinueShopping} />);
      expect(screen.getByText((content) => content.replace(/\s/g, '').includes('5570'))).toBeInTheDocument();
      expect(screen.queryByText((content) => content.replace(/\s/g, '').includes('4972'))).not.toBeInTheDocument();
    });

    it('вызывает onClose при клике на кнопку закрытия', () => {
      render(<CartView onClose={mockOnClose} onContinueShopping={mockOnContinueShopping} />);
      
      const buttons = screen.getAllByTestId('prime-button');
      const closeButton = buttons[0];
      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('очищает корзину при подтверждении', () => {
      mockConfirm.mockReturnValue(true);
      
      render(<CartView onClose={mockOnClose} onContinueShopping={mockOnContinueShopping} />);
      
      const clearButton = screen.getByText('Очистить корзину');
      fireEvent.click(clearButton);
      expect(mockConfirm).toHaveBeenCalledWith('Вы уверены, что хотите очистить корзину?');
      expect(mockClearCart).toHaveBeenCalled();
    });

    it('не очищает корзину при отмене', () => {
      mockConfirm.mockReturnValue(false);
      
      render(<CartView onClose={mockOnClose} onContinueShopping={mockOnContinueShopping} />);
      
      const clearButton = screen.getByText('Очистить корзину');
      fireEvent.click(clearButton);
      expect(mockConfirm).toHaveBeenCalledWith('Вы уверены, что хотите очистить корзину?');
      expect(mockClearCart).not.toHaveBeenCalled();
    });

    it('открывает модальное окно оформления заказа', () => {
      render(<CartView onClose={mockOnClose} onContinueShopping={mockOnContinueShopping} />);
      
      const checkoutButton = screen.getByText('Оформить заказ');
      fireEvent.click(checkoutButton);
      expect(screen.getByTestId('checkout-modal')).toBeInTheDocument();
    });

    it('отображает состояние загрузки при оформлении заказа', () => {
      render(<CartView onClose={mockOnClose} onContinueShopping={mockOnContinueShopping} />);
      
      const checkoutButton = screen.getByText('Оформить заказ');
      fireEvent.click(checkoutButton);
      expect(screen.getByText('Оформление...')).toBeInTheDocument();
    });

    it('закрывает модальное окно оформления заказа', () => {
      render(<CartView onClose={mockOnClose} onContinueShopping={mockOnContinueShopping} />);
      
      const checkoutButton = screen.getByText('Оформить заказ');
      fireEvent.click(checkoutButton);
      expect(screen.getByTestId('checkout-modal')).toBeInTheDocument();
      const closeModalButton = screen.getByText('Закрыть');
      fireEvent.click(closeModalButton);
      expect(screen.queryByTestId('checkout-modal')).not.toBeInTheDocument();
    });

    it('обрабатывает успешное оформление заказа', async () => {
      const { container } = render(<CartView onClose={mockOnClose} onContinueShopping={mockOnContinueShopping} />);
      
      const checkoutButton = screen.getByText('Оформить заказ');
      fireEvent.click(checkoutButton);
      const successButton = screen.getByText('Успешно');
      fireEvent.click(successButton);
      expect(screen.queryByTestId('checkout-modal')).not.toBeInTheDocument();
      await waitFor(() => {
        const successTitle = container.querySelector('.text-3xl.font-extrabold.text-green-600.mb-2');
        expect(successTitle).toBeInTheDocument();
        expect(successTitle.textContent).toContain('Заказ оформлен');
        expect(container.textContent).toContain('Спасибо за покупку');
      });
    });

    it('блокирует кнопки при загрузке', () => {
      render(<CartView onClose={mockOnClose} onContinueShopping={mockOnContinueShopping} />);
      
      const checkoutButton = screen.getByText('Оформить заказ');
      fireEvent.click(checkoutButton);
      const clearButton = screen.getByText('Очистить корзину');
      expect(clearButton).toBeDisabled();
      const newCheckoutButton = screen.getByText('Оформление...');
      expect(newCheckoutButton).toBeDisabled();
    });

    it('скрывает сообщение об успехе через 5 секунд (покрытие setTimeout)', async () => {
      const { container } = render(<CartView onClose={mockOnClose} onContinueShopping={mockOnContinueShopping} />);
      fireEvent.click(screen.getByText('Оформить заказ'));
      fireEvent.click(screen.getByText('Успешно'));
      await waitFor(() => {
        expect(container.textContent).toContain('Спасибо за покупку');
      });
      act(() => {
        jest.advanceTimersByTime(5000);
      });
      await waitFor(() => {
        expect(container.textContent).not.toContain('Спасибо за покупку');
      });
    });
  });

  describe('Информационные блоки', () => {
    it('отображает информацию о заказе', () => {
      render(<CartView onClose={mockOnClose} onContinueShopping={mockOnContinueShopping} />);
      
      expect(screen.getByText('Информация о заказе')).toBeInTheDocument();
      expect(screen.getByText('• Бесплатная доставка от 5000₽')).toBeInTheDocument();
      expect(screen.getByText('• Возврат в течение 14 дней')).toBeInTheDocument();
      expect(screen.getByText('• Безопасная оплата')).toBeInTheDocument();
    });

    it('отображает информацию о доставке', () => {
      render(<CartView onClose={mockOnClose} onContinueShopping={mockOnContinueShopping} />);
      
      expect(screen.getByText('Информация о доставке')).toBeInTheDocument();
      expect(screen.getByText('• Срок доставки: 1-3 рабочих дня')).toBeInTheDocument();
      expect(screen.getByText('• Оплата при получении или онлайн')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('работает с корзиной без товаров со скидкой', () => {
      const { calculateCartTotals } = require('../../../utils/cartUtils');
      calculateCartTotals.mockReturnValue({
        totalWithDiscount: 1000,
        hasDiscount: false
      });

      render(<CartView onClose={mockOnClose} onContinueShopping={mockOnContinueShopping} />);
      // Проверяем, что есть элемент с числом 1000
      expect(screen.getByText((content) => content.replace(/\s/g, '').includes('1000'))).toBeInTheDocument();
      // Проверяем отсутствие зачеркнутой цены
      expect(screen.queryByText((content, element) => {
        return element.className && element.className.includes('line-through');
      })).not.toBeInTheDocument();
    });

    it('работает с корзиной с одним товаром', () => {
      const { useCart } = require('../../../context/CartContext');
      useCart.mockReturnValue({
        ...mockCartContext,
        cart: [mockCart[0]]
      });

      render(<CartView onClose={mockOnClose} onContinueShopping={mockOnContinueShopping} />);
      
      expect(screen.getByText('Корзина (1 товаров)')).toBeInTheDocument();
      expect(screen.getAllByTestId('cart-item')).toHaveLength(1);
    });
  });
}); 
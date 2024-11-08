import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CartItem from '../CartItem';

jest.mock('primereact/card', () => ({
  Card: ({ children, className, ...props }) => (
    <div data-testid="prime-card" className={className} {...props}>
      {children}
    </div>
  )
}));

jest.mock('primereact/button', () => ({
  Button: ({ onClick, label, className, ...props }) => (
    <button
      data-testid="prime-button"
      onClick={onClick}
      className={className}
      {...props}
    >
      {label}
    </button>
  )
}));

jest.mock('primereact/inputnumber', () => ({
  InputNumber: ({ value, onValueChange, ...props }) => {
    const { 
      showButtons, 
      buttonLayout, 
      inputClassName, 
      decrementButtonClassName, 
      incrementButtonClassName,
      ...domProps 
    } = props;
    
    return (
      <div data-testid="prime-inputnumber" {...domProps}>
        <button onClick={() => onValueChange(value - 1)}>-</button>
        <input
          data-testid="quantity-input"
          value={value}
          onChange={(e) => onValueChange(parseInt(e.target.value))}
        />
        <button onClick={() => onValueChange(value + 1)}>+</button>
        <button 
          data-testid="test-null-value" 
          onClick={() => onValueChange(null)}
        >
          Test Null
        </button>
        <button 
          data-testid="test-object-without-value" 
          onClick={() => onValueChange({ someOtherProp: 'test' })}
        >
          Test Object
        </button>
        <button 
          data-testid="test-string-value" 
          onClick={() => onValueChange('5')}
        >
          Test String
        </button>
      </div>
    );
  }
}));

jest.mock('../../../context/CartContext', () => ({
  useCart: jest.fn()
}));

jest.mock('../../Product/ProductModal', () => {
  return function MockProductModal({ product, visible, onHide, fromCart }) {
    if (!visible) return null;
    return (
      <div data-testid="product-modal" data-from-cart={fromCart}>
        <div data-testid="modal-product-name">{product.name}</div>
        <button onClick={onHide}>Закрыть</button>
      </div>
    );
  };
});

describe('CartItem', () => {
  const mockItem = {
    id: 1,
    name: 'Тестовый товар',
    price: 1000,
    salePrice: 800,
    onSale: true,
    quantity: 2,
    size: 'M',
    image: '/images/test.jpg',
    shortDescription: 'Описание товара',
    brand: 'TestBrand',
    specifications: {
      Sizes: ['S', 'M', 'L', 'XL']
    }
  };

  const mockCartFunctions = {
    updateQuantity: jest.fn(),
    removeFromCart: jest.fn(),
    updateSize: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    const { useCart } = require('../../../context/CartContext');
    useCart.mockReturnValue(mockCartFunctions);
  });

  it('рендерит товар с основной информацией', () => {
    render(<CartItem item={mockItem} />);
    
    expect(screen.getByText('Тестовый товар')).toBeInTheDocument();
    expect(screen.getByText('Описание товара')).toBeInTheDocument();
    expect(screen.getByText('TestBrand')).toBeInTheDocument();
    expect(screen.getByText('800₽')).toBeInTheDocument();
    expect(screen.getByText('1000₽')).toBeInTheDocument();
    expect(screen.getByText('за шт.')).toBeInTheDocument();
    expect(screen.getByText('1 600₽')).toBeInTheDocument();
  });

  it('рендерит товар без скидки', () => {
    const itemWithoutSale = { ...mockItem, onSale: false, salePrice: null };
    render(<CartItem item={itemWithoutSale} />);
    
    expect(screen.getByText('1000₽')).toBeInTheDocument();
    expect(screen.queryByText('800₽')).not.toBeInTheDocument();
    expect(screen.getByText('2 000₽')).toBeInTheDocument();
  });

  it('рендерит товар без описания и бренда', () => {
    const itemWithoutOptional = { 
      ...mockItem, 
      shortDescription: null, 
      brand: null 
    };
    render(<CartItem item={itemWithoutOptional} />);
    
    expect(screen.queryByText('Описание товара')).not.toBeInTheDocument();
    expect(screen.queryByText('TestBrand')).not.toBeInTheDocument();
  });

  it('обрабатывает изменение количества', () => {
    render(<CartItem item={mockItem} />);
    
    const quantityInput = screen.getByTestId('quantity-input');
    fireEvent.change(quantityInput, { target: { value: '3' } });
    
    expect(mockCartFunctions.updateQuantity).toHaveBeenCalledWith(1, 3, 'M');
  });

  it('обрабатывает изменение количества через объект', () => {
    render(<CartItem item={mockItem} />);
    
    const quantityInput = screen.getByTestId('quantity-input');
    fireEvent.change(quantityInput, { target: { value: '5' } });
    
    expect(mockCartFunctions.updateQuantity).toHaveBeenCalledWith(1, 5, 'M');
  });

  it('обрабатывает изменение количества с объектом без value', () => {
    render(<CartItem item={mockItem} />);
    
    const objectButton = screen.getByTestId('test-object-without-value');
    fireEvent.click(objectButton);
    
    expect(mockCartFunctions.updateQuantity).toHaveBeenCalledWith(1, { someOtherProp: 'test' }, 'M');
  });

  it('обрабатывает изменение количества с null значением', () => {
    render(<CartItem item={mockItem} />);
    
    const nullButton = screen.getByTestId('test-null-value');
    fireEvent.click(nullButton);
    
    expect(mockCartFunctions.updateQuantity).toHaveBeenCalledWith(1, null, 'M');
  });

  it('обрабатывает изменение количества со строковым значением', () => {
    render(<CartItem item={mockItem} />);
    
    const stringButton = screen.getByTestId('test-string-value');
    fireEvent.click(stringButton);
    
    expect(mockCartFunctions.updateQuantity).toHaveBeenCalledWith(1, '5', 'M');
  });

  it('обрабатывает изменение размера', () => {
    render(<CartItem item={mockItem} />);
    
    const sizeSelect = screen.getByDisplayValue('M');
    fireEvent.change(sizeSelect, { target: { value: 'L' } });
    
    expect(mockCartFunctions.updateSize).toHaveBeenCalledWith(1, 'L', 2);
  });

  it('обрабатывает удаление товара', () => {
    render(<CartItem item={mockItem} />);
    
    const removeButton = screen.getByText('Удалить');
    fireEvent.click(removeButton);
    
    expect(mockCartFunctions.removeFromCart).toHaveBeenCalledWith(1, 'M');
  });

  it('открывает модальное окно при клике на название', () => {
    render(<CartItem item={mockItem} />);
    
    const nameButton = screen.getByText('Тестовый товар');
    fireEvent.click(nameButton);
    
    expect(screen.getByTestId('product-modal')).toBeInTheDocument();
    expect(screen.getByTestId('modal-product-name')).toHaveTextContent('Тестовый товар');
    expect(screen.getByTestId('product-modal')).toHaveAttribute('data-from-cart', 'true');
  });

  it('закрывает модальное окно', () => {
    render(<CartItem item={mockItem} />);
    
    const nameButton = screen.getByText('Тестовый товар');
    fireEvent.click(nameButton);
    expect(screen.getByTestId('product-modal')).toBeInTheDocument();
    
    const closeButton = screen.getByText('Закрыть');
    fireEvent.click(closeButton);
    
    expect(screen.queryByTestId('product-modal')).not.toBeInTheDocument();
  });

  it('обрабатывает ошибку загрузки изображения', () => {
    render(<CartItem item={mockItem} />);
    
    const image = screen.getByAltText('Тестовый товар');
    fireEvent.error(image);
    
    expect(image.src).toContain('/images/img-1.jpg');
  });

  it('рендерит опции размеров', () => {
    render(<CartItem item={mockItem} />);
    
    const sizeSelect = screen.getByDisplayValue('M');
    expect(sizeSelect).toBeInTheDocument();
    expect(sizeSelect).toHaveValue('M');
  });

  it('работает с товаром без спецификаций размеров', () => {
    const itemWithoutSizes = { ...mockItem, specifications: null };
    render(<CartItem item={itemWithoutSizes} />);
    
    const sizeSelect = screen.getByRole('combobox');
    expect(sizeSelect).toBeInTheDocument();
    expect(sizeSelect.children.length).toBe(0);
  });
}); 
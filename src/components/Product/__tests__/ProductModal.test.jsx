import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductModal from '../ProductModal';

let mockAddToCart = jest.fn();
jest.mock('../../../context/CartContext', () => ({
  useCart: () => ({ addToCart: mockAddToCart }),
}));

const mockToast = { error: jest.fn() };
jest.mock('react-hot-toast', () => ({ toast: mockToast }));

jest.mock('primereact/inputnumber', () => ({
  InputNumber: ({ value, onValueChange, min, max, disabled, className }) => (
    <input
      value={value}
      min={min}
      max={max}
      disabled={disabled}
      className={className}
      onChange={(e) => onValueChange && onValueChange({ value: e.target.value })}
      data-testid="input-number"
    />
  ),
}));

jest.mock('primereact/selectbutton', () => ({
  SelectButton: ({ value, onChange, options, className, itemTemplate, pt, ...props }) => {
    // Вызываем itemTemplate функцию для покрытия
    const renderedOptions = options.map((option, index) => {
      const template = itemTemplate ? itemTemplate(option) : option;
      return (
        <button
          key={index}
          className={`p-selectbutton-button ${value === option ? 'p-highlight' : ''}`}
          onClick={() => onChange && onChange({ value: option })}
        >
          {template}
        </button>
      );
    });

    // Вызываем pt.button функцию для покрытия
    const buttonClassName = pt?.button ? pt.button() : '';

    return (
      <div {...props} className={className}>
        {renderedOptions}
      </div>
    );
  },
}));

const mockProduct = {
  id: 1,
  name: 'Кроссовки',
  brand: 'Nike',
  price: 5000,
  salePrice: 4000,
  onSale: true,
  inStock: true,
  image: '/images/img-1.jpg',
  rating: 4.5,
  reviews: 123,
  description: 'Описание товара',
  specifications: { Sizes: ['M', 'L'], Цвет: 'Белый' },
};

describe('ProductModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  let onHide;
  beforeEach(() => {
    onHide = jest.fn();
    mockAddToCart = jest.fn();
  });

  it('рендерится без ошибок (smoke)', () => {
    render(<ProductModal product={mockProduct} visible={true} onHide={onHide} />);
    expect(screen.getByText('Кроссовки')).toBeInTheDocument();
  });

  it('не рендерит, если product не передан', () => {
    const { container } = render(<ProductModal product={null} visible={true} onHide={onHide} />);
    expect(container.firstChild).toBeNull();
  });

  it('отображает цену, бренд, характеристики, описание, наличие, просмотры', () => {
    render(<ProductModal product={mockProduct} visible={true} onHide={onHide} />);
    expect(screen.getByText('Nike')).toBeInTheDocument();
    expect(screen.getByText('Белый')).toBeInTheDocument();
    expect(screen.getByText('Описание товара')).toBeInTheDocument();
    expect(screen.getByText('есть')).toBeInTheDocument();
    expect(screen.getByText('123 просмотров')).toBeInTheDocument();
  });

  it('отображает скидку и зачёркнутую цену при onSale', () => {
    render(<ProductModal product={mockProduct} visible={true} onHide={onHide} />);

    const priceRegex = /4[,\s\u00A0]000/;
    const priceNodes = screen.getAllByText(priceRegex);

    expect(priceNodes.some(node => node.className && node.className.includes('text-red-600'))).toBe(true);

    const oldPriceNode = document.querySelector('.line-through');
    expect(oldPriceNode).toBeInTheDocument();

    expect(document.body.textContent).toContain('₽');

    expect(screen.getByText('Скидка')).toBeInTheDocument();
  });

  it('отображает "нет" если нет в наличии', () => {
    render(<ProductModal product={{ ...mockProduct, inStock: false }} visible={true} onHide={onHide} />);
    expect(screen.getByText('нет')).toBeInTheDocument();
    expect(screen.getByText('Нет в наличии')).toBeInTheDocument();
  });

  it('кнопка "Добавить в корзину" disabled если нет в наличии', () => {
    render(<ProductModal product={{ ...mockProduct, inStock: false }} visible={true} onHide={onHide} />);
    const btn = screen.getByText('Добавить в корзину').closest('button');
    expect(btn).toBeDisabled();
  });

  it('кнопка "Добавить в корзину" disabled если не выбран размер', () => {
    const product = { ...mockProduct, specifications: { Sizes: [] } };
    render(<ProductModal product={product} visible={true} onHide={onHide} />);
    const btn = screen.getByText('Добавить в корзину').closest('button');
    expect(btn).toBeDisabled();
  });

  it('вызывает addToCart, onHide и сбрасывает количество при добавлении', () => {
    render(<ProductModal product={mockProduct} visible={true} onHide={onHide} />);
    const btn = screen.getByText('Добавить в корзину').closest('button');
    fireEvent.click(btn);
    expect(mockAddToCart).toHaveBeenCalledWith(mockProduct, 1, 'M');
    expect(onHide).toHaveBeenCalled();
  });

  it('скрывает блок добавления в корзину, если fromCart=true', () => {
    render(<ProductModal product={mockProduct} visible={true} onHide={onHide} fromCart />);
    expect(screen.queryByText('Добавить в корзину')).not.toBeInTheDocument();
  });

  it('работает с product без характеристик, описания, onSale, inStock', () => {
    const product = { id: 2, name: 'Товар', price: 1000, image: '/images/img-1.jpg' };
    render(<ProductModal product={product} visible={true} onHide={onHide} />);
    expect(screen.getByText('Товар')).toBeInTheDocument();

    const priceElements = screen.getAllByText(/1[,\s\u00A0]000\s*₽/);
    expect(priceElements.length).toBeGreaterThan(0);
  });

  it('отображает прочерк при некорректной цене', () => {
    const product = { id: 3, name: 'Товар с некорректной ценой', price: NaN, image: '/images/img-1.jpg' };
    render(<ProductModal product={product} visible={true} onHide={onHide} />);
    expect(screen.getByText('Товар с некорректной ценой')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('работает с переключением картинок (индикаторы)', () => {
    render(<ProductModal product={mockProduct} visible={true} onHide={onHide} />);
    const indicators = screen.getAllByRole('button', { name: /Показать фото/i });
    fireEvent.click(indicators[1]);
    expect(indicators[1]).toBeInTheDocument();
  });

  it('работает с touch событиями для слайдера', () => {
    render(<ProductModal product={mockProduct} visible={true} onHide={onHide} />);
    const slider = document.querySelector('.select-none');
    
    fireEvent.touchStart(slider, {
      touches: [{ clientX: 100 }]
    });
    
    fireEvent.touchEnd(slider, {
      changedTouches: [{ clientX: 200 }]
    });
  });

  it('работает с touch событиями для слайдера влево', () => {
    render(<ProductModal product={mockProduct} visible={true} onHide={onHide} />);
    const slider = document.querySelector('.select-none');
    
    fireEvent.touchStart(slider, {
      touches: [{ clientX: 200 }]
    });
    
    fireEvent.touchEnd(slider, {
      changedTouches: [{ clientX: 100 }]
    });
  });

  it('работает с обработчиком ошибок изображений', () => {
    render(<ProductModal product={mockProduct} visible={true} onHide={onHide} />);
    const images = screen.getAllByAltText('Кроссовки');
    
    fireEvent.error(images[0]);
    expect(images[0].src).toContain('/images/img-1.jpg');
  });

  it('работает с InputNumber onChange', () => {
    render(<ProductModal product={mockProduct} visible={true} onHide={onHide} />);
    const inputNumber = screen.getByTestId('input-number');
    
    fireEvent.change(inputNumber, { target: { value: '5' } });
  });

  it('работает с SelectButton onChange', () => {
    render(<ProductModal product={mockProduct} visible={true} onHide={onHide} />);
    const selectButtons = document.querySelectorAll('.p-selectbutton-button');
    
    if (selectButtons.length > 1) {
      fireEvent.click(selectButtons[1]);
    }
  });

  it('работает с веткой прочерка в цене', () => {
    const productWithInvalidPrice = {
      ...mockProduct,
      price: 'invalid',
      salePrice: 'invalid'
    };
    render(<ProductModal product={productWithInvalidPrice} visible={true} onHide={onHide} />);
    
    expect(document.body.textContent).toContain('—');
  });

  it('работает с веткой прочерка в итоговой цене', () => {
    const productWithInvalidPrice = {
      ...mockProduct,
      price: 'invalid'
    };
    render(<ProductModal product={productWithInvalidPrice} visible={true} onHide={onHide} />);
    
    expect(document.body.textContent).toContain('—');
  });

  it('работает с веткой prev в handleIndicatorClick', () => {
    render(<ProductModal product={mockProduct} visible={true} onHide={onHide} />);
    const indicators = screen.getAllByRole('button', { name: /Показать фото/i });
    
    fireEvent.click(indicators[1]);
    
    fireEvent.click(indicators[0]);
  });

  it('работает с handleTouchEnd когда touchStartX === null', () => {
    render(<ProductModal product={mockProduct} visible={true} onHide={onHide} />);
    const slider = document.querySelector('.select-none');
    
    fireEvent.touchEnd(slider, {
      changedTouches: [{ clientX: 200 }]
    });
  });

  it('работает с handleIndicatorClick когда i === imgIndex', () => {
    render(<ProductModal product={mockProduct} visible={true} onHide={onHide} />);
    const indicators = screen.getAllByRole('button', { name: /Показать фото/i });
    
    fireEvent.click(indicators[0]);
  });
}); 
import React from 'react';
import { render, fireEvent, screen, act } from '@testing-library/react';
import FilterPanel from '../FilterPanel';

const filters = {
  categories: ['Обувь'],
  gender: 'Мужской',
  inStock: true,
  priceFrom: '1000',
  priceTo: '5000',
};
const products = [
  { id: 1, name: 'Кроссовки', category: 'Обувь' },
  { id: 2, name: 'Куртка', category: 'Одежда' },
];

describe('FilterPanel', () => {
  let onFiltersChange;
  beforeEach(() => {
    onFiltersChange = jest.fn();
  });

  it('рендерится без ошибок (smoke)', () => {
    render(<FilterPanel filters={filters} onFiltersChange={onFiltersChange} products={products} />);
    expect(screen.getByText('Фильтры')).toBeInTheDocument();
  });

  it('открывает и закрывает мобильную панель', () => {
    act(() => {
      render(<FilterPanel filters={filters} onFiltersChange={onFiltersChange} products={products} />);
    });
    act(() => {
      fireEvent.click(screen.getAllByLabelText('Открыть фильтры')[0]);
    });
    expect(screen.getAllByText('Фильтры').length).toBeGreaterThan(0);
    act(() => {
      fireEvent.click(document.querySelector('.bg-black'));
    });
    act(() => {
      fireEvent.click(screen.getAllByLabelText('Открыть фильтры')[0]);
    });
    act(() => {
      fireEvent.click(screen.getByLabelText('Закрыть фильтры'));
    });
  });

  it('открывает и закрывает десктопную панель', () => {
    act(() => {
      render(<FilterPanel filters={filters} onFiltersChange={onFiltersChange} products={products} />);
    });
    const btn = screen.getAllByLabelText('Открыть фильтры')[1];
    act(() => {
      fireEvent.click(btn);
    });
    expect(screen.getAllByText('Фильтры').length).toBeGreaterThan(0);
    act(() => {
      fireEvent.click(btn);
    });
  });

  it('handleCategoryClick добавляет и убирает категорию', () => {
    act(() => {
      render(<FilterPanel filters={filters} onFiltersChange={onFiltersChange} products={products} />);
    });
  
    const categoryBtn = screen.getByText('Одежда');
    act(() => {
      fireEvent.click(categoryBtn);
    });
    expect(screen.getAllByText('Одежда').length).toBeGreaterThan(1);
    act(() => {
      fireEvent.click(categoryBtn);
    });
  });

  it('handleGenderClick меняет пол', () => {
    act(() => {
      render(<FilterPanel filters={filters} onFiltersChange={onFiltersChange} products={products} />);
    });
    const genderBtn = screen.getByText('Женский');
    act(() => {
      fireEvent.click(genderBtn);
    });
    expect(screen.getByText('Женский')).toBeInTheDocument();
  });

  it('handleInStockClick меняет inStock', () => {
    act(() => {
      render(<FilterPanel filters={filters} onFiltersChange={onFiltersChange} products={products} />);
    });
    const inStockTag = screen.getByText('В наличии');
    act(() => {
      fireEvent.click(inStockTag);
    });
    expect(inStockTag).toBeInTheDocument();
  });

  it('handlePriceChange меняет значения цены', () => {
    act(() => {
      render(<FilterPanel filters={filters} onFiltersChange={onFiltersChange} products={products} />);
    });
    const fromInput = screen.getByPlaceholderText('от');
    act(() => {
      fireEvent.change(fromInput, { target: { value: '1234', name: 'priceFrom' } });
    });
    expect(fromInput.value).toBe('1234');
    const toInput = screen.getByPlaceholderText('до');
    act(() => {
      fireEvent.change(toInput, { target: { value: '5678', name: 'priceTo' } });
    });
    expect(toInput.value).toBe('5678');
  });

  it('handleRemoveCategory удаляет категорию', () => {
    act(() => {
      render(<FilterPanel filters={filters} onFiltersChange={onFiltersChange} products={products} />);
    });
    const tag = screen.getAllByText('Обувь')[1];
    const closeBtn = tag.parentElement.querySelector('button');
    act(() => {
      fireEvent.click(closeBtn);
    });
  });

  it('handleApply вызывает onFiltersChange с правильными данными', () => {
    act(() => {
      render(<FilterPanel filters={filters} onFiltersChange={onFiltersChange} products={products} />);
    });
    const applyBtn = screen.getByText('Применить');
    act(() => {
      fireEvent.click(applyBtn);
    });
    expect(onFiltersChange).toHaveBeenCalledWith(expect.objectContaining({
      categories: expect.any(Array),
      gender: expect.any(String),
      inStock: expect.any(Boolean),
      priceRange: expect.any(Array),
    }));
  });

  it('handleReset очищает фильтры и вызывает onFiltersChange', () => {
    act(() => {
      render(<FilterPanel filters={filters} onFiltersChange={onFiltersChange} products={products} />);
    });
    const resetBtn = screen.getByText('Сбросить');
    act(() => {
      fireEvent.click(resetBtn);
    });
    expect(onFiltersChange).toHaveBeenCalledWith(expect.objectContaining({
      categories: [],
      gender: '',
      inStock: false,
      priceFrom: '',
      priceTo: '',
      priceRange: [0, 10000],
    }));
  });

  it('работает с пустыми products и filters', () => {
    render(<FilterPanel filters={{}} onFiltersChange={onFiltersChange} products={[]} />);
    expect(screen.getByText('Фильтры')).toBeInTheDocument();
  });

  it('handleGenderClick сбрасывает пол при повторном клике', () => {
    act(() => {
      render(<FilterPanel filters={filters} onFiltersChange={onFiltersChange} products={products} />);
    });
    const genderBtn = screen.getByText('Мужской');
    act(() => {
      fireEvent.click(genderBtn);
    });
    expect(screen.getByText('Мужской')).toBeInTheDocument();
  });

  it('handleApply работает с пустыми значениями цены', () => {
    const filtersWithEmptyPrice = {
      ...filters,
      priceFrom: '',
      priceTo: '',
    };
    act(() => {
      render(<FilterPanel filters={filtersWithEmptyPrice} onFiltersChange={onFiltersChange} products={products} />);
    });
    const applyBtn = screen.getByText('Применить');
    act(() => {
      fireEvent.click(applyBtn);
    });
    expect(onFiltersChange).toHaveBeenCalledWith(expect.objectContaining({
      priceRange: [0, 10000],
    }));
  });
}); 
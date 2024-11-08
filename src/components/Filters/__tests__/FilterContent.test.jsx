import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import FilterContent from '../FilterContent';

const categories = ['Обувь', 'Одежда'];
const GENDERS = [
  { value: 'male', label: 'Муж' },
  { value: 'female', label: 'Жен' },
];
const localFilters = {
  categories: ['Обувь'],
  gender: 'male',
  inStock: true,
  priceFrom: '1000',
  priceTo: '5000',
};

describe('FilterContent', () => {
  let handlers;
  beforeEach(() => {
    handlers = {
      handleCategoryClick: jest.fn(),
      handleGenderClick: jest.fn(),
      handleInStockClick: jest.fn(),
      handlePriceChange: jest.fn(),
      handleRemoveCategory: jest.fn(),
      handleReset: jest.fn(),
      handleApply: jest.fn(),
    };
  });

  it('рендерит все фильтры и выбранные категории', () => {
    render(
      <FilterContent
        localFilters={localFilters}
        categories={categories}
        GENDERS={GENDERS}
        {...handlers}
      />
    );
    expect(screen.getByText('Категории')).toBeInTheDocument();
    expect(screen.getByText('Одежда')).toBeInTheDocument();
    expect(screen.getAllByText('Обувь').length).toBeGreaterThan(1);
    expect(screen.getByText('Пол')).toBeInTheDocument();
    expect(screen.getByText('Муж')).toBeInTheDocument();
    expect(screen.getByText('Жен')).toBeInTheDocument();
    expect(screen.getByText('В наличии')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('от')).toHaveValue('1000');
    expect(screen.getByPlaceholderText('до')).toHaveValue('5000');
    expect(screen.getByText('Вы выбрали:')).toBeInTheDocument();
    expect(screen.getByText('Сбросить')).toBeInTheDocument();
    expect(screen.getByText('Применить')).toBeInTheDocument();
  });

  it('вызывает handleCategoryClick при клике по категории', () => {
    render(
      <FilterContent
        localFilters={localFilters}
        categories={categories}
        GENDERS={GENDERS}
        {...handlers}
      />
    );
    fireEvent.click(screen.getByText('Одежда'));
    expect(handlers.handleCategoryClick).toHaveBeenCalledWith('Одежда');
  });

  it('вызывает handleGenderClick при клике по полу', () => {
    render(
      <FilterContent
        localFilters={localFilters}
        categories={categories}
        GENDERS={GENDERS}
        {...handlers}
      />
    );
    fireEvent.click(screen.getByText('Жен'));
    expect(handlers.handleGenderClick).toHaveBeenCalledWith('female');
  });

  it('вызывает handleInStockClick при клике по "В наличии"', () => {
    render(
      <FilterContent
        localFilters={localFilters}
        categories={categories}
        GENDERS={GENDERS}
        {...handlers}
      />
    );
    fireEvent.click(screen.getByText('В наличии'));
    expect(handlers.handleInStockClick).toHaveBeenCalled();
  });

  it('вызывает handlePriceChange при изменении цены', () => {
    render(
      <FilterContent
        localFilters={localFilters}
        categories={categories}
        GENDERS={GENDERS}
        {...handlers}
      />
    );
    fireEvent.change(screen.getByPlaceholderText('от'), { target: { value: '2000' } });
    expect(handlers.handlePriceChange).toHaveBeenCalled();
    fireEvent.change(screen.getByPlaceholderText('до'), { target: { value: '6000' } });
    expect(handlers.handlePriceChange).toHaveBeenCalled();
  });

  it('вызывает handleRemoveCategory при клике по крестику выбранной категории', () => {
    render(
      <FilterContent
        localFilters={localFilters}
        categories={categories}
        GENDERS={GENDERS}
        {...handlers}
      />
    );
    const btn = screen.getByLabelText('Убрать Обувь');
    fireEvent.click(btn);
    expect(handlers.handleRemoveCategory).toHaveBeenCalledWith('Обувь');
  });

  it('вызывает handleReset при клике по "Сбросить"', () => {
    render(
      <FilterContent
        localFilters={localFilters}
        categories={categories}
        GENDERS={GENDERS}
        {...handlers}
      />
    );
    fireEvent.click(screen.getByText('Сбросить'));
    expect(handlers.handleReset).toHaveBeenCalled();
  });

  it('вызывает handleApply при клике по "Применить"', () => {
    render(
      <FilterContent
        localFilters={localFilters}
        categories={categories}
        GENDERS={GENDERS}
        {...handlers}
      />
    );
    fireEvent.click(screen.getByText('Применить'));
    expect(handlers.handleApply).toHaveBeenCalled();
  });

  it('не рендерит блок "Вы выбрали", если нет выбранных категорий', () => {
    render(
      <FilterContent
        localFilters={{ ...localFilters, categories: [] }}
        categories={categories}
        GENDERS={GENDERS}
        {...handlers}
      />
    );
    expect(screen.queryByText('Вы выбрали:')).not.toBeInTheDocument();
  });

  it('корректно работает с пустыми categories и GENDERS', () => {
    render(
      <FilterContent
        localFilters={{ ...localFilters, categories: [] }}
        categories={[]}
        GENDERS={[]}
        {...handlers}
      />
    );

    expect(screen.getByText('Категории')).toBeInTheDocument();
    expect(screen.getByText('Пол')).toBeInTheDocument();
    expect(screen.getByText('В наличии')).toBeInTheDocument();
    expect(screen.getByText('Сбросить')).toBeInTheDocument();
    expect(screen.getByText('Применить')).toBeInTheDocument();
  });

  it('рендерит мобильный вариант', () => {
    render(
      <FilterContent
        localFilters={localFilters}
        categories={categories}
        GENDERS={GENDERS}
        variant="mobile"
        {...handlers}
      />
    );

    expect(screen.getByText('Категории').parentElement.parentElement.className).toContain('filters-mobile-vertical');
  });

  it('рендерит Tag "В наличии" с серым классом, если inStock=false', () => {
    render(
      <FilterContent
        localFilters={{ ...localFilters, inStock: false }}
        categories={categories}
        GENDERS={GENDERS}
        {...handlers}
      />
    );
 
    const tagValue = screen.getByText('В наличии');
    const tag = tagValue.closest('[data-pc-name="tag"]');
    expect(tag).toHaveClass('bg-gray-100');
  });
}); 
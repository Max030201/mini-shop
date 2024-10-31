import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchSortBar from '../SearchSortBar';

jest.mock('primereact/inputtext', () => ({
  InputText: ({ value, onChange, placeholder, className }) => (
    <input
      data-testid="search-input"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
    />
  )
}));

jest.mock('primereact/dropdown', () => ({
  Dropdown: ({ value, onChange, options, placeholder, className }) => (
    <select
      data-testid="sort-dropdown"
      value={value}
      onChange={(e) => onChange({ value: e.target.value })}
      className={className}
    >
      <option value="">{placeholder}</option>
      {options?.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}));

describe('SearchSortBar', () => {
  const mockSetSearchQuery = jest.fn();
  const mockSetSortBy = jest.fn();
  const defaultProps = {
    searchQuery: '',
    setSearchQuery: mockSetSearchQuery,
    sortBy: '',
    setSortBy: mockSetSortBy,
    sortOptions: [
      { label: 'По цене (возрастание)', value: 'price-asc' },
      { label: 'По цене (убывание)', value: 'price-desc' },
      { label: 'По названию', value: 'name' }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('отображает компонент с правильными лейблами', () => {
    render(<SearchSortBar {...defaultProps} />);
    
    expect(screen.getByText('Поиск товаров')).toBeInTheDocument();
    expect(screen.getByText('Сортировка')).toBeInTheDocument();
  });

  it('отображает поле поиска с правильным плейсхолдером', () => {
    render(<SearchSortBar {...defaultProps} />);
    
    const searchInput = screen.getByTestId('search-input');
    expect(searchInput).toHaveAttribute('placeholder', 'Введите название товара...');
  });

  it('отображает дропдаун сортировки', () => {
    render(<SearchSortBar {...defaultProps} />);
    
    const sortDropdown = screen.getByTestId('sort-dropdown');
    expect(sortDropdown).toBeInTheDocument();
  });

  it('отображает текущее значение поискового запроса', () => {
    render(<SearchSortBar {...defaultProps} searchQuery="тестовый запрос" />);
    
    const searchInput = screen.getByTestId('search-input');
    expect(searchInput).toHaveValue('тестовый запрос');
  });

  it('отображает текущее значение сортировки', () => {
    render(<SearchSortBar {...defaultProps} sortBy="price-asc" />);
    
    const sortDropdown = screen.getByTestId('sort-dropdown');
    expect(sortDropdown).toHaveValue('price-asc');
  });

  it('вызывает setSearchQuery при изменении поискового запроса', () => {
    render(<SearchSortBar {...defaultProps} />);
    
    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'новый запрос' } });
    
    expect(mockSetSearchQuery).toHaveBeenCalledWith('новый запрос');
  });

  it('вызывает setSearchQuery с пустой строкой при очистке поиска', () => {
    render(<SearchSortBar {...defaultProps} searchQuery="тестовый запрос" />);
    
    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: '' } });
    
    expect(mockSetSearchQuery).toHaveBeenCalledWith('');
  });

  it('вызывает setSortBy при изменении сортировки', () => {
    render(<SearchSortBar {...defaultProps} />);
    
    const sortDropdown = screen.getByTestId('sort-dropdown');
    fireEvent.change(sortDropdown, { target: { value: 'price-asc' } });
    
    expect(mockSetSortBy).toHaveBeenCalledWith('price-asc');
  });

  it('вызывает setSortBy с пустым значением при сбросе сортировки', () => {
    render(<SearchSortBar {...defaultProps} sortBy="price-asc" />);
    
    const sortDropdown = screen.getByTestId('sort-dropdown');
    fireEvent.change(sortDropdown, { target: { value: '' } });
    
    expect(mockSetSortBy).toHaveBeenCalledWith('');
  });

  it('имеет правильные CSS классы для адаптивности', () => {
    render(<SearchSortBar {...defaultProps} />);
    
    const container = screen.getByText('Поиск товаров').closest('div').parentElement;
    expect(container).toHaveClass('flex', 'flex-col', 'md:flex-row');
  });

  it('работает с пустыми sortOptions', () => {
    render(<SearchSortBar {...defaultProps} sortOptions={[]} />);
    
    const sortDropdown = screen.getByTestId('sort-dropdown');
    expect(sortDropdown).toBeInTheDocument();
  });

  it('работает с undefined sortOptions', () => {
    render(<SearchSortBar {...defaultProps} sortOptions={undefined} />);
    
    const sortDropdown = screen.getByTestId('sort-dropdown');
    expect(sortDropdown).toBeInTheDocument();
  });

  it('покрывает все строки кода компонента', () => {
    render(<SearchSortBar {...defaultProps} />);
    
    expect(screen.getByText('Поиск товаров')).toBeInTheDocument();
    expect(screen.getByText('Сортировка')).toBeInTheDocument();
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
    expect(screen.getByTestId('sort-dropdown')).toBeInTheDocument();
    
    const searchInput = screen.getByTestId('search-input');
    const sortDropdown = screen.getByTestId('sort-dropdown');
    
    fireEvent.change(searchInput, { target: { value: 'тест' } });
    fireEvent.change(sortDropdown, { target: { value: 'price-asc' } });
    
    expect(mockSetSearchQuery).toHaveBeenCalledWith('тест');
    expect(mockSetSortBy).toHaveBeenCalledWith('price-asc');
  });
}); 
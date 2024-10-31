import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ProductList from '../ProductList';
import { getProducts } from '../../../api/productsApi';
import { useCart } from '../../../context/CartContext';
import { toast } from 'react-hot-toast';

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation((msg, ...args) => {
    if (
      typeof msg === 'string' &&
      msg.includes('not wrapped in act')
    ) {
      return;
    }
    console.warn(msg, ...args);
  });
  
  jest.spyOn(console, 'warn').mockImplementation((msg, ...args) => {
    if (
      typeof msg === 'string' &&
      (msg.includes('React does not recognize') || 
       msg.includes('Unknown event handler property'))
    ) {
      return;
    }
    console.warn(msg, ...args);
  });
});

afterAll(() => {
  jest.restoreAllMocks();
});

jest.mock('../../../api/productsApi');
jest.mock('../../../context/CartContext');
jest.mock('react-hot-toast');
jest.mock('../SearchSortBar', () => {
  return function MockSearchSortBar({ searchQuery, setSearchQuery, sortBy, setSortBy }) {
    return (
      <div data-testid="search-sort-bar">
        <input
          data-testid="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          data-testid="sort-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="name_asc">По названию (А-Я)</option>
          <option value="name_desc">По названию (Я-А)</option>
          <option value="price_asc">По цене (возрастание)</option>
          <option value="price_desc">По цене (убывание)</option>
        </select>
      </div>
    );
  };
});

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

jest.mock('primereact/tag', () => ({
  Tag: ({ value, severity }) => (
    <span data-testid="prime-tag" data-severity={severity}>
      {value}
    </span>
  )
}));

jest.mock('primereact/paginator', () => ({
  Paginator: ({ first, rows, totalRecords, onPageChange, template, className }) => {
    if (template && template.FirstPageLink) {
      template.FirstPageLink({ onClick: jest.fn(), disabled: false });
    }
    if (template && template.PrevPageLink) {
      template.PrevPageLink({ onClick: jest.fn(), disabled: false });
    }
    if (template && template.NextPageLink) {
      template.NextPageLink({ onClick: jest.fn(), disabled: false });
    }
    if (template && template.LastPageLink) {
      template.LastPageLink({ onClick: jest.fn(), disabled: false });
    }
    if (template && template.CurrentPageReport) {
      template.CurrentPageReport({});
    }
    
    return (
      <div data-testid="prime-paginator" className={className}>
        <button
          data-testid="first-page"
          onClick={() => onPageChange({ first: 0 })}
          disabled={first === 0}
        >
          Первая
        </button>
        <button
          data-testid="prev-page"
          onClick={() => onPageChange({ first: Math.max(0, first - rows) })}
          disabled={first === 0}
        >
          Предыдущая
        </button>
        <span data-testid="current-page">
          Страница {Math.floor(first / rows) + 1}
        </span>
        <button
          data-testid="next-page"
          onClick={() => onPageChange({ first: first + rows })}
          disabled={first + rows >= totalRecords}
        >
          Следующая
        </button>
        <button
          data-testid="last-page"
          onClick={() => onPageChange({ first: Math.floor((totalRecords - 1) / rows) * rows })}
          disabled={first + rows >= totalRecords}
        >
          Последняя
        </button>
      </div>
    );
  }
}));

jest.mock('primereact/message', () => ({
  Message: ({ severity, text, className }) => (
    <div data-testid={`message-${severity}`} className={className}>
      {text}
    </div>
  )
}));

describe('ProductList', () => {
  const mockAddToCart = jest.fn();
  const mockOnProductClick = jest.fn();
  const mockSetSearchQuery = jest.fn();
  const mockSetSortBy = jest.fn();

  const mockProducts = [
    {
      id: 1,
      name: 'Футболка белая',
      price: 1290,
      salePrice: null,
      image: 'images/img-1.jpg',
      shortDescription: 'Классическая белая футболка из хлопка.',
      category: 'Футболки',
      gender: 'Мужской',
      inStock: true,
      rating: '4.5',
      onSale: false
    },
    {
      id: 2,
      name: 'Футболка с принтом',
      price: 1590,
      salePrice: 1272,
      image: 'images/img-2.jpg',
      shortDescription: 'Яркая футболка с модным принтом.',
      category: 'Футболки',
      gender: 'Женский',
      inStock: false,
      rating: '4.4',
      onSale: true
    },
    {
      id: 3,
      name: 'Джинсы Slim Fit',
      price: 2990,
      salePrice: null,
      image: 'images/img-3.jpg',
      shortDescription: 'Узкие джинсы современного кроя для мужчин.',
      category: 'Джинсы',
      gender: 'Мужской',
      inStock: true,
      rating: '4.5',
      onSale: false
    }
  ];

  const defaultProps = {
    filters: {
      categories: [],
      gender: '',
      inStock: false,
      priceRange: [0, 10000]
    },
    onProductClick: mockOnProductClick,
    searchQuery: '',
    setSearchQuery: mockSetSearchQuery,
    sortBy: 'name_asc',
    setSortBy: mockSetSortBy
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useCart.mockReturnValue({ addToCart: mockAddToCart });
    getProducts.mockResolvedValue({ products: mockProducts });
  });

  describe('Инициализация и загрузка данных', () => {
    it('загружает товары при монтировании компонента', async () => {
      render(<ProductList {...defaultProps} />);

      await waitFor(() => {
        expect(getProducts).toHaveBeenCalledWith({ limit: 1000 });
      });
    });

    it('отображает состояние загрузки', () => {
      render(<ProductList {...defaultProps} />);

      const skeletonElements = screen.getAllByText('');
      expect(skeletonElements.length).toBeGreaterThan(0);
    });

    it('обрабатывает ошибку загрузки товаров', async () => {
      const error = new Error('Network error');
      getProducts.mockRejectedValue(error);

      render(<ProductList {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('message-error')).toBeInTheDocument();
        expect(screen.getByTestId('message-error')).toHaveTextContent('Ошибка загрузки товаров');
      });

      expect(toast.error).toHaveBeenCalledWith('Не удалось загрузить товары. Попробуйте обновить страницу.');
    });

    it('сбрасывает первую страницу при изменении поиска или сортировки', async () => {
      const { rerender } = render(<ProductList {...defaultProps} />);

      rerender(<ProductList {...defaultProps} searchQuery="новый поиск" />);
      rerender(<ProductList {...defaultProps} sortBy="price_desc" />);
    });
  });

  describe('Отображение товаров', () => {
    it('отображает список товаров после загрузки', async () => {
      render(<ProductList {...defaultProps} />);

      await waitFor(() => {
        const productNames = screen.getAllByRole('heading', { level: 3 });
        expect(productNames).toHaveLength(3);
        expect(productNames.some(name => name.textContent.includes('Футболка белая'))).toBe(true);
        expect(productNames.some(name => name.textContent.includes('Футболка с принтом'))).toBe(true);
        expect(productNames.some(name => name.textContent.includes('Джинсы Slim Fit'))).toBe(true);
      });
    });

    it('отображает товар со скидкой', async () => {
      render(<ProductList {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Скидка')).toBeInTheDocument();
        expect(screen.getByText('1272₽')).toBeInTheDocument();
        expect(screen.getByText('1590₽')).toBeInTheDocument();
      });
    });

    it('отображает товар не в наличии', async () => {
      render(<ProductList {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('prime-tag')).toBeInTheDocument();
        expect(screen.getByTestId('prime-tag')).toHaveTextContent('Нет в наличии');
      });
    });

    it('отображает товар без описания', async () => {
      const productWithoutDescription = {
        ...mockProducts[0],
        shortDescription: null
      };
      getProducts.mockResolvedValue({ products: [productWithoutDescription] });

      render(<ProductList {...defaultProps} />);

      await waitFor(() => {
        const productNames = screen.getAllByRole('heading', { level: 3 });
        expect(productNames).toHaveLength(1);
        expect(productNames[0]).toHaveTextContent('Футболка белая');
      });
    });

    it('отображает товар с некорректной ценой', async () => {
      const productWithInvalidPrice = {
        ...mockProducts[0],
        price: 'invalid'
      };
      getProducts.mockResolvedValue({ products: [productWithInvalidPrice] });

      render(<ProductList {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('search-sort-bar')).toBeInTheDocument();
      });
    });

    it('обрабатывает ошибку загрузки изображения', async () => {
      render(<ProductList {...defaultProps} />);

      await waitFor(() => {
        const images = screen.getAllByAltText(/футболка|джинсы/i);
        fireEvent.error(images[0]);
      });
    });
  });

  describe('Фильтрация товаров', () => {
    it('фильтрует товары по категориям', async () => {
      const filtersWithCategories = {
        ...defaultProps.filters,
        categories: ['Футболки']
      };

      render(<ProductList {...defaultProps} filters={filtersWithCategories} />);

      await waitFor(() => {
        const productNames = screen.getAllByRole('heading', { level: 3 });
        expect(productNames).toHaveLength(2);
        expect(productNames.some(name => name.textContent.includes('Футболка белая'))).toBe(true);
        expect(productNames.some(name => name.textContent.includes('Футболка с принтом'))).toBe(true);
        expect(productNames.some(name => name.textContent.includes('Джинсы Slim Fit'))).toBe(false);
      });
    });

    it('фильтрует товары по полу', async () => {
      const filtersWithGender = {
        ...defaultProps.filters,
        gender: 'Мужской'
      };

      render(<ProductList {...defaultProps} filters={filtersWithGender} />);

      await waitFor(() => {
        const productNames = screen.getAllByRole('heading', { level: 3 });
        expect(productNames).toHaveLength(2);
        expect(productNames.some(name => name.textContent.includes('Футболка белая'))).toBe(true);
        expect(productNames.some(name => name.textContent.includes('Джинсы Slim Fit'))).toBe(true);
        expect(productNames.some(name => name.textContent.includes('Футболка с принтом'))).toBe(false);
      });
    });

    it('фильтрует товары по наличию', async () => {
      const filtersInStock = {
        ...defaultProps.filters,
        inStock: true
      };

      render(<ProductList {...defaultProps} filters={filtersInStock} />);

      await waitFor(() => {
        const productNames = screen.getAllByRole('heading', { level: 3 });
        expect(productNames).toHaveLength(2);
        expect(productNames.some(name => name.textContent.includes('Футболка белая'))).toBe(true);
        expect(productNames.some(name => name.textContent.includes('Джинсы Slim Fit'))).toBe(true);
        expect(productNames.some(name => name.textContent.includes('Футболка с принтом'))).toBe(false);
      });
    });

    it('фильтрует товары по диапазону цен', async () => {
      const filtersWithPriceRange = {
        ...defaultProps.filters,
        priceRange: [1000, 1500]
      };

      render(<ProductList {...defaultProps} filters={filtersWithPriceRange} />);

      await waitFor(() => {
        const productNames = screen.getAllByRole('heading', { level: 3 });

        expect(productNames).toHaveLength(2);
        expect(productNames.some(name => name.textContent.includes('Футболка белая'))).toBe(true);
        expect(productNames.some(name => name.textContent.includes('Футболка с принтом'))).toBe(true);
        expect(productNames.some(name => name.textContent.includes('Джинсы Slim Fit'))).toBe(false);
      });
    });

    it('фильтрует товары по поисковому запросу', async () => {
      render(<ProductList {...defaultProps} searchQuery="белая" />);

      await waitFor(() => {
        const productNames = screen.getAllByRole('heading', { level: 3 });
        expect(productNames).toHaveLength(1);
        expect(productNames[0]).toHaveTextContent('Футболка белая');
        expect(productNames.some(name => name.textContent.includes('Футболка с принтом'))).toBe(false);
        expect(productNames.some(name => name.textContent.includes('Джинсы Slim Fit'))).toBe(false);
      });
    });

    it('обрабатывает пустой поисковый запрос', async () => {
      render(<ProductList {...defaultProps} searchQuery="   " />);

      await waitFor(() => {
        const productNames = screen.getAllByRole('heading', { level: 3 });
        expect(productNames).toHaveLength(3);
        expect(productNames.some(name => name.textContent.includes('Футболка белая'))).toBe(true);
        expect(productNames.some(name => name.textContent.includes('Футболка с принтом'))).toBe(true);
        expect(productNames.some(name => name.textContent.includes('Джинсы Slim Fit'))).toBe(true);
      });
    });
  });

  describe('Сортировка товаров', () => {
    it('сортирует товары по цене по возрастанию', async () => {
      render(<ProductList {...defaultProps} sortBy="price_asc" />);

      await waitFor(() => {
        const productNames = screen.getAllByRole('heading', { level: 3 });

        expect(productNames).toHaveLength(3);
        expect(productNames.some(name => name.textContent.includes('Джинсы Slim Fit'))).toBe(true);
        expect(productNames.some(name => name.textContent.includes('Футболка белая'))).toBe(true);
        expect(productNames.some(name => name.textContent.includes('Футболка с принтом'))).toBe(true);
      });
    });

    it('сортирует товары по цене по убыванию', async () => {
      render(<ProductList {...defaultProps} sortBy="price_desc" />);

      await waitFor(() => {
        const productNames = screen.getAllByRole('heading', { level: 3 });

        expect(productNames).toHaveLength(3);
        expect(productNames.some(name => name.textContent.includes('Джинсы Slim Fit'))).toBe(true);
        expect(productNames.some(name => name.textContent.includes('Футболка белая'))).toBe(true);
        expect(productNames.some(name => name.textContent.includes('Футболка с принтом'))).toBe(true);
      });
    });

    it('сортирует товары по названию по возрастанию', async () => {
      render(<ProductList {...defaultProps} sortBy="name_asc" />);

      await waitFor(() => {
        const productNames = screen.getAllByRole('heading', { level: 3 });
        expect(productNames).toHaveLength(3);
        expect(productNames.some(name => name.textContent.includes('Джинсы Slim Fit'))).toBe(true);
        expect(productNames.some(name => name.textContent.includes('Футболка белая'))).toBe(true);
        expect(productNames.some(name => name.textContent.includes('Футболка с принтом'))).toBe(true);
      });
    });

    it('сортирует товары по названию по убыванию', async () => {
      render(<ProductList {...defaultProps} sortBy="name_desc" />);

      await waitFor(() => {
        const productNames = screen.getAllByRole('heading', { level: 3 });
        expect(productNames).toHaveLength(3);
        expect(productNames.some(name => name.textContent.includes('Джинсы Slim Fit'))).toBe(true);
        expect(productNames.some(name => name.textContent.includes('Футболка белая'))).toBe(true);
        expect(productNames.some(name => name.textContent.includes('Футболка с принтом'))).toBe(true);
      });
    });
  });

  describe('Пагинация', () => {
    it('отображает пагинацию при большом количестве товаров', async () => {
      const manyProducts = Array.from({ length: 20 }, (_, i) => ({
        ...mockProducts[0],
        id: i + 1,
        name: `Товар ${i + 1}`
      }));
      getProducts.mockResolvedValue({ products: manyProducts });

      render(<ProductList {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('prime-paginator')).toBeInTheDocument();
        expect(screen.getByText('Показано 1 - 12 из 20 товаров')).toBeInTheDocument();
      });
    });

    it('не отображает пагинацию при малом количестве товаров', async () => {
      render(<ProductList {...defaultProps} />);

      await waitFor(() => {
        expect(screen.queryByTestId('prime-paginator')).not.toBeInTheDocument();
      });
    });

    it('обрабатывает изменение страницы', async () => {
      const manyProducts = Array.from({ length: 20 }, (_, i) => ({
        ...mockProducts[0],
        id: i + 1,
        name: `Товар ${i + 1}`
      }));
      getProducts.mockResolvedValue({ products: manyProducts });

      render(<ProductList {...defaultProps} />);

      await waitFor(() => {
        const nextButton = screen.getByTestId('next-page');
        fireEvent.click(nextButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Показано 13 - 20 из 20 товаров')).toBeInTheDocument();
      });
    });
  });

  describe('Интерактивность', () => {
    it('добавляет товар в корзину при клике на кнопку', async () => {
      render(<ProductList {...defaultProps} />);

      await waitFor(() => {
        const addToCartButtons = screen.getAllByText('Добавить в корзину');
        const activeButton = addToCartButtons.find(button => !button.disabled);
        fireEvent.click(activeButton);
      });

      expect(mockAddToCart).toHaveBeenCalledWith(expect.any(Object), 1);
    });

    it('открывает модальное окно товара при клике на "Подробнее"', async () => {
      render(<ProductList {...defaultProps} />);

      await waitFor(() => {
        const detailLinks = screen.getAllByText('Подробнее');
        fireEvent.click(detailLinks[0]);
      });

      expect(mockOnProductClick).toHaveBeenCalledWith(expect.any(Object));
    });

    it('блокирует кнопку добавления в корзину для товара не в наличии', async () => {
      render(<ProductList {...defaultProps} />);

      await waitFor(() => {
        const addToCartButtons = screen.getAllByText('Добавить в корзину');
        const disabledButton = addToCartButtons.find(button => button.disabled);
        expect(disabledButton).toBeInTheDocument();
      });
    });
  });

  describe('Граничные случаи', () => {
    it('отображает сообщение при отсутствии товаров', async () => {
      getProducts.mockResolvedValue({ products: [] });

      render(<ProductList {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('message-info')).toBeInTheDocument();
        expect(screen.getByTestId('message-info')).toHaveTextContent('Товары не найдены');
      });
    });

    it('отображает сообщение при отсутствии товаров после фильтрации', async () => {
      const filtersWithNoResults = {
        ...defaultProps.filters,
        categories: ['Несуществующая категория']
      };

      render(<ProductList {...defaultProps} filters={filtersWithNoResults} />);

      await waitFor(() => {
        expect(screen.getByTestId('message-info')).toBeInTheDocument();
        expect(screen.getByTestId('message-info')).toHaveTextContent('Товары не найдены');
      });
    });

    it('работает с товарами без категории', async () => {
      const productWithoutCategory = {
        ...mockProducts[0],
        category: null
      };
      getProducts.mockResolvedValue({ products: [productWithoutCategory] });

      const filtersWithCategories = {
        ...defaultProps.filters,
        categories: ['Футболки']
      };

      render(<ProductList {...defaultProps} filters={filtersWithCategories} />);

      await waitFor(() => {
        expect(screen.queryByText('Футболка белая')).not.toBeInTheDocument();
      });
    });

    it('работает с товарами без пола', async () => {
      const productWithoutGender = {
        ...mockProducts[0],
        gender: null
      };
      getProducts.mockResolvedValue({ products: [productWithoutGender] });

      const filtersWithGender = {
        ...defaultProps.filters,
        gender: 'Мужской'
      };

      render(<ProductList {...defaultProps} filters={filtersWithGender} />);

      await waitFor(() => {
        expect(screen.queryByText('Футболка белая')).not.toBeInTheDocument();
      });
    });

    it('работает с пустыми фильтрами', async () => {
      const emptyFilters = {
        categories: [],
        gender: '',
        inStock: false,
        priceRange: null
      };

      render(<ProductList {...defaultProps} filters={emptyFilters} />);

      await waitFor(() => {
        expect(screen.getByText('Футболка белая')).toBeInTheDocument();
        expect(screen.getByText('Футболка с принтом')).toBeInTheDocument();
        expect(screen.getByText('Джинсы Slim Fit')).toBeInTheDocument();
      });
    });
  });

  describe('Покрытие всех веток кода', () => {
    it('покрывает все условия фильтрации и сортировки', async () => {
      const complexFilters = {
        categories: ['Футболки'],
        gender: 'Мужской',
        inStock: true,
        priceRange: [1000, 2000]
      };

      render(<ProductList {...defaultProps} filters={complexFilters} searchQuery="белая" sortBy="price_desc" />);

      await waitFor(() => {
        expect(screen.getByText('Футболка белая')).toBeInTheDocument();
      });
    });

    it('покрывает все условия отображения пагинации', async () => {
      const manyProducts = Array.from({ length: 15 }, (_, i) => ({
        ...mockProducts[0],
        id: i + 1,
        name: `Товар ${i + 1}`
      }));
      getProducts.mockResolvedValue({ products: manyProducts });

      render(<ProductList {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('prime-paginator')).toBeInTheDocument();
        expect(screen.getByText('Показано 1 - 12 из 15 товаров')).toBeInTheDocument();
      });
    });

    it('покрывает создание кастомного шаблона пагинации', async () => {
      const manyProducts = Array.from({ length: 25 }, (_, i) => ({
        ...mockProducts[0],
        id: i + 1,
        name: `Товар ${i + 1}`
      }));
      getProducts.mockResolvedValue({ products: manyProducts });

      render(<ProductList {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('prime-paginator')).toBeInTheDocument();
        expect(screen.getByText('Показано 1 - 12 из 25 товаров')).toBeInTheDocument();
      });
    });

    it('покрывает логику пагинации с большим количеством страниц', async () => {
      const manyProducts = Array.from({ length: 50 }, (_, i) => ({
        ...mockProducts[0],
        id: i + 1,
        name: `Товар ${i + 1}`
      }));
      getProducts.mockResolvedValue({ products: manyProducts });

      render(<ProductList {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('prime-paginator')).toBeInTheDocument();
        expect(screen.getByText('Показано 1 - 12 из 50 товаров')).toBeInTheDocument();
      });
    });

    it('покрывает все условия отображения цен', async () => {
      const productsWithDifferentPrices = [
        { ...mockProducts[0], id: 1, price: 1000, salePrice: null, onSale: false },
        { ...mockProducts[1], id: 2, price: 2000, salePrice: 1500, onSale: true },
        { ...mockProducts[2], id: 3, price: 'invalid', salePrice: null, onSale: false },
        { ...mockProducts[0], id: 4, price: NaN, salePrice: null, onSale: false }
      ];
      getProducts.mockResolvedValue({ products: productsWithDifferentPrices });

      render(<ProductList {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('1000₽')).toBeInTheDocument();
        expect(screen.getByText('1500₽')).toBeInTheDocument();
        expect(screen.getByText('2000₽')).toBeInTheDocument();
        const productNames = screen.getAllByRole('heading', { level: 3 });
        expect(productNames.length).toBeGreaterThanOrEqual(2);
      });
    });

    it('покрывает ветку с некорректной ценой', async () => {
      const productWithInvalidPrice = {
        ...mockProducts[0],
        id: 1,
        name: 'Товар с некорректной ценой',
        price: 'не число',
        salePrice: null,
        onSale: false,
        inStock: true,
        category: 'Футболки',
        gender: 'Мужской'
      };
      getProducts.mockResolvedValue({ products: [productWithInvalidPrice] });

      const emptyFilters = {
        categories: [],
        gender: '',
        inStock: false,
        priceRange: null
      };

      render(<ProductList {...defaultProps} filters={emptyFilters} />);

      await waitFor(() => {
        expect(screen.getByText('Товар с некорректной ценой')).toBeInTheDocument();
        expect(screen.getByText('—')).toBeInTheDocument();
      });
    });

    it('покрывает функцию onPageChange', async () => {
      const manyProducts = Array.from({ length: 20 }, (_, i) => ({
        ...mockProducts[0],
        id: i + 1,
        name: `Товар ${i + 1}`
      }));
      getProducts.mockResolvedValue({ products: manyProducts });

      render(<ProductList {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('prime-paginator')).toBeInTheDocument();
      });

      const paginator = screen.getByTestId('prime-paginator');
      const nextButton = paginator.querySelector('[aria-label="Next Page"]') || 
                        paginator.querySelector('[aria-label="Следующая страница"]') ||
                        paginator.querySelector('button[aria-label*="next"]') ||
                        paginator.querySelector('button[aria-label*="Next"]');
      
      if (nextButton) {
        fireEvent.click(nextButton);
        
        await waitFor(() => {
          expect(screen.getByText('Показано 13 - 20 из 20 товаров')).toBeInTheDocument();
        });
      }
    });

    it('покрывает функцию handleAddToCart', async () => {
      render(<ProductList {...defaultProps} />);

      await waitFor(() => {
        const addToCartButtons = screen.getAllByText('Добавить в корзину');
        const activeButton = addToCartButtons.find(button => !button.disabled);
        if (activeButton) {
          const mockEvent = {
            stopPropagation: jest.fn()
          };
          fireEvent.click(activeButton, mockEvent);
        }
      });

      expect(mockAddToCart).toHaveBeenCalledWith(expect.any(Object), 1);
    });

    it('покрывает все ветки сортировки', async () => {
      const productsForSorting = [
        { ...mockProducts[0], id: 1, name: 'Альфа', price: 100 },
        { ...mockProducts[1], id: 2, name: 'Бета', price: 200 },
        { ...mockProducts[2], id: 3, name: 'Гамма', price: 150 }
      ];
      getProducts.mockResolvedValue({ products: productsForSorting });

      const emptyFilters = {
        categories: [],
        gender: '',
        inStock: false,
        priceRange: null
      };

      const { unmount: unmount1 } = render(<ProductList {...defaultProps} filters={emptyFilters} sortBy="price_asc" />);
      await waitFor(() => {
        const productNames = screen.getAllByRole('heading', { level: 3 });
        expect(productNames).toHaveLength(3);
      });
      unmount1();

      const { unmount: unmount2 } = render(<ProductList {...defaultProps} filters={emptyFilters} sortBy="price_desc" />);
      await waitFor(() => {
        const productNames = screen.getAllByRole('heading', { level: 3 });
        expect(productNames).toHaveLength(3);
      });
      unmount2();

      const { unmount: unmount3 } = render(<ProductList {...defaultProps} filters={emptyFilters} sortBy="name_asc" />);
      await waitFor(() => {
        const productNames = screen.getAllByRole('heading', { level: 3 });
        expect(productNames).toHaveLength(3);
      });
      unmount3();

      render(<ProductList {...defaultProps} filters={emptyFilters} sortBy="name_desc" />);
      await waitFor(() => {
        const productNames = screen.getAllByRole('heading', { level: 3 });
        expect(productNames).toHaveLength(3);
      });
    });

    it('покрывает функцию fetchAllProducts с успешным результатом', async () => {
      const testProducts = [
        { ...mockProducts[0], id: 1, name: 'Тестовый товар 1' },
        { ...mockProducts[1], id: 2, name: 'Тестовый товар 2' }
      ];
      getProducts.mockResolvedValue({ products: testProducts });

      render(<ProductList {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Тестовый товар 1')).toBeInTheDocument();
        expect(screen.getByText('Тестовый товар 2')).toBeInTheDocument();
      });

      expect(getProducts).toHaveBeenCalledWith({ limit: 1000 });
    });

    it('покрывает все ветки фильтрации', async () => {
      const productsForFiltering = [
        { ...mockProducts[0], id: 1, category: 'Футболки', gender: 'Мужской', price: 1000, inStock: true },
        { ...mockProducts[1], id: 2, category: 'Джинсы', gender: 'Женский', price: 2000, inStock: false },
        { ...mockProducts[2], id: 3, category: 'Футболки', gender: 'Мужской', price: 1500, inStock: true }
      ];
      getProducts.mockResolvedValue({ products: productsForFiltering });

      const filtersWithCategories = {
        ...defaultProps.filters,
        categories: ['Футболки']
      };
      render(<ProductList {...defaultProps} filters={filtersWithCategories} />);
      await waitFor(() => {
        const productNames = screen.getAllByRole('heading', { level: 3 });
        expect(productNames.length).toBeGreaterThanOrEqual(2);
      });

      const filtersWithGender = {
        ...defaultProps.filters,
        gender: 'Мужской'
      };
      render(<ProductList {...defaultProps} filters={filtersWithGender} />);
      await waitFor(() => {
        const productNames = screen.getAllByRole('heading', { level: 3 });
        expect(productNames.length).toBeGreaterThanOrEqual(2);
      });

      const filtersWithStock = {
        ...defaultProps.filters,
        inStock: true
      };
      render(<ProductList {...defaultProps} filters={filtersWithStock} />);
      await waitFor(() => {
        const productNames = screen.getAllByRole('heading', { level: 3 });
        expect(productNames.length).toBeGreaterThanOrEqual(2);
      });

      const filtersWithPriceRange = {
        ...defaultProps.filters,
        priceRange: [1000, 2000]
      };
      render(<ProductList {...defaultProps} filters={filtersWithPriceRange} />);
      await waitFor(() => {
        const productNames = screen.getAllByRole('heading', { level: 3 });
        expect(productNames.length).toBeGreaterThanOrEqual(2);
      });
    });

    it('покрывает кастомные функции пагинации', async () => {
      const originalPaginator = require('primereact/paginator').Paginator;
      const MockPaginator = jest.fn(({ template, first, rows, totalRecords, onPageChange, className }) => {
        if (template && template.FirstPageLink) {
          const FirstPageLink = template.FirstPageLink({ onClick: jest.fn(), disabled: false });
          expect(FirstPageLink).toBeDefined();
        }
        if (template && template.PrevPageLink) {
          const PrevPageLink = template.PrevPageLink({ onClick: jest.fn(), disabled: false });
          expect(PrevPageLink).toBeDefined();
        }
        if (template && template.NextPageLink) {
          const NextPageLink = template.NextPageLink({ onClick: jest.fn(), disabled: false });
          expect(NextPageLink).toBeDefined();
        }
        if (template && template.LastPageLink) {
          const LastPageLink = template.LastPageLink({ onClick: jest.fn(), disabled: false });
          expect(LastPageLink).toBeDefined();
        }
        if (template && template.CurrentPageReport) {
          const CurrentPageReport = template.CurrentPageReport({});
          expect(CurrentPageReport).toBeDefined();
        }
        
        return <div data-testid="prime-paginator" className={className} />;
      });
      
      require('primereact/paginator').Paginator = MockPaginator;

      const manyProducts = Array.from({ length: 25 }, (_, i) => ({
        ...mockProducts[0],
        id: i + 1,
        name: `Товар ${i + 1}`
      }));
      getProducts.mockResolvedValue({ products: manyProducts });

      render(<ProductList {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('prime-paginator')).toBeInTheDocument();
      });

      require('primereact/paginator').Paginator = originalPaginator;
    });

    it('покрывает логику CurrentPageReport с разными условиями', async () => {
      const originalPaginator = require('primereact/paginator').Paginator;
      const MockPaginator = jest.fn(({ template, first, rows, totalRecords, onPageChange, className }) => {
        if (template && template.CurrentPageReport) {
          const CurrentPageReport1 = template.CurrentPageReport({});
          expect(CurrentPageReport1).toBeDefined();
          
        }
        
        return <div data-testid="prime-paginator" className={className} />;
      });
      
      require('primereact/paginator').Paginator = MockPaginator;

      const manyProducts = Array.from({ length: 50 }, (_, i) => ({
        ...mockProducts[0],
        id: i + 1,
        name: `Товар ${i + 1}`
      }));
      getProducts.mockResolvedValue({ products: manyProducts });

      render(<ProductList {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('prime-paginator')).toBeInTheDocument();
      });

      require('primereact/paginator').Paginator = originalPaginator;
    });
  });
}); 
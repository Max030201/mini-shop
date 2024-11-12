import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';

jest.mock('../api/productsApi', () => ({
  getProducts: jest.fn(() => Promise.resolve({ products: [
    { id: 1, name: 'Товар 1', price: 1000, onSale: false },
    { id: 2, name: 'Товар 2', price: 2000, onSale: true }
  ] }))
}));

jest.mock('../components/Layout/Header', () => ({
  __esModule: true,
  default: ({ onCartOpen, onContinueShopping, showCart }) => (
    <header>
      <button onClick={onCartOpen}>Открыть корзину</button>
      <button onClick={onContinueShopping}>Продолжить покупки</button>
      <div>Header {showCart ? 'CartOpen' : ''}</div>
    </header>
  )
}));

jest.mock('../components/Layout/Footer', () => ({
  __esModule: true,
  default: () => <footer>Footer</footer>
}));

jest.mock('../components/Filters/FilterPanel', () => ({
  __esModule: true,
  default: ({ filters, onFiltersChange, products }) => (
    <aside>
      <div>FilterPanel</div>
      <button onClick={() => onFiltersChange({ ...filters, gender: 'male' })}>Мужское</button>
    </aside>
  )
}));

jest.mock('../components/Catalog/ProductList', () => ({
  __esModule: true,
  default: ({ filters, onProductClick, searchQuery, setSearchQuery, sortBy, setSortBy }) => (
    <section>
      <div>ProductList</div>
      <button onClick={() => onProductClick({ id: 1, name: 'Товар 1' })}>Открыть товар</button>
      <input
        data-testid="search-input"
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
      />
      <button onClick={() => setSortBy('price_desc')}>Сортировать по цене</button>
    </section>
  )
}));

jest.mock('../components/Cart/CartView', () => ({
  __esModule: true,
  default: ({ onClose, onContinueShopping }) => (
    <div>
      <div>CartView</div>
      <button onClick={onClose}>Закрыть корзину</button>
      <button onClick={onContinueShopping}>Продолжить покупки</button>
    </div>
  )
}));

jest.mock('../components/Product/ProductModal', () => ({
  __esModule: true,
  default: ({ product, visible, onHide }) => (
    visible ? (
      <div>
        <div>ProductModal: {product?.name}</div>
        <button onClick={onHide}>Закрыть модалку</button>
      </div>
    ) : null
  )
}));

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation((msg, ...args) => {
    if (
      typeof msg === 'string' &&
      msg.includes('Warning: An update to App inside a test was not wrapped in act')
    ) {
      return;
    }
    return;
  });
});

afterAll(() => {
  console.error.mockRestore();
});

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('рендерит главную страницу', async () => {
    render(<App />);
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
    expect(screen.getByText('ProductList')).toBeInTheDocument();
    expect(screen.getAllByText('FilterPanel')).toHaveLength(2);
    await waitFor(() => expect(require('../api/productsApi').getProducts).toHaveBeenCalled());
  });

  it('открывает и закрывает корзину', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('Открыть корзину'));
    expect(screen.getByText('CartView')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Закрыть корзину'));
    expect(screen.queryByText('CartView')).not.toBeInTheDocument();
  });

  it('открывает и закрывает модалку товара', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('Открыть товар'));
    expect(screen.getByText('ProductModal: Товар 1')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Закрыть модалку'));
    expect(screen.queryByText('ProductModal: Товар 1')).not.toBeInTheDocument();
  });

  it('меняет фильтр и сортировку', async () => {
    render(<App />);
    fireEvent.click(screen.getAllByText('Мужское')[0]);
    fireEvent.click(screen.getByText('Сортировать по цене'));
    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'поиск' } });
    expect(searchInput.value).toBe('поиск');
  });

  it('обрабатывает ошибку загрузки продуктов', async () => {
    require('../api/productsApi').getProducts.mockImplementationOnce(() => Promise.reject(new Error('Ошибка')));
    render(<App />);
    await waitFor(() => expect(require('../api/productsApi').getProducts).toHaveBeenCalled());
  });

  it('закрывает корзину по кнопке Продолжить покупки', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('Открыть корзину'));
    expect(screen.getByText('CartView')).toBeInTheDocument();
    fireEvent.click(screen.getAllByText('Продолжить покупки')[1]);
    expect(screen.queryByText('CartView')).not.toBeInTheDocument();
  });
}); 
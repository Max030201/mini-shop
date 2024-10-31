jest.mock('react-hot-toast', () => ({
  __esModule: true,
  toast: { error: jest.fn() }
}));

import { getProducts, getProductById, getCategories } from '../productsApi';

const mockToast = require('react-hot-toast').toast;

describe('productsApi', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    mockToast.error.mockClear();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  describe('getProducts', () => {
    it('корректно формирует query string и возвращает данные', async () => {
      const mockData = [{ id: 1, name: 'Товар' }];
      fetch.mockResolvedValueOnce({ ok: true, json: async () => mockData });
      const params = {
        search: 'test',
        categories: ['A', 'B'],
        gender: 'male',
        inStock: true,
        onSale: true,
        sortBy: 'price',
        sortOrder: 'desc',
        minPrice: 100,
        maxPrice: 200,
        limit: 10
      };
      const result = await getProducts(params);
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('name_like=test'));
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('category=A'));
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('category=B'));
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('gender=male'));
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('inStock=true'));
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('onSale=true'));
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('_sort=price'));
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('_order=desc'));
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('price_gte=100'));
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('price_lte=200'));
      expect(result).toEqual({ products: mockData, totalCount: mockData.length });
    });

    it('работает с пустыми параметрами', async () => {
      const mockData = [{ id: 1 }];
      fetch.mockResolvedValueOnce({ ok: true, json: async () => mockData });
      const result = await getProducts();
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/products?'));
      expect(result).toEqual({ products: mockData, totalCount: mockData.length });
    });

    it('вызывает toast и бросает ошибку при не-OK ответе', async () => {
      fetch.mockResolvedValueOnce({ ok: false, status: 500 });
      await expect(getProducts()).rejects.toThrow('HTTP error! status: 500');
      expect(mockToast.error).toHaveBeenCalled();
    });

    it('вызывает toast и бросает ошибку при исключении', async () => {
      fetch.mockRejectedValueOnce(new Error('fail'));
      await expect(getProducts()).rejects.toThrow('fail');
      expect(mockToast.error).toHaveBeenCalled();
    });

    it('добавляет onSale=true в query string, если onSale: true', async () => {
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
      await getProducts({ onSale: true });
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('onSale=true'));
    });

    it('не добавляет onSale в query string, если onSale: false', async () => {
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
      await getProducts({ onSale: false });
      expect(fetch).not.toHaveBeenCalledWith(expect.stringContaining('onSale=true'));
    });

    it('не добавляет onSale в query string, если onSale: undefined', async () => {
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
      await getProducts({ onSale: undefined });
      expect(fetch).not.toHaveBeenCalledWith(expect.stringContaining('onSale=true'));
    });

    it('не добавляет onSale в query string, если onSale: null', async () => {
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
      await getProducts({ onSale: null });
      expect(fetch).not.toHaveBeenCalledWith(expect.stringContaining('onSale=true'));
    });

    it('не добавляет невалидные категории в query string', async () => {
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
      await getProducts({ categories: ['A', '', null, '   ', 'B'] });
      const url = fetch.mock.calls[0][0];
      expect(url).toContain('category=A');
      expect(url).toContain('category=B');
      expect(url).not.toMatch(/category=&/);
      expect(url).not.toMatch(/category=%20+/);
      expect(url).not.toMatch(/category=\s+/);
      expect(url).not.toContain('&&');
    });
  });

  describe('getProductById', () => {
    it('возвращает товар по id', async () => {
      const mockProduct = { id: 1, name: 'Товар' };
      fetch.mockResolvedValueOnce({ ok: true, json: async () => mockProduct });
      const result = await getProductById(1);
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/products/1'));
      expect(result).toEqual(mockProduct);
    });

    it('вызывает toast и бросает ошибку при не-OK ответе', async () => {
      fetch.mockResolvedValueOnce({ ok: false, status: 404 });
      await expect(getProductById(1)).rejects.toThrow('HTTP error! status: 404');
      expect(mockToast.error).toHaveBeenCalled();
    });

    it('вызывает toast и бросает ошибку при исключении', async () => {
      fetch.mockRejectedValueOnce(new Error('fail'));
      await expect(getProductById(1)).rejects.toThrow('fail');
      expect(mockToast.error).toHaveBeenCalled();
    });
  });

  describe('getCategories', () => {
    it('возвращает список категорий', async () => {
      const mockCategories = ['A', 'B'];
      fetch.mockResolvedValueOnce({ ok: true, json: async () => mockCategories });
      const result = await getCategories();
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/categories'));
      expect(result).toEqual(mockCategories);
    });

    it('вызывает toast и бросает ошибку при не-OK ответе', async () => {
      fetch.mockResolvedValueOnce({ ok: false, status: 500 });
      await expect(getCategories()).rejects.toThrow('HTTP error! status: 500');
      expect(mockToast.error).toHaveBeenCalled();
    });

    it('вызывает toast и бросает ошибку при исключении', async () => {
      fetch.mockRejectedValueOnce(new Error('fail'));
      await expect(getCategories()).rejects.toThrow('fail');
      expect(mockToast.error).toHaveBeenCalled();
    });
  });
}); 
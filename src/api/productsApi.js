import { toast } from 'react-hot-toast';

const isProduction = process.env.NODE_ENV === 'production';
const API_BASE_URL = isProduction 
  ? 'https://max030201.github.io/mini-shop-json'
  : 'http://localhost:3001';

// Функция для фильтрации товаров для продакшена
const filterProductsLocally = (products, params) => {
  let filtered = [...products];
  const {
    category,
    search,
    sortBy,
    sortOrder = 'asc',
    minPrice,
    maxPrice,
    gender,
    inStock,
    onSale,
    categories
  } = params;

  // Поиск
  if (search && search.trim().length > 0) {
    const searchTerm = search.trim().toLowerCase();
    filtered = filtered.filter(product =>
      product.name.toLowerCase().includes(searchTerm) ||
      (product.description && product.description.toLowerCase().includes(searchTerm))
    );
  }

  // Фильтрация по категориям (массив или одиночная)
  if (Array.isArray(categories) && categories.length > 0) {
    filtered = filtered.filter(product =>
      categories.includes(product.category)
    );
  } else if (category && category.trim()) {
    filtered = filtered.filter(product =>
      product.category === category.trim()
    );
  }

  // Фильтрация по полу
  if (gender && gender.trim()) {
    filtered = filtered.filter(product =>
      product.gender === gender.trim()
    );
  }

  // В наличии
  if (inStock) {
    filtered = filtered.filter(product => product.inStock);
  }

  // Со скидкой
  if (onSale) {
    filtered = filtered.filter(product => product.onSale);
  }

  // Цена от
  if (minPrice !== undefined && minPrice !== '') {
    filtered = filtered.filter(product => product.price >= minPrice);
  }

  // Цена до
  if (maxPrice !== undefined && maxPrice !== '') {
    filtered = filtered.filter(product => product.price <= maxPrice);
  }

  // Сортировка
  if (sortBy) {
    filtered.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
  }

  return filtered;
};

export const getProducts = async (params = {}) => {
  try {
    if (isProduction) {
      const response = await fetch(`${API_BASE_URL}/db.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const products = data.products || [];
      const filteredProducts = filterProductsLocally(products, params);
      
      return {
        products: filteredProducts,
        totalCount: filteredProducts.length
      };
    } else {
      const queryParams = new URLSearchParams();

      if (params.search && params.search.trim().length > 0) {
        queryParams.append('name_like', params.search.trim());
      }

      if (Array.isArray(params.categories) && params.categories.length > 0) {
        params.categories.forEach(cat => {
          if (cat && cat.trim()) {
            queryParams.append('category', cat.trim());
          }
        });
      } else if (params.category && params.category.trim()) {
        queryParams.append('category', params.category.trim());
      }

      if (params.gender && params.gender.trim()) {
        queryParams.append('gender', params.gender.trim());
      }

      if (params.inStock) {
        queryParams.append('inStock', 'true');
      }

      if (params.onSale) {
        queryParams.append('onSale', 'true');
      }

      if (params.sortBy) {
        queryParams.append('_sort', params.sortBy);
        queryParams.append('_order', params.sortOrder || 'asc');
      }

      if (params.minPrice !== undefined && params.minPrice !== '') {
        queryParams.append('price_gte', params.minPrice);
      }
      if (params.maxPrice !== undefined && params.maxPrice !== '') {
        queryParams.append('price_lte', params.maxPrice);
      }

      const response = await fetch(`${API_BASE_URL}/products?${queryParams}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const products = await response.json();
      return {
        products,
        totalCount: products.length
      };
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    toast.error('Не удалось загрузить товары. Попробуйте позже.');
    throw error;
  }
};

export const getProductById = async (id) => {
  try {
    if (isProduction) {
      const response = await fetch(`${API_BASE_URL}/db.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const product = data.products.find(p => p.id === parseInt(id));
      
      if (!product) {
        throw new Error('Product not found');
      }
      
      return product;
    } else {
      const response = await fetch(`${API_BASE_URL}/products/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    toast.error('Не удалось загрузить информацию о товаре.');
    throw error;
  }
};

export const getCategories = async () => {
  try {
    if (isProduction) {
      const response = await fetch(`${API_BASE_URL}/db.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const categories = [...new Set(data.products.map(p => p.category))];
      return categories;
    } else {
      const response = await fetch(`${API_BASE_URL}/categories`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
    toast.error('Не удалось загрузить категории товаров.');
    throw error;
  }
};
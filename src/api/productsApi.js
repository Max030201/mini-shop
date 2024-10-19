import { toast } from 'react-hot-toast';

const isProduction = process.env.NODE_ENV === 'production';
const API_BASE_URL = isProduction 
  ? 'https://max030201.github.io/mini-shop-json/db.json'
  : 'http://localhost:3001';

export const getProducts = async (params = {}) => {
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

  const queryParams = new URLSearchParams();

  if (search && search.trim().length > 0) {
    queryParams.append('name_like', search.trim());
  }

  if (Array.isArray(categories) && categories.length > 0) {
    categories.forEach(cat => {
      if (cat && cat.trim()) {
        queryParams.append('category', cat.trim());
      }
    });
  }

  if (gender && gender.trim()) {
    queryParams.append('gender', gender.trim());
  }

  if (inStock) {
    queryParams.append('inStock', 'true');
  }

  if (onSale) {
    queryParams.append('onSale', 'true');
  }

  if (sortBy) {
    queryParams.append('_sort', sortBy);
    queryParams.append('_order', sortOrder);
  }

  if (minPrice !== undefined && minPrice !== '') {
    queryParams.append('price_gte', minPrice);
  }
  if (maxPrice !== undefined && maxPrice !== '') {
    queryParams.append('price_lte', maxPrice);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/products?${queryParams}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const products = await response.json();
    return {
      products,
      totalCount: products.length
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    toast.error('Не удалось загрузить товары. Попробуйте позже.');
    throw error;
  }
};

export const getProductById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching product:', error);
    toast.error('Не удалось загрузить информацию о товаре.');
    throw error;
  }
};

export const getCategories = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    toast.error('Не удалось загрузить категории товаров.');
    throw error;
  }
}; 
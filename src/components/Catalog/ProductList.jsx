import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Paginator } from 'primereact/paginator';
import { Message } from 'primereact/message';
import { getProducts } from '../../api/productsApi';
import { useCart } from '../../context/CartContext';
import SearchSortBar from './SearchSortBar';
import { toast } from 'react-hot-toast';

const ProductList = ({ products: productsProp, filters, onProductClick, searchQuery, setSearchQuery, sortBy, setSortBy }) => {
  const [productsState, setProducts] = useState([]);
  const products = productsProp ?? productsState;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [first, setFirst] = useState(0);
  const [rows] = useState(12);
  const { addToCart } = useCart();

  const sortOptions = [
    { label: 'По названию (А-Я)', value: 'name_asc' },
    { label: 'По названию (Я-А)', value: 'name_desc' },
    { label: 'По цене (возрастание)', value: 'price_asc' },
    { label: 'По цене (убывание)', value: 'price_desc' }
  ];

  useEffect(() => {
    fetchAllProducts();
  }, []);

  useEffect(() => {
    setFirst(0);
  }, [searchQuery, sortBy]);

  const fetchAllProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getProducts({ limit: 1000 });
      setProducts(response.products);
    } catch (err) {
      setError('Ошибка загрузки товаров');
      toast.error('Не удалось загрузить товары. Попробуйте обновить страницу.');
    } finally {
      setLoading(false);
    }
  };

  const onPageChange = (event) => {
    setFirst(event.first);
  };

  const handleAddToCart = (product, event) => {
    event.stopPropagation();
    addToCart(product, 1);
  };

  const processedProducts = React.useMemo(() => {
    let arr = [...products];
    
    if (Array.isArray(filters.categories) && filters.categories.length > 0) {
      arr = arr.filter(p => filters.categories.includes(p.category?.trim()));
    }
    if (filters.gender && filters.gender.trim()) {
      arr = arr.filter(p => p.gender === filters.gender.trim());
    }
    if (filters.inStock) {
      arr = arr.filter(p => p.inStock === true);
    }
    if (filters.priceRange && filters.priceRange.length === 2) {
      arr = arr.filter(p => {
        const price = p.salePrice ?? p.price;
        return price >= filters.priceRange[0] && price <= filters.priceRange[1];
      });
    }
    if (searchQuery && searchQuery.trim().length > 0) {
      arr = arr.filter(p => p.name.toLowerCase().includes(searchQuery.trim().toLowerCase()));
    }
    
    if (sortBy === 'price_asc') {
      arr.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
    } else if (sortBy === 'price_desc') {
      arr.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
    } else if (sortBy === 'name_asc') {
      arr.sort((a, b) => a.name.localeCompare(b.name, 'ru', { sensitivity: 'base' }));
    } else if (sortBy === 'name_desc') {
      arr.sort((a, b) => b.name.localeCompare(a.name, 'ru', { sensitivity: 'base' }));
    }
    
    return arr;
  }, [products, filters, searchQuery, sortBy]);

  const paginatedProducts = processedProducts.slice(first, first + rows);

  const paginatorButtonStyle = "flex items-center justify-center min-w-[36px] min-h-[36px] rounded-lg hover:bg-blue-100 hover:text-blue-600 hover:scale-110 transition leading-none text-center";

  const customPaginatorTemplate = {
    layout: 'FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink',
    FirstPageLink: (options) => (
      <button
        type="button"
        className={paginatorButtonStyle}
        onClick={options.onClick}
        disabled={options.disabled}
        aria-label="Первая страница"
      >
        <img src={`${process.env.PUBLIC_URL}/images/arrow-double-left.svg`} alt="В начало" className="w-7 h-7" />
      </button>
    ),
    PrevPageLink: (options) => (
      <button
        type="button"
        className={paginatorButtonStyle}
        onClick={options.onClick}
        disabled={options.disabled}
        aria-label="Предыдущая страница"
      >
        <img src={`${process.env.PUBLIC_URL}/images/arrow-left.svg`} alt="Назад" className="w-5 h-5" />
      </button>
    ),
    NextPageLink: (options) => (
      <button
        type="button"
        className={paginatorButtonStyle}
        onClick={options.onClick}
        disabled={options.disabled}
        aria-label="Следующая страница"
      >
        <img src={`${process.env.PUBLIC_URL}/images/arrow-right.svg`} alt="Вперёд" className="w-5 h-5" />
      </button>
    ),
    LastPageLink: (options) => (
      <button
        type="button"
        className={paginatorButtonStyle}
        onClick={options.onClick}
        disabled={options.disabled}
        aria-label="Последняя страница"
      >
        <img src={`${process.env.PUBLIC_URL}/images/arrow-double-right.svg`} alt="В конец" className="w-7 h-7" />
      </button>
    ),
    CurrentPageReport: (options) => {
      const totalPages = Math.ceil(processedProducts.length / rows);
      const currentPage = Math.floor(first / rows) + 1;
      return (
        <span className="flex items-center justify-center min-w-[48px] min-h-[36px] text-xl font-bold bg-blue-50 rounded-lg">
          {totalPages > 1 && currentPage > 1 ? <span className="mx-1 text-gray-400 text-lg">…</span> : null}
          <span className="text-blue-900">{currentPage}</span>
          {totalPages > 1 && currentPage < totalPages ? <span className="mx-1 text-gray-400 text-lg">…</span> : null}
        </span>
      );
    }
  };

  if (error) {
    return (
      <div className="w-full flex justify-center items-center min-h-[300px]">
        <Message severity="error" text={error} className="w-full max-w-xl" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-md border border-gray-100 flex flex-col justify-between animate-pulse p-4">
              <div className="h-48 bg-gray-200 rounded-t-2xl mb-4" />
              <div className="h-6 bg-gray-200 rounded mb-2 w-3/4" />
              <div className="h-4 bg-gray-200 rounded mb-2 w-1/2" />
              <div className="h-4 bg-gray-200 rounded mb-4 w-1/3" />
              <div className="flex gap-2 mt-auto">
                <div className="h-10 bg-gray-200 rounded w-full" />
                <div className="h-10 bg-gray-200 rounded w-10" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="w-full">
        <SearchSortBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOptions={sortOptions}
        />
        <div className="flex justify-center items-center min-h-[300px]">
          <Message severity="info" text="Товары не найдены. Попробуйте изменить фильтры или поисковый запрос." className="w-full max-w-xl" />
        </div>
      </div>
    );
  }

  if (!loading && !error && products.length > 0 && processedProducts.length === 0) {
    return (
      <div className="w-full">
        <SearchSortBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOptions={sortOptions}
        />
        <div className="flex justify-center items-center min-h-[300px]">
          <Message severity="info" text="Товары не найдены. Попробуйте изменить фильтры или поисковый запрос." className="w-full max-w-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col flex-1 min-h-0 h-full max-w-7xl mx-auto">
      <div className="p-4 flex flex-col flex-1 min-h-0 h-full">
        <SearchSortBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOptions={sortOptions}
        />

        <div className="flex-1 min-h-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
            {paginatedProducts && paginatedProducts.map((product) => (
            <div key={product.id} className="h-full flex flex-col">
              <div className="bg-white rounded-2xl shadow-md hover:shadow-xl h-full min-h-[290px] transition-shadow duration-300 border border-gray-100 cursor-pointer p-0">
                <div className="flex flex-col h-full">
                  <div className="relative">
                    <img
                      src={`${process.env.PUBLIC_URL}/${product.image}`}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-t-2xl shadow-sm"
                      onError={(e) => {
                        e.target.src = `${process.env.PUBLIC_URL}/images/img-1.jpg`;
                      }}
                    />
                    {product.onSale && (
                      <span className="absolute top-2 right-2 text-red-600 font-bold bg-white bg-opacity-80 rounded px-2 py-0.5 text-sm shadow">Скидка</span>
                    )}
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-t-2xl">
                        <Tag value="Нет в наличии" severity="warning" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-h-0 flex flex-col p-4 pb-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mb-0">{product.name}</h3>
                      <div className="flex items-center gap-1 ml-2">
                        <span className="text-sm text-gray-500">{product.rating}</span>
                      </div>
                    </div>
                    {product.shortDescription && (
                      <div className="text-sm text-gray-500 mb-2 line-clamp-2">{product.shortDescription}</div>
                    )}
                    <div className="flex items-center gap-2 mb-3">
                      {product.onSale ? (
                        <>
                          <span className="text-lg font-bold text-red-600">{product.salePrice}₽</span>
                          <span className="text-sm text-gray-400 line-through">{product.price}₽</span>
                        </>
                      ) : (
                        <span className="text-lg font-bold text-gray-900">
                          {typeof product.price === 'number' && !isNaN(product.price) ? product.price + '₽' : '—'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-auto px-4 pb-4 items-center">
                    <a
                      href="#"
                      className="text-blue-700 text-sm font-semibold hover:underline focus:underline cursor-pointer"
                      onClick={e => { e.preventDefault(); onProductClick(product); }}
                    >
                      Подробнее
                    </a>
                    <Button
                      label="Добавить в корзину"
                      className="!bg-blue-600 !text-white !border-blue-600 hover:!bg-blue-700 hover:!border-blue-700 focus:!ring-2 focus:!ring-blue-300 px-3 py-2 rounded-lg text-sm font-semibold transition w-full"
                      disabled={!product.inStock}
                      onClick={(e) => handleAddToCart(product, e)}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
        
        {processedProducts.length > rows && (
          <div className="mt-6 flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
          <Paginator
            first={first}
            rows={rows}
                totalRecords={processedProducts.length}
            onPageChange={onPageChange}
                template={customPaginatorTemplate}
                className="border-none text-lg"
              />
            </div>
            <div className="text-gray-500 text-sm mt-2 text-center">
              Показано {first + 1} - {Math.min(first + rows, processedProducts.length)} из {processedProducts.length} товаров
            </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default ProductList; 
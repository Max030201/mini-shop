import React, { useState, useMemo } from 'react';
import { Panel } from 'primereact/panel';
import FilterContent from './FilterContent';

const GENDERS = [
  { label: 'Мужской', value: 'Мужской' },
  { label: 'Женский', value: 'Женский' },
];

const FilterPanel = ({ filters, onFiltersChange, products = [] }) => {
  const [localFilters, setLocalFilters] = useState({
    ...filters,
    categories: filters.categories || [],
    gender: filters.gender || '',
    inStock: filters.inStock || false,
    priceFrom: filters.priceFrom || '',
    priceTo: filters.priceTo || '',
  });
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleCategoryClick = (cat) => {
    setLocalFilters((prev) => {
      const exists = prev.categories.includes(cat);
      return {
        ...prev,
        categories: exists
          ? prev.categories.filter((c) => c !== cat)
          : [...prev.categories, cat],
      };
    });
  };
  
  const handleGenderClick = (gender) => {
    setLocalFilters((prev) => ({ ...prev, gender: prev.gender === gender ? '' : gender }));
  };
  
  const handleInStockClick = () => {
    setLocalFilters((prev) => ({ ...prev, inStock: !prev.inStock }));
  };
  
  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters((prev) => ({ ...prev, [name]: value.replace(/\D/g, '') }));
  };
  
  const handleRemoveCategory = (cat) => {
    setLocalFilters((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c !== cat),
    }));
  };
  
  const handleApply = () => {
    const apiFilters = {
      ...filters,
      categories: localFilters.categories,
      gender: localFilters.gender,
      inStock: localFilters.inStock,
      priceRange: [
        localFilters.priceFrom ? parseInt(localFilters.priceFrom) : 0,
        localFilters.priceTo ? parseInt(localFilters.priceTo) : 10000,
      ],
    };
    onFiltersChange(apiFilters);
  };
  
  const handleReset = () => {
    const cleared = {
      categories: [],
      gender: '',
      inStock: false,
      priceFrom: '',
      priceTo: '',
      priceRange: [0, 10000],
    };
    setLocalFilters(cleared);
    onFiltersChange(cleared);
  };

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean));
    return Array.from(set).sort();
  }, [products]);

  const filterContentProps = {
    localFilters,
    categories,
    GENDERS,
    handleCategoryClick,
    handleGenderClick,
    handleInStockClick,
    handlePriceChange,
    handleRemoveCategory,
    handleReset,
    handleApply,
    className: "flex flex-col gap-8 sm:gap-3"
  };

  return (
    <>
      <div className={`fixed top-[72px] right-0 h-auto bg-white shadow-lg z-50 transition-transform duration-300 rounded-l-2xl overflow-y-auto lg:hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between h-14 px-4 border-b border-gray-100 filters-mobile-header">
          <span className="font-semibold text-lg text-gray-700 filters-title">Фильтры</span>
      <button
        type="button"
            className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-gray-100 transition"
            onClick={() => setIsOpen(false)}
            aria-label="Закрыть фильтры"
      >
            <img src="/images/close.svg" alt="Закрыть" className="w-6 h-6" />
      </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 filters-panel-content">
          <Panel className="border-none shadow-none bg-transparent p-0">
            <FilterContent
              {...filterContentProps}
              variant="mobile"
            />
          </Panel>
        </div>
      </div>

      <div className={`transition-all duration-300 flex flex-col shadow-lg border-r border-gray-200 bg-white
        ${isPanelOpen ? 'w-80' : 'w-14'}
        h-full static z-0
        hidden lg:flex
      `}>
        <div className="flex items-center justify-start h-12 w-full pl-2">
          <button
            type="button"
            className="flex items-center justify-center h-10 w-10 rounded-lg hover:bg-blue-50 transition"
            onClick={() => setIsPanelOpen((prev) => !prev)}
            aria-label="Открыть фильтры"
          >
            <img src="/images/filter_icon.svg" className={`w-7 h-7 ${isPanelOpen ? 'text-blue-600' : 'text-gray-500'}`} alt="filter icon" />
          </button>
        </div>
        <div className={`transition-all duration-300 overflow-hidden ${isPanelOpen ? 'opacity-100 pointer-events-auto px-4' : 'opacity-0 pointer-events-none w-0 px-0'} flex-1`}> 
          {isPanelOpen && (
            <Panel className="border-none shadow-none bg-transparent p-0" >
              <FilterContent
                {...filterContentProps}
                variant="desktop"
              />
            </Panel>
          )}
        </div>
      </div>

      <div className={`fixed inset-0 bg-black bg-opacity-30 z-30 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} lg:hidden`} onClick={() => setIsOpen(false)} aria-hidden="true" />

      <button
        type="button"
        className="fixed top-[80px] right-6 z-40 flex items-center justify-center h-12 w-12 rounded-full bg-blue-500 text-white shadow-lg lg:hidden"
        onClick={() => setIsOpen(true)}
        aria-label="Открыть фильтры"
      >
        <img src="/images/filter_icon.svg" className="w-7 h-7" alt="filter icon" />
      </button>
    </>
  );
};

export default FilterPanel; 
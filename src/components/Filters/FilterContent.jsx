import React from 'react';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';

const FilterContent = ({
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
  className = '',
  variant = 'desktop',
}) => (
  <div className={className}>
    <div className={variant === 'mobile' ? 'flex flex-row gap-10 lg:flex-col filters-mobile-vertical' : 'flex flex-row gap-10 lg:flex-col max-w-[470px]:flex-col max-w-[470px]:gap-2'}>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-base text-gray-700 mb-2 sm:mb-1">Категории</div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`relative text-left font-medium rounded select-none transition focus:outline-none flex items-center w-full whitespace-nowrap
                text-xs h-7 lg:text-xs lg:h-8
                ${localFilters.categories.includes(cat)
                  ? 'text-blue-700 font-semibold underline underline-offset-4'
                  : 'text-gray-700 hover:text-blue-500'}`}
              style={{ background: 'none', border: 'none', padding: 0, boxShadow: 'none' }}
              onClick={() => handleCategoryClick(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-4 flex-1 min-w-0">
        <div>
          <div className="font-semibold text-base text-gray-700 mb-2 sm:mb-1">Пол</div>
          <div className="flex flex-wrap gap-2">
            {GENDERS.map((g) => (
              <Tag
                key={g.value}
                value={g.label}
                className={`cursor-pointer px-2 py-1 text-sm rounded-md border transition ${localFilters.gender === g.value ? 'bg-blue-500 text-white border-blue-500' : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-300'}`}
                onClick={() => handleGenderClick(g.value)}
              />
            ))}
          </div>
        </div>
        <div>
          <div className="font-semibold text-base text-gray-700 mb-2 sm:mb-1">Наличие</div>
          <Tag
            value="В наличии"
            className={`cursor-pointer px-2 py-1 text-sm rounded-md border transition ${localFilters.inStock ? 'bg-green-500 text-white border-green-500' : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-green-50 hover:border-green-300'}`}
            onClick={handleInStockClick}
          />
        </div>
        <div>
          <div className="font-semibold text-base text-gray-700 mb-2 sm:mb-1">Цена (₽)</div>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              name="priceFrom"
              value={localFilters.priceFrom}
              onChange={handlePriceChange}
              placeholder="от"
              className="w-16 px-1.5 py-1 rounded-md border border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition text-center text-sm"
              inputMode="numeric"
            />
            <span className="text-gray-500">—</span>
            <input
              type="text"
              name="priceTo"
              value={localFilters.priceTo}
              onChange={handlePriceChange}
              placeholder="до"
              className="w-16 px-1.5 py-1 rounded-md border border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition text-center text-sm"
              inputMode="numeric"
            />
          </div>
        </div>
      </div>
    </div>
    {localFilters.categories.length > 0 && (
      <div className="mb-2 sm:mb-1">
        <div className="font-semibold text-gray-700 mb-1">Вы выбрали:</div>
        <div className="grid grid-cols-2 gap-2">
          {localFilters.categories.map((cat) => (
            <div key={cat} className="flex items-center bg-transparent rounded text-xs font-medium">
              <span className="truncate">{cat}</span>
              <button
                type="button"
                className="ml-1 w-4 h-4 inline-flex items-center justify-center text-blue-500 hover:text-red-500 transition p-0"
                style={{ transform: 'rotate(45deg)', fontSize: '1rem', lineHeight: 1 }}
                onClick={() => handleRemoveCategory(cat)}
                aria-label={`Убрать ${cat}`}
              >
                +
              </button>
            </div>
          ))}
        </div>
      </div>
    )}
    <div className={variant === 'mobile' ? 'flex flex-col gap-2 mt-2 self-end filters-mobile-buttons-row' : 'flex flex-col lg:flex-row gap-2 mt-2 self-end'}>
      <Button
        label="Сбросить"
        className="filter-btn bg-white border border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-400 w-auto px-4 py-2 rounded-lg transition"
        onClick={handleReset}
      />
      <Button
        label="Применить"
        className="filter-btn bg-blue-500 text-white hover:bg-blue-600 w-auto px-4 py-2 rounded-lg shadow hover:scale-105 transition-transform"
        onClick={handleApply}
      />
    </div>
  </div>
);

export default FilterContent; 
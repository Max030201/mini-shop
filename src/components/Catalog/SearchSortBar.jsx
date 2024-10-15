import React from 'react';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';

const SearchSortBar = ({ searchQuery, setSearchQuery, sortBy, setSortBy, sortOptions }) => {
  return (
    <div className="mb-6 p-3 md:p-6 px-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-sm border border-blue-100">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1">
            Поиск товаров
          </label>
          <div className="w-full">
            <InputText
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Введите название товара..."
              className="w-full rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-300 text-xs py-1.5 px-2 md:text-base md:py-2 md:px-3 bg-white shadow-sm hover:shadow-md"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <div className="w-full md:w-80">
            <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1">
              Сортировка
            </label>
            <Dropdown
              value={sortBy}
              onChange={(e) => setSortBy(e.value)}
              options={sortOptions}
              placeholder="Выберите сортировку"
              className="w-full rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-300 text-xs py-1.5 px-2 md:text-base md:py-2 md:px-3 bg-white shadow-sm hover:shadow-md"
              panelClassName="rounded-xl shadow-lg border border-gray-200 bg-white text-base px-3"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchSortBar; 
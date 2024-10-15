import React from 'react';
import { Divider } from 'primereact/divider';

const Footer = () => {
  return (
    <footer className="w-full bg-gray-900 text-gray-200 mt-auto border-t border-gray-800">
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-lg font-semibold m-0 text-white">Mini Shop</h3>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Ваш надежный партнер в мире моды. Мы предлагаем качественную одежду и аксессуары по доступным ценам.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-lg font-semibold m-0 text-white">Контакты</h3>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">+7 (999) 123-45-67</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">info@minishop.ru</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">г. Москва, ул. Примерная, 123</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Пн-Вс: 9:00 - 21:00</span>
              </div>
            </div>
          </div>
        </div>

        <Divider className="border-gray-700 my-4" />

        <div className="flex flex-col justify-center items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm">
              2024 Mini Shop. Все права защищены.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 
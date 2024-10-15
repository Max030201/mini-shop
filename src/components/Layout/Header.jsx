import React from 'react';
import { Toolbar } from 'primereact/toolbar';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import { useCart } from '../../context/CartContext';

const Header = ({ onCartOpen, onContinueShopping, showCart }) => {
  const { getCartItemCount } = useCart();

  const startContent = (
    <div className="flex items-center gap-3">
      <Avatar 
        image="/images/logo.jpg" 
        size="large" 
        shape="circle"
        className="border-2 border-blue-500 shadow-md" />
      <span className="text-2xl font-bold text-gray-800 tracking-tight whitespace-nowrap">Mini Shop</span>
    </div>
  );

  const endContent = (
    <div className="flex items-center gap-2 ml-2">
      {showCart ? (
        <Button
          onClick={onContinueShopping}
          className="flex items-center whitespace-nowrap bg-white border border-gray-300 text-gray-900 font-medium rounded-lg px-2 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm md:px-4 md:py-2 md:text-base shadow hover:bg-gray-100 transition relative"
        >
          <img src="/images/arrow-left.svg" alt="В магазин" className="w-5 h-5 mr-2" />
          <span>В магазин</span>
        </Button>
      ) : (
      <Button
        onClick={onCartOpen}
        className="flex items-center whitespace-nowrap bg-white border border-gray-300 text-gray-900 font-medium rounded-lg px-2 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm md:px-4 md:py-2 md:text-base shadow hover:bg-gray-100 transition relative"
      >
        <img src="/images/basket.svg" alt="Корзина" className="w-5 h-5 mr-2" />
        <span>Корзина</span>
        {getCartItemCount() > 0 && (
          <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full min-w-[20px] h-[20px]">
            {getCartItemCount()}
          </span>
        )}
      </Button>
      )}
    </div>
  );

  return (
    <Toolbar
      start={startContent}
      end={endContent}
      className="bg-white shadow-md border-b border-gray-100 sticky top-0 z-30 min-h-[72px] px-4 flex-nowrap"
    />
  );
};

export default Header; 
import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { useCart } from '../../context/CartContext';
import ProductModal from '../../components/Product/ProductModal';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart, updateSize } = useCart();
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedSize, setSelectedSize] = useState(item.size);

  const handleQuantityChange = (e) => {
    const value = typeof e === 'object' && e !== null && 'value' in e ? e.value : e;
    updateQuantity(item.id, value, selectedSize);
  };

  const handleSizeChange = (size) => {
    setSelectedSize(size);
    updateSize(item.id, size, item.quantity);
  };

  const handleRemove = () => {
    removeFromCart(item.id, item.size);
  };

  const itemTotal = (item.onSale ? item.salePrice : item.price) * item.quantity;

  return (
    <Card className="border border-gray-200 rounded-xl shadow-sm bg-white">
      <div className="flex flex-col md:flex-row items-stretch gap-4 pr-4 pl-4 py-4">
        <div className="flex-shrink-0 w-full md:w-auto flex justify-center md:block mb-2 md:mb-0">
          <img
            src={`${process.env.PUBLIC_URL}/${item.image}`}
            alt={item.name}
            className="w-32 h-32 object-cover rounded-lg shadow"
            onError={(e) => {
              e.target.src = `${process.env.PUBLIC_URL}/images/img-1.jpg`;
            }}
          />
        </div>

        <div className="flex-1 min-w-0 w-full">
          <h4 className="text-base font-semibold text-blue-700 mb-1 line-clamp-2">
            <button
              className="text-left hover:underline focus:outline-none"
              onClick={() => setShowProductModal(true)}
              type="button"
            >
              {item.name}
            </button>
          </h4>
          {item.shortDescription && (
            <div className="text-xs text-gray-500 mb-1 line-clamp-2">{item.shortDescription}</div>
          )}
          <div className="flex items-center gap-2 mb-2">
            {item.brand && (
              <span className="text-xs text-gray-600">{item.brand}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {item.onSale ? (
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-red-600">{item.salePrice}₽</span>
                <span className="text-xs text-gray-500 line-through">{item.price}₽</span>
              </div>
            ) : (
              <span className="text-sm font-bold text-gray-800">
                {item.price}₽
              </span>
            )}
            <span className="text-xs text-gray-500">за шт.</span>
          </div>
        </div>

        <div className="flex flex-row flex-wrap items-center justify-end gap-4 w-auto ml-auto">
          <div className="flex items-center gap-4">
            <div className="short-input">
              <InputNumber
                value={item.quantity}
                onValueChange={handleQuantityChange}
                min={1}
                max={99}
                showButtons
                buttonLayout="horizontal"
                className="h-9 border border-gray-300 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition text-lg font-semibold bg-white px-0 hover:border-blue-400 hover:bg-blue-50"
                inputClassName="w-12 text-base font-semibold text-center p-0"
                decrementButtonClassName="bg-gray-200 text-gray-700 hover:bg-gray-300 p-2 rounded-l-lg transition"
                incrementButtonClassName="bg-gray-200 text-gray-700 hover:bg-gray-300 p-2 rounded-r-lg transition"
              />
            </div>
            <div className="relative flex items-center">
              <select
                value={selectedSize}
                onChange={e => handleSizeChange(e.target.value)}
                className="h-9 w-12 text-base font-semibold text-gray-800 rounded-lg border border-gray-300 shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition appearance-none cursor-pointer outline-none hover:bg-blue-50 text-center p-0 pr-6 align-middle leading-none"
                style={{
                  backgroundImage: 'url(/images/chevron-down.svg)',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.25rem center',
                  backgroundSize: '1rem 1rem',
                  lineHeight: '2.25rem',
                }}
              >
                {(item.specifications?.Sizes || []).map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="text-center">
            <span className="text-base font-bold text-blue-600">{itemTotal.toLocaleString()}₽</span>
          </div>
          <div className="relative">
            <Button
              className="bg-transparent border-none text-red-500 hover:text-red-700 text-base sm:w-auto p-2 rounded hover:bg-red-50 transition"
              onClick={handleRemove}
              label="Удалить"
            />
          </div>
        </div>
      </div>

      {showProductModal && (
        <ProductModal
          product={item}
          visible={showProductModal}
          onHide={() => setShowProductModal(false)}
          fromCart={true}
        />
      )}
    </Card>
  );
};

export default CartItem; 
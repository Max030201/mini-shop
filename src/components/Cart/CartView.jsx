import React, { useState } from 'react';
import { Panel } from 'primereact/panel';
import { Button } from 'primereact/button';
import { useCart } from '../../context/CartContext';
import CartItem from './CartItem';
import CheckoutModal from './CheckoutModal';
import { calculateCartTotals, SuccessModal } from '../../utils/cartUtils';

const CartView = ({ onClose, onContinueShopping }) => {
  const { cart, total, clearCart } = useCart();
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const { totalWithDiscount, hasDiscount } = calculateCartTotals(cart);

  const handleCheckout = () => {
    setShowCheckoutModal(true);
  };

  const handleCheckoutClose = () => {
    setShowCheckoutModal(false);
    setIsLoading(false);
  };

  const handleCheckoutSuccess = () => {
    setShowCheckoutModal(false);
    setIsLoading(false);
    setSuccessMessage('Заказ оформлен! Спасибо за покупку! Мы свяжемся с вами в ближайшее время.');
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const handleClearCart = () => {
    if (window.confirm('Вы уверены, что хотите очистить корзину?')) {
      clearCart();
    }
  };

  if (cart.length === 0) {
    return (
      <>
        {successMessage && <SuccessModal message={successMessage} />}
        <div className="h-full flex flex-col bg-white rounded-2xl shadow-md p-8 relative">
          <div className="flex items-center justify-between mb-8">
            <span className="text-xl font-bold text-gray-800">Корзина</span>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <span className="text-2xl font-semibold text-gray-500 mb-6">Ваша корзина пуста</span>
            <Button
              label="Продолжить покупки"
              className="bg-blue-500 text-white px-6 py-2 rounded-lg shadow hover:scale-105 transition-transform"
              onClick={onContinueShopping}
            />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {successMessage && <SuccessModal message={successMessage} />}
      <div className="h-full flex flex-col bg-white rounded-2xl shadow-md p-8">
        <Panel 
          header={
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-gray-800">Корзина ({cart.length} товаров)</span>
              </div>
              <Button
                className="bg-transparent border-none text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-gray-100 transition"
                onClick={onClose}
              />
            </div>
          }
          className="h-full border-none shadow-none bg-transparent"
        >
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto">
              <div className="flex flex-col gap-3">
                {cart.map((item) => (
                  <CartItem key={item.id + '_' + item.size} item={item} />
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Итого:</span>
                <span className="flex items-baseline gap-2">
                  {hasDiscount && (
                    <span className="text-lg text-gray-400 line-through font-normal">
                      {total.toLocaleString()} ₽
                    </span>
                  )}
                  <span className="text-2xl font-bold text-blue-600">
                    {totalWithDiscount.toLocaleString()} ₽
                  </span>
                </span>
              </div>
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 mt-2">
                <Button
                  label="Очистить корзину"
                  className="bg-white border border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 w-full md:w-auto text-base py-3 px-4 rounded-lg shadow transition"
                  onClick={handleClearCart}
                  disabled={isLoading}
                />
                <Button
                  label={isLoading ? 'Оформление...' : 'Оформить заказ'}
                  className="bg-blue-500 text-white hover:bg-blue-600 hover:border-blue-700 w-full md:w-auto text-base py-3 px-4 rounded-lg shadow transition"
                  onClick={() => { setIsLoading(true); handleCheckout(); }}
                  disabled={isLoading}
                />
              </div>
              <div className="flex flex-col lg:flex-row lg:justify-between gap-3 mt-2">
                <div className="bg-gray-50 p-3 rounded-lg lg:flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium">Информация о заказе</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>• Бесплатная доставка от 5000₽</div>
                    <div>• Возврат в течение 14 дней</div>
                    <div>• Безопасная оплата</div>
                  </div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg lg:flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-blue-800">Информация о доставке</span>
                  </div>
                  <div className="text-sm text-blue-700">
                    <div>• Срок доставки: 1-3 рабочих дня</div>
                    <div>• Оплата при получении или онлайн</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Panel>
      </div>
      <CheckoutModal
        visible={showCheckoutModal}
        onHide={handleCheckoutClose}
        onSuccess={handleCheckoutSuccess}
      />
    </>
  );
};

export default CartView; 
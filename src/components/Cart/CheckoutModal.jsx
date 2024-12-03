import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputMask } from 'primereact/inputmask';
import { Message } from 'primereact/message';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-hot-toast';
import { calculateCartTotals } from '../../utils/cartUtils';
import { getImagePath } from '../../utils/imageUtils';

const CheckoutModal = ({ visible, onHide, onSuccess }) => {
  const { cart, total, clearCart } = useCart();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');

  const { totalWithDiscount, hasDiscount } = calculateCartTotals(cart);

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      zipCode: ''
    });
    setErrors({});
    setIsSubmitting(false);
  };

  const getInputClassName = (fieldName) => {
    const baseClass = "w-full h-12 px-4 border border-gray-300 rounded-lg shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition text-base placeholder-gray-400";
    const errorClass = errors[fieldName] ? 'border-red-400' : '';
    return `${baseClass} ${errorClass}`;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Имя обязательно для заполнения';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'Имя должно содержать минимум 2 символа';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Фамилия обязательна для заполнения';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Фамилия должна содержать минимум 2 символа';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен для заполнения';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Введите корректный email';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Телефон обязателен для заполнения';
    } else if (formData.phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = 'Введите корректный номер телефона';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Адрес обязателен для заполнения';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'Город обязателен для заполнения';
    }

    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'Индекс обязателен для заполнения';
    } else if (!/^\d{6}$/.test(formData.zipCode.replace(/\D/g, ''))) {
      newErrors.zipCode = 'Введите корректный индекс (6 цифр)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Пожалуйста, исправьте ошибки в форме.');
      return;
    }

    setIsSubmitting(true);
    setInfoMessage('Отправка заказа... Пожалуйста, подождите.');

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      clearCart();
      if (onSuccess) {
        onSuccess();
      }
      onHide();
      resetForm();
      setInfoMessage('');
    } catch (error) {
      console.error('Error submitting order:', error);
      toast.error('Произошла ошибка при отправке заказа. Попробуйте еще раз.');
      setInfoMessage('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onHide();
    resetForm();
  };

  const footer = (
    <div className="flex flex-col md:flex-row justify-end gap-3 mt-4 px-6 mb-4">
      <Button
        label="Отмена"
        className="w-full md:w-auto px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold bg-white hover:bg-gray-100 transition disabled:opacity-60 disabled:cursor-not-allowed"
        onClick={handleClose}
        disabled={isSubmitting}
      />
      <Button
        label={isSubmitting ? "Оформление..." : "Оформить заказ"}
        className="w-full md:w-auto px-6 py-3 rounded-lg bg-blue-500 text-white font-semibold shadow hover:bg-blue-600 active:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        onClick={handleSubmit}
        disabled={isSubmitting}
      />
    </div>
  );

  return (
    <>
      {infoMessage && (
        <div className="fixed top-1/2 left-1/2 z-[9999] -translate-x-1/2 -translate-y-1/2 w-full max-w-xs flex items-center justify-center">
          <Message 
            severity="info" 
            text={infoMessage} 
            icon={false}
            className="rounded-2xl shadow-2xl bg-white border-2 border-blue-400 p-6 w-full text-center text-lg font-semibold animate-fade-in-up"
          />
        </div>
      )}
    <Dialog
      visible={visible}
      onHide={handleClose}
      header={
        <div className="flex items-center justify-between px-2 pt-2 pb-1 relative">
          <div className="flex items-center gap-2">
            <span className="font-bold text-2xl text-gray-900">Оформление заказа</span>
          </div>
          <button
            className="absolute -top-2 -right-2 p-2 rounded-full hover:bg-gray-100 transition text-gray-400 hover:text-red-500 text-xl"
            onClick={handleClose}
            aria-label="Закрыть"
            disabled={isSubmitting}
          >
            <img src={getImagePath('images/close.svg')} alt="закрыть" className="w-6 h-6" />
          </button>
        </div>
      }
      footer={footer}
      className="w-[calc(100%-2rem)] max-w-[calc(100vw-2rem)] sm:max-w-lg md:max-w-xl lg:max-w-2xl bg-white rounded-2xl shadow-xl p-0 animate-fade-in-up mx-4 sm:mx-auto"
      modal
      maskClassName="bg-black bg-opacity-50 backdrop-blur-sm"
      dismissableMask={true}
      closeOnEscape={!isSubmitting}
      closable={false}
    >
      <div className="space-y-8 px-6 py-6">
        <div className="bg-blue-50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
          <div className="text-base text-gray-700 font-semibold whitespace-nowrap mb-2 sm:mb-0">
            Товаров в заказе: <span className="font-bold text-lg text-gray-900 whitespace-nowrap">{cart.length}</span>
          </div>
          <div className="flex items-baseline gap-2 text-base text-gray-700 font-semibold whitespace-nowrap [@media(max-width:400px)]:block [@media(max-width:400px)]:whitespace-normal">
            Общая сумма:
            <span className="whitespace-nowrap">
              {hasDiscount && (
                <span className="text-lg text-gray-400 line-through font-normal whitespace-nowrap">{total.toLocaleString()} ₽</span>
              )}
              <span className="text-2xl font-extrabold text-blue-600 whitespace-nowrap ml-2">{totalWithDiscount.toLocaleString()} ₽</span>
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block font-semibold text-gray-800 mb-1">Имя *</label>
            <InputText
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
                className={getInputClassName('firstName')}
              placeholder="Введите имя"
              disabled={isSubmitting}
            />
            {errors.firstName && <div className="text-red-500 text-xs mt-1">{errors.firstName}</div>}
          </div>
          <div>
            <label className="block font-semibold text-gray-800 mb-1">Фамилия *</label>
            <InputText
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
                className={getInputClassName('lastName')}
              placeholder="Введите фамилию"
              disabled={isSubmitting}
            />
            {errors.lastName && <div className="text-red-500 text-xs mt-1">{errors.lastName}</div>}
          </div>
          <div>
            <label className="block font-semibold text-gray-800 mb-1">Email *</label>
            <InputText
              name="email"
              value={formData.email}
              onChange={handleInputChange}
                className={getInputClassName('email')}
              placeholder="example@email.com"
              disabled={isSubmitting}
            />
            {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
          </div>
          <div>
            <label className="block font-semibold text-gray-800 mb-1">Телефон *</label>
            <InputMask
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              mask="+7 (999) 999-99-99"
                className={getInputClassName('phone')}
              placeholder="+7 (___) ___-__-__"
              disabled={isSubmitting}
            />
            {errors.phone && <div className="text-red-500 text-xs mt-1">{errors.phone}</div>}
          </div>
          <div className="md:col-span-2">
            <label className="block font-semibold text-gray-800 mb-1">Адрес доставки *</label>
            <InputText
              name="address"
              value={formData.address}
              onChange={handleInputChange}
                className={getInputClassName('address')}
              placeholder="Улица, дом, квартира"
              disabled={isSubmitting}
            />
            {errors.address && <div className="text-red-500 text-xs mt-1">{errors.address}</div>}
          </div>
          <div>
            <label className="block font-semibold text-gray-800 mb-1">Город *</label>
            <InputText
              name="city"
              value={formData.city}
              onChange={handleInputChange}
                className={getInputClassName('city')}
              placeholder="Введите город"
              disabled={isSubmitting}
            />
            {errors.city && <div className="text-red-500 text-xs mt-1">{errors.city}</div>}
          </div>
          <div>
            <label className="block font-semibold text-gray-800 mb-1">Индекс *</label>
            <InputText
              name="zipCode"
              value={formData.zipCode}
              onChange={handleInputChange}
                className={getInputClassName('zipCode')}
              placeholder="000000"
              disabled={isSubmitting}
            />
            {errors.zipCode && <div className="text-red-500 text-xs mt-1">{errors.zipCode}</div>}
          </div>
        </form>
      </div>
    </Dialog>
    </>
  );
};

export default CheckoutModal; 
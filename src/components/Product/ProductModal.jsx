import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { Tag } from 'primereact/tag';
import { useCart } from '../../context/CartContext';
import { SelectButton } from 'primereact/selectbutton';
import { toast } from 'react-hot-toast';

const ProductModal = ({ product, visible, onHide, fromCart = false }) => {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const [imgIndex, setImgIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);
  const [direction, setDirection] = useState('next');
  const [prevIndex, setPrevIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product?.specifications?.Sizes?.[0] || '');

  useEffect(() => {
    if (!visible) setQuantity(1);
  }, [visible]);

  useEffect(() => {
    setSelectedSize(product?.specifications?.Sizes?.[0] || '');
  }, [product, visible]);

  if (!product) return null;

  // Константы для цен и изображений
  const price = product.onSale ? product.salePrice : product.price;
  const total = price * quantity;
  const isInStock = !!product.inStock;
  const images = [product.image, product.image, product.image];

  const handleAddToCart = (size) => {
    if (!size) {
      toast.error('Пожалуйста, выберите размер.');
      return;
    }
    if (!isInStock) {
      toast.error('Товар отсутствует на складе.');
      return;
    }
    addToCart(product, quantity, size);
    onHide();
    setQuantity(1);
    setSelectedSize(size);
  };

  const dialogClass =
    'w-full max-w-3xl bg-white rounded-2xl shadow-2xl p-0 border-0 animate-modal-open m-4 md:m-12 max-w-[calc(100vw-2rem)]';

  const handleTouchStart = (e) => setTouchStartX(e.touches[0].clientX);
  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    if (touchEndX - touchStartX > 50) {
      setDirection('prev');
      setPrevIndex(imgIndex);
      setImgIndex((i) => (i === 0 ? images.length - 1 : i - 1));
    } else if (touchStartX - touchEndX > 50) {
      setDirection('next');
      setPrevIndex(imgIndex);
      setImgIndex((i) => (i === images.length - 1 ? 0 : i + 1));
    }
    setTouchStartX(null);
  };

  const handleIndicatorClick = (i) => {
    if (i === imgIndex) return;
    setDirection(i > imgIndex ? 'next' : 'prev');
    setPrevIndex(imgIndex);
    setImgIndex(i);
  };

  const getImageStyle = (index) => {
    let offset = index - imgIndex;
    if (offset > images.length / 2) offset -= images.length;
    if (offset < -images.length / 2) offset += images.length;
    
    return {
      transition: 'transform 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.5s cubic-bezier(0.4,0,0.2,1)',
      transform: `translateX(${offset * 100}%)`,
      opacity: offset === 0 ? 1 : 0,
      zIndex: offset === 0 ? 10 : 0,
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%'
    };
  };

  const getIndicatorClassName = (index) => {
    const baseClass = "w-2 h-2 rounded-full transition-all duration-200 focus:outline-none";
    const activeClass = index === imgIndex ? 'bg-blue-500 scale-125' : 'bg-gray-300';
    return `${baseClass} ${activeClass}`;
  };

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      className={dialogClass}
      modal
      closeOnEscape
      closable={false}
      dismissableMask={true}
      style={{ padding: 0 }}
      contentClassName="p-0"
      maskClassName="bg-black bg-opacity-40 backdrop-blur-sm"
    >
      <div className="flex items-start justify-between px-6 pt-6 pb-2 border-b border-gray-100">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-2xl font-bold text-gray-900 truncate pr-2">{product.name}</h2>
            <div className="flex items-center gap-1 ml-2 shrink-0">
              <img src="/images/star.svg" alt="рейтинг" className="w-5 h-5 text-yellow-500 inline" />
              <span className="text-base text-gray-600 font-semibold">{product.rating}</span>
            </div>
          </div>
        </div>
        <button
          className="ml-4 p-2 rounded-full hover:bg-gray-100 transition text-gray-400 hover:text-red-500 text-xl"
          onClick={onHide}
          aria-label="Закрыть"
        >
          <img src="/images/close.svg" alt="закрыть" className="w-6 h-6" />
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8 px-6 py-6">
        <div className="flex-shrink-0 w-full md:w-1/2 flex flex-col items-center">
          <div
            className="w-full max-w-md mb-4 select-none relative overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            style={{ height: '256px' }}
          >
            {images.map((img, i) => {
              const style = getImageStyle(i);
              const base = 'w-full h-64 object-cover rounded-xl shadow-md';
              return (
                <img
                  key={i}
                  src={img}
                  alt={product.name}
                  className={base}
                  onError={(e) => { e.target.src = '/images/img-1.jpg'; }}
                  style={style}
                />
              );
            })}
            {imgIndex === 0 && product.onSale && (
              <span className="absolute top-2 right-2 text-red-600 font-bold bg-white bg-opacity-80 rounded px-2 py-0.5 text-sm shadow">Скидка</span>
            )}
            {imgIndex === 0 && !isInStock && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-xl">
                <Tag value="Нет в наличии" severity="warning" />
              </div>
            )}
            <div className="flex justify-center gap-2 mt-2 absolute left-0 right-0 bottom-2 z-20">
              {images.map((_, i) => (
                <button
                  key={i}
                  className={getIndicatorClassName(i)}
                  onClick={() => handleIndicatorClick(i)}
                  aria-label={`Показать фото ${i + 1}`}
                  type="button"
                />
              ))}
            </div>
          </div>
          <div className="w-full mb-4 pt-4">
            <h3 className="text-xl font-bold mb-1 text-gray-900">Бренд</h3>
            <div className="text-base text-gray-700 font-semibold">{product.brand}</div>
          </div>
          <div className="mt-2 w-full">
            <h3 className="text-xl font-bold mb-4 text-gray-900">Характеристики</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
              {product.specifications && Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="flex justify-between items-baseline py-1 border-b border-gray-100 last:border-b-0 text-base">
                  <span className="text-gray-500 font-semibold mr-2">{key}:</span>
                  <span className="font-bold text-gray-900 text-right">
                    {key === 'Sizes' && Array.isArray(value)
                      ? value.join(', ')
                      : value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {product.description && (
            <div className="mb-2">
              <p className="text-gray-700 leading-relaxed text-base">{product.description}</p>
            </div>
          )}

          <div className="flex flex-col gap-4 bg-white/70 rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center gap-2 text-base">
              <span className="font-semibold text-gray-700">Наличие:</span>
              {isInStock ? (
                <span className="text-green-600 font-bold">есть</span>
              ) : (
                <span className="text-red-500 font-bold">нет</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-lg">
              <span className="font-semibold text-gray-700">Цена:</span>
              <span className="flex flex-row gap-2 items-baseline xs:flex-col xs:items-start [@media(max-width:400px)]:flex-col [@media(max-width:400px)]:items-start">
                <span className={product.onSale ? 'text-red-600 font-extrabold text-2xl tracking-tight whitespace-nowrap' : 'text-gray-900 font-extrabold text-2xl tracking-tight whitespace-nowrap'}>
                  {typeof price === 'number' && !isNaN(price) ? price.toLocaleString() + '₽' : '—'}
                </span>
                {product.onSale && (
                  <span className="text-base text-gray-400 line-through ml-1 whitespace-nowrap">
                    {typeof product.price === 'number' && !isNaN(product.price) ? product.price.toLocaleString() + '₽' : '—'}
                  </span>
                )}
              </span>
            </div>
            {!fromCart && (
              <>
                <div className="flex flex-wrap items-center gap-4 text-base items-center">
                  <span className="font-semibold text-gray-700">Количество:</span>
                  <div className="w-15 short-input">
                    <InputNumber
                      value={quantity}
                      onValueChange={e => setQuantity(e.value ?? 1)}
                      min={1}
                      max={99}
                      showButtons
                      buttonLayout="horizontal"
                      className="w-full h-9 border border-gray-300 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition text-lg font-semibold bg-white px-0 hover:border-blue-400 hover:bg-blue-50"
                      decrementButtonClassName="bg-gray-200 text-gray-700 hover:bg-gray-300 p-2 rounded-l-lg transition"
                      incrementButtonClassName="bg-gray-200 text-gray-700 hover:bg-gray-300 p-2 rounded-r-lg transition"
                      disabled={!isInStock}
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-gray-700 whitespace-nowrap">Размер:</span>
                    <div className="min-w-0 flex-shrink-0 flex flex-wrap gap-1 max-w-full" style={{wordBreak: 'break-all'}}>
                      <SelectButton
                        value={selectedSize}
                        onChange={e => setSelectedSize(e.value)}
                        options={product.specifications?.Sizes || []}
                        itemTemplate={option => <span className="px-2 py-0.5 text-sm font-semibold">{option}</span>}
                        pt={{
                          root: { className: 'gap-1' },
                          button: () =>
                            'rounded-lg border transition-all duration-150 shadow-sm bg-white text-gray-800 border-gray-300 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700 active:bg-blue-100 font-semibold text-sm px-2 py-0.5'
                        }}
                        className="rounded-lg"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-lg mt-2">
                  <span className="font-semibold text-gray-700">Итого:</span>
                  <span className="font-extrabold text-blue-600 text-2xl tracking-tight">
                    {quantity > 1
                      ? (typeof total === 'number' && !isNaN(total) ? total.toLocaleString() : '—')
                      : (typeof price === 'number' && !isNaN(price) ? price.toLocaleString() : '—')
                    }₽
                  </span>
                </div>
                <Button
                  label="Добавить в корзину"
                  className="w-full mt-4 py-3 text-lg font-semibold rounded-xl shadow-md bg-blue-500 hover:bg-blue-600 hover:shadow-lg hover:scale-[1.02] active:bg-blue-700 border-0 transition-all duration-200 text-white"
                  onClick={() => handleAddToCart(selectedSize)}
                  disabled={!isInStock || !selectedSize}
                />
              </>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400 mt-auto self-end select-none">
            <img src="/images/eye.svg" alt="просмотры" className="w-4 h-4 align-text-bottom" />
            {product.reviews || 0} просмотров
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default ProductModal;
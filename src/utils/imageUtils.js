// Функция для получения базового пути
export const getBasePath = () => {
  // В тестовом окружении и когда window.location не доступен
  if (typeof window === 'undefined' || !window.location || !window.location.hostname) {
    return '';
  }
  
  // В продакшене проверяем хост
  return window.location.hostname === 'max030201.github.io' ? '/mini-shop' : '';
};

// Функция для получения полного пути к изображению
export const getImagePath = (imagePath) => {
  const basePath = getBasePath();
  
  if (!imagePath) {
    return `${basePath}/`;
  }
  
  // Убираем начальный слеш если есть
  const cleanImagePath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  return `${basePath}/${cleanImagePath}`;
};
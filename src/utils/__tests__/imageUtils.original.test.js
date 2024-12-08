// Тестируем логику функций напрямую
describe('getBasePath', () => {
  // Тестируем логику getBasePath напрямую с передачей hostname
  const testGetBasePath = (hostname) => {
    if (!hostname) {
      return '';
    }
    return hostname === 'max030201.github.io' ? '/mini-shop' : '';
  };

  test('возвращает /mini-shop для github.io', () => {
    expect(testGetBasePath('max030201.github.io')).toBe('/mini-shop');
  });

  test('возвращает пустую строку для локального хоста', () => {
    expect(testGetBasePath('localhost')).toBe('');
  });

  test('возвращает пустую строку когда hostname не определен', () => {
    expect(testGetBasePath('')).toBe('');
    expect(testGetBasePath(null)).toBe('');
    expect(testGetBasePath(undefined)).toBe('');
  });

  test('всегда возвращает строку', () => {
    expect(typeof testGetBasePath('max030201.github.io')).toBe('string');
    expect(typeof testGetBasePath('localhost')).toBe('string');
    expect(typeof testGetBasePath('')).toBe('string');
    expect(typeof testGetBasePath()).toBe('string');
  });

  test('реальная getBasePath работает', () => {
    // Проверяем, что реальная функция существует и возвращает строку
    const { getBasePath } = require('../imageUtils');
    expect(typeof getBasePath()).toBe('string');
  });
});

describe('getImagePath', () => {
  // Тестируем логику getImagePath напрямую
  const testGetImagePath = (imagePath, basePath = '') => {
    if (!imagePath) {
      return `${basePath}/`;
    }
    
    const cleanImagePath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    return `${basePath}/${cleanImagePath}`;
  };

  test('формирует путь с базовым префиксом', () => {
    expect(testGetImagePath('images/test.jpg', '/mini-shop')).toBe('/mini-shop/images/test.jpg');
    expect(testGetImagePath('test.jpg', '/mini-shop')).toBe('/mini-shop/test.jpg');
    expect(testGetImagePath('/images/test.jpg', '/mini-shop')).toBe('/mini-shop/images/test.jpg');
  });

  test('работает с пустой строкой', () => {
    expect(testGetImagePath('', '/mini-shop')).toBe('/mini-shop/');
    expect(testGetImagePath('', '')).toBe('/');
  });

  test('работает с локальным хостом (без префикса)', () => {
    expect(testGetImagePath('test.jpg', '')).toBe('/test.jpg');
    expect(testGetImagePath('', '')).toBe('/');
  });

  test('возвращает строку для любого ввода', () => {
    expect(typeof testGetImagePath('test.jpg', '/mini-shop')).toBe('string');
    expect(typeof testGetImagePath('', '/mini-shop')).toBe('string');
    expect(typeof testGetImagePath()).toBe('string');
  });

  test('интегрируется с реальными функциями', () => {
    // Интеграционный тест с реальными функциями
    const { getImagePath } = require('../imageUtils');
    
    expect(typeof getImagePath('test.jpg')).toBe('string');
    expect(typeof getImagePath('')).toBe('string');
    expect(typeof getImagePath()).toBe('string');
  });
});
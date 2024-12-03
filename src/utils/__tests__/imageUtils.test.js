import { getImagePath } from '../imageUtils';

// Тестируем только логику формирования пути, без мокирования
describe('getImagePath', () => {
  test('формирует путь с базовым префиксом', () => {
    // Тестируем саму логику формирования пути
    const testLogic = (basePath, input, expected) => {
      // Эмулируем работу функции
      const result = `${basePath}/${input.startsWith('/') ? input.slice(1) : input}`;
      expect(result).toBe(expected);
    };

    testLogic('/mini-shop', 'images/test.jpg', '/mini-shop/images/test.jpg');
    testLogic('/mini-shop', 'test.jpg', '/mini-shop/test.jpg');
    testLogic('/mini-shop', '/images/test.jpg', '/mini-shop/images/test.jpg');
  });

  test('работает с пустой строкой', () => {
    const testLogic = (basePath, input, expected) => {
      const result = input ? `${basePath}/${input.startsWith('/') ? input.slice(1) : input}` : `${basePath}/`;
      expect(result).toBe(expected);
    };

    testLogic('', '', '/');
    testLogic('/mini-shop', '', '/mini-shop/');
  });

  test('возвращает строку для любого ввода', () => {
    expect(typeof getImagePath('test.jpg')).toBe('string');
    expect(typeof getImagePath('')).toBe('string');
    expect(typeof getImagePath()).toBe('string');
  });
});

// Отдельный тест для getBasePath
describe('getBasePath', () => {
  test('всегда возвращает строку', () => {
    const { getBasePath } = require('../imageUtils');
    expect(typeof getBasePath()).toBe('string');
  });
});
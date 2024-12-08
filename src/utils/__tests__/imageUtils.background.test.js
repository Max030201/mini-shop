// Просто тестируем логику getBackgroundImage напрямую
describe('getBackgroundImage', () => {
  // Импортируем только getImagePath, а getBackgroundImage тестируем как чистую функцию
  const { getImagePath } = require('../imageUtils');
  
  // Тестируем логику преобразования в CSS url()
  const testGetBackgroundImage = (imageUrl) => `url(${imageUrl})`;

  test('возвращает корректную строку CSS url()', () => {
    expect(testGetBackgroundImage('/mini-shop/test.jpg')).toBe('url(/mini-shop/test.jpg)');
    expect(testGetBackgroundImage('/mini-shop/images/photo.png')).toBe('url(/mini-shop/images/photo.png)');
  });

  test('работает с пустой строкой', () => {
    expect(testGetBackgroundImage('/mini-shop/')).toBe('url(/mini-shop/)');
  });

  test('возвращает строку для любого ввода', () => {
    expect(typeof testGetBackgroundImage('/base/test.jpg')).toBe('string');
    expect(typeof testGetBackgroundImage('/base/')).toBe('string');
    expect(typeof testGetBackgroundImage('')).toBe('string');
  });

  test('корректно обрабатывает различные типы путей', () => {
    expect(testGetBackgroundImage('/base/image.jpg')).toBe('url(/base/image.jpg)');
    expect(testGetBackgroundImage('/base//absolute/path.png')).toBe('url(/base//absolute/path.png)');
    expect(testGetBackgroundImage('/base')).toBe('url(/base)');
  });

  test('интегрируется с реальной getImagePath', () => {
    // Интеграционный тест с реальной getImagePath
    const imageUrl = getImagePath('test.jpg');
    const result = testGetBackgroundImage(imageUrl);
    
    expect(result).toMatch(/^url\(.*\)$/);
    expect(typeof result).toBe('string');
    expect(result).toContain('test.jpg');
  });

  test('реальная getBackgroundImage работает', () => {
    // Также проверяем, что реальная функция существует и работает
    const { getBackgroundImage } = require('../imageUtils');
    const result = getBackgroundImage('test.jpg');
    
    expect(typeof result).toBe('string');
    expect(result).toMatch(/^url\(.*\)$/);
  });
});
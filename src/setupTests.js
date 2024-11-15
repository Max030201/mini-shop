import '@testing-library/jest-dom';

global.normalizePriceText = (text) => {
  return text.replace(/[\s,\u00A0]/g, '');
};

afterEach(() => {
  jest.clearAllMocks();
}); 
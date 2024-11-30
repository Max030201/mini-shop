# Mini Shop

Mini Shop — одностраничное приложение интернет-магазина одежды на React. Проект демонстрирует работу с каталогом товаров, фильтрами, корзиной, оформлением заказа, моковым API и покрытием тестами.

## Основные возможности

- Каталог товаров с фильтрацией по категориям, полу, наличию, цене
- Поиск и сортировка товаров
- Просмотр подробной информации о товаре в модальном окне
- Добавление и удаление товаров из корзины
- Оформление заказа через модальное окно
- Моковый backend на json-server (db.json)
- Адаптивная верстка с TailwindCSS
- Покрытие тестами (Jest, React Testing Library)

## Технологии и зависимости

- React 18
- PrimeReact (UI-компоненты)
- TailwindCSS (стили)
- react-hot-toast (уведомления)
- Webpack (сборка)
- Jest, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event (тестирование)
- json-server (моковый REST API)
- concurrently (параллельный запуск серверов)
- autoprefixer, postcss, postcss-loader, style-loader, css-loader (обработка стилей)

## Структура проекта

```
mini-shop/
  src/
    components/
      Cart/        # CartView, CartItem, CheckoutModal, __tests__/
      Catalog/     # ProductList, SearchSortBar, __tests__/
      Product/     # ProductModal, __tests__/
      Filters/     # FilterPanel, FilterContent, __tests__/
      Layout/      # Header, Footer, __tests__/
    api/           # productsApi.js, __tests__/
    context/       # CartContext.jsx, __tests__/
    utils/         # cartUtils.jsx, __tests__/
    App.jsx
    index.js
    index.css
    setupTests.js
    __tests__/     # Интеграционные тесты (App.test.jsx)
  db.json          # Моковые данные для json-server
  public/
    image/
    index.html           
  package.json
  README.md
  package-lock.json
  webpack.config.js
  tailwind.config.js
  postcss.config.js
  jest.config.js
  babelrc.config.js
```

## Скрипты

- `npm start` — запуск dev-сервера (webpack) с автоматическим открытием браузера
- `npm run dev` — запуск dev-сервера (webpack) без открытия браузера
- `npm run dev:all` — параллельный запуск mock API (`json-server`) и dev-сервера (webpack)
- `npm run server` — запуск только mock API (`json-server`)
- `npm run build` — сборка production-версии
- `npm test` — запуск тестов
- `npm run test:watch` — тесты в watch-режиме
- `npm run test:coverage` — покрытие тестами
- `npm run test:coverage:watch` — покрытие тестами в watch-режиме
- `npm run test:coverage:report` — html-отчет по покрытию
- `npm run test:ci` — тесты для CI

## Быстрый старт

1. Установите зависимости:
   ```
   npm install
   ```

2. Запустите dev-сервер с mock API:
   ```
   npm run dev:all
   ```
   - Приложение: http://localhost:3000
   - Mock API: http://localhost:3001

   Или только приложение:
   ```
   npm start
   ```

3. Запустите тесты:
   ```
   npm test
   ```

4. Соберите production-версию:
   ```
   npm run build
   ```

## API

Моковые данные хранятся в `db.json`.
Основные эндпоинты:
- `GET /products` — список товаров
- `GET /cart` — содержимое корзины

## Тесты

В проекте реализованы unit-, интеграционные и компонентные тесты для компонентов и бизнес-логики с использованием Jest и React Testing Library. Используются моки зависимостей, тестируются пользовательские сценарии, edge-cases и ошибки. Тесты оформлены в BDD-стиле.

### Общее покрытие:
- Statements: 86.37%
- Branches: 811.34%
- Functions: 92.59%
- Lines: 86.51%

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import CheckoutModal from '../CheckoutModal';

jest.mock('primereact/dialog', () => ({
  Dialog: ({ visible, onHide, header, footer, children }) =>
    visible ? (
      <div data-testid="dialog">
        <div data-testid="dialog-header">{header}</div>
        {children}
        <div data-testid="dialog-footer">{footer}</div>
      </div>
    ) : null
}));

jest.mock('primereact/button', () => ({
  Button: ({ label, onClick, disabled, className, children }) => (
    <button
      data-testid="prime-button"
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {label || children}
    </button>
  )
}));

jest.mock('primereact/inputtext', () => ({
  InputText: ({ name, value, onChange, className, placeholder, disabled }) => (
    <input
      data-testid={`input-${name}`}
      name={name}
      value={value}
      onChange={onChange}
      className={className}
      placeholder={placeholder}
      disabled={disabled}
    />
  )
}));

jest.mock('primereact/inputmask', () => ({
  InputMask: ({ name, value, onChange, className, placeholder, disabled }) => (
    <input
      data-testid={`input-${name}`}
      name={name}
      value={value}
      onChange={onChange}
      className={className}
      placeholder={placeholder}
      disabled={disabled}
    />
  )
}));

jest.mock('primereact/message', () => ({
  Message: ({ text }) => <div data-testid="info-message">{text}</div>
}));

jest.mock('react-hot-toast', () => ({ toast: { error: jest.fn() } }));

jest.mock('../../../context/CartContext', () => ({
  useCart: () => ({
    cart: [
      { id: 1, name: 'Товар', price: 1000, salePrice: 900, quantity: 1, size: 'M', onSale: true }
    ],
    total: 1000,
    clearCart: jest.fn()
  })
}));

jest.mock('../../../utils/cartUtils', () => ({
  calculateCartTotals: () => ({ totalWithDiscount: 900, hasDiscount: true })
}));

describe('CheckoutModal', () => {
  const mockOnHide = jest.fn();
  const mockOnSuccess = jest.fn();
  const getInputs = () => ({
    firstName: screen.getByTestId('input-firstName'),
    lastName: screen.getByTestId('input-lastName'),
    email: screen.getByTestId('input-email'),
    phone: screen.getByTestId('input-phone'),
    address: screen.getByTestId('input-address'),
    city: screen.getByTestId('input-city'),
    zipCode: screen.getByTestId('input-zipCode'),
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('отображает модалку и поля', () => {
    render(<CheckoutModal visible={true} onHide={mockOnHide} onSuccess={mockOnSuccess} />);
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    Object.values(getInputs()).forEach(input => {
      expect(input).toBeInTheDocument();
    });
  });

  it('валидирует форму и показывает ошибки', async () => {
    render(<CheckoutModal visible={true} onHide={mockOnHide} onSuccess={mockOnSuccess} />);
    fireEvent.click(screen.getByText('Оформить заказ'));
    await waitFor(() => {
      expect(screen.getByText('Имя обязательно для заполнения')).toBeInTheDocument();
      expect(screen.getByText('Фамилия обязательна для заполнения')).toBeInTheDocument();
      expect(screen.getByText('Email обязателен для заполнения')).toBeInTheDocument();
      expect(screen.getByText('Телефон обязателен для заполнения')).toBeInTheDocument();
      expect(screen.getByText('Адрес обязателен для заполнения')).toBeInTheDocument();
      expect(screen.getByText('Город обязателен для заполнения')).toBeInTheDocument();
      expect(screen.getByText('Индекс обязателен для заполнения')).toBeInTheDocument();
    });
  });

  it('отправляет форму при валидных данных', async () => {
    render(<CheckoutModal visible={true} onHide={mockOnHide} onSuccess={mockOnSuccess} />);
    const inputs = getInputs();
    fireEvent.change(inputs.firstName, { target: { value: 'Иван' } });
    fireEvent.change(inputs.lastName, { target: { value: 'Иванов' } });
    fireEvent.change(inputs.email, { target: { value: 'ivan@test.ru' } });
    fireEvent.change(inputs.phone, { target: { value: '+7 (999) 123-45-67' } });
    fireEvent.change(inputs.address, { target: { value: 'ул. Ленина, 1' } });
    fireEvent.change(inputs.city, { target: { value: 'Москва' } });
    fireEvent.change(inputs.zipCode, { target: { value: '123456' } });
    fireEvent.click(screen.getByText('Оформить заказ'));
    expect(screen.getByText('Отправка заказа... Пожалуйста, подождите.')).toBeInTheDocument();
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 2100));
    });
    expect(mockOnSuccess).toHaveBeenCalled();
    expect(mockOnHide).toHaveBeenCalled();
  });

  it('сбрасывает форму при закрытии', () => {
    render(<CheckoutModal visible={true} onHide={mockOnHide} onSuccess={mockOnSuccess} />);
    const inputs = getInputs();
    fireEvent.change(inputs.firstName, { target: { value: 'Иван' } });
    fireEvent.click(screen.getByText('Отмена'));
    Object.values(getInputs()).forEach(input => {
      expect(input.value).toBe('');
    });
  });

  it('handleInputChange очищает ошибку поля', async () => {
    render(<CheckoutModal visible={true} onHide={mockOnHide} onSuccess={mockOnSuccess} />);
    const inputs = getInputs();
    fireEvent.change(inputs.lastName, { target: { value: 'Иванов' } });
    fireEvent.change(inputs.email, { target: { value: 'ivan@test.ru' } });
    fireEvent.change(inputs.phone, { target: { value: '+7 (999) 123-45-67' } });
    fireEvent.change(inputs.address, { target: { value: 'ул. Ленина, 1' } });
    fireEvent.change(inputs.city, { target: { value: 'Москва' } });
    fireEvent.change(inputs.zipCode, { target: { value: '123456' } });

    const input = screen.getByTestId('input-firstName');
    fireEvent.change(input, { target: { value: 'И' } });
    fireEvent.click(screen.getByText('Оформить заказ'));
    expect(screen.getByText('Имя должно содержать минимум 2 символа')).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'Иван' } });
    expect(screen.queryByText('Имя должно содержать минимум 2 символа')).not.toBeInTheDocument();
  });

  it('getInputClassName возвращает класс ошибки', () => {
    render(<CheckoutModal visible={true} onHide={mockOnHide} onSuccess={mockOnSuccess} />);
    fireEvent.click(screen.getByText('Оформить заказ'));
    const input = screen.getByTestId('input-firstName');
    expect(input.className).toMatch(/border-red-400/);
  });

  it('отображает infoMessage при отправке', async () => {
    render(<CheckoutModal visible={true} onHide={mockOnHide} onSuccess={mockOnSuccess} />);
    const inputs = getInputs();
    fireEvent.change(inputs.firstName, { target: { value: 'Иван' } });
    fireEvent.change(inputs.lastName, { target: { value: 'Иванов' } });
    fireEvent.change(inputs.email, { target: { value: 'ivan@test.ru' } });
    fireEvent.change(inputs.phone, { target: { value: '+7 (999) 123-45-67' } });
    fireEvent.change(inputs.address, { target: { value: 'ул. Ленина, 1' } });
    fireEvent.change(inputs.city, { target: { value: 'Москва' } });
    fireEvent.change(inputs.zipCode, { target: { value: '123456' } });
    fireEvent.click(screen.getByText('Оформить заказ'));
    expect(screen.getByTestId('info-message')).toBeInTheDocument();
  });

  it('handleClose вызывает onHide и сбрасывает форму', () => {
    render(<CheckoutModal visible={true} onHide={mockOnHide} onSuccess={mockOnSuccess} />);
    const inputs = getInputs();
    fireEvent.change(inputs.firstName, { target: { value: 'Иван' } });
    fireEvent.click(screen.getByLabelText('Закрыть'));
    expect(mockOnHide).toHaveBeenCalled();
    Object.values(getInputs()).forEach(input => {
      expect(input.value).toBe('');
    });
  });

  it('кнопки блокируются при isSubmitting', async () => {
    render(<CheckoutModal visible={true} onHide={mockOnHide} onSuccess={mockOnSuccess} />);
    const inputs = getInputs();
    fireEvent.change(inputs.firstName, { target: { value: 'Иван' } });
    fireEvent.change(inputs.lastName, { target: { value: 'Иванов' } });
    fireEvent.change(inputs.email, { target: { value: 'ivan@test.ru' } });
    fireEvent.change(inputs.phone, { target: { value: '+7 (999) 123-45-67' } });
    fireEvent.change(inputs.address, { target: { value: 'ул. Ленина, 1' } });
    fireEvent.change(inputs.city, { target: { value: 'Москва' } });
    fireEvent.change(inputs.zipCode, { target: { value: '123456' } });
    fireEvent.click(screen.getByText('Оформить заказ'));
    const buttons = screen.getAllByTestId('prime-button');
    buttons.forEach(btn => {
      expect(btn).toBeDisabled();
    });
  });
}); 
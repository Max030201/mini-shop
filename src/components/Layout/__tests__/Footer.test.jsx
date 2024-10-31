import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from '../Footer';

describe('Footer', () => {
  it('рендерится без ошибок (smoke)', () => {
    render(<Footer />);
    expect(screen.getByText('Mini Shop')).toBeInTheDocument();
  });

  it('содержит описание магазина', () => {
    render(<Footer />);
    expect(screen.getByText(/Ваш надежный партнер в мире моды/i)).toBeInTheDocument();
  });

  it('содержит контакты', () => {
    render(<Footer />);
    expect(screen.getByText('+7 (999) 123-45-67')).toBeInTheDocument();
    expect(screen.getByText('info@minishop.ru')).toBeInTheDocument();
    expect(screen.getByText('г. Москва, ул. Примерная, 123')).toBeInTheDocument();
    expect(screen.getByText('Пн-Вс: 9:00 - 21:00')).toBeInTheDocument();
  });

  it('содержит копирайт', () => {
    render(<Footer />);
    expect(screen.getByText(/2024 Mini Shop. Все права защищены/i)).toBeInTheDocument();
  });

  it('содержит Divider', () => {
    render(<Footer />);
  
    expect(document.querySelector('[data-pc-name="divider"]')).toBeInTheDocument();
  });
}); 
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import InputField from '../../components/common/InputField';

describe('InputField Component', () => {
  test('renders input with label', () => {
    render(<InputField label="نام کاربری" />);
    expect(screen.getByText('نام کاربری')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  test('renders input with placeholder', () => {
    render(<InputField placeholder="نام خود را وارد کنید" />);
    expect(screen.getByPlaceholderText('نام خود را وارد کنید')).toBeInTheDocument();
  });

  test('shows error message when error prop is provided', () => {
    render(<InputField error="این فیلد الزامی است" />);
    expect(screen.getByText('این فیلد الزامی است')).toBeInTheDocument();
  });

  test('applies error styles when error exists', () => {
    render(<InputField error="خطا" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-red-500');
  });

  test('handles password type correctly', () => {
    render(<InputField type="password" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'password');
  });

  test('toggles password visibility', () => {
    render(<InputField type="password" />);
    const input = screen.getByRole('textbox');
    const toggleButton = screen.getByRole('button');
    
    expect(input).toHaveAttribute('type', 'password');
    
    fireEvent.click(toggleButton);
    expect(input).toHaveAttribute('type', 'text');
    
    fireEvent.click(toggleButton);
    expect(input).toHaveAttribute('type', 'password');
  });

  test('calls onChange when input value changes', () => {
    const handleChange = jest.fn();
    render(<InputField onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test value' } });
    
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  test('calls onBlur when input loses focus', () => {
    const handleBlur = jest.fn();
    render(<InputField onBlur={handleBlur} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.blur(input);
    
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  test('calls onFocus when input gains focus', () => {
    const handleFocus = jest.fn();
    render(<InputField onFocus={handleFocus} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    
    expect(handleFocus).toHaveBeenCalledTimes(1);
  });

  test('applies focus styles when focused', () => {
    render(<InputField />);
    const input = screen.getByRole('textbox');
    
    fireEvent.focus(input);
    expect(input).toHaveClass('ring-2', 'ring-blue-500');
  });

  test('is disabled when disabled prop is true', () => {
    render(<InputField disabled />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  test('applies disabled styles when disabled', () => {
    render(<InputField disabled />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('bg-gray-100', 'cursor-not-allowed');
  });

  test('renders with initial value', () => {
    render(<InputField value="initial value" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('initial value');
  });

  test('applies custom className', () => {
    render(<InputField className="custom-input" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('custom-input');
  });
});
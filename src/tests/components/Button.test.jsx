import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Button from '../../components/common/Button';

describe('Button Component', () => {
  test('renders button with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  test('applies primary variant by default', () => {
    render(<Button>Primary Button</Button>);
    const button = screen.getByText('Primary Button');
    expect(button).toHaveClass('bg-blue-600');
  });

  test('applies secondary variant when specified', () => {
    render(<Button variant="secondary">Secondary Button</Button>);
    const button = screen.getByText('Secondary Button');
    expect(button).toHaveClass('bg-gray-600');
  });

  test('applies danger variant when specified', () => {
    render(<Button variant="danger">Danger Button</Button>);
    const button = screen.getByText('Danger Button');
    expect(button).toHaveClass('bg-red-600');
  });

  test('applies medium size by default', () => {
    render(<Button>Medium Button</Button>);
    const button = screen.getByText('Medium Button');
    expect(button).toHaveClass('px-4', 'py-2');
  });

  test('applies small size when specified', () => {
    render(<Button size="small">Small Button</Button>);
    const button = screen.getByText('Small Button');
    expect(button).toHaveClass('px-3', 'py-1');
  });

  test('applies large size when specified', () => {
    render(<Button size="large">Large Button</Button>);
    const button = screen.getByText('Large Button');
    expect(button).toHaveClass('px-6', 'py-3');
  });

  test('shows loading state', () => {
    render(<Button loading>Loading Button</Button>);
    expect(screen.getByText('در حال بارگذاری...')).toBeInTheDocument();
  });

  test('is disabled when loading', () => {
    render(<Button loading>Loading Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  test('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  test('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Clickable Button</Button>);
    
    fireEvent.click(screen.getByText('Clickable Button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('does not call onClick when disabled', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick} disabled>Disabled Button</Button>);
    
    fireEvent.click(screen.getByText('Disabled Button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  test('applies custom className', () => {
    render(<Button className="custom-class">Custom Button</Button>);
    const button = screen.getByText('Custom Button');
    expect(button).toHaveClass('custom-class');
  });

  test('renders as submit type when specified', () => {
    render(<Button type="submit">Submit Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'submit');
  });
});
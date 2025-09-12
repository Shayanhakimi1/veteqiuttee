import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Alert from '../../components/common/Alert';

describe('Alert Component', () => {
  test('renders alert with message', () => {
    render(<Alert message="این یک پیام تست است" />);
    expect(screen.getByText('این یک پیام تست است')).toBeInTheDocument();
  });

  test('renders alert with title and message', () => {
    render(<Alert title="عنوان" message="پیام" />);
    expect(screen.getByText('عنوان')).toBeInTheDocument();
    expect(screen.getByText('پیام')).toBeInTheDocument();
  });

  test('applies success type styles', () => {
    render(<Alert type="success" message="موفقیت" />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-green-50', 'border-green-200');
  });

  test('applies error type styles', () => {
    render(<Alert type="error" message="خطا" />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-red-50', 'border-red-200');
  });

  test('applies warning type styles', () => {
    render(<Alert type="warning" message="هشدار" />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-yellow-50', 'border-yellow-200');
  });

  test('applies info type styles', () => {
    render(<Alert type="info" message="اطلاعات" />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-blue-50', 'border-blue-200');
  });

  test('shows icon when showIcon is true', () => {
    render(<Alert type="success" message="موفقیت" showIcon />);
    const icon = screen.getByRole('img', { hidden: true });
    expect(icon).toBeInTheDocument();
  });

  test('does not show icon when showIcon is false', () => {
    render(<Alert type="success" message="موفقیت" showIcon={false} />);
    const icon = screen.queryByRole('img', { hidden: true });
    expect(icon).not.toBeInTheDocument();
  });

  test('shows close button when onClose is provided', () => {
    const handleClose = jest.fn();
    render(<Alert message="پیام" onClose={handleClose} />);
    const closeButton = screen.getByRole('button');
    expect(closeButton).toBeInTheDocument();
  });

  test('calls onClose when close button is clicked', () => {
    const handleClose = jest.fn();
    render(<Alert message="پیام" onClose={handleClose} />);
    
    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);
    
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  test('does not show close button when onClose is not provided', () => {
    render(<Alert message="پیام" />);
    const closeButton = screen.queryByRole('button');
    expect(closeButton).not.toBeInTheDocument();
  });

  test('renders children content', () => {
    render(
      <Alert message="پیام">
        <div>محتوای اضافی</div>
      </Alert>
    );
    expect(screen.getByText('محتوای اضافی')).toBeInTheDocument();
  });

  test('applies custom className', () => {
    render(<Alert message="پیام" className="custom-alert" />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('custom-alert');
  });

  test('renders without title when only message is provided', () => {
    render(<Alert message="فقط پیام" />);
    expect(screen.getByText('فقط پیام')).toBeInTheDocument();
    
    // Check that no title element exists
    const titleElements = screen.queryAllByRole('heading');
    expect(titleElements).toHaveLength(0);
  });

  test('has correct ARIA attributes', () => {
    render(<Alert message="پیام" />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('role', 'alert');
  });
});
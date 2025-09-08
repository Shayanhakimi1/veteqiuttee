import React from 'react';

// کامپوننت دکمه با انواع مختلف
const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  disabled = false, 
  onClick, 
  type = 'button',
  className = '',
  ...props 
}) => {
  // تعریف کلاس‌های مختلف بر اساس variant
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'btn-primary';
      case 'outline':
        return 'btn-outline';
      case 'secondary':
        return 'bg-gray-500 text-white hover:bg-gray-600';
      case 'success':
        return 'bg-green-500 text-white hover:bg-green-600';
      case 'danger':
        return 'bg-red-500 text-white hover:bg-red-600';
      default:
        return 'btn-primary';
    }
  };

  // تعریف کلاس‌های اندازه
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-4 py-2 text-sm';
      case 'md':
        return 'px-6 py-3 text-base';
      case 'lg':
        return 'px-8 py-4 text-lg';
      default:
        return 'px-6 py-3 text-base';
    }
  };

  // کلاس‌های پایه
  const baseClasses = 'rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed';
  
  // ترکیب تمام کلاس‌ها
  const buttonClasses = `
    ${baseClasses}
    ${getVariantClasses()}
    ${getSizeClasses()}
    ${loading || disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `.trim();

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>در حال پردازش...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
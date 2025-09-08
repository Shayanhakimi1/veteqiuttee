import React from 'react';

// کامپوننت کارت اصلی
export const Card = ({ 
  children, 
  variant = 'default', 
  size = 'md',
  hover = true,
  className = '',
  onClick,
  ...props 
}) => {
  // تعریف کلاس‌های مختلف بر اساس variant
  const getVariantClasses = () => {
    switch (variant) {
      case 'default':
        return 'card';
      case 'glass':
        return 'card-glass';
      case 'outlined':
        return 'bg-white border-2 border-gray-200 rounded-2xl transition-all duration-300';
      case 'elevated':
        return 'bg-white rounded-2xl shadow-strong transition-all duration-300';
      case 'flat':
        return 'bg-white rounded-2xl transition-all duration-300';
      case 'gradient':
        return 'bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl transition-all duration-300 border border-primary-100';
      default:
        return 'card';
    }
  };

  // تعریف کلاس‌های اندازه
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'p-4';
      case 'md':
        return 'p-6';
      case 'lg':
        return 'p-8';
      case 'xl':
        return 'p-10';
      default:
        return 'p-6';
    }
  };

  // کلاس‌های hover
  const hoverClasses = hover ? 'hover:shadow-strong hover:-translate-y-1' : '';
  
  // کلاس‌های clickable
  const clickableClasses = onClick ? 'cursor-pointer' : '';

  // ترکیب تمام کلاس‌ها
  const combinedClasses = `
    ${getVariantClasses()}
    ${getSizeClasses()}
    ${hoverClasses}
    ${clickableClasses}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div
      className={combinedClasses}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

// کامپوننت هدر کارت
export const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`mb-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// کامپوننت عنوان کارت
export const CardTitle = ({ children, className = '', ...props }) => {
  return (
    <h3 
      className={`text-xl font-semibold text-gray-800 mb-2 ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
};

// کامپوننت توضیحات کارت
export const CardDescription = ({ children, className = '', ...props }) => {
  return (
    <p 
      className={`text-gray-600 text-sm ${className}`}
      {...props}
    >
      {children}
    </p>
  );
};

// کامپوننت محتوای کارت
export const CardContent = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// کامپوننت فوتر کارت
export const CardFooter = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`mt-4 pt-4 border-t border-gray-100 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// اضافه کردن کامپوننت‌های فرعی به Card
Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
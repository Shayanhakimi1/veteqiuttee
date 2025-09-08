import React from 'react';

// کامپوننت نشان (Badge)
export const Badge = ({ 
  children, 
  variant = 'default', 
  size = 'md',
  rounded = true,
  className = '', 
  ...props 
}) => {
  // کلاس‌های پایه
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200';
  
  // تعریف کلاس‌های مختلف بر اساس variant
  const getVariantClasses = () => {
    switch (variant) {
      case 'default':
        return 'bg-gray-100 text-gray-800 border border-gray-200';
      case 'primary':
        return 'bg-primary-100 text-primary-800 border border-primary-200';
      case 'secondary':
        return 'bg-secondary-100 text-secondary-800 border border-secondary-200';
      case 'success':
        return 'bg-success-100 text-success-800 border border-success-200';
      case 'warning':
        return 'bg-warning-100 text-warning-800 border border-warning-200';
      case 'error':
      case 'danger':
        return 'bg-error-100 text-error-800 border border-error-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'outline':
        return 'bg-transparent text-gray-700 border border-gray-300';
      case 'solid-primary':
        return 'bg-primary-500 text-white border border-primary-500';
      case 'solid-success':
        return 'bg-success-500 text-white border border-success-500';
      case 'solid-warning':
        return 'bg-warning-500 text-white border border-warning-500';
      case 'solid-error':
        return 'bg-error-500 text-white border border-error-500';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  // تعریف کلاس‌های اندازه
  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'px-2 py-0.5 text-xs';
      case 'sm':
        return 'px-2.5 py-1 text-xs';
      case 'md':
        return 'px-3 py-1.5 text-sm';
      case 'lg':
        return 'px-4 py-2 text-base';
      case 'xl':
        return 'px-5 py-2.5 text-lg';
      default:
        return 'px-3 py-1.5 text-sm';
    }
  };

  // کلاس‌های گردی
  const getRoundedClasses = () => {
    if (!rounded) return '';
    
    switch (size) {
      case 'xs':
      case 'sm':
        return 'rounded-md';
      case 'md':
        return 'rounded-lg';
      case 'lg':
      case 'xl':
        return 'rounded-xl';
      default:
        return 'rounded-lg';
    }
  };
  
  // ترکیب کلاس‌ها
  const allClasses = `
    ${baseClasses}
    ${getVariantClasses()}
    ${getSizeClasses()}
    ${getRoundedClasses()}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <span 
      className={allClasses}
      {...props}
    >
      {children}
    </span>
  );
};

// کامپوننت Status Tag
export const StatusTag = ({ 
  status,
  children,
  showDot = true,
  className = '',
  ...props 
}) => {
  // تعریف رنگ‌ها بر اساس وضعیت
  const getStatusClasses = () => {
    switch (status) {
      case 'active':
      case 'online':
      case 'success':
        return {
          badge: 'bg-success-100 text-success-800 border border-success-200',
          dot: 'bg-success-500'
        };
      case 'pending':
      case 'warning':
        return {
          badge: 'bg-warning-100 text-warning-800 border border-warning-200',
          dot: 'bg-warning-500'
        };
      case 'inactive':
      case 'offline':
      case 'error':
        return {
          badge: 'bg-error-100 text-error-800 border border-error-200',
          dot: 'bg-error-500'
        };
      case 'processing':
      case 'info':
        return {
          badge: 'bg-blue-100 text-blue-800 border border-blue-200',
          dot: 'bg-blue-500'
        };
      default:
        return {
          badge: 'bg-gray-100 text-gray-800 border border-gray-200',
          dot: 'bg-gray-500'
        };
    }
  };

  const statusClasses = getStatusClasses();
  const baseClasses = 'inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200';
  
  const allClasses = `${baseClasses} ${statusClasses.badge} ${className}`;

  return (
    <span
      className={allClasses}
      {...props}
    >
      {showDot && (
        <span 
          className={`w-2 h-2 rounded-full ${statusClasses.dot}`}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
};

export default Badge;
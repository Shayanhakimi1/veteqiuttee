import React from 'react';
import PropTypes from 'prop-types';

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
  fullWidth = false,
  ...props 
}) => {
  // تعریف کلاس‌های مختلف بر اساس variant
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'btn-primary';
      case 'secondary':
        return 'btn-secondary';
      case 'outline':
        return 'btn-outline';
      case 'ghost':
        return 'btn-ghost';
      case 'success':
        return 'bg-gradient-to-r from-success-500 to-success-600 text-white hover:from-success-600 hover:to-success-700 shadow-elevation-2 hover:shadow-elevation-4 transition-all duration-smooth hover:-translate-y-1';
      case 'warning':
        return 'bg-gradient-to-r from-warning-500 to-warning-600 text-white hover:from-warning-600 hover:to-warning-700 shadow-elevation-2 hover:shadow-elevation-4 transition-all duration-smooth hover:-translate-y-1';
      case 'error':
      case 'danger':
        return 'bg-gradient-to-r from-error-500 to-error-600 text-white hover:from-error-600 hover:to-error-700 shadow-elevation-2 hover:shadow-elevation-4 transition-all duration-smooth hover:-translate-y-1';
      case 'info':
        return 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 shadow-elevation-2 hover:shadow-elevation-4 transition-all duration-smooth hover:-translate-y-1';
      case 'glass':
        return 'bg-glass-white backdrop-blur-lg border border-glass-light text-white hover:bg-glass-light shadow-glass transition-all duration-smooth hover:-translate-y-1';
      case 'glass-dark':
        return 'bg-glass-dark backdrop-blur-lg border border-neutral-700/30 text-neutral-800 hover:bg-neutral-800/20 shadow-glass transition-all duration-smooth hover:-translate-y-1';
      case 'gradient':
        return 'bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 text-white hover:from-primary-600 hover:via-secondary-600 hover:to-accent-600 shadow-elevation-3 hover:shadow-elevation-5 transition-all duration-bounce hover:-translate-y-2';
      case 'gradient-warm':
        return 'bg-gradient-to-r from-accent-500 to-warning-500 text-white hover:from-accent-600 hover:to-warning-600 shadow-elevation-2 hover:shadow-elevation-4 transition-all duration-smooth hover:-translate-y-1';
      case 'gradient-cool':
        return 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:from-primary-600 hover:to-secondary-600 shadow-elevation-2 hover:shadow-elevation-4 transition-all duration-smooth hover:-translate-y-1';
      case 'minimal':
        return 'bg-transparent text-neutral-700 hover:bg-neutral-100 border border-neutral-200 hover:border-neutral-300 transition-all duration-200';
      case 'soft':
        return 'bg-primary-50 text-primary-700 hover:bg-primary-100 border border-primary-200 hover:border-primary-300 transition-all duration-200';
      case 'elevated':
        return 'bg-white text-neutral-700 hover:bg-neutral-50 shadow-elevation-2 hover:shadow-elevation-4 border border-neutral-200 transition-all duration-smooth hover:-translate-y-1';
      case 'flat':
        return 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border border-neutral-300 hover:border-neutral-400 transition-all duration-200';
      default:
        return 'btn-primary';
    }
  };

  // تعریف کلاس‌های اندازه
  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'px-3 py-1.5 text-xs font-medium';
      case 'sm':
        return 'px-4 py-2 text-sm font-medium';
      case 'md':
        return 'px-6 py-3 text-base font-medium';
      case 'lg':
        return 'px-8 py-4 text-lg font-semibold';
      case 'xl':
        return 'px-10 py-5 text-xl font-semibold';
      case 'icon':
        return 'p-3 text-base';
      default:
        return 'px-6 py-3 text-base font-medium';
    }
  };

  // کلاس‌های پایه
  const baseClasses = 'inline-flex items-center justify-center rounded-xl transition-all duration-smooth focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none active:scale-95 select-none';
  
  // کلاس‌های loading
  const loadingClasses = loading ? 'cursor-wait' : '';
  
  // کلاس‌های disabled
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';
  
  // کلاس‌های full width
  const widthClasses = fullWidth ? 'w-full' : '';
  
  // ترکیب تمام کلاس‌ها
  const combinedClasses = `
    ${baseClasses}
    ${getVariantClasses()}
    ${getSizeClasses()}
    ${widthClasses}
    ${loadingClasses}
    ${disabledClasses}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <button
      type={type}
      onClick={disabled || loading ? undefined : onClick}
      disabled={disabled || loading}
      className={combinedClasses}
      {...props}
    >
      {loading && (
        <div className="flex items-center">
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>در حال بارگذاری...</span>
        </div>
      )}
      {!loading && children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'ghost', 'success', 'warning', 'danger']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  className: PropTypes.string,
  fullWidth: PropTypes.bool
};

Button.defaultProps = {
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false,
  type: 'button',
  className: '',
  fullWidth: false
};

export { Button };
export default Button;
import React from 'react';

// کامپوننت ورودی
export const Input = ({ 
  type = 'text',
  placeholder = '',
  value,
  onChange,
  disabled = false,
  error = false,
  success = false,
  variant = 'default',
  size = 'md',
  icon,
  label,
  helperText,
  errorMessage,
  className = '',
  ...props 
}) => {
  // کلاس‌های پایه
  const baseClasses = 'input-field';
  
  // کلاس‌های variant
  const getVariantClasses = () => {
    switch (variant) {
      case 'outlined':
        return 'border-2 border-neutral-200 bg-transparent rounded-xl focus:border-primary-500 focus:ring-primary-100 transition-all duration-smooth';
      case 'filled':
        return 'bg-neutral-50 border-0 rounded-xl focus:bg-white focus:ring-primary-100 transition-all duration-smooth hover:bg-neutral-100';
      case 'underlined':
        return 'border-0 border-b-2 border-neutral-200 rounded-none bg-transparent focus:border-primary-500 transition-all duration-smooth';
      case 'glass':
        return 'bg-glass-white backdrop-blur-lg border border-glass-light rounded-xl focus:bg-glass-light focus:border-glass-border text-white placeholder-white/60 transition-all duration-smooth';
      case 'glass-dark':
        return 'bg-glass-dark backdrop-blur-lg border border-neutral-700/30 rounded-xl focus:bg-neutral-800/20 focus:border-neutral-600/40 text-neutral-800 placeholder-neutral-500 transition-all duration-smooth';
      case 'gradient':
        return 'bg-gradient-surface border border-neutral-200 rounded-xl focus:border-primary-500 transition-all duration-smooth';
      case 'minimal':
        return 'bg-transparent border-0 border-b border-neutral-300 rounded-none focus:border-primary-500 transition-all duration-smooth';
      case 'elevated':
        return 'bg-white border border-neutral-200 rounded-xl shadow-elevation-1 focus:shadow-elevation-2 focus:border-primary-500 transition-all duration-smooth';
      case 'soft':
        return 'bg-primary-50 border border-primary-200 rounded-xl focus:bg-primary-100 focus:border-primary-400 transition-all duration-smooth';
      case 'flat':
        return 'bg-neutral-100 border border-neutral-300 rounded-xl focus:bg-neutral-50 focus:border-primary-500 transition-all duration-smooth';
      default:
        return '';
    }
  };

  // کلاس‌های اندازه
  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'px-2 py-1.5 text-xs';
      case 'sm':
        return 'px-3 py-2 text-sm';
      case 'md':
        return 'px-4 py-3 text-base';
      case 'lg':
        return 'px-5 py-4 text-lg';
      case 'xl':
        return 'px-6 py-5 text-xl';
      default:
        return 'px-4 py-3 text-base';
    }
  };
  
  // کلاس‌های وضعیت
  const getStateClasses = () => {
    if (error) {
      return 'border-error-500 focus:border-error-500 focus:ring-error-100 bg-error-50 shadow-elevation-1 focus:shadow-elevation-2';
    }
    if (success) {
      return 'border-success-500 focus:border-success-500 focus:ring-success-100 bg-success-50 shadow-elevation-1 focus:shadow-elevation-2';
    }
    if (disabled) {
      return 'border-neutral-200 bg-neutral-50 text-neutral-400 cursor-not-allowed opacity-60';
    }
    return 'hover:shadow-elevation-1 focus:shadow-elevation-2';
  };

  // ترکیب کلاس‌ها
  const allClasses = `
    ${baseClasses}
    ${getVariantClasses()}
    ${getSizeClasses()}
    ${getStateClasses()}
    ${icon ? 'pr-10' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={allClasses}
          {...props}
        />
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400">
            {icon}
          </div>
        )}
      </div>
      {(helperText || errorMessage) && (
        <p className={`mt-1 text-sm ${
          error ? 'text-error-600' : success ? 'text-success-600' : 'text-neutral-500'
        }`}>
          {error ? errorMessage : helperText}
        </p>
      )}
    </div>
  );
};

// کامپوننت Textarea
export const Textarea = ({ 
  placeholder = '',
  value,
  onChange,
  disabled = false,
  error = false,
  success = false,
  rows = 4,
  label,
  helperText,
  errorMessage,
  className = '',
  ...props 
}) => {
  // کلاس‌های پایه
  const baseClasses = 'textarea-field resize-none';
  
  // کلاس‌های وضعیت
  const getStateClasses = () => {
    if (error) {
      return 'border-error-500 focus:border-error-500 focus:ring-error-100 bg-error-50 shadow-elevation-1 focus:shadow-elevation-2 transition-all duration-smooth';
    }
    if (success) {
      return 'border-success-500 focus:border-success-500 focus:ring-success-100 bg-success-50 shadow-elevation-1 focus:shadow-elevation-2 transition-all duration-smooth';
    }
    if (disabled) {
      return 'border-neutral-200 bg-neutral-50 text-neutral-400 cursor-not-allowed opacity-60';
    }
    return 'hover:shadow-elevation-1 focus:shadow-elevation-2 transition-all duration-smooth';
  };

  const allClasses = `${baseClasses} ${getStateClasses()} ${className}`;

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          {label}
        </label>
      )}
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        rows={rows}
        className={allClasses}
        {...props}
      />
      {(helperText || errorMessage) && (
        <p className={`mt-1 text-sm ${
          error ? 'text-error-600' : success ? 'text-success-600' : 'text-neutral-500'
        }`}>
          {error ? errorMessage : helperText}
        </p>
      )}
    </div>
  );
};

export default Input;
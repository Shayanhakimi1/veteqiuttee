import React, { useState, forwardRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

// Enhanced Textarea component with design system integration
const Textarea = forwardRef(({
  placeholder,
  value,
  onChange,
  className = '',
  disabled = false,
  required = false,
  error = null,
  success = false,
  size = 'md',
  variant = 'default',
  label = null,
  helperText = null,
  fullWidth = true,
  rounded = true,
  rows = 4,
  cols,
  resize = 'vertical',
  maxLength,
  showCharCount = false,
  autoResize = false,
  ...props
}, ref) => {
  const { hasReducedMotion, isRtl } = useTheme();
  // Focus state and theme colors removed as they're not currently used
  const [currentLength, setCurrentLength] = useState(value?.length || 0);

  // Base textarea classes
  const baseClasses = [
    'transition-all',
    'duration-200',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-1',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    'disabled:bg-neutral-50',
    hasReducedMotion && 'transition-none',
  ];

  // Variant styles
  const getVariantClasses = () => {
    const variants = {
      default: [
        'bg-white',
        'border border-neutral-300',
        'text-neutral-900',
        'placeholder-neutral-500',
        'focus:border-primary-500',
        'focus:ring-primary-500/20',
        error && 'border-error-500 focus:border-error-500 focus:ring-error-500/20',
        success && 'border-success-500 focus:border-success-500 focus:ring-success-500/20',
      ],
      filled: [
        'bg-neutral-50',
        'border border-transparent',
        'text-neutral-900',
        'placeholder-neutral-500',
        'focus:bg-white',
        'focus:border-primary-500',
        'focus:ring-primary-500/20',
        error && 'bg-error-50 border-error-500 focus:border-error-500 focus:ring-error-500/20',
        success && 'bg-success-50 border-success-500 focus:border-success-500 focus:ring-success-500/20',
      ],
      outlined: [
        'bg-transparent',
        'border-2 border-neutral-300',
        'text-neutral-900',
        'placeholder-neutral-500',
        'focus:border-primary-500',
        'focus:ring-primary-500/20',
        error && 'border-error-500 focus:border-error-500 focus:ring-error-500/20',
        success && 'border-success-500 focus:border-success-500 focus:ring-success-500/20',
      ],
      ghost: [
        'bg-transparent',
        'border border-transparent',
        'text-neutral-900',
        'placeholder-neutral-500',
        'focus:bg-neutral-50',
        'focus:border-neutral-300',
        'focus:ring-neutral-500/20',
        error && 'focus:bg-error-50 focus:border-error-500 focus:ring-error-500/20',
        success && 'focus:bg-success-50 focus:border-success-500 focus:ring-success-500/20',
      ],
      glass: [
        'border-white/20 bg-white/10 backdrop-blur-sm',
        'hover:bg-white/15',
        'focus:bg-white/20 focus:border-primary-400 focus:ring-primary-200/50',
        'text-white placeholder:text-white/60',
        error ? 'border-error-400 focus:border-error-400 focus:ring-error-200/50' : ''
      ]
    };

    return variants[variant] || variants.default;
  };

  // Size styles
  const getSizeClasses = () => {
    const sizes = {
      xs: ['px-2', 'py-1', 'text-xs'],
      sm: ['px-3', 'py-1.5', 'text-sm'],
      md: ['px-4', 'py-2.5', 'text-base'],
      lg: ['px-5', 'py-3', 'text-lg'],
      xl: ['px-6', 'py-4', 'text-xl'],
    };

    return sizes[size] || sizes.md;
  };

  // Border radius
  const getBorderRadius = () => {
    if (!rounded) return '';
    
    const radiusMap = {
      xs: 'rounded',
      sm: 'rounded-md',
      md: 'rounded-lg',
      lg: 'rounded-xl',
      xl: 'rounded-2xl',
    };
    
    return radiusMap[size] || 'rounded-lg';
  };

  // Width classes
  const getWidthClasses = () => {
    return fullWidth ? 'w-full' : 'w-auto';
  };

  // Resize classes
  const getResizeClasses = () => {
    const resizeMap = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize',
    };
    
    return resizeMap[resize] || 'resize-y';
  };

  // Auto-resize functionality
  const handleAutoResize = (element) => {
    if (autoResize && element) {
      element.style.height = 'auto';
      element.style.height = `${element.scrollHeight}px`;
    }
  };

  // Handle change with character count
  const handleChange = (e) => {
    const newValue = e.target.value;
    setCurrentLength(newValue.length);
    
    if (autoResize) {
      handleAutoResize(e.target);
    }
    
    if (onChange) {
      onChange(e);
    }
  };

  // Combine all classes
  const textareaClasses = [
    ...baseClasses,
    ...getVariantClasses(),
    ...getSizeClasses(),
    getBorderRadius(),
    getWidthClasses(),
    getResizeClasses(),
    className,
  ].filter(Boolean).join(' ');

  // Character count display
  const renderCharCount = () => {
    if (!showCharCount && !maxLength) return null;

    const isOverLimit = maxLength && currentLength > maxLength;
    const countColor = isOverLimit ? 'text-error-500' : 'text-neutral-500';

    return (
      <div className={`text-xs ${countColor} ${isRtl ? 'text-left' : 'text-right'} mt-1`}>
        {maxLength ? `${currentLength}/${maxLength}` : currentLength}
      </div>
    );
  };

  return (
    <div className={fullWidth ? 'w-full' : 'w-auto'}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        ref={ref}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        required={required}
        rows={rows}
        cols={cols}
        maxLength={maxLength}
        className={textareaClasses}
        onFocus={props.onFocus}
        onBlur={props.onBlur}
        {...props}
      />
      
      {renderCharCount()}
      
      {(error || success || helperText) && (
        <div className="mt-2">
          {error && (
            <p className="text-sm text-error-600 flex items-center gap-1">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </p>
          )}
          {success && !error && (
            <p className="text-sm text-success-600 flex items-center gap-1">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              عملیات با موفقیت انجام شد
            </p>
          )}
          {helperText && !error && !success && (
            <p className="text-sm text-neutral-600">{helperText}</p>
          )}
        </div>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export { Textarea };
import React, { useState, forwardRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

// Enhanced Input component with design system integration
const Input = forwardRef(({
  type = 'text',
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
  leftIcon = null,
  rightIcon = null,
  leftAddon = null,
  rightAddon = null,
  fullWidth = true,
  rounded = true,
  ...props
}, ref) => {
  const { hasReducedMotion, isRtl } = useTheme();
  // Focus state removed as it's not currently used in styling
  const [showPassword, setShowPassword] = useState(false);

  // Base input classes
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

  // Icon/addon padding adjustments
  const getIconPadding = () => {
    const iconPadding = {
      xs: leftIcon || leftAddon ? 'pl-8' : rightIcon || rightAddon ? 'pr-8' : '',
      sm: leftIcon || leftAddon ? 'pl-10' : rightIcon || rightAddon ? 'pr-10' : '',
      md: leftIcon || leftAddon ? 'pl-12' : rightIcon || rightAddon ? 'pr-12' : '',
      lg: leftIcon || leftAddon ? 'pl-14' : rightIcon || rightAddon ? 'pr-14' : '',
      xl: leftIcon || leftAddon ? 'pl-16' : rightIcon || rightAddon ? 'pr-16' : '',
    };

    const leftPadding = leftIcon || leftAddon ? iconPadding[size] : '';
    const rightPadding = rightIcon || rightAddon ? iconPadding[size].replace('pl-', 'pr-') : '';
    
    return [leftPadding, rightPadding].filter(Boolean).join(' ');
  };

  // Combine all classes
  const inputClasses = [
    ...baseClasses,
    ...getVariantClasses(),
    ...getSizeClasses(),
    getBorderRadius(),
    getWidthClasses(),
    getIconPadding(),
    className,
  ].filter(Boolean).join(' ');

  // Handle password visibility toggle
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Get input type (handle password visibility)
  const getInputType = () => {
    if (type === 'password') {
      return showPassword ? 'text' : 'password';
    }
    return type;
  };

  // Icon positioning classes
  const getIconClasses = (position) => {
    const baseIconClasses = [
      'absolute',
      'top-1/2',
      'transform',
      '-translate-y-1/2',
      'text-neutral-400',
      'pointer-events-none',
    ];

    const positionClasses = {
      left: isRtl ? 'right-3' : 'left-3',
      right: isRtl ? 'left-3' : 'right-3',
    };

    const sizeClasses = {
      xs: 'w-3 h-3',
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
      xl: 'w-7 h-7',
    };

    return [
      ...baseIconClasses,
      positionClasses[position],
      sizeClasses[size],
    ].join(' ');
  };

  // Render password toggle icon
  const renderPasswordToggle = () => {
    if (type !== 'password') return null;

    return (
      <button
        type="button"
        className={`absolute top-1/2 transform -translate-y-1/2 ${isRtl ? 'left-3' : 'right-3'} text-neutral-400 hover:text-neutral-600 pointer-events-auto`}
        onClick={togglePasswordVisibility}
        tabIndex={-1}
      >
        {showPassword ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        )}
      </button>
    );
  };

  // Input wrapper component
  const InputWrapper = ({ children }) => {
    if (leftIcon || rightIcon || leftAddon || rightAddon || type === 'password') {
      return (
        <div className="relative">
          {children}
          {leftIcon && (
            <div className={getIconClasses('left')}>
              {React.cloneElement(leftIcon, { className: 'w-full h-full' })}
            </div>
          )}
          {rightIcon && !type === 'password' && (
            <div className={getIconClasses('right')}>
              {React.cloneElement(rightIcon, { className: 'w-full h-full' })}
            </div>
          )}
          {leftAddon && (
            <div className={`absolute top-1/2 transform -translate-y-1/2 ${isRtl ? 'right-3' : 'left-3'} text-neutral-500 text-sm pointer-events-none`}>
              {leftAddon}
            </div>
          )}
          {rightAddon && (
            <div className={`absolute top-1/2 transform -translate-y-1/2 ${isRtl ? 'left-3' : 'right-3'} text-neutral-500 text-sm pointer-events-none`}>
              {rightAddon}
            </div>
          )}
          {renderPasswordToggle()}
        </div>
      );
    }
    return children;
  };

  return (
    <div className={fullWidth ? 'w-full' : 'w-auto'}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <InputWrapper>
        <input
          ref={ref}
          type={getInputType()}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={inputClasses}
          onFocus={props.onFocus}
          onBlur={props.onBlur}
          {...props}
        />
      </InputWrapper>
      
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

Input.displayName = 'Input';

export { Input };
export default Input;
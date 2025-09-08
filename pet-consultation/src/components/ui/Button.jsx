import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import LoadingSpinner from '../common/LoadingSpinner';

// Enhanced Button component with design system integration
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
  icon = null,
  iconPosition = 'left',
  rounded = false,
  shadow = true,
  ...props 
}) => {
  const { hasReducedMotion } = useTheme();

  // Base button classes
  const baseClasses = [
    'inline-flex',
    'items-center',
    'justify-center',
    'font-medium',
    'transition-all',
    'duration-200',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    'disabled:pointer-events-none',
  ];

  // Variant styles
  const getVariantClasses = () => {
    const variants = {
      primary: [
        'bg-primary-500',
        'hover:bg-primary-600',
        'active:bg-primary-700',
        'text-white',
        'border-transparent',
        'focus:ring-primary-500',
        shadow && 'shadow-md',
        shadow && 'hover:shadow-lg',
      ],
      secondary: [
        'bg-secondary-500',
        'hover:bg-secondary-600',
        'active:bg-secondary-700',
        'text-white',
        'border-transparent',
        'focus:ring-secondary-500',
        shadow && 'shadow-md',
        shadow && 'hover:shadow-lg',
      ],
      outline: [
        'bg-transparent',
        'hover:bg-primary-50',
        'active:bg-primary-100',
        'text-primary-600',
        'border-2',
        'border-primary-500',
        'hover:border-primary-600',
        'focus:ring-primary-500',
      ],
      ghost: [
        'bg-transparent',
        'hover:bg-neutral-100',
        'active:bg-neutral-200',
        'text-neutral-700',
        'border-transparent',
        'focus:ring-neutral-500',
      ],
      success: [
        'bg-success-500',
        'hover:bg-success-600',
        'active:bg-success-700',
        'text-white',
        'border-transparent',
        'focus:ring-success-500',
        shadow && 'shadow-md',
        shadow && 'hover:shadow-lg',
      ],
      warning: [
        'bg-warning-500',
        'hover:bg-warning-600',
        'active:bg-warning-700',
        'text-white',
        'border-transparent',
        'focus:ring-warning-500',
        shadow && 'shadow-md',
        shadow && 'hover:shadow-lg',
      ],
      error: [
        'bg-error-500',
        'hover:bg-error-600',
        'active:bg-error-700',
        'text-white',
        'border-transparent',
        'focus:ring-error-500',
        shadow && 'shadow-md',
        shadow && 'hover:shadow-lg',
      ],
      info: [
        'bg-info-500',
        'hover:bg-info-600',
        'active:bg-info-700',
        'text-white',
        'border-transparent',
        'focus:ring-info-500',
        shadow && 'shadow-md',
        shadow && 'hover:shadow-lg',
      ],
      glass: [
        'bg-white/20',
        'hover:bg-white/30',
        'active:bg-white/40',
        'text-white',
        'border',
        'border-white/20',
        'backdrop-blur-lg',
        'focus:ring-white/50',
      ],
      minimal: [
        'bg-transparent',
        'hover:bg-neutral-50',
        'active:bg-neutral-100',
        'text-neutral-600',
        'border',
        'border-neutral-200',
        'hover:border-neutral-300',
        'focus:ring-neutral-500',
      ],
    };

    return variants[variant] || variants.primary;
  };

  // Size styles
  const getSizeClasses = () => {
    const sizes = {
      xs: ['px-2', 'py-1', 'text-xs', 'gap-1'],
      sm: ['px-3', 'py-1.5', 'text-sm', 'gap-1.5'],
      md: ['px-4', 'py-2', 'text-base', 'gap-2'],
      lg: ['px-6', 'py-3', 'text-lg', 'gap-2.5'],
      xl: ['px-8', 'py-4', 'text-xl', 'gap-3'],
    };

    return sizes[size] || sizes.md;
  };

  // Border radius
  const getBorderRadius = () => {
    if (rounded) return 'rounded-full';
    
    const radiusMap = {
      xs: 'rounded-sm',
      sm: 'rounded',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
    };
    
    return radiusMap[size] || 'rounded-md';
  };

  // Full width
  const getWidthClasses = () => {
    return fullWidth ? 'w-full' : 'w-auto';
  };

  // Combine all classes
  const buttonClasses = [
    ...baseClasses,
    ...getVariantClasses(),
    ...getSizeClasses(),
    getBorderRadius(),
    getWidthClasses(),
    hasReducedMotion && 'transition-none',
    className,
  ].filter(Boolean).join(' ');

  // Handle click with loading state
  const handleClick = (e) => {
    if (loading || disabled) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  // Icon rendering
  const renderIcon = () => {
    if (!icon) return null;
    
    const iconClasses = [
      'flex-shrink-0',
      size === 'xs' ? 'w-3 h-3' : '',
      size === 'sm' ? 'w-4 h-4' : '',
      size === 'md' ? 'w-5 h-5' : '',
      size === 'lg' ? 'w-6 h-6' : '',
      size === 'xl' ? 'w-7 h-7' : '',
    ].filter(Boolean).join(' ');

    return React.cloneElement(icon, { className: iconClasses });
  };

  // Content rendering
  const renderContent = () => {
    if (loading) {
      return (
        <>
          <LoadingSpinner 
            size={size === 'xs' || size === 'sm' ? 'sm' : 'md'} 
            className="text-current" 
          />
          {children && <span className="ml-2">{children}</span>}
        </>
      );
    }

    if (icon && iconPosition === 'left') {
      return (
        <>
          {renderIcon()}
          {children && <span>{children}</span>}
        </>
      );
    }

    if (icon && iconPosition === 'right') {
      return (
        <>
          {children && <span>{children}</span>}
          {renderIcon()}
        </>
      );
    }

    return children;
  };

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {renderContent()}
    </button>
  );
};

// Button variants as separate components for convenience
export const PrimaryButton = (props) => <Button variant="primary" {...props} />;
export const SecondaryButton = (props) => <Button variant="secondary" {...props} />;
export const OutlineButton = (props) => <Button variant="outline" {...props} />;
export const GhostButton = (props) => <Button variant="ghost" {...props} />;
export const SuccessButton = (props) => <Button variant="success" {...props} />;
export const WarningButton = (props) => <Button variant="warning" {...props} />;
export const ErrorButton = (props) => <Button variant="error" {...props} />;
export const InfoButton = (props) => <Button variant="info" {...props} />;
export const GlassButton = (props) => <Button variant="glass" {...props} />;
export const MinimalButton = (props) => <Button variant="minimal" {...props} />;

export { Button };
export default Button;
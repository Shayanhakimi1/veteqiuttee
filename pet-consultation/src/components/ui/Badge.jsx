import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

// Enhanced Badge component with design system integration
const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  rounded = true,
  removable = false,
  onRemove,
  icon,
  dot = false,
  pulse = false,
  className = '',
  ...props
}) => {
  const { hasReducedMotion, isRtl } = useTheme();

  // Variant styles
  const getVariantClasses = () => {
    const variants = {
      default: [
        'bg-neutral-100',
        'text-neutral-800',
        'border border-neutral-200',
      ],
      primary: [
        'bg-primary-100',
        'text-primary-800',
        'border border-primary-200',
      ],
      secondary: [
        'bg-secondary-100',
        'text-secondary-800',
        'border border-secondary-200',
      ],
      success: [
        'bg-success-100',
        'text-success-800',
        'border border-success-200',
      ],
      warning: [
        'bg-warning-100',
        'text-warning-800',
        'border border-warning-200',
      ],
      error: [
        'bg-error-100',
        'text-error-800',
        'border border-error-200',
      ],
      info: [
        'bg-blue-100',
        'text-blue-800',
        'border border-blue-200',
      ],
      // Solid variants
      'primary-solid': [
        'bg-primary-500',
        'text-white',
        'border border-primary-500',
      ],
      'secondary-solid': [
        'bg-secondary-500',
        'text-white',
        'border border-secondary-500',
      ],
      'success-solid': [
        'bg-success-500',
        'text-white',
        'border border-success-500',
      ],
      'warning-solid': [
        'bg-warning-500',
        'text-white',
        'border border-warning-500',
      ],
      'error-solid': [
        'bg-error-500',
        'text-white',
        'border border-error-500',
      ],
      'info-solid': [
        'bg-blue-500',
        'text-white',
        'border border-blue-500',
      ],
      // Outline variants
      'primary-outline': [
        'bg-transparent',
        'text-primary-600',
        'border border-primary-300',
      ],
      'secondary-outline': [
        'bg-transparent',
        'text-secondary-600',
        'border border-secondary-300',
      ],
      'success-outline': [
        'bg-transparent',
        'text-success-600',
        'border border-success-300',
      ],
      'warning-outline': [
        'bg-transparent',
        'text-warning-600',
        'border border-warning-300',
      ],
      'error-outline': [
        'bg-transparent',
        'text-error-600',
        'border border-error-300',
      ],
      'info-outline': [
        'bg-transparent',
        'text-blue-600',
        'border border-blue-300',
      ],
      // Glass variant
      glass: [
        'bg-white/20',
        'text-white',
        'border border-white/30',
        'backdrop-blur-sm',
      ],
    };
    return variants[variant] || variants.default;
  };

  // Size styles
  const getSizeClasses = () => {
    const sizes = {
      xs: [
        'px-1.5',
        'py-0.5',
        'text-xs',
        'font-medium',
      ],
      sm: [
        'px-2',
        'py-1',
        'text-xs',
        'font-medium',
      ],
      md: [
        'px-2.5',
        'py-1',
        'text-sm',
        'font-medium',
      ],
      lg: [
        'px-3',
        'py-1.5',
        'text-sm',
        'font-semibold',
      ],
      xl: [
        'px-4',
        'py-2',
        'text-base',
        'font-semibold',
      ],
    };
    return sizes[size] || sizes.md;
  };

  // Border radius
  const getBorderRadius = () => {
    if (!rounded) return '';
    
    const radiusMap = {
      xs: 'rounded',
      sm: 'rounded-md',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-lg',
    };
    
    return radiusMap[size] || 'rounded-md';
  };

  // Dot indicator classes
  const getDotClasses = () => {
    if (!dot) return '';
    
    const dotSizes = {
      xs: 'w-1.5 h-1.5',
      sm: 'w-2 h-2',
      md: 'w-2 h-2',
      lg: 'w-2.5 h-2.5',
      xl: 'w-3 h-3',
    };
    
    return [
      'inline-block',
      'rounded-full',
      'bg-current',
      dotSizes[size] || 'w-2 h-2',
      isRtl ? 'ml-1.5' : 'mr-1.5',
      pulse && !hasReducedMotion && 'animate-pulse',
    ].filter(Boolean).join(' ');
  };

  // Icon classes
  const getIconClasses = () => {
    const iconSizes = {
      xs: 'w-3 h-3',
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-4 h-4',
      xl: 'w-5 h-5',
    };
    
    return [
      iconSizes[size] || 'w-4 h-4',
      isRtl ? 'ml-1' : 'mr-1',
    ].join(' ');
  };

  // Remove button classes
  const getRemoveButtonClasses = () => {
    const buttonSizes = {
      xs: 'w-3 h-3',
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-4 h-4',
      xl: 'w-5 h-5',
    };
    
    return [
      'inline-flex',
      'items-center',
      'justify-center',
      'rounded-full',
      'hover:bg-black/10',
      'focus:outline-none',
      'focus:ring-1',
      'focus:ring-current',
      'transition-colors',
      'duration-200',
      buttonSizes[size] || 'w-4 h-4',
      isRtl ? 'mr-1' : 'ml-1',
      hasReducedMotion && 'transition-none',
    ].filter(Boolean).join(' ');
  };

  // Combine all classes
  const badgeClasses = [
    'inline-flex',
    'items-center',
    'justify-center',
    'whitespace-nowrap',
    'transition-colors',
    'duration-200',
    ...getVariantClasses(),
    ...getSizeClasses(),
    getBorderRadius(),
    pulse && !hasReducedMotion && 'animate-pulse',
    hasReducedMotion && 'transition-none',
    className,
  ].filter(Boolean).join(' ');

  return (
    <span className={badgeClasses} {...props}>
      {dot && <span className={getDotClasses()} />}
      {icon && (
        <span className={getIconClasses()}>
          {React.cloneElement(icon, { className: 'w-full h-full' })}
        </span>
      )}
      {children}
      {removable && (
        <button
          type="button"
          onClick={onRemove}
          className={getRemoveButtonClasses()}
          aria-label="حذف"
        >
          <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
};

// Status Badge variants for common use cases
const StatusBadge = ({ status, ...props }) => {
  const statusMap = {
    active: { variant: 'success', children: 'فعال' },
    inactive: { variant: 'error', children: 'غیرفعال' },
    pending: { variant: 'warning', children: 'در انتظار' },
    completed: { variant: 'success', children: 'تکمیل شده' },
    cancelled: { variant: 'error', children: 'لغو شده' },
    draft: { variant: 'default', children: 'پیش‌نویس' },
    published: { variant: 'primary', children: 'منتشر شده' },
    archived: { variant: 'default', children: 'بایگانی شده' },
  };

  const statusProps = statusMap[status] || { variant: 'default', children: status };
  
  return <Badge {...statusProps} {...props} />;
};

// Notification Badge for counts
const NotificationBadge = ({ count, max = 99, ...props }) => {
  const displayCount = count > max ? `${max}+` : count;
  
  return (
    <Badge
      variant="error-solid"
      size="xs"
      rounded
      {...props}
    >
      {displayCount}
    </Badge>
  );
};

Badge.Status = StatusBadge;
Badge.Notification = NotificationBadge;

export { Badge, StatusBadge, NotificationBadge };
export default Badge;
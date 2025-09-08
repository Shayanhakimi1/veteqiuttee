import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

// Enhanced Spinner component with design system integration
const Spinner = ({
  size = 'md',
  variant = 'primary',
  thickness = 'normal',
  speed = 'normal',
  label = 'در حال بارگذاری...',
  showLabel = false,
  className = '',
  ...props
}) => {
  const { hasReducedMotion } = useTheme();

  // Size styles
  const getSizeClasses = () => {
    const sizes = {
      xs: 'w-3 h-3',
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8',
      xl: 'w-12 h-12',
      '2xl': 'w-16 h-16',
    };
    return sizes[size] || sizes.md;
  };

  // Variant styles
  const getVariantClasses = () => {
    const variants = {
      primary: 'text-primary-500',
      secondary: 'text-secondary-500',
      success: 'text-success-500',
      warning: 'text-warning-500',
      error: 'text-error-500',
      white: 'text-white',
      gray: 'text-gray-500',
      current: 'text-current',
    };
    return variants[variant] || variants.primary;
  };

  // Thickness styles
  const getThicknessClasses = () => {
    const thickness_map = {
      thin: 'border-[1px]',
      normal: 'border-2',
      thick: 'border-[3px]',
      'extra-thick': 'border-4',
    };
    return thickness_map[thickness] || thickness_map.normal;
  };

  // Animation speed
  const getSpeedClasses = () => {
    if (hasReducedMotion) return '';
    
    const speeds = {
      slow: 'animate-spin-slow',
      normal: 'animate-spin',
      fast: 'animate-spin-fast',
    };
    return speeds[speed] || speeds.normal;
  };

  // Label size based on spinner size
  const getLabelClasses = () => {
    const labelSizes = {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-sm',
      lg: 'text-base',
      xl: 'text-lg',
      '2xl': 'text-xl',
    };
    return [
      'mt-2',
      'text-center',
      'font-medium',
      getVariantClasses(),
      labelSizes[size] || labelSizes.md,
    ].join(' ');
  };

  // Combine all classes
  const spinnerClasses = [
    getSizeClasses(),
    getThicknessClasses(),
    getVariantClasses(),
    'border-current',
    'border-t-transparent',
    'rounded-full',
    getSpeedClasses(),
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className="inline-flex flex-col items-center" {...props}>
      <div
        className={spinnerClasses}
        role="status"
        aria-label={label}
      />
      {showLabel && (
        <div className={getLabelClasses()}>
          {label}
        </div>
      )}
    </div>
  );
};

// Dots Spinner variant
const DotsSpinner = ({
  size = 'md',
  variant = 'primary',
  speed = 'normal',
  label = 'در حال بارگذاری...',
  showLabel = false,
  className = '',
  ...props
}) => {
  const { hasReducedMotion } = useTheme();

  // Size styles for dots
  const getDotSizeClasses = () => {
    const sizes = {
      xs: 'w-1 h-1',
      sm: 'w-1.5 h-1.5',
      md: 'w-2 h-2',
      lg: 'w-3 h-3',
      xl: 'w-4 h-4',
      '2xl': 'w-5 h-5',
    };
    return sizes[size] || sizes.md;
  };

  // Variant styles
  const getVariantClasses = () => {
    const variants = {
      primary: 'bg-primary-500',
      secondary: 'bg-secondary-500',
      success: 'bg-success-500',
      warning: 'bg-warning-500',
      error: 'bg-error-500',
      white: 'bg-white',
      gray: 'bg-gray-500',
      current: 'bg-current',
    };
    return variants[variant] || variants.primary;
  };

  // Animation classes
  const getAnimationClasses = () => {
    if (hasReducedMotion) return '';
    
    const speeds = {
      slow: 'animate-bounce-slow',
      normal: 'animate-bounce',
      fast: 'animate-bounce-fast',
    };
    return speeds[speed] || speeds.normal;
  };

  // Gap between dots based on size
  const getGapClasses = () => {
    const gaps = {
      xs: 'gap-0.5',
      sm: 'gap-1',
      md: 'gap-1',
      lg: 'gap-1.5',
      xl: 'gap-2',
      '2xl': 'gap-2.5',
    };
    return gaps[size] || gaps.md;
  };

  const dotClasses = [
    getDotSizeClasses(),
    getVariantClasses(),
    'rounded-full',
    getAnimationClasses(),
  ].filter(Boolean).join(' ');

  const containerClasses = [
    'inline-flex',
    'items-center',
    getGapClasses(),
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className="inline-flex flex-col items-center" {...props}>
      <div className={containerClasses} role="status" aria-label={label}>
        <div className={dotClasses} style={{ animationDelay: '0ms' }} />
        <div className={dotClasses} style={{ animationDelay: '150ms' }} />
        <div className={dotClasses} style={{ animationDelay: '300ms' }} />
      </div>
      {showLabel && (
        <div className={`mt-2 text-center font-medium ${getVariantClasses()}`}>
          {label}
        </div>
      )}
    </div>
  );
};

// Pulse Spinner variant
const PulseSpinner = ({
  size = 'md',
  variant = 'primary',
  speed = 'normal',
  label = 'در حال بارگذاری...',
  showLabel = false,
  className = '',
  ...props
}) => {
  const { hasReducedMotion } = useTheme();

  // Size styles
  const getSizeClasses = () => {
    const sizes = {
      xs: 'w-3 h-3',
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8',
      xl: 'w-12 h-12',
      '2xl': 'w-16 h-16',
    };
    return sizes[size] || sizes.md;
  };

  // Variant styles
  const getVariantClasses = () => {
    const variants = {
      primary: 'bg-primary-500',
      secondary: 'bg-secondary-500',
      success: 'bg-success-500',
      warning: 'bg-warning-500',
      error: 'bg-error-500',
      white: 'bg-white',
      gray: 'bg-gray-500',
      current: 'bg-current',
    };
    return variants[variant] || variants.primary;
  };

  // Animation classes
  const getAnimationClasses = () => {
    if (hasReducedMotion) return '';
    
    const speeds = {
      slow: 'animate-pulse-slow',
      normal: 'animate-pulse',
      fast: 'animate-pulse-fast',
    };
    return speeds[speed] || speeds.normal;
  };

  const pulseClasses = [
    getSizeClasses(),
    getVariantClasses(),
    'rounded-full',
    getAnimationClasses(),
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className="inline-flex flex-col items-center" {...props}>
      <div
        className={pulseClasses}
        role="status"
        aria-label={label}
      />
      {showLabel && (
        <div className={`mt-2 text-center font-medium ${getVariantClasses()}`}>
          {label}
        </div>
      )}
    </div>
  );
};

// Loading Spinner with overlay
const LoadingOverlay = ({
  isLoading = false,
  children,
  spinnerProps = {},
  overlayClassName = '',
  ...props
}) => {
  if (!isLoading) {
    return children;
  }

  return (
    <div className="relative" {...props}>
      {children}
      <div className={`absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 ${overlayClassName}`}>
        <Spinner {...spinnerProps} />
      </div>
    </div>
  );
};

// Attach variants to main component
Spinner.Dots = DotsSpinner;
Spinner.Pulse = PulseSpinner;
Spinner.Overlay = LoadingOverlay;

export { Spinner, DotsSpinner, PulseSpinner, LoadingOverlay };
export default Spinner;
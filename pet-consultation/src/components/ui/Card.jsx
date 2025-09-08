import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

// Enhanced Card component with design system integration
const Card = ({ 
  children, 
  variant = 'default', 
  size = 'md',
  hover = true,
  className = '',
  onClick,
  padding = true,
  shadow = true,
  border = false,
  rounded = true,
  ...props 
}) => {
  const { hasReducedMotion } = useTheme();

  // Base card classes
  const baseClasses = [
    'transition-all',
    'duration-200',
    hasReducedMotion && 'transition-none',
  ];

  // Variant styles
  const getVariantClasses = () => {
    const variants = {
      default: [
        'bg-white',
        'text-neutral-900',
        border && 'border border-neutral-200',
        shadow && 'shadow-md',
        hover && 'hover:shadow-lg',
      ],
      glass: [
        'bg-white/20',
        'backdrop-blur-lg',
        'border border-white/20',
        'text-white',
        shadow && 'shadow-glass',
        hover && 'hover:bg-white/30',
      ],
      outlined: [
        'bg-white',
        'border-2 border-neutral-200',
        'text-neutral-900',
        hover && 'hover:border-neutral-300',
        hover && 'hover:shadow-md',
      ],
      elevated: [
        'bg-white',
        'text-neutral-900',
        'shadow-lg',
        hover && 'hover:shadow-xl',
        hover && 'hover:-translate-y-1',
      ],
      flat: [
        'bg-white',
        'text-neutral-900',
        border && 'border border-neutral-100',
      ],
      gradient: [
        'bg-gradient-to-br from-primary-50 to-secondary-50',
        'text-neutral-900',
        'border border-primary-100',
        shadow && 'shadow-md',
        hover && 'hover:shadow-lg',
      ],
      dark: [
        'bg-neutral-800',
        'text-white',
        border && 'border border-neutral-700',
        shadow && 'shadow-md',
        hover && 'hover:shadow-lg',
      ],
      primary: [
        'bg-primary-50',
        'text-primary-900',
        'border border-primary-200',
        shadow && 'shadow-md',
        hover && 'hover:shadow-lg',
        hover && 'hover:bg-primary-100',
      ],
      secondary: [
        'bg-secondary-50',
        'text-secondary-900',
        'border border-secondary-200',
        shadow && 'shadow-md',
        hover && 'hover:shadow-lg',
        hover && 'hover:bg-secondary-100',
      ],
      success: [
        'bg-success-50',
        'text-success-900',
        'border border-success-200',
        shadow && 'shadow-md',
        hover && 'hover:shadow-lg',
        hover && 'hover:bg-success-100',
      ],
      warning: [
        'bg-warning-50',
        'text-warning-900',
        'border border-warning-200',
        shadow && 'shadow-md',
        hover && 'hover:shadow-lg',
        hover && 'hover:bg-warning-100',
      ],
      error: [
        'bg-error-50',
        'text-error-900',
        'border border-error-200',
        shadow && 'shadow-md',
        hover && 'hover:shadow-lg',
        hover && 'hover:bg-error-100',
      ],
    };

    return variants[variant] || variants.default;
  };

  // Size styles (padding)
  const getSizeClasses = () => {
    if (!padding) return [];
    
    const sizes = {
      xs: ['p-3'],
      sm: ['p-4'],
      md: ['p-6'],
      lg: ['p-8'],
      xl: ['p-10'],
    };

    return sizes[size] || sizes.md;
  };

  // Border radius
  const getBorderRadius = () => {
    if (!rounded) return '';
    
    const radiusMap = {
      xs: 'rounded-lg',
      sm: 'rounded-lg',
      md: 'rounded-xl',
      lg: 'rounded-2xl',
      xl: 'rounded-3xl',
    };
    
    return radiusMap[size] || 'rounded-xl';
  };

  // Interactive styles
  const getInteractiveClasses = () => {
    if (!onClick) return [];
    
    return [
      'cursor-pointer',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-primary-500',
      'focus:ring-offset-2',
    ];
  };

  // Combine all classes
  const cardClasses = [
    ...baseClasses,
    ...getVariantClasses(),
    ...getSizeClasses(),
    getBorderRadius(),
    ...getInteractiveClasses(),
    className,
  ].filter(Boolean).join(' ');

  const CardComponent = onClick ? 'button' : 'div';

  return (
    <CardComponent
      className={cardClasses}
      onClick={onClick}
      {...props}
    >
      {children}
    </CardComponent>
  );
};

// Card sub-components
export const CardHeader = ({ 
  children, 
  className = '', 
  divider = false,
  ...props 
}) => {
  const dividerClasses = divider ? 'border-b border-neutral-200 pb-4 mb-4' : '';
  
  return (
    <div 
      className={`${dividerClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardTitle = ({ 
  children, 
  className = '', 
  size = 'lg',
  ...props 
}) => {
  const sizeClasses = {
    sm: 'text-lg font-semibold',
    md: 'text-xl font-semibold',
    lg: 'text-2xl font-bold',
    xl: 'text-3xl font-bold',
  };
  
  return (
    <h3 
      className={`${sizeClasses[size] || sizeClasses.lg} text-neutral-900 ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
};

export const CardSubtitle = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <p 
      className={`text-neutral-600 text-sm mt-1 ${className}`}
      {...props}
    >
      {children}
    </p>
  );
};

export const CardContent = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <div 
      className={`text-neutral-700 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardFooter = ({ 
  children, 
  className = '', 
  divider = false,
  justify = 'end',
  ...props 
}) => {
  const dividerClasses = divider ? 'border-t border-neutral-200 pt-4 mt-4' : '';
  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
  };
  
  return (
    <div 
      className={`flex items-center gap-3 ${justifyClasses[justify]} ${dividerClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardImage = ({ 
  src, 
  alt, 
  className = '', 
  aspectRatio = 'auto',
  objectFit = 'cover',
  ...props 
}) => {
  const aspectRatioClasses = {
    auto: '',
    square: 'aspect-square',
    video: 'aspect-video',
    '4/3': 'aspect-[4/3]',
    '3/2': 'aspect-[3/2]',
    '16/9': 'aspect-[16/9]',
  };
  
  const objectFitClasses = {
    cover: 'object-cover',
    contain: 'object-contain',
    fill: 'object-fill',
    none: 'object-none',
    'scale-down': 'object-scale-down',
  };
  
  return (
    <div className={`overflow-hidden ${aspectRatioClasses[aspectRatio]}`}>
      <img 
        src={src}
        alt={alt}
        className={`w-full h-full ${objectFitClasses[objectFit]} ${className}`}
        {...props}
      />
    </div>
  );
};

// Card variants as separate components for convenience
export const GlassCard = (props) => <Card variant="glass" {...props} />;
export const OutlinedCard = (props) => <Card variant="outlined" {...props} />;
export const ElevatedCard = (props) => <Card variant="elevated" {...props} />;
export const FlatCard = (props) => <Card variant="flat" {...props} />;
export const GradientCard = (props) => <Card variant="gradient" {...props} />;
export const DarkCard = (props) => <Card variant="dark" {...props} />;
export const PrimaryCard = (props) => <Card variant="primary" {...props} />;
export const SecondaryCard = (props) => <Card variant="secondary" {...props} />;
export const SuccessCard = (props) => <Card variant="success" {...props} />;
export const WarningCard = (props) => <Card variant="warning" {...props} />;
export const ErrorCard = (props) => <Card variant="error" {...props} />;

export { Card };
export default Card;
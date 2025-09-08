import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

// Enhanced Toast component with design system integration
const Toast = ({
  children,
  variant = 'default',
  position = 'top-right',
  duration = 5000,
  closable = true,
  onClose,
  icon,
  title,
  description,
  action,
  className = '',
  ...props
}) => {
  const { hasReducedMotion, isRtl } = useTheme();
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  // Auto-dismiss timer
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, handleClose]);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, hasReducedMotion ? 0 : 300);
  }, [hasReducedMotion, onClose]);

  if (!isVisible) return null;

  // Variant styles
  const getVariantClasses = () => {
    const variants = {
      default: [
        'bg-white',
        'text-gray-900',
        'border border-gray-200',
        'shadow-lg',
      ],
      success: [
        'bg-success-50',
        'text-success-900',
        'border border-success-200',
        'shadow-lg shadow-success-100/50',
      ],
      warning: [
        'bg-warning-50',
        'text-warning-900',
        'border border-warning-200',
        'shadow-lg shadow-warning-100/50',
      ],
      error: [
        'bg-error-50',
        'text-error-900',
        'border border-error-200',
        'shadow-lg shadow-error-100/50',
      ],
      info: [
        'bg-blue-50',
        'text-blue-900',
        'border border-blue-200',
        'shadow-lg shadow-blue-100/50',
      ],
    };
    return variants[variant] || variants.default;
  };

  // Position styles
  const getPositionClasses = () => {
    const positions = {
      'top-left': 'top-4 left-4',
      'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
      'top-right': 'top-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
      'bottom-right': 'bottom-4 right-4',
    };
    return positions[position] || positions['top-right'];
  };

  // Animation classes
  const getAnimationClasses = () => {
    if (hasReducedMotion) return '';
    
    const baseAnimation = 'transition-all duration-300 ease-in-out';
    const enterAnimation = isExiting ? 'opacity-0 scale-95 translate-y-2' : 'opacity-100 scale-100 translate-y-0';
    
    return `${baseAnimation} ${enterAnimation}`;
  };

  // Icon color based on variant
  const getIconColor = () => {
    const colors = {
      default: 'text-gray-500',
      success: 'text-success-500',
      warning: 'text-warning-500',
      error: 'text-error-500',
      info: 'text-blue-500',
    };
    return colors[variant] || colors.default;
  };

  // Default icons for variants
  const getDefaultIcon = () => {
    const icons = {
      success: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      warning: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
      error: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
      info: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    };
    return icons[variant];
  };

  // Combine all classes
  const toastClasses = [
    'fixed',
    'z-50',
    'max-w-sm',
    'w-full',
    'rounded-lg',
    'p-4',
    'pointer-events-auto',
    ...getVariantClasses(),
    getPositionClasses(),
    getAnimationClasses(),
    className,
  ].filter(Boolean).join(' ');

  const displayIcon = icon || getDefaultIcon();

  return (
    <div className={toastClasses} {...props}>
      <div className="flex items-start">
        {displayIcon && (
          <div className={`flex-shrink-0 ${getIconColor()} ${isRtl ? 'ml-3' : 'mr-3'}`}>
            {displayIcon}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          {title && (
            <div className="text-sm font-semibold mb-1">
              {title}
            </div>
          )}
          
          {description && (
            <div className="text-sm opacity-90">
              {description}
            </div>
          )}
          
          {children && (
            <div className="text-sm">
              {children}
            </div>
          )}
          
          {action && (
            <div className="mt-3">
              {action}
            </div>
          )}
        </div>
        
        {closable && (
          <button
            type="button"
            onClick={handleClose}
            className={`
              flex-shrink-0
              ${isRtl ? 'mr-2' : 'ml-2'}
              text-gray-400
              hover:text-gray-600
              focus:outline-none
              focus:ring-2
              focus:ring-offset-2
              focus:ring-primary-500
              rounded
              transition-colors
              duration-200
              ${hasReducedMotion ? 'transition-none' : ''}
            `}
            aria-label="بستن"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Progress bar for auto-dismiss */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 rounded-b-lg overflow-hidden">
          <div 
            className={`h-full bg-current opacity-50 ${hasReducedMotion ? '' : 'animate-progress'}`}
            style={{
              animation: hasReducedMotion ? 'none' : `progress ${duration}ms linear forwards`,
            }}
          />
        </div>
      )}
    </div>
  );
};

// Toast Container for managing multiple toasts
const ToastContainer = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`fixed inset-0 pointer-events-none z-50 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Toast Hook for programmatic usage
const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (toastProps) => {
    const id = Date.now() + Math.random();
    const toast = { id, ...toastProps };
    
    setToasts(prev => [...prev, toast]);
    
    // Auto-remove after duration
    if (toastProps.duration !== 0) {
      setTimeout(() => {
        removeToast(id);
      }, toastProps.duration || 5000);
    }
    
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const removeAllToasts = () => {
    setToasts([]);
  };

  // Convenience methods
  const toast = {
    success: (props) => addToast({ ...props, variant: 'success' }),
    error: (props) => addToast({ ...props, variant: 'error' }),
    warning: (props) => addToast({ ...props, variant: 'warning' }),
    info: (props) => addToast({ ...props, variant: 'info' }),
    default: (props) => addToast({ ...props, variant: 'default' }),
  };

  return {
    toasts,
    addToast,
    removeToast,
    removeAllToasts,
    toast,
  };
};

// Toast Provider Component
const ToastProvider = ({ children, maxToasts = 5 }) => {
  const { toasts, removeToast } = useToast();
  
  // Limit number of toasts
  const visibleToasts = toasts.slice(-maxToasts);
  
  return (
    <>
      {children}
      <ToastContainer>
        {visibleToasts.map((toast, index) => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={() => removeToast(toast.id)}
            style={{
              transform: `translateY(${index * 70}px)`,
            }}
          />
        ))}
      </ToastContainer>
    </>
  );
};

Toast.Container = ToastContainer;
Toast.Provider = ToastProvider;
Toast.useToast = useToast;

/* eslint-disable react-refresh/only-export-components */
export { Toast, ToastContainer, ToastProvider, useToast };
export default Toast;
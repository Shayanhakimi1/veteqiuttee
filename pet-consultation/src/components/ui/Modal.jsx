import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

// Enhanced Modal component with design system integration
const Modal = ({
  isOpen = false,
  onClose,
  title,
  children,
  size = 'md',
  variant = 'default',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className = '',
  overlayClassName = '',
  contentClassName = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
  footer,
  centered = true,
  scrollable = true,
  ...props
}) => {
  const { hasReducedMotion, isRtl } = useTheme();
  const modalRef = useRef(null);
  const overlayRef = useRef(null);

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Focus management
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  // Handle overlay click
  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === overlayRef.current) {
      onClose?.();
    }
  };

  if (!isOpen) return null;

  // Size variants
  const getSizeClasses = () => {
    const sizes = {
      xs: 'max-w-xs',
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      '2xl': 'max-w-2xl',
      '3xl': 'max-w-3xl',
      '4xl': 'max-w-4xl',
      '5xl': 'max-w-5xl',
      '6xl': 'max-w-6xl',
      '7xl': 'max-w-7xl',
      full: 'max-w-full',
    };
    return sizes[size] || sizes.md;
  };

  // Variant styles
  const getVariantClasses = () => {
    const variants = {
      default: [
        'bg-white',
        'border border-neutral-200',
        'shadow-xl',
        'text-neutral-900',
      ],
      glass: [
        'bg-white/90',
        'backdrop-blur-lg',
        'border border-white/20',
        'shadow-2xl',
        'text-neutral-900',
      ],
      dark: [
        'bg-neutral-800',
        'border border-neutral-700',
        'shadow-xl',
        'text-white',
      ],
      minimal: [
        'bg-white',
        'shadow-lg',
        'text-neutral-900',
      ],
    };
    return variants[variant] || variants.default;
  };

  // Base modal classes
  const modalClasses = [
    'relative',
    'w-full',
    'mx-4',
    'rounded-lg',
    'overflow-hidden',
    getSizeClasses(),
    ...getVariantClasses(),
    !hasReducedMotion && 'transform transition-all duration-300 ease-out',
    className,
  ].filter(Boolean).join(' ');

  // Overlay classes
  const overlayClasses = [
    'fixed',
    'inset-0',
    'z-50',
    'flex',
    'items-center',
    'justify-center',
    'bg-black/50',
    'backdrop-blur-sm',
    !hasReducedMotion && 'transition-opacity duration-300 ease-out',
    centered ? 'items-center' : 'items-start pt-16',
    overlayClassName,
  ].filter(Boolean).join(' ');

  // Content classes
  const contentClasses = [
    'relative',
    'w-full',
    'h-full',
    scrollable && 'overflow-y-auto',
    'max-h-[90vh]',
    contentClassName,
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={overlayRef}
      className={overlayClasses}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        ref={modalRef}
        className={modalClasses}
        tabIndex={-1}
        {...props}
      >
        <div className={contentClasses}>
          {/* Header */}
          {(title || showCloseButton) && (
            <div className={`flex items-center justify-between p-6 border-b border-neutral-200 ${headerClassName}`}>
              {title && (
                <h2 id="modal-title" className="text-lg font-semibold text-neutral-900">
                  {title}
                </h2>
              )}
              {showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  className={`
                    ${isRtl ? 'ml-4' : 'mr-4'}
                    p-2 rounded-lg
                    text-neutral-400 hover:text-neutral-600
                    hover:bg-neutral-100
                    transition-colors duration-200
                    focus:outline-none focus:ring-2 focus:ring-primary-500
                  `}
                  aria-label="بستن"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div className={`p-6 ${bodyClassName}`}>
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className={`px-6 py-4 border-t border-neutral-200 bg-neutral-50 ${footerClassName}`}>
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Modal Header component
const ModalHeader = ({ children, className = '', ...props }) => {
  return (
    <div className={`px-6 py-4 border-b border-neutral-200 ${className}`} {...props}>
      {children}
    </div>
  );
};

// Modal Body component
const ModalBody = ({ children, className = '', scrollable = true, ...props }) => {
  const bodyClasses = [
    'px-6 py-4',
    scrollable && 'overflow-y-auto',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={bodyClasses} {...props}>
      {children}
    </div>
  );
};

// Modal Footer component
const ModalFooter = ({ children, className = '', ...props }) => {
  return (
    <div className={`px-6 py-4 border-t border-neutral-200 bg-neutral-50 ${className}`} {...props}>
      {children}
    </div>
  );
};

// Modal Title component
const ModalTitle = ({ children, className = '', ...props }) => {
  return (
    <h2 className={`text-lg font-semibold text-neutral-900 ${className}`} {...props}>
      {children}
    </h2>
  );
};

Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;
Modal.Title = ModalTitle;

export { Modal, ModalHeader, ModalBody, ModalFooter, ModalTitle };
export default Modal;
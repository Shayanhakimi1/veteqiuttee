import React, { useState, useEffect, useCallback } from 'react';
import Alert from './Alert';

// کامپوننت نوتیفیکیشن با قابلیت نمایش خودکار و بسته شدن
const Notification = ({ 
  type = 'success', 
  title, 
  message, 
  duration = 5000, 
  onClose,
  show = false,
  position = 'top-right'
}) => {
  const [isVisible, setIsVisible] = useState(show);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClose = useCallback(() => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) {
        onClose();
      }
    }, 300); // زمان انیمیشن
  }, [onClose]);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setIsAnimating(true);
      
      // بسته شدن خودکار پس از مدت زمان مشخص
      if (duration > 0) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);
        
        return () => clearTimeout(timer);
      }
    }
  }, [show, duration, handleClose]);

  if (!isVisible) return null;

  // تعریف موقعیت نوتیفیکیشن
  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'top-4 right-4';
    }
  };

  return (
    <div 
      className={`fixed z-50 max-w-sm w-full transition-all duration-300 ${
        getPositionClasses()
      } ${
        isAnimating 
          ? 'opacity-100 transform translate-y-0' 
          : 'opacity-0 transform -translate-y-2'
      }`}
    >
      <Alert
        type={type}
        title={title}
        message={message}
        onClose={handleClose}
        className="shadow-lg"
      />
    </div>
  );
};

export default Notification;
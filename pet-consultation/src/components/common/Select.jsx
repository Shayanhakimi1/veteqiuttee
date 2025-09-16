import React, { useState, useRef, useEffect } from 'react';

// کامپوننت انتخابگر اصلی
export const Select = ({ children, value, onValueChange, ...props }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={selectRef} {...props}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            isOpen,
            setIsOpen,
            value,
            onValueChange
          });
        }
        return child;
      })}
    </div>
  );
};

// کامپوننت محرک انتخابگر
export const SelectTrigger = ({ children, isOpen, setIsOpen, className = '', ...props }) => {
  return (
    <button
      type="button"
      className={`w-full px-3 py-2 text-right bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
      onClick={() => setIsOpen(!isOpen)}
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      role="combobox"
      {...props}
    >
      <div className="flex items-center justify-between">
        {children}
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </button>
  );
};

// کامپوننت مقدار انتخابگر
export const SelectValue = ({ placeholder, value, ...props }) => {
  return (
    <span className="block truncate" {...props}>
      {value || placeholder}
    </span>
  );
};

// کامپوننت محتوای انتخابگر
export const SelectContent = ({ children, isOpen, value, onValueChange, className = '', ...props }) => {
  if (!isOpen) return null;

  return (
    <div
      className={`absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto ${className}`}
      {...props}
    >
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            value,
            onValueChange
          });
        }
        return child;
      })}
    </div>
  );
};

// کامپوننت آیتم انتخابگر
export const SelectItem = ({ children, value: itemValue, value, onValueChange, className = '', ...props }) => {
  const isSelected = value === itemValue;

  return (
    <div
      className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${isSelected ? 'bg-blue-50 text-blue-600' : 'text-gray-900'} ${className}`}
      onClick={() => {
        onValueChange(itemValue);
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export default Select;
import React from 'react';

const AdModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
        >
          ×
        </button>
        
        {/* Modal Content */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            <span className="block">به واسطه فروشگاه بزرگ <span className="text-blue-900">کاژه</span></span>
          </h2>
          
          <div className="mb-6">
            <p className="text-xl text-orange-500 font-medium mb-2">
              در جزیره زیبای کیش
            </p>
            <h3 className="text-lg font-semibold text-gray-700">
              کنارتان هستیم
            </h3>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-orange-50 p-4 rounded-lg mb-6">
            <p className="text-gray-700 text-sm">
              ما افتخار داریم که با حمایت فروشگاه بزرگ کاژه در جزیره زیبای کیش، 
              بهترین خدمات مشاوره دامپزشکی را به شما ارائه می‌دهیم.
            </p>
          </div>
          
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            ادامه ثبت نام
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdModal;
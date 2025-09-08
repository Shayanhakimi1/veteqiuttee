import React from 'react';

// کامپوننت نوار پیشرفت
const ProgressBar = ({ 
  currentStep = 1, 
  totalSteps = 4, 
  steps = ['انتخاب پت', 'ثبت نام', 'مشاوره', 'پرداخت'],
  showLabels = true,
  className = ''
}) => {
  // محاسبه درصد پیشرفت
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className={`w-full ${className}`}>
      {/* نوار پیشرفت اصلی */}
      <div className="relative">
        {/* پس‌زمینه نوار */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-gradient-to-r from-cyan-500 to-teal-500 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        
        {/* نقاط مراحل */}
        <div className="flex justify-between absolute top-0 w-full transform -translate-y-1">
          {Array.from({ length: totalSteps }, (_, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber <= currentStep;
            const isCurrent = stepNumber === currentStep;
            
            return (
              <div key={stepNumber} className="flex flex-col items-center">
                {/* دایره مرحله */}
                <div 
                  className={`
                    w-4 h-4 rounded-full border-2 transition-all duration-300
                    ${isCompleted 
                      ? 'bg-gradient-to-r from-cyan-500 to-teal-500 border-cyan-500' 
                      : 'bg-white border-gray-300'
                    }
                    ${isCurrent ? 'ring-4 ring-cyan-200 scale-110' : ''}
                  `}
                >
                  {isCompleted && (
                    <svg 
                      className="w-2 h-2 text-white m-0.5" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                  )}
                </div>
                
                {/* برچسب مرحله */}
                {showLabels && steps[index] && (
                  <span 
                    className={`
                      text-xs mt-2 text-center max-w-16 leading-tight
                      ${isCompleted ? 'text-cyan-600 font-medium' : 'text-gray-500'}
                      ${isCurrent ? 'text-cyan-700 font-semibold' : ''}
                    `}
                  >
                    {steps[index]}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* نمایش متنی پیشرفت */}
      <div className="flex justify-between items-center mt-8 text-sm text-gray-600">
        <span>مرحله {currentStep} از {totalSteps}</span>
        <span>{Math.round(progressPercentage)}% تکمیل شده</span>
      </div>
    </div>
  );
};

// کامپوننت نوار پیشرفت ساده برای لودینگ
export const SimpleProgressBar = ({ 
  progress = 0, 
  animated = true, 
  className = '',
  showPercentage = false 
}) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`
            bg-gradient-to-r from-cyan-500 to-teal-500 h-2 rounded-full transition-all duration-300
            ${animated ? 'animate-pulse' : ''}
          `}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        ></div>
      </div>
      {showPercentage && (
        <div className="text-center text-sm text-gray-600 mt-2">
          {Math.round(progress)}%
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
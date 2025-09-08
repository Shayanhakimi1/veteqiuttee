import React, { useState, useRef } from 'react';

// کامپوننت آپلود فایل با drag & drop
const FileUploader = ({
  onFileSelect,
  acceptedTypes = ['image/*'],
  maxSize = 5 * 1024 * 1024, // 5MB
  multiple = false,
  className = '',
  label = 'فایل های خود را آپلود کنید',
  description = 'حداکثر اندازه فایل: 5MB'
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef(null);

  // بررسی نوع فایل
  const isValidFileType = (file) => {
    return acceptedTypes.some(type => {
      if (type === 'image/*') {
        return file.type.startsWith('image/');
      }
      if (type === 'video/*') {
        return file.type.startsWith('video/');
      }
      return file.type === type || file.name.toLowerCase().endsWith(type.replace('*', ''));
    });
  };

  // بررسی اندازه فایل
  const isValidFileSize = (file) => {
    return file.size <= maxSize;
  };

  // فرمت اندازه فایل
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // پردازش فایل‌ها
  const processFiles = (files) => {
    const fileArray = Array.from(files);
    const validFiles = [];
    const errors = [];

    fileArray.forEach(file => {
      if (!isValidFileType(file)) {
        errors.push(`${file.name}: نوع فایل مجاز نیست`);
        return;
      }
      if (!isValidFileSize(file)) {
        errors.push(`${file.name}: اندازه فایل بیش از حد مجاز است`);
        return;
      }
      validFiles.push(file);
    });

    if (errors.length > 0) {
      alert(errors.join('\n'));
    }

    if (validFiles.length > 0) {
      if (!multiple) {
        setUploadedFiles([validFiles[0]]);
        onFileSelect && onFileSelect(validFiles[0]);
      } else {
        const newFiles = [...uploadedFiles, ...validFiles];
        setUploadedFiles(newFiles);
        onFileSelect && onFileSelect(newFiles);
      }

      // شبیه‌سازی پیشرفت آپلود
      validFiles.forEach(file => {
        simulateUploadProgress(file);
      });
    }
  };

  // شبیه‌سازی پیشرفت آپلود
  const simulateUploadProgress = (file) => {
    const fileName = file.name;
    let progress = 0;
    
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[fileName];
            return newProgress;
          });
        }, 1000);
      }
      
      setUploadProgress(prev => ({
        ...prev,
        [fileName]: Math.min(progress, 100)
      }));
    }, 200);
  };

  // مدیریت drag & drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    processFiles(files);
  };

  // مدیریت انتخاب فایل
  const handleFileSelect = (e) => {
    const files = e.target.files;
    processFiles(files);
  };

  // حذف فایل
  const removeFile = (index) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    onFileSelect && onFileSelect(multiple ? newFiles : null);
  };

  // نمایش پیش‌نمایش فایل
  const renderFilePreview = (file, index) => {
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    const progress = uploadProgress[file.name];

    return (
      <div key={index} className="relative bg-gray-50 rounded-lg p-3 border">
        <div className="flex items-center gap-3">
          {/* آیکون یا تصویر */}
          <div className="flex-shrink-0">
            {isImage ? (
              <img 
                src={URL.createObjectURL(file)} 
                alt={file.name}
                className="w-12 h-12 object-cover rounded"
              />
            ) : isVideo ? (
              <video 
                src={URL.createObjectURL(file)} 
                className="w-12 h-12 object-cover rounded"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          
          {/* اطلاعات فایل */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
            
            {/* نوار پیشرفت */}
            {progress !== undefined && (
              <div className="mt-1">
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div 
                    className="bg-primary-500 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{Math.round(progress)}%</p>
              </div>
            )}
          </div>
          
          {/* دکمه حذف */}
          <button
            type="button"
            onClick={() => removeFile(index)}
            className="flex-shrink-0 text-red-500 hover:text-red-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`w-full ${className}`}>
      {/* منطقه آپلود */}
      <div
        className={`
          border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 cursor-pointer
          ${isDragOver 
            ? 'border-cyan-500 bg-cyan-50' 
            : 'border-gray-300 hover:border-cyan-400 hover:bg-gray-50'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        
        <p className="text-lg font-medium text-gray-700 mb-2">{label}</p>
        <p className="text-sm text-gray-500">{description}</p>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
      
      {/* نمایش فایل‌های آپلود شده */}
      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-700">فایل‌های انتخاب شده:</h4>
          {uploadedFiles.map((file, index) => renderFilePreview(file, index))}
        </div>
      )}
    </div>
  );
};

export default FileUploader;
import React, { useState } from 'react';
import Button from '../common/Button';
import { mediaAPI } from '../../services/api';

const MediaViewer = ({ media, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getMediaUrl = () => {
    return mediaAPI.getMediaUrl(media.id);
  };

  const handleDownload = async () => {
    try {
      setLoading(true);
      
      const response = await mediaAPI.downloadMedia(media.id);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = media.originalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setError('خطا در دانلود فایل');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'medical_document': return 'سند پزشکی';
      case 'audio_file': return 'فایل صوتی';
      case 'video_file': return 'فایل ویدیویی';
      case 'voice_recording': return 'ضبط صدا';
      default: return category;
    }
  };

  const renderMediaPreview = () => {
    const mediaUrl = getMediaUrl();

    switch (media.mediaType) {
      case 'image':
        return (
          <div className="flex justify-center">
            <img
              src={mediaUrl}
              alt={media.originalName}
              className="max-w-full max-h-96 object-contain rounded-lg shadow-lg"
              onError={() => setError('خطا در بارگذاری تصویر')}
            />
          </div>
        );

      case 'video':
        return (
          <div className="flex justify-center">
            <video
              controls
              className="max-w-full max-h-96 rounded-lg shadow-lg"
              onError={() => setError('خطا در بارگذاری ویدیو')}
            >
              <source src={mediaUrl} type={media.mimeType} />
              مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
            </video>
          </div>
        );

      case 'audio':
        return (
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <div className="bg-gray-100 rounded-lg p-6 text-center mb-4">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <p className="text-gray-600 font-medium">{media.originalName}</p>
              </div>
              <audio
                controls
                className="w-full"
                onError={() => setError('خطا در بارگذاری فایل صوتی')}
              >
                <source src={mediaUrl} type={media.mimeType} />
                مرورگر شما از پخش صدا پشتیبانی نمی‌کند.
              </audio>
            </div>
          </div>
        );

      case 'document':
        return (
          <div className="text-center">
            <div className="bg-gray-100 rounded-lg p-8 mb-4">
              <svg className="w-20 h-20 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-600 font-medium text-lg">{media.originalName}</p>
              <p className="text-gray-500 text-sm mt-2">
                {media.mimeType === 'application/pdf' ? 'فایل PDF' : 'سند'}
              </p>
            </div>
            {media.mimeType === 'application/pdf' && (
              <div className="mt-4">
                <iframe
                  src={mediaUrl}
                  className="w-full h-96 border rounded-lg"
                  title={media.originalName}
                />
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="text-center">
            <div className="bg-gray-100 rounded-lg p-8">
              <svg className="w-20 h-20 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-600 font-medium text-lg">{media.originalName}</p>
              <p className="text-gray-500 text-sm mt-2">پیش‌نمایش در دسترس نیست</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">مشاهده فایل رسانه‌ای</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* File Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">اطلاعات فایل</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">نام فایل:</span>
                    <span className="font-medium">{media.originalName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">نوع:</span>
                    <span className="font-medium">{media.mediaType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">دسته‌بندی:</span>
                    <span className="font-medium">{getCategoryLabel(media.category)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">اندازه:</span>
                    <span className="font-medium">{formatFileSize(media.fileSize)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">تاریخ آپلود:</span>
                    <span className="font-medium">{formatDate(media.uploadedAt)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">اطلاعات کاربر</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">نام:</span>
                    <span className="font-medium">{media.user?.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">موبایل:</span>
                    <span className="font-medium">{media.user?.mobile}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">شناسه مشاوره:</span>
                    <span className="font-medium">#{media.consultation?.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">نوع مشاوره:</span>
                    <span className="font-medium">{media.consultation?.consultationType}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Media Preview */}
          <div className="mb-6">
            {renderMediaPreview()}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 space-x-reverse">
            <Button
              onClick={onClose}
              variant="outline"
            >
              بستن
            </Button>
            <Button
              onClick={handleDownload}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'در حال دانلود...' : 'دانلود فایل'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaViewer;
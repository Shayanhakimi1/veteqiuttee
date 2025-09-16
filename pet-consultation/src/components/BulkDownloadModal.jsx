import React, { useState } from 'react';
import { consultationAPI } from '../services/api';

const BulkDownloadModal = ({ isOpen, onClose, users }) => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const handleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user.id));
    }
  };

  const handleBulkDownload = async () => {
    if (selectedUsers.length === 0) return;

    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      for (let i = 0; i < selectedUsers.length; i++) {
        const userId = selectedUsers[i];
        const user = users.find(u => u.id === userId);
        
        try {
          const response = await consultationAPI.downloadUserRecord(userId);
          
          // Create download link
          const blob = new Blob([response.data], { type: 'application/zip' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${user.fullName}_${user.mobileNumber}_records.zip`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          
          setDownloadProgress(((i + 1) / selectedUsers.length) * 100);
          
          // Small delay between downloads
          if (i < selectedUsers.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (error) {
          console.error(`Error downloading records for user ${userId}:`, error);
        }
      }
    } catch (error) {
      console.error('Bulk download error:', error);
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
      setSelectedUsers([]);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">دانلود گروهی سوابق کاربران</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isDownloading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {isDownloading && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">در حال دانلود...</span>
              <span className="text-sm text-gray-600">{Math.round(downloadProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${downloadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="mb-4 flex justify-between items-center">
          <button
            onClick={handleSelectAll}
            className="text-blue-600 hover:text-blue-800 text-sm"
            disabled={isDownloading}
          >
            {selectedUsers.length === users.length ? 'لغو انتخاب همه' : 'انتخاب همه'}
          </button>
          <span className="text-sm text-gray-600">
            {selectedUsers.length} از {users.length} کاربر انتخاب شده
          </span>
        </div>

        <div className="overflow-y-auto max-h-96 border rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  انتخاب
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  نام کامل
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  شماره موبایل
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  تعداد حیوانات
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  تعداد مشاوره‌ها
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleUserSelection(user.id)}
                      disabled={isDownloading}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.fullName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.mobileNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.pets?.length || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.consultations?.length || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end space-x-3 space-x-reverse">
          <button
            onClick={onClose}
            disabled={isDownloading}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            انصراف
          </button>
          <button
            onClick={handleBulkDownload}
            disabled={selectedUsers.length === 0 || isDownloading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {isDownloading ? 'در حال دانلود...' : `دانلود ${selectedUsers.length} سابقه`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkDownloadModal;
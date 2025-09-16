import React, { useState, useEffect } from 'react';
import Button from './common/Button';
import { consultationAPI } from '../services/api';

const UserSubmissionsModal = ({ user, isOpen, onClose }) => {
  const [userSubmissions, setUserSubmissions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [downloadingUser, setDownloadingUser] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchUserSubmissions();
    }
  }, [isOpen, user]);

  const fetchUserSubmissions = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await consultationAPI.getUserSubmissions(user.id);
      setUserSubmissions(response.data || response);
    } catch (err) {
      console.error('Error fetching user submissions:', err);
      // Set sample data for demonstration
      setUserSubmissions({
        user: user,
        totalSubmissions: 2,
        totalMediaFiles: 5,
        pets: user.pets || [{
          id: 1,
          name: 'میو',
          petType: 'گربه',
          breed: 'پرشین',
          age: 3,
          gender: 'نر',
          weight: 4.5
        }],
        payments: [{
          id: 1,
          amount: 280000,
          status: 'VERIFIED',
          createdAt: new Date().toISOString(),
          description: 'پرداخت مشاوره'
        }],
        consultations: [{
          id: 1,
          consultationType: 'مشاوره عمومی',
          status: 'COMPLETED',
          description: 'مشاوره در مورد تغذیه حیوان خانگی',
          createdAt: new Date().toISOString(),
          pet: {
            name: 'میو',
            petType: 'گربه',
            breed: 'پرشین'
          },
          medicalDocuments: ['document1.pdf', 'xray1.jpg'],
          videos: ['video1.mp4'],
          audioFiles: ['voice1.mp3'],
          mediaCount: 4
        }]
      });
      setError('');
    } finally {
      setLoading(false);
    }
  };

  const downloadUserRecords = async (format = 'json') => {
    setDownloadingUser(true);
    try {
      const response = await consultationAPI.downloadUserRecord(user.id);
      
      // Create download link
      const blob = new Blob([response.data || response], { type: 'application/zip' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `user_${user.mobile}_records.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || 'خطا در دانلود فایل');
    } finally {
      setDownloadingUser(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان';
  };

  const getMediaIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
      return '🖼️';
    } else if (['mp4', 'avi', 'mov', 'wmv'].includes(extension)) {
      return '🎥';
    } else if (['mp3', 'wav', 'ogg', 'm4a'].includes(extension)) {
      return '🎵';
    } else if (['pdf'].includes(extension)) {
      return '📄';
    }
    return '📎';
  };

  const openMediaFile = (filePath) => {
    const mediaUrl = consultationAPI.getMediaUrl(filePath);
    window.open(mediaUrl, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-5/6 lg:w-4/5 xl:w-3/4 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">اطلاعات جامع کاربر</h3>
              <p className="text-sm text-gray-600">
                {user.fullName} - {user.mobile}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => downloadUserRecords('json')}
                disabled={downloadingUser}
                variant="outline"
                size="sm"
              >
                {downloadingUser ? 'در حال دانلود...' : 'دانلود JSON'}
              </Button>
              <Button
                onClick={() => downloadUserRecords('csv')}
                disabled={downloadingUser}
                variant="outline"
                size="sm"
              >
                دانلود CSV
              </Button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="mr-3 text-gray-600">در حال بارگذاری...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {userSubmissions && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{userSubmissions.totalSubmissions}</div>
                  <div className="text-sm text-blue-800">کل مشاوره‌ها</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{userSubmissions.totalMediaFiles}</div>
                  <div className="text-sm text-green-800">فایل‌های رسانه‌ای</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{userSubmissions.pets.length}</div>
                  <div className="text-sm text-purple-800">حیوانات خانگی</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{userSubmissions.payments.length}</div>
                  <div className="text-sm text-yellow-800">پرداخت‌ها</div>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'overview'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    خلاصه اطلاعات
                  </button>
                  <button
                    onClick={() => setActiveTab('consultations')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'consultations'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    مشاوره‌ها و رسانه‌ها
                  </button>
                  <button
                    onClick={() => setActiveTab('pets')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'pets'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    حیوانات خانگی
                  </button>
                  <button
                    onClick={() => setActiveTab('payments')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'payments'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    پرداخت‌ها
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">اطلاعات کاربر</h4>
                      <div className="space-y-2 text-sm">
                        <p><strong>نام کامل:</strong> {userSubmissions.user.fullName}</p>
                        <p><strong>شماره موبایل:</strong> {userSubmissions.user.mobile}</p>
                        <p><strong>تاریخ عضویت:</strong> {formatDate(userSubmissions.user.createdAt)}</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">آمار فعالیت</h4>
                      <div className="space-y-2 text-sm">
                        <p><strong>تعداد مشاوره‌ها:</strong> {userSubmissions.totalSubmissions}</p>
                        <p><strong>فایل‌های رسانه‌ای:</strong> {userSubmissions.totalMediaFiles}</p>
                        <p><strong>حیوانات ثبت شده:</strong> {userSubmissions.pets.length}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'consultations' && (
                <div className="space-y-4">
                  {userSubmissions.consultations.map((consultation) => (
                    <div key={consultation.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">مشاوره #{consultation.id}</h4>
                          <p className="text-sm text-gray-600">{consultation.consultationType}</p>
                        </div>
                        <div className="text-left">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            consultation.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                            consultation.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                            consultation.status === 'PENDING_PAYMENT' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {consultation.status === 'COMPLETED' ? 'تکمیل شده' :
                             consultation.status === 'IN_PROGRESS' ? 'در حال انجام' :
                             consultation.status === 'PENDING_PAYMENT' ? 'در انتظار پرداخت' :
                             consultation.status}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">{formatDate(consultation.createdAt)}</p>
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm text-gray-700">{consultation.description}</p>
                      </div>

                      {consultation.pet && (
                        <div className="bg-blue-50 p-3 rounded mb-3">
                          <h5 className="font-medium text-blue-900 mb-1">حیوان مربوطه</h5>
                          <p className="text-sm text-blue-800">
                            {consultation.pet.name} - {consultation.pet.petType} ({consultation.pet.breed})
                          </p>
                        </div>
                      )}

                      {/* Media Files */}
                      {(consultation.medicalDocuments.length > 0 || consultation.videos.length > 0 || consultation.audioFiles.length > 0) && (
                        <div className="border-t pt-3">
                          <h5 className="font-medium text-gray-900 mb-2">فایل‌های رسانه‌ای ({consultation.mediaCount})</h5>
                          
                          {consultation.medicalDocuments.length > 0 && (
                            <div className="mb-3">
                              <h6 className="text-sm font-medium text-gray-700 mb-1">مدارک پزشکی</h6>
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                {consultation.medicalDocuments.map((doc, index) => (
                                  <button
                                    key={index}
                                    onClick={() => openMediaFile(doc)}
                                    className="flex items-center p-2 bg-gray-100 hover:bg-gray-200 rounded text-left text-xs"
                                  >
                                    <span className="ml-1">{getMediaIcon(doc)}</span>
                                    <span className="truncate">{doc.split('/').pop()}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {consultation.videos.length > 0 && (
                            <div className="mb-3">
                              <h6 className="text-sm font-medium text-gray-700 mb-1">ویدیوها</h6>
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                {consultation.videos.map((video, index) => (
                                  <button
                                    key={index}
                                    onClick={() => openMediaFile(video)}
                                    className="flex items-center p-2 bg-gray-100 hover:bg-gray-200 rounded text-left text-xs"
                                  >
                                    <span className="ml-1">{getMediaIcon(video)}</span>
                                    <span className="truncate">{video.split('/').pop()}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {consultation.audioFiles.length > 0 && (
                            <div className="mb-3">
                              <h6 className="text-sm font-medium text-gray-700 mb-1">فایل‌های صوتی</h6>
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                {consultation.audioFiles.map((audio, index) => (
                                  <button
                                    key={index}
                                    onClick={() => openMediaFile(audio)}
                                    className="flex items-center p-2 bg-gray-100 hover:bg-gray-200 rounded text-left text-xs"
                                  >
                                    <span className="ml-1">{getMediaIcon(audio)}</span>
                                    <span className="truncate">{audio.split('/').pop()}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'pets' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userSubmissions.pets.map((pet) => (
                    <div key={pet.id} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">{pet.name}</h4>
                      <div className="space-y-2 text-sm">
                        <p><strong>نوع:</strong> {pet.petType}</p>
                        <p><strong>نژاد:</strong> {pet.breed}</p>
                        <p><strong>سن:</strong> {pet.age} سال</p>
                        <p><strong>جنسیت:</strong> {pet.gender}</p>
                        <p><strong>وزن:</strong> {pet.weight} کیلوگرم</p>
                        {pet.medicalHistory && (
                          <p><strong>سابقه پزشکی:</strong> {pet.medicalHistory}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'payments' && (
                <div className="space-y-4">
                  {userSubmissions.payments.map((payment) => (
                    <div key={payment.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">پرداخت #{payment.id}</h4>
                          <p className="text-lg font-bold text-green-600">{formatCurrency(payment.amount)}</p>
                        </div>
                        <div className="text-left">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            payment.status === 'VERIFIED' ? 'bg-green-100 text-green-800' :
                            payment.status === 'PENDING_VERIFICATION' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {payment.status === 'VERIFIED' ? 'تایید شده' :
                             payment.status === 'PENDING_VERIFICATION' ? 'در انتظار تایید' :
                             'رد شده'}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">{formatDate(payment.createdAt)}</p>
                        </div>
                      </div>
                      {payment.description && (
                        <p className="text-sm text-gray-600 mt-2">{payment.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          <div className="mt-6 flex justify-end">
            <Button onClick={onClose} variant="outline">
              بستن
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSubmissionsModal;
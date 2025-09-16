import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI, consultationAPI } from '../services/api';
import { logger } from '../utils/logger';
import Button from '../components/common/Button';
import InputField from '../components/common/InputField';
import LoadingSpinner from '../components/common/LoadingSpinner';
import UserSubmissionsModal from '../components/UserSubmissionsModal';
import BulkDownloadModal from '../components/BulkDownloadModal';
import UserCard from '../components/UserCard';
import MediaTab from '../components/admin/MediaTab';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserForSubmissions, setSelectedUserForSubmissions] = useState(null);
  const [showBulkDownload, setShowBulkDownload] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('users');
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    totalPayments: 0,
    totalConsultations: 0,
    pendingPayments: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filterStatus]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [usersData, paymentsData, consultationsData, statsData] = await Promise.all([
        adminAPI.getAllUsers().catch(() => ({ data: [] })),
        adminAPI.getAllPayments().catch(() => ({ data: [] })),
        adminAPI.getAllConsultations().catch(() => ({ data: [] })),
        adminAPI.getDashboardStats().catch(() => ({}))
      ]);

      const usersArray = usersData.data || usersData || [];
      const paymentsArray = paymentsData.data || paymentsData || [];
      const consultationsArray = consultationsData.data || consultationsData || [];

      setUsers(usersArray);
      setPayments(paymentsArray);
      setConsultations(consultationsArray);
      setDashboardStats(statsData || {
        totalUsers: usersArray.length,
        totalPayments: paymentsArray.length,
        totalConsultations: consultationsArray.length,
        pendingPayments: paymentsArray.filter(p => p.status === 'PENDING_VERIFICATION').length
      });
    } catch (error) {
      logger.error('Failed to load dashboard data', { error });
      setError('خطا در بارگذاری اطلاعات داشبورد');
      // Set sample data for demonstration
      setSampleData();
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadUser = async (user) => {
    try {
      const response = await consultationAPI.downloadUserRecord(user.id);
      
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
    } catch (error) {
      setError('خطا در دانلود فایل: ' + error.message);
    }
  };

  const setSampleData = () => {
    const sampleUsers = [
      {
        id: 1,
        fullName: 'احمد محمدی',
        mobile: '09123456789',
        createdAt: new Date().toISOString(),
        pets: [{ name: 'میو', petType: 'گربه', breed: 'پرشین', age: 3, gender: 'نر' }]
      },
      {
        id: 2,
        fullName: 'فاطمه احمدی',
        mobile: '09987654321',
        createdAt: new Date().toISOString(),
        pets: [{ name: 'رکس', petType: 'سگ', breed: 'ژرمن', age: 5, gender: 'نر' }]
      }
    ];
    
    const samplePayments = [
      {
        id: 1,
        userId: 1,
        amount: 280000,
        status: 'VERIFIED',
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        userId: 2,
        amount: 280000,
        status: 'PENDING_VERIFICATION',
        createdAt: new Date().toISOString()
      }
    ];
    
    const sampleConsultations = [
      {
        id: 1,
        userId: 1,
        consultationType: 'مشاوره عمومی',
        status: 'COMPLETED',
        description: 'مشاوره در مورد تغذیه گربه',
        createdAt: new Date().toISOString()
      }
    ];

    setUsers(sampleUsers);
    setPayments(samplePayments);
    setConsultations(sampleConsultations);
    setDashboardStats({
      totalUsers: sampleUsers.length,
      totalPayments: samplePayments.length,
      totalConsultations: sampleConsultations.length,
      pendingPayments: samplePayments.filter(p => p.status === 'PENDING_VERIFICATION').length
    });
  };

  const filterUsers = () => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.mobile.includes(searchTerm)
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      if (filterStatus === 'paid') {
        filtered = filtered.filter(user => {
          const userPayments = payments.filter(p => p.userId === user.id);
          return userPayments.some(p => p.status === 'VERIFIED');
        });
      } else if (filterStatus === 'pending') {
        filtered = filtered.filter(user => {
          const userPayments = payments.filter(p => p.userId === user.id);
          return userPayments.some(p => p.status === 'PENDING_VERIFICATION');
        });
      } else if (filterStatus === 'no-payment') {
        filtered = filtered.filter(user => {
          const userPayments = payments.filter(p => p.userId === user.id);
          return userPayments.length === 0;
        });
      }
    }

    setFilteredUsers(filtered);
  };

  const getUserPaymentStatus = (userId) => {
    const userPayments = payments.filter(p => p.userId === userId);
    if (userPayments.length === 0) return { status: 'no-payment', text: 'بدون پرداخت', color: 'text-gray-500' };
    
    const hasVerified = userPayments.some(p => p.status === 'VERIFIED');
    const hasPending = userPayments.some(p => p.status === 'PENDING_VERIFICATION');
    
    if (hasVerified) return { status: 'verified', text: 'تایید شده', color: 'text-green-600' };
    if (hasPending) return { status: 'pending', text: 'در انتظار تایید', color: 'text-yellow-600' };
    return { status: 'rejected', text: 'رد شده', color: 'text-red-600' };
  };

  const getUserConsultations = (userId) => {
    return consultations.filter(c => c.userId === userId);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان';
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">داشبورد مدیریت</h1>
            <Button
              onClick={() => navigate('/dashboard')}
              variant="outline"
              size="sm"
            >
              بازگشت به داشبورد
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">کل کاربران</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">کل پرداخت‌ها</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalPayments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">کل مشاوره‌ها</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalConsultations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">پرداخت‌های در انتظار</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.pendingPayments}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                مدیریت کاربران
              </button>
              <button
                onClick={() => setActiveTab('payments')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'payments'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                مدیریت پرداخت‌ها
              </button>
              <button
                onClick={() => setActiveTab('consultations')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'consultations'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                مدیریت مشاوره‌ها
              </button>
              <button
                onClick={() => setActiveTab('media')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'media'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                مدیریت رسانه‌ها
              </button>
            </nav>
          </div>

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="p-6">
              {/* Search and Filter */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <InputField
                    type="text"
                    placeholder="جستجو بر اساس نام یا شماره موبایل..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="md:w-48">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">همه کاربران</option>
                    <option value="paid">پرداخت شده</option>
                    <option value="pending">در انتظار تایید</option>
                    <option value="no-payment">بدون پرداخت</option>
                  </select>
                </div>
                <div className="flex items-center space-x-3 space-x-reverse">
                      {/* View Mode Toggle */}
                      <div className="flex rounded-md shadow-sm">
                        <button
                          onClick={() => setViewMode('table')}
                          className={`px-3 py-2 text-sm font-medium rounded-r-md border ${
                            viewMode === 'table'
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 6h18m-9 8h9" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setViewMode('cards')}
                          className={`px-3 py-2 text-sm font-medium rounded-l-md border-t border-b border-l ${
                            viewMode === 'cards'
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                          </svg>
                        </button>
                      </div>

                      <button
                        onClick={() => setShowBulkDownload(true)}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center space-x-2 space-x-reverse"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>دانلود گروهی</span>
                      </button>
                    </div>
              </div>

              {/* Users Display */}
              {viewMode === 'table' ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          کاربر
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          شماره موبایل
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          وضعیت پرداخت
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          تعداد مشاوره‌ها
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          تاریخ عضویت
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          عملیات
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((user) => {
                        const paymentStatus = getUserPaymentStatus(user.id);
                        const userConsultations = getUserConsultations(user.id);
                        return (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <span className="text-sm font-medium text-blue-600">
                                      {user.fullName.charAt(0)}
                                    </span>
                                  </div>
                                </div>
                                <div className="mr-4">
                                  <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                                  <div className="text-sm text-gray-500">کاربر #{user.id}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {user.mobile}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`text-sm font-medium ${paymentStatus.color}`}>
                                {paymentStatus.text}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {userConsultations.length}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(user.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => setSelectedUser(user)}
                                className="text-blue-600 hover:text-blue-900 ml-4"
                              >
                                مشاهده جزئیات
                              </button>
                              <button
                                onClick={() => setSelectedUserForSubmissions(user)}
                                className="text-green-600 hover:text-green-900 ml-4"
                              >
                                اطلاعات جامع حیوان
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredUsers.map((user) => {
                    const paymentStatus = getUserPaymentStatus(user.id);
                    const userConsultations = getUserConsultations(user.id);
                    return (
                      <UserCard
                        key={user.id}
                        user={{
                          ...user,
                          paymentStatus,
                          consultationsCount: userConsultations.length
                        }}
                        onViewDetails={setSelectedUser}
                        onViewSubmissions={setSelectedUserForSubmissions}
                        onDownload={handleDownloadUser}
                        formatDate={formatDate}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        شناسه پرداخت
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        کاربر
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        مبلغ
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        وضعیت
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        تاریخ پرداخت
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        عملیات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payments.map((payment) => {
                      const user = users.find(u => u.id === payment.userId);
                      return (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            #{payment.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user?.fullName || 'نامشخص'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              payment.status === 'VERIFIED' ? 'bg-green-100 text-green-800' :
                              payment.status === 'PENDING_VERIFICATION' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {payment.status === 'VERIFIED' ? 'تایید شده' :
                               payment.status === 'PENDING_VERIFICATION' ? 'در انتظار تایید' :
                               'رد شده'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(payment.paymentDate || payment.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900 ml-4">
                              مشاهده رسید
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Consultations Tab */}
          {activeTab === 'consultations' && (
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        شناسه مشاوره
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        کاربر
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        نوع مشاوره
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        وضعیت
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        تاریخ ایجاد
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        عملیات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {consultations.map((consultation) => {
                      const user = users.find(u => u.id === consultation.userId);
                      return (
                        <tr key={consultation.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            #{consultation.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user?.fullName || 'نامشخص'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {consultation.consultationType}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
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
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(consultation.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900 ml-4">
                              مشاهده جزئیات
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Media Tab */}
          {activeTab === 'media' && (
            <MediaTab />
          )}
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">جزئیات کاربر</h3>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">نام کامل</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedUser.fullName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">شماره موبایل</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedUser.mobile}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">تاریخ عضویت</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(selectedUser.createdAt)}</p>
                </div>

                {/* User's Pets */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">حیوانات خانگی</label>
                  {selectedUser.pets && selectedUser.pets.length > 0 ? (
                    <div className="space-y-2">
                      {selectedUser.pets.map((pet, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-md">
                          <p className="text-sm"><strong>نام:</strong> {pet.name}</p>
                          <p className="text-sm"><strong>نوع:</strong> {pet.petType}</p>
                          <p className="text-sm"><strong>نژاد:</strong> {pet.breed}</p>
                          <p className="text-sm"><strong>سن:</strong> {pet.age} سال</p>
                          <p className="text-sm"><strong>جنسیت:</strong> {pet.gender}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">هیچ حیوان خانگی ثبت نشده</p>
                  )}
                </div>

                {/* User's Payments */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">پرداخت‌ها</label>
                  {(() => {
                    const userPayments = payments.filter(p => p.userId === selectedUser.id);
                    return userPayments.length > 0 ? (
                      <div className="space-y-2">
                        {userPayments.map((payment) => (
                          <div key={payment.id} className="bg-gray-50 p-3 rounded-md">
                            <p className="text-sm"><strong>مبلغ:</strong> {formatCurrency(payment.amount)}</p>
                            <p className="text-sm"><strong>وضعیت:</strong> {payment.status}</p>
                            <p className="text-sm"><strong>تاریخ:</strong> {formatDate(payment.paymentDate || payment.createdAt)}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">هیچ پرداختی ثبت نشده</p>
                    );
                  })()}
                </div>

                {/* User's Consultations */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">مشاوره‌ها</label>
                  {(() => {
                    const userConsultations = consultations.filter(c => c.userId === selectedUser.id);
                    return userConsultations.length > 0 ? (
                      <div className="space-y-2">
                        {userConsultations.map((consultation) => (
                          <div key={consultation.id} className="bg-gray-50 p-3 rounded-md">
                            <p className="text-sm"><strong>نوع:</strong> {consultation.consultationType}</p>
                            <p className="text-sm"><strong>وضعیت:</strong> {consultation.status}</p>
                            <p className="text-sm"><strong>توضیحات:</strong> {consultation.description}</p>
                            <p className="text-sm"><strong>تاریخ:</strong> {formatDate(consultation.createdAt)}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">هیچ مشاوره‌ای ثبت نشده</p>
                    );
                  })()}
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button
                  onClick={() => setSelectedUser(null)}
                  variant="outline"
                >
                  بستن
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Submissions Modal */}
      <UserSubmissionsModal
        user={selectedUserForSubmissions}
        isOpen={!!selectedUserForSubmissions}
        onClose={() => setSelectedUserForSubmissions(null)}
      />

      {/* Bulk Download Modal */}
      <BulkDownloadModal
        isOpen={showBulkDownload}
        onClose={() => setShowBulkDownload(false)}
        users={filteredUsers}
      />

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          {error}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaUsers, FaPaw, FaCreditCard, FaChartLine, FaSignOutAlt, FaUserShield, FaEye, FaEdit } from 'react-icons/fa';
import { MdDashboard } from 'react-icons/md';
import { adminAPI, authAPI } from '../../services/api';
// Removed duplicate admin guard: useAdminAuth is no longer needed here
// import { useAdminAuth } from '../../hooks/useAuth';
import InfoCard from '../common/InfoCard';
import DataTable from '../common/DataTable';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPets: 0,
    totalPayments: 0,
    totalConsultations: 0,
  });
  const [users, setUsers] = useState([]);
  const [pets, setPets] = useState([]);
  const [payments, setPayments] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  // Removed duplicate admin guard usage
  // const { isAdmin } = useAdminAuth();
  const adminData = JSON.parse(localStorage.getItem('currentUser'));

  const handleLogout = useCallback((showToast = true) => {
    authAPI.logout();
    if (showToast) {
      toast.success('خروج موفقیت‌آمیز');
    }
    navigate('/admin/login');
  }, [navigate]);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [usersData, petsData, paymentsData, consultationsData] = await Promise.all([
        adminAPI.getAllUsers(),
        adminAPI.getAllPets(),
        adminAPI.getAllPayments(),
        adminAPI.getAllConsultations(),
      ]);

      setUsers(usersData.data.users || []);
      setStats(prev => ({ ...prev, totalUsers: usersData.data.pagination.total || 0 }));

      setPets(petsData.data.pets || []);
      setStats(prev => ({ ...prev, totalPets: petsData.data.pagination.total || 0 }));

      setPayments(paymentsData.data.payments || []);
      setStats(prev => ({ ...prev, totalPayments: paymentsData.data.pagination.total || 0 }));

      setConsultations(consultationsData.data.consultations || []);
      setStats(prev => ({ ...prev, totalConsultations: consultationsData.data.pagination.total || 0 }));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error(error.message || 'خطا در دریافت اطلاعات داشبورد');
      if (error.message.includes("احراز هویت")) {
        handleLogout(false);
      }
    } finally {
      setIsLoading(false);
    }
  }, [handleLogout]);

  // Fetch on mount; component is already protected by AdminProtectedRoute
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('fa-IR');
  const formatCurrency = (amount) => new Intl.NumberFormat('fa-IR').format(amount) + ' تومان';

  const userColumns = [
    { key: 'fullName', label: 'نام و نام خانوادگی', render: (_, row) => `${row.firstName} ${row.lastName}` },
    { key: 'mobile', label: 'شماره موبایل' },
    { key: 'email', label: 'ایمیل', render: (email) => email || 'ندارد' },
    { key: 'createdAt', label: 'تاریخ ثبت‌نام', render: formatDate },
    { key: 'isActive', label: 'وضعیت', render: (isActive) => (
      <span className={`status ${isActive ? 'active' : 'inactive'}`}>{isActive ? 'فعال' : 'غیرفعال'}</span>
    )},
  ];

  const petColumns = [
    { key: 'name', label: 'نام حیوان' },
    { key: 'species', label: 'نوع' },
    { key: 'breed', label: 'نژاد', render: (breed) => breed || 'نامشخص' },
    { key: 'age', label: 'سن', render: (age) => age || 'نامشخص' },
    { key: 'owner', label: 'صاحب', render: (owner) => `${owner?.firstName} ${owner?.lastName}` },
    { key: 'createdAt', label: 'تاریخ ثبت', render: formatDate },
  ];

  const paymentColumns = [
    { key: 'amount', label: 'مبلغ', render: formatCurrency },
    { key: 'paymentMethod', label: 'روش پرداخت' },
    { key: 'status', label: 'وضعیت', render: (status) => (
      <span className={`status ${status.toLowerCase()}`}>{status === 'COMPLETED' ? 'تکمیل شده' : status === 'PENDING' ? 'در انتظار' : 'لغو شده'}</span>
    )},
    { key: 'user', label: 'کاربر', render: (user) => `${user?.firstName} ${user?.lastName}` },
    { key: 'paidAt', label: 'تاریخ پرداخت', render: (paidAt) => paidAt ? formatDate(paidAt) : 'پرداخت نشده' },
  ];

  const consultationColumns = [
    { key: 'title', label: 'عنوان' },
    { key: 'user', label: 'کاربر', render: (user) => `${user?.firstName} ${user?.lastName}` },
    { key: 'pet', label: 'حیوان', render: (pet) => pet?.name },
    { key: 'status', label: 'وضعیت', render: (status) => (
      <span className={`status ${status.toLowerCase()}`}>{status === 'COMPLETED' ? 'تکمیل شده' : status === 'PENDING' ? 'در انتظار' : status === 'IN_PROGRESS' ? 'در حال انجام' : 'لغو شده'}</span>
    )},
    { key: 'urgencyLevel', label: 'اولویت', render: (urgencyLevel) => (
      <span className={`priority ${urgencyLevel.toLowerCase()}`}>{urgencyLevel === 'HIGH' ? 'بالا' : urgencyLevel === 'MEDIUM' ? 'متوسط' : 'عادی'}</span>
    )},
    { key: 'createdAt', label: 'تاریخ ایجاد', render: formatDate },
  ];

  const tableActions = [
    { label: 'View', type: 'view', icon: <FaEye />, onClick: (row) => console.log('View:', row) },
    { label: 'Edit', type: 'edit', icon: <FaEdit />, onClick: (row) => console.log('Edit:', row) },
  ];

  if (isLoading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>در حال بارگذاری...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-content">
          <div className="admin-header-left">
            <FaUserShield className="admin-header-icon" />
            <div>
              <h1>پنل مدیریت</h1>
              <p>خوش آمدید، {adminData?.firstName} {adminData?.lastName}</p>
            </div>
          </div>
          <button onClick={() => handleLogout()} className="logout-btn">
            <FaSignOutAlt />
            خروج
          </button>
        </div>
      </header>

      <nav className="admin-nav">
        <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}><MdDashboard /> نمای کلی</button>
        <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}><FaUsers /> کاربران</button>
        <button className={activeTab === 'pets' ? 'active' : ''} onClick={() => setActiveTab('pets')}><FaPaw /> حیوانات</button>
        <button className={activeTab === 'payments' ? 'active' : ''} onClick={() => setActiveTab('payments')}><FaCreditCard /> پرداخت‌ها</button>
        <button className={activeTab === 'consultations' ? 'active' : ''} onClick={() => setActiveTab('consultations')}><FaChartLine /> مشاوره‌ها</button>
      </nav>

      <main className="admin-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <h2>نمای کلی سیستم</h2>
            <div className="stats-grid">
              <InfoCard title="کاربران ثبت‌نام شده" value={stats.totalUsers} icon={<FaUsers />} />
              <InfoCard title="حیوانات ثبت شده" value={stats.totalPets} icon={<FaPaw />} />
              <InfoCard title="پرداخت‌های انجام شده" value={stats.totalPayments} icon={<FaCreditCard />} />
              <InfoCard title="مشاوره‌های درخواستی" value={stats.totalConsultations} icon={<FaChartLine />} />
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="users-section">
            <h2>مدیریت کاربران</h2>
            <DataTable columns={userColumns} data={users} actions={tableActions} />
          </div>
        )}

        {activeTab === 'pets' && (
          <div className="pets-section">
            <h2>مدیریت حیوانات</h2>
            <DataTable columns={petColumns} data={pets} actions={tableActions} />
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="payments-section">
            <h2>مدیریت پرداخت‌ها</h2>
            <DataTable columns={paymentColumns} data={payments} actions={[{ label: 'View', type: 'view', icon: <FaEye />, onClick: (row) => console.log('View:', row) }]} />
          </div>
        )}

        {activeTab === 'consultations' && (
          <div className="consultations-section">
            <h2>مدیریت مشاوره‌ها</h2>
            <DataTable columns={consultationColumns} data={consultations} actions={tableActions} />
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
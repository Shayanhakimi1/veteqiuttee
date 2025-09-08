import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { MdAdminPanelSettings } from 'react-icons/md';
import './AdminLogin.css';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    mobile: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/auth/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Store admin tokens
        localStorage.setItem('adminAccessToken', data.data.tokens.accessToken);
        localStorage.setItem('adminRefreshToken', data.data.tokens.refreshToken);
        localStorage.setItem('adminData', JSON.stringify(data.data.admin));
        
        toast.success('ورود موفقیت‌آمیز بود!');
        navigate('/admin/dashboard');
      } else {
        toast.error(data.message || 'خطا در ورود');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('خطا در اتصال به سرور');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <MdAdminPanelSettings className="admin-icon" />
          <h2>ورود مدیریت</h2>
          <p>پنل مدیریت سیستم مشاوره دامپزشکی</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="mobile">شماره موبایل</label>
            <div className="input-wrapper">
              <FaUser className="input-icon" />
              <input
                type="text"
                id="mobile"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="شماره موبایل خود را وارد کنید"
                required
                dir="ltr"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">رمز عبور</label>
            <div className="input-wrapper">
              <FaLock className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="رمز عبور خود را وارد کنید"
                required
                dir="ltr"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="admin-login-btn"
            disabled={isLoading}
          >
            {isLoading ? 'در حال ورود...' : 'ورود به پنل مدیریت'}
          </button>
        </form>

        <div className="admin-login-footer">
          <p>دسترسی محدود به مدیران سیستم</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
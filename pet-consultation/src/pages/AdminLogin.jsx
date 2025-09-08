import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth'; // Import useAuth hook
import '../styles/Auth.css'; // Reusing the same styles as Login/Registration

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    identifier: '', // Can be mobile or email
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { adminLogin } = useAuth(); // Get adminLogin from useAuth

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Use the adminLogin function from the useAuth hook
      const response = await adminLogin(formData.identifier, formData.password);
      toast.success(response.message || 'ورود موفقیت‌آمیز بود');
      navigate('/admin/dashboard');
    } catch (error) {
      toast.error(error.message || 'اطلاعات ورود صحیح نمی‌باشد.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>ورود مدیران</h2>
        <p>لطفا برای ورود به پنل مدیریت، اطلاعات خود را وارد کنید.</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="identifier">ایمیل یا شماره موبایل</label>
            <input
              type="text"
              id="identifier"
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              required
              placeholder="example@domain.com or 09123456789"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">رمز عبور</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="auth-btn" disabled={isLoading}>
            {isLoading ? 'در حال ورود...' : 'ورود'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
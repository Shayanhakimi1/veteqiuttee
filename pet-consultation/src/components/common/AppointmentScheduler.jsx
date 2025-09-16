import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle } from 'lucide-react';
import { logger } from '../../utils/logger';
import { appointmentsAPI } from '../../services/api';

const AppointmentScheduler = ({ onAppointmentSelect, selectedDate, selectedTime }) => {
  const [currentDate, setCurrentDate] = useState(selectedDate || '');
  const [currentTime, setCurrentTime] = useState(selectedTime || '');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // تولید تاریخ‌های 30 روز آینده
  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // حذف جمعه‌ها (روز 5 در JavaScript)
      if (date.getDay() !== 5) {
        dates.push({
          value: date.toISOString().split('T')[0],
          label: date.toLocaleDateString('fa-IR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        });
      }
    }
    
    return dates;
  };

  const availableDates = generateAvailableDates();

  // دریافت ساعت‌های موجود برای تاریخ انتخاب شده
  const fetchAvailableSlots = async (date) => {
    if (!date) return;
    
    setLoading(true);
    setError('');
    
    try {
      const data = await appointmentsAPI.getAvailableSlots(date);
      
      if (data.success) {
        setAvailableSlots(data.slots);
      } else {
        setError('خطا در دریافت ساعت‌های موجود');
      }
    } catch (err) {
      logger.error('Failed to fetch available appointment slots', { error: err });
      setError(err.message || 'خطا در اتصال به سرور');
    } finally {
      setLoading(false);
    }
  };

  // تغییر تاریخ
  const handleDateChange = (date) => {
    setCurrentDate(date);
    setCurrentTime(''); // ریست کردن ساعت انتخاب شده
    fetchAvailableSlots(date);
  };

  // تغییر ساعت
  const handleTimeChange = (time) => {
    setCurrentTime(time);
    if (onAppointmentSelect) {
      onAppointmentSelect({
        date: currentDate,
        time: time
      });
    }
  };

  // بارگذاری ساعت‌های موجود هنگام تغییر تاریخ
  useEffect(() => {
    if (currentDate) {
      fetchAvailableSlots(currentDate);
    }
  }, [currentDate]);

  return (
    <div className="space-y-6">
      {/* انتخاب تاریخ */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
          <Calendar className="w-4 h-4" />
          انتخاب تاریخ مشاوره
        </label>
        <select
          value={currentDate}
          onChange={(e) => handleDateChange(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        >
          <option value="">تاریخ مورد نظر را انتخاب کنید</option>
          {availableDates.map((date) => (
            <option key={date.value} value={date.value}>
              {date.label}
            </option>
          ))}
        </select>
      </div>

      {/* انتخاب ساعت */}
      {currentDate && (
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
            <Clock className="w-4 h-4" />
            انتخاب ساعت مشاوره
          </label>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
              <span className="mr-3 text-gray-600">در حال بارگذاری ساعت‌های موجود...</span>
            </div>
          ) : error ? (
            <div className="text-red-600 text-center py-4">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {availableSlots.map((slot) => (
                <button
                  key={slot.time}
                  onClick={() => slot.available && handleTimeChange(slot.time)}
                  disabled={!slot.available}
                  className={`
                    relative p-3 rounded-lg border-2 transition-all duration-200 text-sm font-medium
                    ${
                      !slot.available
                        ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                        : currentTime === slot.time
                        ? 'bg-cyan-500 border-cyan-500 text-white shadow-lg'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-cyan-400 hover:bg-cyan-50'
                    }
                  `}
                >
                  {slot.time}
                  {currentTime === slot.time && (
                    <CheckCircle className="absolute -top-1 -right-1 w-4 h-4 text-white bg-cyan-500 rounded-full" />
                  )}
                  {!slot.available && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs text-red-500">رزرو شده</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
          
          {!loading && !error && availableSlots.length === 0 && currentDate && (
            <div className="text-center py-8 text-gray-500">
              هیچ ساعت موجودی برای این تاریخ یافت نشد
            </div>
          )}
        </div>
      )}

      {/* نمایش انتخاب نهایی */}
      {currentDate && currentTime && (
        <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
          <h4 className="font-medium text-cyan-800 mb-2">زمان انتخاب شده:</h4>
          <div className="flex items-center gap-4 text-sm text-cyan-700">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {availableDates.find(d => d.value === currentDate)?.label}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {currentTime}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentScheduler;
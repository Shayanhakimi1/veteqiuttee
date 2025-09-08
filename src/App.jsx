import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './contexts/AppContext';
import ScrollToTop from './components/common/ScrollToTop';

// Import pages
import Loading from './pages/Loading';
// import Home from './pages/Home'; // موقتاً غیرفعال
import PetSelection from './pages/PetSelection';
import Registration from './pages/Registration';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Consultation from './pages/Consultation';
import Payment from './pages/Payment';
import Confirmation from './pages/Confirmation';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, checkIsLoggedIn } = useApp();
  return (isLoggedIn || checkIsLoggedIn()) ? children : <Navigate to="/login" replace />;
};

// App Routes Component
const AppRoutes = () => {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* صفحه اصلی - موقتاً لودینگ نمایش داده می‌شود */}
        <Route path="/" element={<Loading />} />
        
        {/* صفحه لودینگ */}
        <Route path="/loading" element={<Loading />} />
        
        {/* صفحه اصلی - موقتاً غیرفعال */}
        {/* <Route path="/home" element={<Home />} /> */}
        
        {/* انتخاب پت */}
        <Route path="/pet-selection" element={<PetSelection />} />
        
        {/* ثبت نام */}
        <Route path="/registration" element={<Registration />} />
        
        {/* ورود */}
        <Route path="/login" element={<Login />} />
        
        {/* صفحات محافظت شده */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/consultation" 
          element={
            <ProtectedRoute>
              <Consultation />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/payment" 
          element={
            <ProtectedRoute>
              <Payment />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/confirmation" 
          element={
            <ProtectedRoute>
              <Confirmation />
            </ProtectedRoute>
          } 
        />
        
        {/* Redirect any unknown routes to loading */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

// Main App Component
function App() {
  return (
    <AppProvider>
      <div className="App">
        <AppRoutes />
      </div>
    </AppProvider>
  );
}

export default App;

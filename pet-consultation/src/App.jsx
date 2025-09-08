import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { useAuth } from './hooks/useAuth'; // Import only useAuth
import ScrollToTop from './components/common/ScrollToTop';
import ErrorBoundary from './components/common/ErrorBoundary';
import Loading from './pages/Loading'; // Loading component for Suspense fallback
import { Toast } from './components/ui';

// Lazy load pages
const PetSelection = lazy(() => import('./pages/PetSelection'));
const Registration = lazy(() => import('./pages/Registration'));
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Consultation = lazy(() => import('./pages/Consultation'));
const Payment = lazy(() => import('./pages/Payment'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));
const PaymentVerify = lazy(() => import('./pages/PaymentVerify'));
const Confirmation = lazy(() => import('./pages/Confirmation'));
const FinalConfirmation = lazy(() => import('./pages/FinalConfirmation'));

// Lazy load Admin components
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Admin Protected Route Component
const AdminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');
  const currentUserRaw = localStorage.getItem('currentUser');
  let isAdmin = false;
  try {
    const user = currentUserRaw ? JSON.parse(currentUserRaw) : null;
    isAdmin = Boolean(token && user?.isAdmin);
  } catch {
    isAdmin = false;
  }
  return isAdmin ? children : <Navigate to="/admin/login" replace />;
};

// App Routes Component
const AppRoutes = () => {
  return (
    <Router>
      <ScrollToTop />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Loading />} />
          <Route path="/loading" element={<Loading />} />
          <Route path="/pet-selection" element={<PetSelection />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="/login" element={<Login />} />
          
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/consultation" element={<ProtectedRoute><Consultation /></ProtectedRoute>} />
          <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment/verify" element={<ProtectedRoute><PaymentVerify /></ProtectedRoute>} />
          <Route path="/confirmation" element={<ProtectedRoute><Confirmation /></ProtectedRoute>} />
          <Route path="/final-confirmation" element={<FinalConfirmation />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

// Main App Component
function App() {
  return (
    <ErrorBoundary fallbackMessage="متأسفانه مشکلی در بارگذاری اپلیکیشن پیش آمده است.">
      <ThemeProvider>
        <AppProvider>
          <Toast.Provider>
            <ErrorBoundary fallbackMessage="مشکلی در مدیریت وضعیت اپلیکیشن رخ داده است.">
              <div className="App">
                <ErrorBoundary fallbackMessage="مشکلی در مسیریابی صفحات رخ داده است.">
                  <AppRoutes />
                </ErrorBoundary>
              </div>
            </ErrorBoundary>
          </Toast.Provider>
        </AppProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

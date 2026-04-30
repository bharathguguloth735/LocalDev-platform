import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { api } from './api';
import Navbar from './components/layout/Navbar';
import LandingPage from './pages/LandingPage';
import ClientDashboard from './pages/ClientDashboard';
import StudentDashboard from './pages/StudentDashboard';
import AdminPanel from './pages/AdminPanel';
import Auth from './pages/Auth';
import ForgotPassword from './pages/ForgotPassword';
import PostProject from './pages/PostProject';
import ProtectedRoute from './components/layout/ProtectedRoute';
import About from './pages/info/About';
import Contact from './pages/info/Contact';
import Privacy from './pages/info/Privacy';
import Terms from './pages/info/Terms';
import Pricing from './pages/info/Pricing';
import Explore from './pages/info/Explore';
import HowItWorksPage from './pages/info/HowItWorksPage';
import Portfolio from './pages/public/Portfolio';

import Onboarding from './pages/Onboarding';
import AiAssistant from './components/dashboard/AiAssistant';
import { ToastProvider } from './components/layout/Toast';
import CommandPalette from './components/dashboard/CommandPalette';
import GlobalSocketListener from './components/layout/GlobalSocketListener';
import ErrorBoundary from './components/layout/ErrorBoundary';
import useUserStore from './store/useUserStore';

function App() {
  const { isAuthenticated, user, setUser } = useUserStore();
  const location = useLocation();

  // Neural Role Sync: Ensure the frontend role always matches the database
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      api.getMe()
        .then(updatedUser => {
          const localUserStr = localStorage.getItem('user');
          let localUserRole = null;
          try { localUserRole = JSON.parse(localUserStr)?.role; } catch (e) {}

          if (updatedUser && (updatedUser.role !== user.role || updatedUser.role !== localUserRole)) {
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            // MASTER REDIRECT: If role was upgraded to Admin, move to Command Center
            if (updatedUser.role === 'admin') {
              window.location.href = '/admin';
            } else {
              window.dispatchEvent(new Event('userUpdated'));
            }
          }
        })
        .catch(err => console.error('Role sync failed:', err));
    }
  }, [isAuthenticated, user?.id, user?.role, setUser]);
  
  return (
    <ErrorBoundary>
      <ToastProvider>
        <GlobalSocketListener />
        <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans relative transition-all duration-300 neural-mesh">
          <Navbar />
          <main className="flex-grow pt-[74px]">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Auth />} />
              <Route path="/register" element={<Auth />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/client-dashboard/*" element={<ProtectedRoute allowedRoles={['client', 'admin']}><ClientDashboard /></ProtectedRoute>} />
              <Route path="/student-dashboard/*" element={<ProtectedRoute allowedRoles={['student', 'admin']}><StudentDashboard /></ProtectedRoute>} />
              <Route path="/admin/*" element={<ProtectedRoute allowedRoles={['admin']}><AdminPanel /></ProtectedRoute>} />
              <Route path="/post-project" element={<ProtectedRoute allowedRoles={['client', 'admin']}><PostProject /></ProtectedRoute>} />
              <Route path="/portfolio/:username" element={<Portfolio />} />
              {/* Catch missing routes and redirect home safely: */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          {(user?.role === 'client' || location.pathname.includes('client-dashboard')) && <AiAssistant />}
          <CommandPalette />
        </div>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;

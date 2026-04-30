import { Navigate } from 'react-router-dom';
import useUserStore from '../../store/useUserStore';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const { user } = useUserStore();

  const activeUser = user || (userStr ? JSON.parse(userStr) : null);

  if (!token || !activeUser) {
    // Not logged in
    return <Navigate to="/login" replace />;
  }

  try {
    if (allowedRoles && !allowedRoles.includes(activeUser.role)) {
      // Wrong role, redirect to appropriate dashboard
      if (activeUser.role === 'client') return <Navigate to="/client-dashboard" replace />;
      if (activeUser.role === 'student') return <Navigate to="/student-dashboard" replace />;
      return <Navigate to="/" replace />;
    }

    return children;
  } catch (err) {
    localStorage.clear();
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;

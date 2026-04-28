import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (!token || !userStr) {
    // Not logged in
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userStr);
    
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      // Wrong role, redirect to appropriate dashboard
      if (user.role === 'client') return <Navigate to="/client-dashboard" replace />;
      if (user.role === 'student') return <Navigate to="/student-dashboard" replace />;
      return <Navigate to="/" replace />;
    }

    return children;
  } catch (err) {
    localStorage.clear();
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;

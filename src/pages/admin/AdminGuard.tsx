import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/authService';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

interface AdminGuardProps {
  children: React.ReactNode;
}

const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    const verifyAdmin = async () => {
      // Fast-fail: Admin panel disabled globally
      if (import.meta.env.VITE_ADMIN_ENABLED === 'false') {
        setIsAuthorized(false);
        return;
      }

      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;

      // Fast-fail: Avoid making the request if we know they aren't authenticated
      if (!user) {
        setIsAuthorized(false);
        return;
      }

      // Verify the session integrity against the backend
      const isValidAdmin = await authService.checkAdmin();
      setIsAuthorized(isValidAdmin);
    };

    verifyAdmin();
  }, []);

  if (isAuthorized === null) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48, color: '#00ff88' }} spin />} />
        <div style={{ marginTop: 24, color: '#00ff88', letterSpacing: 2 }}>C3 COMMAND: VERIFYING CLEARANCE...</div>
      </div>
    );
  }

  if (!isAuthorized) {
    // Determine where to send them based on whether they are logged in at all
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AdminGuard;

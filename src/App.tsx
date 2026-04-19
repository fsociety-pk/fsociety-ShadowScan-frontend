import React from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Layout, Button, Input, Space } from 'antd';
import { 
  BugOutlined, 
  UserOutlined, 
  DashboardOutlined, 
  ToolOutlined, 
  CodeOutlined, 
  PlusOutlined, 
  LogoutOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';

import Dashboard from './pages/Dashboard/Dashboard';
import CaseList from './pages/Cases/CaseList';
import CaseDetail from './pages/Cases/CaseDetail';
import NewCase from './pages/Cases/NewCase';
import OsintTools from './pages/OsintTools/OsintTools';
import SearchResults from './pages/Search/SearchResults';
import Profile from './pages/Profile/Profile';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

import AdminLayout from './pages/admin/AdminLayout';
import AdminGuard from './pages/admin/AdminGuard';
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import Analytics from './pages/admin/Analytics';
import ActivityLogs from './pages/admin/ActivityLogs';
import Settings from './pages/admin/Settings';
import { AdminContextProvider } from './context/AdminContext';

// Admin Page Placeholders (None remaining)

const { Header, Content, Footer } = Layout;

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const onSearch = (value: string) => {
    if (value.trim()) {
      navigate(`/search?q=${encodeURIComponent(value.trim())}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navItems = [
    { key: '/dashboard', label: 'Dashboard', icon: <DashboardOutlined /> },
    { key: '/cases', label: 'My Cases', icon: <CodeOutlined /> },
    { key: '/cases/new', label: 'New Case', icon: <PlusOutlined /> },
    { key: '/tools', label: 'OSINT Tools', icon: <ToolOutlined /> },
    { key: '/profile', label: 'My Dossier', icon: <UserOutlined /> },
  ];


  // Helper to protect routes
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    return user ? <>{children}</> : <Navigate to="/login" replace />;
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#000' }}>
      <Header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        width: '100%',
        background: 'rgba(0,0,0,0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0 40px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
           <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
             <BugOutlined style={{ fontSize: 28, color: '#00ff88', filter: 'drop-shadow(0 0 8px #00ff88)' }} />
             <span style={{ color: '#00ff88', fontSize: 20, fontWeight: 'bold', letterSpacing: 1, textShadow: '0 0 10px rgba(0,255,136,0.3)' }}>SHADOWSCAN</span>
           </Link>
        </div>

        <Space size="large">
          {user && (
            <Input.Search
              placeholder="Search dossiers and clues..."
              onSearch={onSearch}
              style={{ width: 350 }}
              className="navbar-search"
              size="large"
            />
          )}
          {user && user.role === 'admin' && (
            <Button 
              type="primary" 
              icon={<SafetyCertificateOutlined />} 
              size="large" 
              onClick={() => navigate('/admin/dashboard')}
              style={{ background: 'rgba(0, 255, 136, 0.1)', borderColor: '#00ff88', color: '#00ff88' }}
            >
              ADMINISTRATION
            </Button>
          )}
          {user ? (
            <Button 
              type="primary" 
              icon={<LogoutOutlined />} 
              size="large" 
              onClick={handleLogout}
              style={{ background: 'rgba(255, 77, 79, 0.1)', borderColor: '#ff4d4f', color: '#ff4d4f' }}
            >
              SIGN OUT
            </Button>
          ) : (
            <Link to="/login">
              <Button type="primary" icon={<UserOutlined />} size="large">CONNECT</Button>
            </Link>
          )}
        </Space>
      </Header>

      <Layout style={{ background: 'transparent', display: 'flex', flexDirection: 'row' }}>
        {user && !location.pathname.startsWith('/admin') && (
          <div className="vertical-nav-container">
            {navItems.map((item) => (
              <div 
                key={item.key} 
                className={`nav-tab-item ${location.pathname === item.key ? 'active' : ''}`}
                onClick={() => navigate(item.key)}
              >
                {item.icon}
                <span>{item.label}</span>
              </div>
            ))}
            <div style={{ marginTop: 'auto', padding: '0 10px', color: '#1a1d23', fontSize: '0.65em', letterSpacing: 1, fontWeight: 'bold', textTransform: 'uppercase' }}>
              STATUS: SECURE // ENCRYPTED
            </div>
          </div>
        )}

        <Content style={{ 
          flex: 1, 
          padding: (user && !location.pathname.startsWith('/admin')) ? '40px 60px 40px 20px' : '0', 
          minHeight: 'calc(100vh - 72px)' 
        }}>
          <div key={location.pathname} className="page-transition" style={{ 
            maxWidth: location.pathname.startsWith('/admin') ? 'none' : 1400, 
            margin: (user && !location.pathname.startsWith('/admin')) ? '0' : (location.pathname.startsWith('/admin') ? '0' : '0 auto') 
          }}>
            <Routes>
              <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/cases" element={<ProtectedRoute><CaseList /></ProtectedRoute>} />
              <Route path="/cases/new" element={<ProtectedRoute><NewCase /></ProtectedRoute>} />
              <Route path="/cases/:id" element={<ProtectedRoute><CaseDetail /></ProtectedRoute>} />
              <Route path="/tools" element={<ProtectedRoute><OsintTools /></ProtectedRoute>} />
              <Route path="/search" element={<ProtectedRoute><SearchResults /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              
              {/* Public Routes */}
              <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
              <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />

              {/* Admin Routes */}
              <Route path="/admin" element={
                <AdminGuard>
                  <AdminContextProvider>
                    <AdminLayout />
                  </AdminContextProvider>
                </AdminGuard>
              }>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="logs" element={<ActivityLogs />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Routes>
          </div>
        </Content>
      </Layout>

      <Footer style={{ textAlign: 'center', background: '#000', color: '#1a1d23', borderTop: '1px solid #30363d', fontSize: '10px', letterSpacing: '2px', padding: '20px' }}>
        FSOCIETY // PERSONAL SHADOWSCAN WORKSPACE // {new Date().getFullYear()} // STAY HIDDEN
      </Footer>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;

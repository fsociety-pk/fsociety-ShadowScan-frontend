import React from 'react';
import logoImg from './assets/logo.png';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Layout, Button, Input, Space } from 'antd';
import {
  UserOutlined,
  DashboardOutlined,
  ToolOutlined,
  CodeOutlined,
  PlusOutlined,
  LogoutOutlined,
  SafetyCertificateOutlined,
  InfoCircleOutlined,
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
import EditCase from './pages/Cases/EditCase';
import OsintChatbot from './components/OsintChatbot';
import QuickAddFinding from './components/QuickAddFinding';
import ToolOverviewModal from './components/ToolOverviewModal';
import WelcomeTourModal from './components/WelcomeTourModal';
import LandingPage from './pages/Landing/LandingPage';

import AdminLayout from './pages/admin/AdminLayout';
import AdminGuard from './pages/admin/AdminGuard';
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import Analytics from './pages/admin/Analytics';
import ActivityLogs from './pages/admin/ActivityLogs';
import Settings from './pages/admin/Settings';
import { AdminContextProvider } from './context/AdminContext';

const { Header, Content, Footer } = Layout;

/**
 * Guards a route — redirects unauthenticated users to /login.
 * Defined outside AppContent so React never remounts it mid-render.
 */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  return user ? <>{children}</> : <Navigate to="/" replace />;
};

/** Top-level nav links — reordered: OSINT Tools → New Case → My Cases. My Dossier removed from sidebar (profile moved to topbar). */
const navItems = [
  { key: '/dashboard', label: 'Dashboard', icon: <DashboardOutlined /> },
  { key: '/tools', label: 'OSINT Tools', icon: <ToolOutlined /> },
  { key: '/cases/new', label: 'New Case & AI Report', icon: <PlusOutlined /> },
  { key: '/cases', label: 'My Cases', icon: <CodeOutlined /> },
];

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const [overviewOpen, setOverviewOpen] = React.useState(false);

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/';

  const onSearch = (value: string) => {
    if (value.trim()) {
      navigate(`/search?q=${encodeURIComponent(value.trim())}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
  };



  return (
    <Layout style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
      {!isAuthPage && (
        <Header
          className="modern-topbar"
          style={{
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            width: '100%',
            padding: '0 40px',
          }}
        >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
           <Link to="/" className="logo-hover" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
             <img src={logoImg} alt="Shadow Scan Logo" style={{ width: 40, height: 40, objectFit: 'contain' }} />
             <div>
               <div style={{
                 fontSize: 20,
                 fontWeight: 900,
                 letterSpacing: 3,
                 color: 'var(--cyber-blue)',
               }}>
                 SHADOW SCAN
               </div>
               <div style={{
                 fontSize: 9,
                 color: '#6b7280',
                 letterSpacing: 1.5,
                 fontWeight: 600,
                 marginTop: 2,
               }}>
                 OSINT INTELLIGENCE
               </div>
             </div>
           </Link>
        </div>

        <Space size="middle" align="center">
          {user && (
            <Button
              type="default"
              className="btn-header-armory"
              icon={<InfoCircleOutlined />}
              size="large"
              onClick={() => setOverviewOpen(true)}
              style={{
                fontWeight: 700,
                letterSpacing: 1,
              }}
            >
              ARMORY OVERVIEW
            </Button>
          )}
          {user && (
            <Input.Search
              placeholder="Search dossiers and findings..."
              onSearch={onSearch}
              className="navbar-search animated-search"
              size="large"
            />
          )}
          {user && user.role === 'admin' && (
            <Button
              type="default"
              className="btn-header-admin"
              icon={<SafetyCertificateOutlined />}
              size="large"
              onClick={() => navigate('/admin/dashboard')}
              style={{
                fontWeight: 700,
                letterSpacing: 1,
              }}
            >
              ADMIN
            </Button>
          )}
          {user ? (
            <>
              {/* Profile avatar — navigates to /profile */}
              <div
                onClick={() => navigate('/profile')}
                title={`Profile: ${user.username || 'Operative'}`}
                style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', flexShrink: 0,
                  boxShadow: '0 2px 10px rgba(14,165,233,0.3)',
                  border: '2px solid rgba(255,255,255,0.6)',
                  transition: 'transform 0.2s ease',
                  color: '#fff', fontSize: 16,
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <UserOutlined />
              </div>
              <Button
                type="default"
                className="btn-header-signout"
                icon={<LogoutOutlined />}
                size="large"
                onClick={handleLogout}
                style={{
                  fontWeight: 700,
                  letterSpacing: 1,
                }}
              >
                SIGN OUT
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button
                type="primary"
                icon={<UserOutlined />}
                size="large"
                style={{
                  background: 'var(--cyber-gradient)',
                  border: 'none',
                  fontWeight: 700,
                  letterSpacing: 1,
                  color: '#fff',
                }}
              >
                CONNECT
              </Button>
            </Link>
          )}
        </Space>
      </Header>
      )}

      <Layout style={{ background: 'transparent', display: 'flex', flexDirection: 'row' }}>
        {user && !location.pathname.startsWith('/admin') && (
          <div className="vertical-nav-container">
            {navItems.map((item) => (
              <div 
                key={item.key} 
                className={`nav-tab-item ${location.pathname === item.key ? 'active' : ''}`}
                onClick={() => navigate(item.key)}
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </div>
            ))}
            <div style={{ marginTop: 'auto', padding: '0 10px', color: '#374151', fontSize: '0.6em', letterSpacing: 1.5, fontWeight: 700, textTransform: 'uppercase' }}>
              ◆ SHADOW SCAN ◆
            </div>
          </div>
        )}

        <Content style={{ 
          flex: 1, 
          padding: (user && !location.pathname.startsWith('/admin')) ? '40px 60px 40px 20px' : '0', 
          minHeight: 'calc(100vh - 72px)' 
        }}>
          <div key={location.pathname} className="page-transition" style={{ 
            maxWidth: isAuthPage || location.pathname.startsWith('/admin') ? 'none' : 1400, 
            margin: (user && !location.pathname.startsWith('/admin')) ? '0' : ((isAuthPage || location.pathname.startsWith('/admin')) ? '0' : '0 auto'),
            width: isAuthPage ? '100%' : 'auto',
            height: isAuthPage ? '100vh' : 'auto'
          }}>
            <Routes>
              <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/cases" element={<ProtectedRoute><CaseList /></ProtectedRoute>} />
              <Route path="/cases/new" element={<ProtectedRoute><NewCase /></ProtectedRoute>} />
              <Route path="/cases/:id" element={<ProtectedRoute><CaseDetail /></ProtectedRoute>} />
              <Route path="/cases/:id/edit" element={<ProtectedRoute><EditCase /></ProtectedRoute>} />
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

      {user && <OsintChatbot />}
      {user && <QuickAddFinding />}
      {user && <WelcomeTourModal />}
      <ToolOverviewModal open={overviewOpen} onClose={() => setOverviewOpen(false)} />

      {!isAuthPage && (
        <Footer style={{ textAlign: 'center', background: 'var(--bg-card)', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', fontSize: '11px', letterSpacing: '1.5px', padding: '30px', fontWeight: 600 }}>
          <div style={{ marginBottom: 10 }}>
            ◆ SHADOW SCAN OSINT PLATFORM ◆ © {new Date().getFullYear()} F.SOCIETY • INTELLIGENCE GATHERING FRAMEWORK
          </div>
          <div style={{ fontSize: 9, color: 'var(--primary)', letterSpacing: 1 }}>
            STATUS: OPERATIONAL • ENCRYPTION: ENABLED • THREAT LEVEL: MONITORED
          </div>
        </Footer>
      )}
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

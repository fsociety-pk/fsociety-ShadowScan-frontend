import React, { useState } from 'react';
import { Layout, Menu, Button, Typography, Space, Breadcrumb } from 'antd';
import { 
  DashboardOutlined, 
  UserOutlined, 
  LineChartOutlined, 
  FileTextOutlined, 
  SettingOutlined, 
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  BugOutlined
} from '@ant-design/icons';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleReturnToWorkspace = () => {
    navigate('/dashboard');
  };

  const menuItems = [
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/admin/dashboard">Dashboard</Link>,
    },
    {
      key: '/admin/users',
      icon: <UserOutlined />,
      label: <Link to="/admin/users">Users</Link>,
    },
    {
      key: '/admin/analytics',
      icon: <LineChartOutlined />,
      label: <Link to="/admin/analytics">Analytics</Link>,
    },
    {
      key: '/admin/logs',
      icon: <FileTextOutlined />,
      label: <Link to="/admin/logs">System Logs</Link>,
    },
    {
      key: '/admin/settings',
      icon: <SettingOutlined />,
      label: <Link to="/admin/settings">System Settings</Link>,
    },
  ];

  const getBreadcrumbLabel = (path: string) => {
    const parts = path.split('/').filter(p => p);
    return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' / ');
  };

  return (
    <Layout style={{ minHeight: '100vh' }} className="admin-layout">
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        width={260}
        theme="dark"
        style={{ 
          borderRight: '1px solid #30363d',
          background: '#010409'
        }}
      >
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: '0 24px',
          borderBottom: '1px solid #30363d'
        }}>
          <BugOutlined style={{ fontSize: 24, color: '#00ff88' }} />
          {!collapsed && (
            <span style={{ 
              marginLeft: 12, 
              color: '#00ff88', 
              fontWeight: 'bold', 
              letterSpacing: 1,
              whiteSpace: 'nowrap'
            }}>
              ADMIN PANEL
            </span>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{ background: 'transparent', marginTop: 16 }}
        />
      </Sider>
      
      <Layout style={{ background: '#0d1117' }}>
        <Header style={{ 
          padding: '0 24px', 
          background: '#010409', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderBottom: '1px solid #30363d'
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64, color: '#8b949e' }}
          />
          
          <Space size="large">
            <Text style={{ color: '#8b949e' }}>STATUS: <span style={{ color: '#00ff88' }}>ADMINISTRATOR SECURE</span></Text>
            <Button 
              type="primary" 
              icon={<DashboardOutlined />} 
              onClick={handleReturnToWorkspace}
              ghost
            >
              RETURN TO WORKSPACE
            </Button>
          </Space>
        </Header>
        
        <Content style={{ margin: '24px 24px', minHeight: 280 }}>
          <div style={{ marginBottom: 24 }}>
            <Breadcrumb items={[
              { title: <Link to="/admin/dashboard" style={{ color: '#8b949e' }}>Admin</Link> },
              { title: <span style={{ color: '#00ff88' }}>{getBreadcrumbLabel(location.pathname).replace('Admin / ', '')}</span> }
            ]} />
          </div>
          
          <div className="admin-page-content page-transition">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;

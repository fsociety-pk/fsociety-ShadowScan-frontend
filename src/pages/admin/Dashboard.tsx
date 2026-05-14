import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Button, Typography, Space, message, Skeleton } from 'antd';
import { 
  UserOutlined, 
  SearchOutlined, 
  CheckCircleOutlined, 
  RiseOutlined, 
  ArrowRightOutlined,
  SyncOutlined
} from '@ant-design/icons';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, 
  BarChart, Bar, Legend 
} from 'recharts';
import api from '../../api/axiosConfig';
import type { DashboardStats, AdminLog, AnalyticsData } from '../../types/admin';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

const COLORS = ['var(--cyber-blue)', '#1890ff', '#f5222d', '#faad14'];

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trends, setTrends] = useState<AnalyticsData[]>([]);
  const [toolUsage, setToolUsage] = useState<any[]>([]);
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [activities, setActivities] = useState<AdminLog[]>([]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, trendsRes, usageRes, topUsersRes, activityRes] = await Promise.all([
        api.get('/admin/analytics/dashboard'),
        api.get('/admin/analytics/trends?timeframe=7d'),
        api.get('/admin/analytics/tools-usage'),
        api.get('/admin/analytics/top-users'),
        api.get('/admin/analytics/activity')
      ]);

      setStats(statsRes.data.data);
      setTrends(trendsRes.data.data);
      
      const usageData = Object.entries(usageRes.data.data || {}).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value
      }));
      setToolUsage(usageData);
      
      setTopUsers(topUsersRes.data.data);
      setActivities((activityRes.data.data || []).slice(0, 5));
    } catch (error) {
      console.error('Dashboard Fetch Error:', error);
      message.error('Failed to fetch dashboard intelligence.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000); // 60s auto-refresh
    return () => clearInterval(interval);
  }, []);

  const activityColumns = [
    {
      title: 'User',
      dataIndex: 'userId',
      key: 'user',
      render: (user: any) => user?.username || 'System',
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (action: string) => (
        <Tag color="blue" style={{ textTransform: 'uppercase', fontSize: '10px' }}>{action.replace(/_/g, ' ')}</Tag>
      )
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (ts: string) => new Date(ts).toLocaleTimeString(),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'success' ? 'var(--cyber-blue)' : '#f50'}>{status.toUpperCase()}</Tag>
      )
    }
  ];

  if (loading && !stats) return <Skeleton active paragraph={{ rows: 20 }} style={{ padding: 40 }} />;

  return (
    <div style={{ padding: '0 0 40px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <Title level={2} style={{ color: 'var(--cyber-blue)', margin: 0 }}>COMMAND CENTER OVERVIEW</Title>
        <Button 
          icon={<SyncOutlined spin={loading} />} 
          onClick={() => { setLoading(true); fetchDashboardData(); }}
          type="text"
          style={{ color: 'var(--text-muted)' }}
        >
          REFRESH INTEL
        </Button>
      </div>

      {/* Stat Cards */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="admin-stat-card">
            <Statistic
              title={<Text style={{ color: 'var(--text-muted)' }}>TOTAL OPERATIVES</Text>}
              value={stats?.totalUsers}
              prefix={<UserOutlined style={{ color: 'var(--cyber-blue)' }} />}
              styles={{ content: { color: 'var(--cyber-blue)' } }}
            />
            <div style={{ marginTop: 8, fontSize: '12px', color: 'var(--cyber-blue)' }}>
              <RiseOutlined /> +12% from last month
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="admin-stat-card">
            <Statistic
              title={<Text style={{ color: 'var(--text-muted)' }}>TOTAL SCANS</Text>}
              value={stats?.totalScans}
              prefix={<SearchOutlined style={{ color: '#1890ff' }} />}
              styles={{ content: { color: '#1890ff' } }}
            />
            <div style={{ marginTop: 8, fontSize: '12px', color: '#1890ff' }}>
              <RiseOutlined /> +240 since yesterday
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="admin-stat-card">
            <Statistic
              title={<Text style={{ color: 'var(--text-muted)' }}>ACTIVE TODAY</Text>}
              value={stats?.activeUsersToday}
              suffix={`/ ${stats?.totalUsers}`}
              styles={{ content: { color: '#faad14' } }}
            />
            <div style={{ marginTop: 8, fontSize: '12px', color: '#faad14' }}>
              {stats && stats.totalUsers > 0 ? Math.round((stats.activeUsersToday / stats.totalUsers) * 100) : 0}% Engagement Rate
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="admin-stat-card">
            <Statistic
              title={<Text style={{ color: 'var(--text-muted)' }}>SYSTEM HEALTH</Text>}
              value={stats?.systemHealthStatus.status.toUpperCase()}
              prefix={<CheckCircleOutlined style={{ color: 'var(--cyber-blue)' }} />}
              styles={{ content: { color: 'var(--cyber-blue)' } }}
            />
            <div style={{ marginTop: 8, fontSize: '12px', color: 'var(--text-muted)' }}>
              LATENCY: {stats?.systemHealthStatus.latency}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts Section */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={16}>
          <Card title="SCAN TRENDS (LAST 7 DAYS)" className="admin-chart-card">
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ background: '#ffffff', border: '1px solid var(--border-color)' }}
                    itemStyle={{ color: 'var(--cyber-blue)' }}
                  />
                  <Line type="monotone" dataKey="scans" stroke="var(--cyber-blue)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="users" stroke="#1890ff" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="TOOL DISTRIBUTION" className="admin-chart-card">
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={toolUsage}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {toolUsage.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ background: '#ffffff', border: '1px solid var(--border-color)' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="TOP OPERATIVES" className="admin-chart-card">
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={topUsers}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="username" stroke="var(--text-muted)" fontSize={12} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ background: '#ffffff', border: '1px solid var(--border-color)' }}
                  />
                  <Bar dataKey="totalScans" fill="var(--cyber-blue)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card 
            title="RECENT ACTIVITY" 
            className="admin-chart-card"
            extra={<Link to="/admin/logs" style={{ color: 'var(--cyber-blue)', fontSize: '12px' }}>VIEW ALL LOGS <ArrowRightOutlined /></Link>}
          >
            <Table 
              columns={activityColumns} 
              dataSource={activities} 
              pagination={false}
              size="small"
              rowKey="_id"
              className="admin-compact-table"
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <div style={{ marginTop: 32 }}>
        <Title level={4} style={{ color: 'var(--text-muted)', marginBottom: 16 }}>QUICK ACTIONS</Title>
        <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
           <Row gutter={16}>
             <Col span={8}>
               <Link to="/admin/users"><Button type="primary" size="large" block>MANAGE OPERATIVES</Button></Link>
             </Col>
             <Col span={8}>
               <Link to="/admin/logs"><Button size="large" block>SYSTEM AUDITS</Button></Link>
             </Col>
             <Col span={8}>
               <Link to="/admin/settings"><Button size="large" block>GLOBAL CONFIG</Button></Link>
             </Col>
           </Row>
        </Space>
      </div>
    </div>
  );
};

export default AdminDashboard;

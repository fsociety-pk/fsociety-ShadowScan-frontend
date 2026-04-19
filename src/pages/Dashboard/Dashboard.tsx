import React, { useEffect, useState } from 'react';
import { Card, Typography, Row, Col, Statistic, Button, List, Tag, Space } from 'antd';
import { FolderOpenOutlined, DatabaseOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';

const { Title, Paragraph, Text } = Typography;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ cases: 0, entities: 0 });
  const [recentCases, setRecentCases] = useState<any[]>([]);
  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [casesRes] = await Promise.all([
        api.get('/cases'),
        api.get('/search?q=') // This might need a proper stats endpoint, but for now we list
      ]);
      setStats({
        cases: casesRes.data.length,
        entities: 0 // Placeholder until we have a proper count endpoint
      });
      setRecentCases(casesRes.data.slice(0, 3));
    } catch (error) {
      console.error('Failed to load dashboard data');
    }
  };

  if (!user) {
    return (
      <div style={{ textAlign: 'center', marginTop: 50 }}>
        <Title level={3} style={{ color: '#f85149' }}>Access Restricted</Title>
        <Paragraph>You must establish a secure connection to access your private workspace.</Paragraph>
        <Button type="primary" onClick={() => navigate('/login')}>Login</Button>
      </div>
    );
  }

  return (
    <div>
      <Title level={2} style={{ color: '#00ff88', borderBottom: '1px solid #30363d', paddingBottom: 10 }}>
        [ Workspace Overview ]
      </Title>
      
      <Row gutter={24} style={{ marginTop: 30 }}>
        <Col xs={24} md={12}>
          <Card bordered={false} style={{ textAlign: 'center' }}>
            <FolderOpenOutlined style={{ fontSize: 40, color: 'var(--neon-green)', marginBottom: 15 }} />
            <Statistic title="Active Investigations" value={stats.cases} valueStyle={{ color: 'var(--text-main)' }} />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card bordered={false} style={{ textAlign: 'center' }}>
            <DatabaseOutlined style={{ fontSize: 40, color: '#1f6feb', marginBottom: 15 }} />
            <Statistic title="Status" value="SECURE" valueStyle={{ color: 'var(--neon-green)' }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={24} style={{ marginTop: 40 }}>
        <Col xs={24} lg={16}>
           <Card 
            title={<span style={{ color: 'var(--neon-green)' }}><FolderOpenOutlined /> Recent Investigations</span>} 
            style={{ height: '100%' }}
            extra={<Button type="link" onClick={() => navigate('/cases')}>View All</Button>}
           >
            <List
              dataSource={recentCases}
              renderItem={item => (
                <List.Item 
                  style={{ borderBottom: '1px solid var(--border-color)', padding: '15px 0', cursor: 'pointer' }}
                  onClick={() => navigate(`/cases/${item._id}`)}
                >
                  <List.Item.Meta
                    title={<Text style={{ color: 'var(--text-main)' }}>{item.title}</Text>}
                    description={<Tag color="blue">{item.category}</Tag>}
                  />
                  <div style={{ textAlign: 'right' }}>
                    <Tag color="error">{item.priority}</Tag>
                    <div style={{ fontSize: '0.8em', color: 'var(--text-muted)', marginTop: 5 }}>{new Date(item.createdAt).toLocaleDateString()}</div>
                  </div>
                </List.Item>
              )}
              locale={{ emptyText: <Text type="secondary">No active cases. Start a new investigation to begin.</Text> }}
            />
           </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card 
            title={<span style={{ color: 'var(--neon-green)' }}><PlusOutlined /> Quick Actions</span>} 
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button type="primary" block icon={<PlusOutlined />} onClick={() => navigate('/cases/new')}>
                New Investigation
              </Button>
              <Button type="default" block icon={<SearchOutlined />} onClick={() => navigate('/cases')}>
                Search Workspace
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;

import React, { useEffect, useState } from 'react';
import { Card, Typography, Row, Col, Statistic, Button, Tag, Space } from 'antd';
import { FolderOpenOutlined, DatabaseOutlined, PlusOutlined, SearchOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import ToolOverviewModal from '../../components/ToolOverviewModal';

const { Title, Paragraph, Text } = Typography;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ cases: 0, entities: 0 });
  const [recentCases, setRecentCases] = useState<any[]>([]);
  const [overviewOpen, setOverviewOpen] = useState(false);
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
        api.get('/cases')
      ]);
      setStats({
        cases: casesRes.data.length,
        entities: casesRes.data.reduce((acc: number, curr: any) => acc + (curr.findings?.length || 0), 0)
      });
      setRecentCases(casesRes.data.slice(0, 3));
    } catch (_error) {
      console.error('Failed to load dashboard data');
    }
  };

  if (!user) {
    return (
      <div style={{ textAlign: 'center', marginTop: 100 }}>
        <Title level={3}>Access Restricted</Title>
        <Paragraph type="secondary">You must log in to access your workspace.</Paragraph>
        <Button type="primary" onClick={() => navigate('/login')}>Sign In</Button>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 40 }}>
      <div className="cyber-gradient-banner" style={{ marginBottom: 40, padding: '24px 32px', background: 'var(--cyber-gradient)', borderRadius: 16, color: 'white', boxShadow: '0 10px 30px rgba(14, 165, 233, 0.2)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Title level={2} style={{ margin: 0, color: 'white', fontWeight: 800, letterSpacing: 1 }}>OPERATIONAL DASHBOARD</Title>
          <Paragraph style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16, marginTop: 8, marginBottom: 0 }}>
            Welcome back, {user.user?.username || 'Agent'}. Your intelligence workspace is secure and active.
          </Paragraph>
          <Button 
            type="default" 
            className="btn-glass-white"
            icon={<SafetyCertificateOutlined />} 
            size="large" 
            onClick={() => setOverviewOpen(true)}
            style={{
              marginTop: 18,
              fontWeight: 800,
              borderRadius: 8
            }}
          >
            VIEW TOOL ARMORY OVERVIEW
          </Button>
        </div>
        <div style={{ position: 'absolute', top: '-50%', right: '-5%', fontSize: 200, opacity: 0.1, transform: 'rotate(-15deg)' }}>
          <SafetyCertificateOutlined />
        </div>
      </div>
      
      <Row gutter={24} style={{ marginTop: 20 }}>
        <Col xs={24} md={8}>
          <Card className="hover-elevate" style={{ textAlign: 'center', height: '100%', borderRadius: 16, border: '1px solid var(--border-color)' }} styles={{ body: { padding: 30 } }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(14, 165, 233, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <FolderOpenOutlined style={{ fontSize: 32, color: 'var(--cyber-blue)' }} />
            </div>
            <Statistic title={<span style={{ fontWeight: 600 }}>Active Investigations</span>} value={stats.cases} styles={{ content: { fontSize: 36, fontWeight: 800, color: 'var(--text-main)' } }} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="hover-elevate" style={{ textAlign: 'center', height: '100%', borderRadius: 16, border: '1px solid var(--border-color)' }} styles={{ body: { padding: 30 } }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <SearchOutlined style={{ fontSize: 32, color: 'var(--cyber-purple)' }} />
            </div>
            <Statistic title={<span style={{ fontWeight: 600 }}>Total Findings Extracted</span>} value={stats.entities} styles={{ content: { fontSize: 36, fontWeight: 800, color: 'var(--text-main)' } }} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="hover-elevate" style={{ textAlign: 'center', height: '100%', borderRadius: 16, border: '1px solid var(--border-color)' }} styles={{ body: { padding: 30 } }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(82, 196, 26, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <SafetyCertificateOutlined style={{ fontSize: 32, color: '#52c41a' }} />
            </div>
            <Statistic title={<span style={{ fontWeight: 600 }}>System Status</span>} value="SECURE" styles={{ content: { fontSize: 32, fontWeight: 800, color: '#52c41a', letterSpacing: 2 } }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={24} style={{ marginTop: 30 }}>
        <Col xs={24} lg={16}>
           <Card 
            title={<span style={{ fontWeight: 700, fontSize: 16 }}><FolderOpenOutlined style={{ color: 'var(--cyber-blue)', marginRight: 8 }}/> Recent Investigations</span>} 
            style={{ height: '100%', borderRadius: 16, border: '1px solid var(--border-color)' }}
            extra={<Button type="link" onClick={() => navigate('/cases')} style={{ fontWeight: 600 }}>View All</Button>}
           >
            {recentCases.length === 0 ? (
              <Text type="secondary">No active cases. Start a new investigation to begin.</Text>
            ) : (
              <div>
                {recentCases.map((item) => (
                  <div
                    key={item._id}
                    className="hover-bg-light"
                    style={{ cursor: 'pointer', borderBottom: '1px solid var(--border-color)', padding: '16px', borderRadius: 8, transition: 'all 0.3s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    onClick={() => navigate(`/cases/${item._id}`)}
                  >
                    <div>
                      <Text style={{ fontWeight: 700, fontSize: 16, color: 'var(--cyber-blue)' }}>{item.title}</Text>
                      <div>
                        <Tag color="blue" style={{ marginTop: 8, borderRadius: 4 }}>{item.category}</Tag>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <Tag color={item.priority === 'High' || item.priority === 'Critical' ? 'error' : 'default'} style={{ fontWeight: 600, borderRadius: 4 }}>{item.priority}</Tag>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 8, fontWeight: 500 }}>{new Date(item.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
           </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card 
            title={<span style={{ fontWeight: 700, fontSize: 16 }}><PlusOutlined style={{ color: 'var(--cyber-purple)', marginRight: 8 }}/> Quick Actions</span>} 
            style={{ height: '100%', borderRadius: 16, border: '1px solid var(--border-color)' }}
          >
            <Space orientation="vertical" style={{ width: '100%', gap: 16 }}>
              <Button type="primary" block size="large" icon={<PlusOutlined />} onClick={() => navigate('/cases/new')} style={{ height: 50, fontWeight: 600 }}>
                New Investigation
              </Button>
              <Button block size="large" icon={<SearchOutlined style={{ color: 'var(--cyber-blue)' }}/>} onClick={() => navigate('/cases')} style={{ height: 50, fontWeight: 600 }}>
                Search Workspace
              </Button>
              <Button block size="large" icon={<DatabaseOutlined style={{ color: 'var(--cyber-purple)' }}/>} onClick={() => navigate('/tools')} style={{ height: 50, fontWeight: 600 }}>
                Run OSINT Tools
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
      <ToolOverviewModal open={overviewOpen} onClose={() => setOverviewOpen(false)} />
    </div>
  );
};

export default Dashboard;

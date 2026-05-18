import React, { useEffect, useState } from 'react';
import { Card, Typography, Row, Col, Avatar, Tag, Spin, message, Statistic, Button } from 'antd';
import { UserOutlined, FolderOpenOutlined, SafetyCertificateOutlined, LogoutOutlined } from '@ant-design/icons';
import api from '../../api/axiosConfig';

const { Title, Text, Paragraph } = Typography;

const Profile: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      setProfileData(response.data);
    } catch (_error) {
      message.error('Could not retrieve private dossier.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: 100 }}><Spin size="large" tip="Accessing digital footprint..." /></div>;
  if (!profileData) return <div style={{ textAlign: 'center', marginTop: 100 }}><Text>No data found for this agent.</Text></div>;

  const { user } = profileData;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Row gutter={[24, 24]}>
        <Col span={24}>
           <Title level={2} style={{ color: 'var(--cyber-blue)', borderBottom: '1px solid var(--border-color)', paddingBottom: 10 }}>
              [ My Dossier - Identity ]
           </Title>
        </Col>
        
        <Col xs={24} md={8}>
          <Card style={{ background: '#ffffff', border: '1px solid var(--border-color)', textAlign: 'center', borderRadius: 12 }}>
            <Avatar size={120} icon={<UserOutlined />} style={{ background: '#f8fafc', border: '2px solid var(--cyber-blue)', marginBottom: 20 }} />
            <Title level={3} style={{ color: 'var(--cyber-blue)', margin: 0 }}>{user.username}</Title>
            <div style={{ marginTop: 10 }}>
              <Tag color="blue">{user.email}</Tag>
            </div>
            <div style={{ marginTop: 10 }}>
              <Tag color="gold">{user.role.toUpperCase()}</Tag>
            </div>
            <Divider />
            <Button danger icon={<LogoutOutlined />} onClick={handleLogout} block>
              TERMINATE SESSION
            </Button>
          </Card>
        </Col>

        <Col xs={24} md={16}>
          <Card 
            title={<span style={{ color: 'var(--cyber-blue)' }}><SafetyCertificateOutlined /> Security & Access</span>}
            style={{ background: '#ffffff', border: '1px solid var(--border-color)', marginBottom: 24, borderRadius: 12 }}
          >
            <Text type="secondary" style={{ display: 'block', marginBottom: 15 }}>
              Your workspace is currently operating under standard encryption. All cases and entities are private to your identifier.
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic title={<span style={{ color: 'var(--text-muted)' }}>Account Status</span>} value="VERIFIED" styles={{ content: { color: 'var(--cyber-blue)', fontSize: '1.2em' } }} />
              </Col>
              <Col span={12}>
                <Statistic title={<span style={{ color: 'var(--text-muted)' }}>Workspace Isolation</span>} value="ACTIVE" styles={{ content: { color: 'var(--cyber-blue)', fontSize: '1.2em' } }} />
              </Col>
            </Row>
          </Card>

          <Card 
            title={<span style={{ color: 'var(--cyber-blue)' }}><FolderOpenOutlined /> Operational Data</span>}
            style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: 12 }}
          >
            <Paragraph style={{ color: 'var(--text-muted)' }}>
              Your investigation data is stored in a private silo. Public sharing of dossiers is currently disabled for security.
            </Paragraph>
            <Button type="default" onClick={() => window.location.href = '/cases'}>
              MANAGE INVESTIGATIONS
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

const Divider = () => <div style={{ borderTop: '1px solid var(--border-color)', margin: '20px 0' }} />;

export default Profile;

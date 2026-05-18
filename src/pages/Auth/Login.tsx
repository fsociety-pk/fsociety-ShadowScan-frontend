/**
 * Login — Operative authentication page.
 * Displays a split-panel layout: branded dark-blue left panel + white form on the right.
 * Logo is centred in the left panel and visible (white filter applied on dark bg).
 */
import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Row, Col, Divider } from 'antd';
import {
  LockOutlined, UserOutlined, GlobalOutlined, RadarChartOutlined,
  KeyOutlined, EyeOutlined, SafetyCertificateOutlined, CodeOutlined,
} from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import logoImg from '../../assets/logo.png';

const { Title, Text, Paragraph } = Typography;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', values);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
      // Clear the tour flag so the guided tour shows for this session
      localStorage.removeItem('shadowscan_tour_seen');
      message.success('Access Granted.');
      navigate('/dashboard');
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      message.error(apiErr.response?.data?.message || 'Access Denied');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper" style={{ padding: '20px' }}>
      {/* Decorative floating OSINT icons */}
      <GlobalOutlined className="auth-icon-floating" style={{ top: '10%', left: '10%', fontSize: '120px', animationDelay: '0s', opacity: 0.05 }} />
      <RadarChartOutlined className="auth-icon-floating" style={{ top: '60%', right: '10%', fontSize: '150px', animationDelay: '1s', opacity: 0.05 }} />
      <KeyOutlined className="auth-icon-floating" style={{ bottom: '15%', left: '15%', fontSize: '80px', animationDelay: '2s', opacity: 0.05 }} />
      <EyeOutlined className="auth-icon-floating" style={{ top: '20%', right: '20%', fontSize: '70px', animationDelay: '0.5s', opacity: 0.05 }} />

      <Card
        style={{ width: '100%', maxWidth: 900, zIndex: 10, padding: 0, overflow: 'hidden' }}
        className="auth-card"
        bodyStyle={{ padding: 0 }}
      >
        <Row align="middle" style={{ minHeight: '520px' }}>
          {/* ── Left branded panel ── */}
          <Col
            xs={0} md={10}
            style={{
              background: 'linear-gradient(160deg, #0ea5e9 0%, #1e3a5f 60%, #0f172a 100%)',
              minHeight: '520px',
              padding: '48px 36px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* decorative watermark */}
            <div style={{ position: 'absolute', top: -30, right: -30, opacity: 0.06, fontSize: 200, color: '#fff' }}>
              <SafetyCertificateOutlined />
            </div>

            {/* Centred logo + branding */}
            <img
              src={logoImg}
              alt="Shadow Scan Logo"
              style={{
                width: 90, height: 90, objectFit: 'contain',
                marginBottom: 20,
                filter: 'brightness(0) invert(1) drop-shadow(0 0 14px rgba(255,255,255,0.35))',
              }}
            />
            <Title
              level={2}
              style={{
                color: '#ffffff', fontWeight: 900, margin: 0,
                letterSpacing: 3, textAlign: 'center',
                // override gradient heading rule
                background: 'none', WebkitBackgroundClip: 'unset',
                WebkitTextFillColor: '#ffffff',
              }}
            >
              SHADOW SCAN
            </Title>
            <Text style={{ color: '#bae6fd', fontSize: 13, letterSpacing: 1.5, marginBottom: 24, display: 'block', textAlign: 'center' }}>
              INTELLIGENCE GATHERING NETWORK
            </Text>
            <Divider style={{ borderColor: 'rgba(255,255,255,0.2)', margin: '0 0 20px' }} />
            <Paragraph style={{ color: '#e2e8f0', fontSize: 13, textAlign: 'center', lineHeight: 1.7 }}>
              Authorized operatives only. All connection attempts are monitored, logged, and traced by the FSociety Security Matrix.
            </Paragraph>
            <div style={{ marginTop: 28, display: 'flex', gap: 16, color: '#bae6fd' }}>
              <CodeOutlined style={{ fontSize: 20 }} />
              <GlobalOutlined style={{ fontSize: 20 }} />
              <RadarChartOutlined style={{ fontSize: 20 }} />
            </div>
          </Col>

          {/* ── Right form panel ── */}
          <Col xs={24} md={14} style={{ padding: '48px 52px', background: '#ffffff' }}>
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <Title
                level={3}
                style={{
                  margin: 0, fontWeight: 800, color: '#0f172a',
                  background: 'none', WebkitBackgroundClip: 'unset',
                  WebkitTextFillColor: '#0f172a',
                }}
              >
                OPERATIVE AUTHENTICATION
              </Title>
              <Text style={{ display: 'block', color: '#475569', fontSize: 14, marginTop: 8 }}>
                Enter your credentials to access the grid.
              </Text>
            </div>

            <Form
              name="login"
              onFinish={onFinish}
              layout="vertical"
              size="large"
              requiredMark="optional"
            >
              <Form.Item
                name="username"
                label={<Text strong style={{ color: '#1e293b', fontSize: 14 }}>Agent Identifier</Text>}
                rules={[{ required: true, message: 'Identifier required.' }]}
              >
                <Input prefix={<UserOutlined style={{ color: '#0ea5e9' }} />} placeholder="Enter your username" />
              </Form.Item>

              <Form.Item
                name="password"
                label={<Text strong style={{ color: '#1e293b', fontSize: 14 }}>Decryption Key</Text>}
                rules={[{ required: true, message: 'Key required.' }]}
              >
                <Input.Password prefix={<LockOutlined style={{ color: '#0ea5e9' }} />} placeholder="Enter your password" />
              </Form.Item>

              <Form.Item style={{ marginTop: 32, marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  style={{
                    width: '100%', height: 50, borderRadius: 12,
                    background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)',
                    border: 'none', fontWeight: 700, fontSize: 16, letterSpacing: 1,
                    boxShadow: '0 4px 20px rgba(14, 165, 233, 0.35)',
                  }}
                >
                  INITIATE SECURE HANDSHAKE
                </Button>
              </Form.Item>
            </Form>

            <div style={{ textAlign: 'center', marginTop: 28, fontSize: '14px', color: '#64748b' }}>
              Not an operative?{' '}
              <Link to="/register" style={{ color: '#0ea5e9', fontWeight: 700, borderBottom: '1px dashed #0ea5e9' }}>
                Request Access
              </Link>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Login;

/**
 * Register — New operative registration page.
 * Mirrors the Login layout: branded dark panel left, form right.
 * Logo centred and visible. Dark text on all form labels.
 */
import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Row, Col, Divider } from 'antd';
import { LockOutlined, UserOutlined, GlobalOutlined, RadarChartOutlined, KeyOutlined, EyeOutlined, SafetyCertificateOutlined, CodeOutlined, IdcardOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import logoImg from '../../assets/logo.png';

const { Title, Text, Paragraph } = Typography;

const Register: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', values);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
      localStorage.removeItem('shadowscan_tour_seen');
      message.success('Registration successful! Welcome to FSociety.');
      navigate('/dashboard');
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      message.error(apiErr.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper" style={{ padding: '20px', position: 'relative' }}>
      {/* Back to Home button */}
      <Button
        type="default"
        onClick={() => navigate('/')}
        style={{ position: 'absolute', top: 20, left: 20, zIndex: 20 }}
      >
        Back to Home
      </Button>

      {/* Floating decorative icons */}
      <GlobalOutlined className="auth-icon-floating" style={{ top: '10%', left: '10%', fontSize: '120px', opacity: 0.05 }} />
      <RadarChartOutlined className="auth-icon-floating" style={{ top: '60%', right: '10%', fontSize: '150px', opacity: 0.05 }} />
      <KeyOutlined className="auth-icon-floating" style={{ bottom: '15%', left: '15%', fontSize: '80px', opacity: 0.05 }} />
      <EyeOutlined className="auth-icon-floating" style={{ top: '20%', right: '20%', fontSize: '70px', opacity: 0.05 }} />

      <Card
        style={{ width: '100%', maxWidth: 900, zIndex: 10, padding: 0, overflow: 'hidden', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}
        className="auth-card"
        bodyStyle={{ padding: 0 }}
      >
        <Row align="middle" style={{ minHeight: '520px' }}>
          {/* Left branded panel */}
          <Col
            xs={0}
            md={10}
            style={{
              background: 'linear-gradient(160deg, #8b5cf6 0%, #1e3a5f 60%, #0f172a 100%)',
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
            <div style={{ position: 'absolute', top: -30, right: -30, opacity: 0.06, fontSize: 200, color: '#fff' }}>
              <IdcardOutlined />
            </div>
            <img
              src={logoImg}
              alt="Shadow Scan Logo"
              style={{ width: 90, height: 90, objectFit: 'contain', marginBottom: 20, filter: 'brightness(0) invert(1) drop-shadow(0 0 14px rgba(255,255,255,0.35))' }}
            />
            <Title level={2} style={{ color: '#ffffff', fontWeight: 900, margin: 0, letterSpacing: 3, textAlign: 'center' }}>
              SHADOW SCAN
            </Title>
            <Text style={{ color: '#ddd6fe', fontSize: 13, letterSpacing: 1.5, marginBottom: 24, display: 'block', textAlign: 'center' }}>
              INTELLIGENCE GATHERING NETWORK
            </Text>
            <Divider style={{ borderColor: 'rgba(255,255,255,0.2)', margin: '0 0 20px' }} />
            <Paragraph style={{ color: '#e2e8f0', fontSize: 13, textAlign: 'center', lineHeight: 1.7 }}>
              Register your operative alias. Your digital footprint on this platform will be encrypted and anonymized. Welcome to the grid.
            </Paragraph>
            <div style={{ marginTop: 28, display: 'flex', gap: 16, color: '#ddd6fe' }}>
              <CodeOutlined style={{ fontSize: 20 }} />
              <GlobalOutlined style={{ fontSize: 20 }} />
              <RadarChartOutlined style={{ fontSize: 20 }} />
            </div>
          </Col>

          {/* Right form panel */}
          <Col xs={24} md={14} style={{ padding: '48px 52px', background: 'transparent' }}>
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <Title level={3} style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>
                OPERATIVE REGISTRATION
              </Title>
              <Text style={{ display: 'block', color: '#475569', fontSize: 14, marginTop: 8 }}>
                Create your dossier and join the network.
              </Text>
            </div>

            <Form name="register" onFinish={onFinish} layout="vertical" size="large" requiredMark="optional">
              <Form.Item
                name="username"
                label={<Text strong style={{ color: '#1e293b', fontSize: 14 }}>Agent Alias</Text>}
                rules={[{ required: true, message: 'Alias required.' }]}
              >
                <Input prefix={<UserOutlined style={{ color: '#8b5cf6' }} />} placeholder="Choose your operative alias" />
              </Form.Item>

              <Form.Item
                name="password"
                label={<Text strong style={{ color: '#1e293b', fontSize: 14 }}>Secure Access Key</Text>}
                rules={[{ required: true, message: 'Key required.' }]}
              >
                <Input.Password prefix={<LockOutlined style={{ color: '#8b5cf6' }} />} placeholder="Create a strong password" />
              </Form.Item>

              <Form.Item style={{ marginTop: 32, marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  style={{
                    width: '100%',
                    height: 50,
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #8b5cf6, #0ea5e9)',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: 16,
                    letterSpacing: 1,
                    boxShadow: '0 4px 20px rgba(139, 92, 246, 0.35)',
                  }}
                >
                  CREATE OPERATIVE DOSSIER
                </Button>
              </Form.Item>
            </Form>

            <div style={{ textAlign: 'center', marginTop: 28, fontSize: '14px', color: '#64748b' }}>
              Already an operative?{' '}
              <Link to="/login" style={{ color: '#8b5cf6', fontWeight: 700, borderBottom: '1px dashed #8b5cf6' }}>
                Authenticate here
              </Link>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Register;
import { Form, Input, Button, Card, Typography, message, Row, Col, Divider } from 'antd';
import {
  LockOutlined, UserOutlined, GlobalOutlined, RadarChartOutlined,
  KeyOutlined, EyeOutlined, CodeOutlined, IdcardOutlined,
} from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import logoImg from '../../assets/logo.png';

const { Title, Text, Paragraph } = Typography;

const Register: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', values);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
      // Clear tour flag so new operatives always see the guided tour
      localStorage.removeItem('shadowscan_tour_seen');
      message.success('Registration successful! Welcome to FSociety.');
      navigate('/dashboard');
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      message.error(apiErr.response?.data?.message || 'Registration failed');
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
              background: 'linear-gradient(160deg, #8b5cf6 0%, #1e3a5f 60%, #0f172a 100%)',
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
              <IdcardOutlined />
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
                background: 'none', WebkitBackgroundClip: 'unset',
                WebkitTextFillColor: '#ffffff',
              }}
            >
              SHADOW SCAN
            </Title>
            <Text style={{ color: '#ddd6fe', fontSize: 13, letterSpacing: 1.5, marginBottom: 24, display: 'block', textAlign: 'center' }}>
              INTELLIGENCE GATHERING NETWORK
            </Text>
            <Divider style={{ borderColor: 'rgba(255,255,255,0.2)', margin: '0 0 20px' }} />
            <Paragraph style={{ color: '#e2e8f0', fontSize: 13, textAlign: 'center', lineHeight: 1.7 }}>
              Register your operative alias. Your digital footprint on this platform will be encrypted and anonymized. Welcome to the grid.
            </Paragraph>
            <div style={{ marginTop: 28, display: 'flex', gap: 16, color: '#ddd6fe' }}>
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
                OPERATIVE REGISTRATION
              </Title>
              <Text style={{ display: 'block', color: '#475569', fontSize: 14, marginTop: 8 }}>
                Create your dossier and join the network.
              </Text>
            </div>

            <Form
              name="register"
              onFinish={onFinish}
              layout="vertical"
              size="large"
              requiredMark="optional"
            >
              <Form.Item
                name="username"
                label={<Text strong style={{ color: '#1e293b', fontSize: 14 }}>Agent Alias</Text>}
                rules={[{ required: true, message: 'Alias required.' }]}
              >
                <Input prefix={<UserOutlined style={{ color: '#8b5cf6' }} />} placeholder="Choose your operative alias" />
              </Form.Item>

              <Form.Item
                name="password"
                label={<Text strong style={{ color: '#1e293b', fontSize: 14 }}>Secure Access Key</Text>}
                rules={[{ required: true, message: 'Key required.' }]}
              >
                <Input.Password prefix={<LockOutlined style={{ color: '#8b5cf6' }} />} placeholder="Create a strong password" />
              </Form.Item>

              <Form.Item style={{ marginTop: 32, marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  style={{
                    width: '100%', height: 50, borderRadius: 12,
                    background: 'linear-gradient(135deg, #8b5cf6, #0ea5e9)',
                    border: 'none', fontWeight: 700, fontSize: 16, letterSpacing: 1,
                    boxShadow: '0 4px 20px rgba(139, 92, 246, 0.35)',
                  }}
                >
                  CREATE OPERATIVE DOSSIER
                </Button>
              </Form.Item>
            </Form>

            <div style={{ textAlign: 'center', marginTop: 28, fontSize: '14px', color: '#64748b' }}>
              Already an operative?{' '}
              <Link to="/login" style={{ color: '#8b5cf6', fontWeight: 700, borderBottom: '1px dashed #8b5cf6' }}>
                Authenticate here
              </Link>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Register;

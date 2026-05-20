/**
 * Login — Cyberpunk operative authentication page.
 * Full-screen split: animated dark panel left + glassmorphism form right.
 * No card/white-box. Logo displays correctly without brightness(0) filter.
 */
import React, { useState } from 'react';
import { Form, Input, Button, Typography, message } from 'antd';
import { LockOutlined, UserOutlined, ArrowLeftOutlined, SafetyCertificateOutlined, RadarChartOutlined, GlobalOutlined, CodeOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import logoImg from '../../assets/logo.png';

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', values);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      fontFamily: "'Space Grotesk', sans-serif",
      position: 'relative',
      overflow: 'hidden',
      background: '#020817',
    }}>
      {/* ── Left Panel ── */}
      <div style={{
        width: '50%',
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #0ea5e9 0%, #1e1b4b 50%, #0f172a 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 48px',
        position: 'relative',
        overflow: 'hidden',
      }}
        className="auth-left-panel"
      >
        {/* Decorative glowing orbs */}
        <div style={{ position: 'absolute', top: '10%', left: '15%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,165,233,0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '15%', right: '10%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Floating icons */}
        <SafetyCertificateOutlined style={{ position: 'absolute', top: '8%', right: '8%', fontSize: 140, opacity: 0.04, color: '#fff' }} />
        <RadarChartOutlined style={{ position: 'absolute', bottom: '12%', left: '5%', fontSize: 120, opacity: 0.04, color: '#fff' }} />

        {/* Logo — no brightness filter, just a glow shadow */}
        <img
          src={logoImg}
          alt="Shadow Scan Logo"
          style={{
            width: 100,
            height: 100,
            objectFit: 'contain',
            marginBottom: 24,
            filter: 'drop-shadow(0 0 20px rgba(14,165,233,0.6))',
            borderRadius: 20,
          }}
        />

        <Title level={1} style={{ color: '#ffffff', fontWeight: 900, margin: 0, letterSpacing: 4, textAlign: 'center', fontSize: 28 }}>
          SHADOW SCAN
        </Title>
        <Text style={{ color: '#bae6fd', fontSize: 12, letterSpacing: 3, marginBottom: 32, display: 'block', textAlign: 'center', marginTop: 6 }}>
          INTELLIGENCE GATHERING NETWORK
        </Text>

        <div style={{ width: '100%', maxWidth: 360, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)', marginBottom: 28 }} />

        <Text style={{ color: '#e2e8f0', fontSize: 14, textAlign: 'center', lineHeight: 1.8, maxWidth: 340 }}>
          Authorized operatives only. All connection attempts are monitored, logged, and traced by the FSociety Security Matrix.
        </Text>

        <div style={{ marginTop: 36, display: 'flex', gap: 20, color: '#bae6fd' }}>
          <CodeOutlined style={{ fontSize: 22 }} />
          <GlobalOutlined style={{ fontSize: 22 }} />
          <RadarChartOutlined style={{ fontSize: 22 }} />
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div style={{
        width: '50%',
        minHeight: '100vh',
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 64px',
        position: 'relative',
      }}>
        {/* Back to Home */}
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/')}
          style={{
            position: 'absolute',
            top: 28,
            left: 32,
            color: '#38bdf8',
            fontWeight: 700,
            fontSize: 14,
            border: '1px solid rgba(56,189,248,0.3)',
            borderRadius: 8,
            padding: '4px 16px',
            height: 38,
            background: 'rgba(14,165,233,0.08)',
          }}
        >
          Back to Home
        </Button>

        {/* Decorative grid lines */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(14,165,233,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />

        <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
          {/* Glow accent line */}
          <div style={{ width: 60, height: 3, background: 'linear-gradient(90deg,#0ea5e9,#8b5cf6)', borderRadius: 99, marginBottom: 24 }} />

          <Title level={2} style={{ margin: '0 0 8px', fontWeight: 800, color: '#0f172a', letterSpacing: 0.6 }}>
            Sign in to Shadow Scan
          </Title>
          <Text style={{ display: 'block', color: '#475569', fontSize: 14, marginBottom: 40 }}>
            Enter your credentials to access the dashboard.
          </Text>

          <Form name="login" onFinish={onFinish} layout="vertical" size="large" requiredMark={false}>
            <Form.Item
              name="username"
              label={<Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: 600, letterSpacing: 1 }}>AGENT IDENTIFIER</Text>}
              rules={[{ required: true, message: 'Identifier required.' }]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#0ea5e9' }} />}
                placeholder="Enter your username"
                style={{
                  background: '#ffffff',
                  border: '1px solid #e6eef6',
                  borderRadius: 12,
                  color: '#0f172a',
                  height: 52,
                  boxShadow: '0 6px 18px rgba(16,24,40,0.06)'
                }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: 600, letterSpacing: 1 }}>DECRYPTION KEY</Text>}
              rules={[{ required: true, message: 'Key required.' }]}
              style={{ marginBottom: 32 }}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#0ea5e9' }} />}
                placeholder="Enter your password"
                style={{
                  background: '#ffffff',
                  border: '1px solid #e6eef6',
                  borderRadius: 12,
                  color: '#0f172a',
                  height: 52,
                  boxShadow: '0 6px 18px rgba(16,24,40,0.06)'
                }}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={{
                  width: '100%',
                  height: 54,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: 15,
                  letterSpacing: 1,
                  boxShadow: '0 10px 30px rgba(14,165,233,0.18)',
                }}
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: 'center', marginTop: 32, fontSize: 14, color: '#475569' }}>
            Not an operative?{' '}
            <Link to="/register" style={{ color: '#0ea5e9', fontWeight: 700 }}>
              Request Access
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile fallback: stack vertically */}
      <style>{`
        @media (max-width: 768px) {
          .auth-left-panel { display: none !important; }
          div[style*="width: 50%"][style*="1e1b4b"] { width: 100% !important; }
        }
        .ant-input, .ant-input-password, .ant-input-affix-wrapper {
          background: #ffffff !important;
          border-color: #e6eef6 !important;
          color: #0f172a !important;
          box-shadow: 0 6px 18px rgba(16,24,40,0.06) !important;
        }
        .ant-input::placeholder, .ant-input-password input::placeholder { color: #94a3b8 !important; }
        .ant-input-password .ant-input { background: transparent !important; }
        .ant-form-item-label label { color: #475569 !important; }
      `}</style>
    </div>
  );
};

export default Login;

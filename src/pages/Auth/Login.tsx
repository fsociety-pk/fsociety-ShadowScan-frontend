import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { LockOutlined, UserOutlined, GlobalOutlined, RadarChartOutlined, KeyOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import logoImg from '../../assets/logo.png';

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', values);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
      message.success('Access Granted.');
      navigate('/dashboard');
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Access Denied');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      {/* Floating OSINT Elements */}
      <GlobalOutlined className="auth-icon-floating" style={{ top: '15%', left: '10%', fontSize: '80px', animationDelay: '0s' }} />
      <RadarChartOutlined className="auth-icon-floating" style={{ top: '60%', right: '15%', fontSize: '100px', animationDelay: '1s' }} />
      <KeyOutlined className="auth-icon-floating" style={{ bottom: '20%', left: '20%', fontSize: '60px', animationDelay: '2s' }} />
      <EyeOutlined className="auth-icon-floating" style={{ top: '25%', right: '25%', fontSize: '50px', animationDelay: '0.5s' }} />

      <Card
        style={{ width: 450, zIndex: 10 }}
        className="auth-card"
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <img src={logoImg} alt="Shadow Scan Logo" style={{ width: 64, height: 64, objectFit: 'contain', marginBottom: 16, filter: 'drop-shadow(0 0 10px rgba(14, 165, 233, 0.4))' }} />
          <Title level={2} style={{ margin: 0, fontWeight: 800, background: 'var(--cyber-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            SHADOW SCAN
          </Title>
          <Text style={{ display: 'block', color: 'var(--text-muted)', fontSize: 16, letterSpacing: 1, marginTop: 8 }}>
            Advanced OSINT Intelligence Platform
          </Text>
        </div>
        
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: 'Please input your Username!' }
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Agent Username" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your Password!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Access Key" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%', marginTop: 16, height: 50, borderRadius: 10, background: 'var(--cyber-gradient)', border: 'none', fontWeight: 700, fontSize: 16, letterSpacing: 1 }} loading={loading}>
              INITIATE SECURE LOGIN
            </Button>
          </Form.Item>
          
          <div style={{ textAlign: 'center', marginTop: 24, fontSize: '14px', color: 'var(--text-muted)' }}>
            Not an operative? <Link to="/register" style={{ color: 'var(--cyber-blue)', fontWeight: 600 }}>Request Access</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;

import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axiosConfig';

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
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '70vh' 
    }}>
      <Card
        style={{ width: 450, border: '1px solid var(--border-color)' }}
        className="auth-card"
      >
        <Title level={2} style={{ textAlign: 'center', color: 'var(--neon-green)', letterSpacing: 2 }}>[ AUTHENTICATION ]</Title>
        <Text style={{ display: 'block', textAlign: 'center', marginBottom: 32, color: 'var(--text-muted)' }}>Enter your access credentials to initialize session.</Text>
        
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: 'Please input your Username!' }
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Username" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your Password!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }} size="large" loading={loading}>
              AUTHENTICATE
            </Button>
          </Form.Item>
          
          <div style={{ textAlign: 'center', marginTop: 24, fontSize: '13px', color: 'var(--text-muted)' }}>
            NO ACCESS KEY? <Link to="/register" style={{ color: 'var(--neon-green)', fontWeight: 'bold' }}>INITIALIZE REGISTRATION</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;

import React, { useState } from 'react';
import { Card, Typography, Form, Input, Select, Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';

const { Title, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const NewCase: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      if (values.toolsSuggested && typeof values.toolsSuggested === 'string') {
        values.toolsSuggested = values.toolsSuggested.split(',').map((t: string) => t.trim());
      } else {
        values.toolsSuggested = [];
      }

      if (values.clues && typeof values.clues === 'string') {
        values.clues = values.clues.split(',').map((h: string) => h.trim());
      } else {
        values.clues = [];
      }

      await api.post('/cases', values);
      message.success('New investigation case initialized successfully.');
      navigate('/cases');
    } catch (error: any) {
      if (error.response?.status === 401) {
        message.error('Unauthenticated: Please login first to manage cases.');
        navigate('/login');
      } else {
        message.error(error.response?.data?.message || 'Failed to initialize case');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <Title level={2} style={{ color: '#00ff88', borderBottom: '1px solid #30363d', paddingBottom: 10 }}>
        [ Initialize New Case ]
      </Title>
      <Paragraph style={{ color: '#8b949e' }}>
        Log a new investigation target and start your open-source intelligence collection.
      </Paragraph>

      <Card style={{ background: '#0d1117', border: '1px solid #30363d' }}>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="title" label="Case Designation (Title)" rules={[{ required: true }]}>
             <Input placeholder="e.g. Investigation: Operation Ghost" />
          </Form.Item>

          <Form.Item name="category" label="Investigation Category" rules={[{ required: true }]}>
             <Select placeholder="Select category">
               <Option value="Cyber">Cyber Security</Option>
               <Option value="Physical">Physical Search</Option>
               <Option value="Corporate">Corporate Intel</Option>
               <Option value="Personal">Personal/Background</Option>
               <Option value="Legal">Legal/Compliance</Option>
             </Select>
          </Form.Item>

          <Form.Item name="priority" label="Case Priority" rules={[{ required: true }]}>
             <Select placeholder="Select priority level">
               <Option value="Low">Low</Option>
               <Option value="Medium">Medium</Option>
               <Option value="High">High</Option>
               <Option value="Critical">Critical</Option>
             </Select>
          </Form.Item>

          <Form.Item name="description" label="Objective Briefing (Description)" rules={[{ required: true }]}>
             <TextArea rows={5} placeholder="What is the primary goal of this investigation? Provide all known starting Intel..." />
          </Form.Item>

          <Form.Item name="clues" label="Initial Clues (Comma separated)">
             <Input placeholder="LinkedIn profile, Old username, Possible IP address..." />
          </Form.Item>

          <Form.Item name="toolsSuggested" label="Recommended Tools (Comma separated URLs or names)">
             <Input placeholder="Maltego, IntelX, Epieos..." />
          </Form.Item>

          <Form.Item>
             <Button type="primary" htmlType="submit" size="large" icon={<PlusOutlined />} loading={loading} style={{ width: '100%' }}>
               INITIALIZE CASE
             </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default NewCase;

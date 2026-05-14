import React, { useState } from 'react';
import { Card, Typography, Form, Input, Select, Button, message, Divider, Row, Col } from 'antd';
import { PlusOutlined, UserOutlined, GlobalOutlined, MailOutlined, PhoneOutlined, BuildOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const NewCase: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // Process comma separated fields
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

      const payload = {
        title: values.title,
        category: values.category,
        priority: values.priority,
        description: values.description,
        clues: values.clues,
        toolsSuggested: values.toolsSuggested,
        targetProfile: {
          name: values.targetName,
          email: values.targetEmail,
          phone: values.targetPhone,
          organization: values.targetOrganization,
          location: values.targetLocation,
          socialMedia: values.targetSocial,
          additionalNotes: values.targetNotes
        }
      };

      await api.post('/cases', payload);
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
    <div style={{ maxWidth: 900, margin: '0 auto', paddingBottom: 40 }}>
      <div style={{ marginBottom: 30 }}>
        <Title level={2} style={{ marginBottom: 4 }}>New Investigation</Title>
        <Paragraph style={{ color: 'var(--text-muted)' }}>
          Initialize a new target profile. Only basic information is required, provide as much detail as possible for better intelligence gathering.
        </Paragraph>
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish} requiredMark="optional">
        
        {/* Core Case Details */}
        <Card style={{ marginBottom: 24 }}>
          <Title level={4} style={{ marginBottom: 20 }}>Core Parameters</Title>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="title" label="Case Designation (Title)" rules={[{ required: true, message: 'Required' }]}>
                <Input placeholder="e.g. Operation Ghost" size="large"/>
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item name="category" label="Category" rules={[{ required: true, message: 'Required' }]}>
                <Select placeholder="Select category" size="large">
                  <Option value="Cyber">Cyber Security</Option>
                  <Option value="Physical">Physical Search</Option>
                  <Option value="Corporate">Corporate Intel</Option>
                  <Option value="Personal">Personal/Background</Option>
                  <Option value="Legal">Legal/Compliance</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item name="priority" label="Priority" rules={[{ required: true, message: 'Required' }]} initialValue="Medium">
                <Select placeholder="Select priority" size="large">
                  <Option value="Low">Low</Option>
                  <Option value="Medium">Medium</Option>
                  <Option value="High">High</Option>
                  <Option value="Critical">Critical</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item name="description" label="Objective Briefing" rules={[{ required: true, message: 'Required' }]}>
            <TextArea rows={4} placeholder="What is the primary goal of this investigation?" />
          </Form.Item>
        </Card>

        {/* Target Profile Data */}
        <Card style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Title level={4} style={{ margin: 0 }}>Target Profile Intelligence</Title>
            <Text type="secondary" style={{ fontSize: 12 }}>(Optional Details)</Text>
          </div>
          <Divider style={{ margin: '12px 0 24px 0', borderColor: 'var(--border-color)' }} />
          
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="targetName" label="Target Name / Alias">
                <Input prefix={<UserOutlined style={{ color: 'var(--text-muted)' }}/>} placeholder="John Doe / hacker99" size="large"/>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="targetEmail" label="Known Email Address">
                <Input prefix={<MailOutlined style={{ color: 'var(--text-muted)' }}/>} placeholder="target@example.com" size="large"/>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="targetPhone" label="Phone Number">
                <Input prefix={<PhoneOutlined style={{ color: 'var(--text-muted)' }}/>} placeholder="+1 234 567 8900" size="large"/>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="targetOrganization" label="Associated Organization">
                <Input prefix={<BuildOutlined style={{ color: 'var(--text-muted)' }}/>} placeholder="Company / Group Name" size="large"/>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="targetLocation" label="Physical Location">
                <Input prefix={<GlobalOutlined style={{ color: 'var(--text-muted)' }}/>} placeholder="City, Country or Address" size="large"/>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="targetSocial" label="Social Media Profiles">
                <Input placeholder="Twitter, LinkedIn URLs" size="large"/>
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item name="targetNotes" label="Additional Profile Notes">
            <TextArea rows={3} placeholder="Physical description, habits, known associates..." />
          </Form.Item>
        </Card>

        {/* Technical Data */}
        <Card style={{ marginBottom: 32 }}>
          <Title level={4} style={{ marginBottom: 20 }}>Technical Leads & Tooling</Title>
          <Form.Item name="clues" label="Initial Digital Leads (Comma separated)">
            <Input placeholder="IP addresses, domains, MAC addresses, UUIDs..." size="large"/>
          </Form.Item>

          <Form.Item name="toolsSuggested" label="Recommended Scanning Tools (Comma separated)">
            <Input placeholder="Maltego, Nmap, SpiderFoot, Shodan..." size="large"/>
          </Form.Item>
        </Card>

        <Form.Item style={{ textAlign: 'right' }}>
          <Button onClick={() => navigate('/cases')} size="large" style={{ marginRight: 16 }}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" size="large" icon={<PlusOutlined />} loading={loading}>
            Create Case
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default NewCase;

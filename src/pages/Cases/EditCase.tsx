import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Select, Button, Space, Typography, message, Row, Col, Divider, Spin } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { SaveOutlined, ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import api from '../../api/axiosConfig';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const EditCase: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCase();
  }, [id]);

  const fetchCase = async () => {
    try {
      const response = await api.get(`/cases/${id}`);
      const data = response.data;
      form.setFieldsValue({
        ...data,
        clues: data.clues?.join(', '),
        toolsSuggested: data.toolsSuggested || [],
        targetProfile: data.targetProfile || {}
      });
    } catch (_error) {
      message.error('Failed to load case data.');
      navigate('/cases');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    setSubmitting(true);
    try {
      const formattedValues = {
        ...values,
        clues: values.clues ? values.clues.split(',').map((c: string) => c.trim()) : [],
      };
      
      await api.put(`/cases/${id}`, formattedValues);
      message.success('Investigation dossier updated successfully.');
      navigate(`/cases/${id}`);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Update failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: 100 }}><Spin size="large" /></div>;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 40 }}>
      <Button 
        type="text" 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate(`/cases/${id}`)} 
        style={{ marginBottom: 20, color: 'var(--text-muted)' }}
      >
        Discard Changes
      </Button>

      <Title level={2} style={{ marginBottom: 30 }}>
        <EditOutlined /> Edit Investigation Dossier
      </Title>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
      >
        <Row gutter={24}>
          <Col xs={24} lg={14}>
            <Card title="Operational Intelligence" style={{ marginBottom: 24 }}>
              <Form.Item
                name="title"
                label="Operation Name"
                rules={[{ required: true, message: 'Please enter a title' }]}
              >
                <Input size="large" placeholder="e.g. Operation Dark Web" />
              </Form.Item>

              <Form.Item
                name="description"
                label="Mission Objective"
                rules={[{ required: true, message: 'Please enter mission details' }]}
              >
                <TextArea rows={6} placeholder="Describe the investigation scope and goals..." />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="category" label="Intelligence Category">
                    <Select size="large">
                      <Option value="Cybercrime">Cybercrime</Option>
                      <Option value="Corporate">Corporate Espionage</Option>
                      <Option value="Person">Person of Interest</Option>
                      <Option value="Financial">Financial Fraud</Option>
                      <Option value="Other">Other</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="priority" label="Threat Priority">
                    <Select size="large">
                      <Option value="Low">Low</Option>
                      <Option value="Medium">Medium</Option>
                      <Option value="High">High</Option>
                      <Option value="Critical">Critical</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="clues" label="Initial Clues (Comma separated)">
                <Input placeholder="e.g. suspect_alias, leaked_email@proton.me, forum_id" />
              </Form.Item>

              <Form.Item name="toolsSuggested" label="Recommended Forensic Tools">
                <Select mode="multiple" placeholder="Select tools for this operation">
                  <Option value="Username Lookup">Username Lookup</Option>
                  <Option value="Email Intelligence">Email Intelligence</Option>
                  <Option value="Phone Forensic">Phone Forensic</Option>
                  <Option value="Metadata Analysis">Metadata Analysis</Option>
                  <Option value="Image Search">Image Search</Option>
                </Select>
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} lg={10}>
            <Card title="Target Profile (POIs)" style={{ marginBottom: 24 }}>
              <Paragraph style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                Optional: Store known intelligence about the target here.
              </Paragraph>
              
              <Form.Item name={['targetProfile', 'name']} label="Target Name">
                <Input placeholder="Real name or known alias" />
              </Form.Item>

              <Form.Item name={['targetProfile', 'email']} label="Primary Email">
                <Input placeholder="target@example.com" />
              </Form.Item>

              <Form.Item name={['targetProfile', 'phone']} label="Contact Number">
                <Input placeholder="+123..." />
              </Form.Item>

              <Form.Item name={['targetProfile', 'organization']} label="Organization/Affiliation">
                <Input placeholder="e.g. Anonymous, Company Name" />
              </Form.Item>

              <Form.Item name={['targetProfile', 'location']} label="Last Known Location">
                <Input placeholder="City, Country" />
              </Form.Item>

              <Form.Item name={['targetProfile', 'socialMedia']} label="Social Media Profiles">
                <Input placeholder="Twitter, LinkedIn, etc." />
              </Form.Item>
            </Card>
          </Col>
        </Row>

        <Divider style={{ borderColor: 'var(--border-color)' }} />

        <div style={{ textAlign: 'right' }}>
          <Space size="large">
            <Button size="large" onClick={() => navigate(`/cases/${id}`)}>Cancel</Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large" 
              icon={<SaveOutlined />} 
              loading={submitting}
            >
              Save Changes
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  );
};

export default EditCase;

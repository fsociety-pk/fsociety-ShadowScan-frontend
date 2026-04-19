import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Switch, 
  InputNumber, 
  Form, 
  Button, 
  Typography, 
  Row, 
  Col, 
  Divider, 
  message, 
  notification,
  Space,
  Slider,
  Input,
  Select,
  List,
  Tag,
  Modal,
  Tooltip
} from 'antd';
import { 
  SaveOutlined, 
  PoweroffOutlined, 
  ToolOutlined,
  InfoCircleOutlined,
  MailOutlined,
  ApiOutlined,
  KeyOutlined,
  HistoryOutlined,
  WarningOutlined
} from '@ant-design/icons';
import api from '../../api/axiosConfig';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

interface APIIntegration {
  name: string;
  id: string;
  isActive: boolean;
  lastChecked: string;
}

const Settings: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [integrations, setIntegrations] = useState<APIIntegration[]>([]);
  const [rotating, setRotating] = useState<string | null>(null);
  const [sudoVisible, setSudoVisible] = useState(false);
  const [sudoPassword, setSudoPassword] = useState('');
  const [sudoCallback, setSudoCallback] = useState<(() => void) | null>(null);
  const [sudoLoading, setSudoLoading] = useState(false);
  const [ipInput, setIpInput] = useState('');

  useEffect(() => {
    fetchSettings();
  }, [form]);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/admin/settings');
      const data = res.data.data;
      form.setFieldsValue(data);
      setIntegrations(data.apiIntegrations || []);
    } catch (error) {
      message.error('Failed to retrieve system protocols.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = (values: any) => {
    executeWithSudo(async () => {
        setSaving(true);
        const sudoToken = localStorage.getItem('sudoToken');
        try {
          await api.patch('/admin/settings', values, {
            headers: { 'x-sudo-token': sudoToken }
          });
          notification.success({
            message: 'PROTOCOLS UPDATED',
            description: 'Platform registry successfully synchronized with new parameters.',
            placement: 'bottomRight',
            className: 'hacker-notification'
          });
          // Refresh to ensure UI stays in sync
          fetchSettings();
        } catch (error) {
          message.error('Failed to sync protocols with the grid.');
        } finally {
          setSaving(false);
          localStorage.removeItem('sudoToken'); // Clear for security
        }
    });
  };

  const handleToggleAPI = async (id: string, status: boolean) => {
    try {
      await api.patch('/admin/api-integrations/toggle', { apiId: id, status });
      setIntegrations(prev => prev.map(item => 
        item.id === id ? { ...item, isActive: status, lastChecked: new Date().toISOString() } : item
      ));
      message.success(`API Node ${id} ${status ? 're-established' : 'decommissioned'}.`);
    } catch (error) {
      message.error('Signal override failed.');
    }
  };

  const handleSudoVerify = async () => {
    if (!sudoPassword) return;
    setSudoLoading(true);
    try {
      const res = await api.post('/auth/sudo', { password: sudoPassword });
      if (res.data.success) {
        localStorage.setItem('sudoToken', res.data.sudoToken);
        setSudoVisible(false);
        setSudoPassword('');
        if (sudoCallback) {
          sudoCallback();
          setSudoCallback(null);
        }
      }
    } catch (error) {
      message.error('Biometric/Credential mismatch. Access denied.');
    } finally {
      setSudoLoading(false);
    }
  };

  const executeWithSudo = (callback: () => void) => {
    const sudoToken = localStorage.getItem('sudoToken');
    if (sudoToken) {
        // We have a token, but let's check if it's likely expired (real check is on backend)
        // For simplicity, we just trigger the modal always if it's sensitive, 
        // or just let the axios interceptor handle 401. 
        // Better UX: Show modal to get a FRESH token.
        setSudoCallback(() => callback);
        setSudoVisible(true);
    } else {
        setSudoCallback(() => callback);
        setSudoVisible(true);
    }
  };

  const handleRotateKey = (id: string) => {
    executeWithSudo(async () => {
        setRotating(id);
        const sudoToken = localStorage.getItem('sudoToken');
        try {
          const res = await api.post('/admin/api-integrations/rotate', { apiId: id }, {
            headers: { 'x-sudo-token': sudoToken }
          });
          notification.success({
            message: 'KEYS ROTATED SUCCESSFULLY',
            description: `Cryptographic refresh completed for ${id}. New key active.`,
            duration: 5,
            className: 'hacker-notification'
          });
          Modal.success({
            title: 'NEW ACCESS TOKEN',
            content: (
              <div style={{ marginTop: 16, padding: '12px', background: '#0d1117', border: '1px solid #00ff88', borderRadius: '4px' }}>
                <Text copyable style={{ color: '#00ff88', fontFamily: 'monospace' }}>{res.data.newKey}</Text>
              </div>
            ),
            className: 'hacker-modal-success'
          });
        } catch (error) {
          message.error('Token regeneration cycle failed.');
        } finally {
          setRotating(null);
          localStorage.removeItem('sudoToken'); // Clear after use for security
        }
    });
  };

  return (
    <div className="admin-settings-container">
      <Row justify="space-between" align="middle" style={{ marginBottom: 32 }}>
        <Col>
          <Title level={2} style={{ color: '#00ff88', margin: 0 }}>C3: COMMAND, CONTROL, CONFIGURATION</Title>
          <Text style={{ color: '#8b949e' }}>Manage core platform parameters and external bridge stability.</Text>
        </Col>
      </Row>

      <Form 
        form={form} 
        layout="vertical" 
        onFinish={handleSaveSettings}
        disabled={loading}
      >
        <Row gutter={[24, 24]}>
          {/* Section 1: System Settings */}
          <Col xs={24} xl={16}>
            <Card 
              title={<span><ToolOutlined /> SECTION 01: SYSTEM CORE</span>}
              className="admin-chart-card"
              extra={<Tag color="cyan">GLOBAL PROTOCOLS</Tag>}
            >
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item name="enableEmailLookup" label="Email Forensic Engine" valuePropName="checked">
                    <Switch checkedChildren="ON" unCheckedChildren="OFF" />
                  </Form.Item>
                  <Form.Item name="enableUsernameScan" label="Username Intelligence" valuePropName="checked">
                    <Switch checkedChildren="ON" unCheckedChildren="OFF" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="enablePhoneLookup" label="Phone Intelligence (PK)" valuePropName="checked">
                    <Switch checkedChildren="ON" unCheckedChildren="OFF" />
                  </Form.Item>
                  <Form.Item name="enableMetadataExtraction" label="Forensic Metadata" valuePropName="checked">
                    <Switch checkedChildren="ON" unCheckedChildren="OFF" />
                  </Form.Item>
                </Col>
              </Row>

              <Divider style={{ borderColor: '#30363d' }} />

              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item 
                    name="rateLimitPerHour" 
                    label="Rate Limit (RPM)"
                    rules={[{ required: true, message: 'Specify a limit' }]}
                  >
                    <Slider min={10} max={1000} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item 
                    name="maxFileUploadSize" 
                    label="Max File Upload (MB)"
                    rules={[{ required: true, message: 'Specify upload limit' }]}
                  >
                    <InputNumber min={1} max={100} style={{ width: '100%' }} suffix="MB" />
                  </Form.Item>
                </Col>
              </Row>

              <Divider style={{ borderColor: '#30363d' }} />

              <Form.Item 
                name="maintenanceMode" 
                label={<span><PoweroffOutlined style={{ color: '#f50' }} /> Maintenance Mode</span>}
                valuePropName="checked"
                className="danger-zone-item"
              >
                <Switch checkedChildren="ACTIVE" unCheckedChildren="OFF" style={{ backgroundColor: '#f50' }} />
              </Form.Item>

              <Button 
                type="primary" 
                icon={<SaveOutlined />} 
                loading={saving}
                block
                size="large"
                htmlType="submit"
              >
                SAVE LOGUE SETTINGS
              </Button>
            </Card>

            {/* Section 4: Security & Access */}
            <Card 
              title={<span><WarningOutlined /> SECTION 04: SECURITY & SURVEILLANCE</span>}
              className="admin-chart-card"
              style={{ marginTop: 24 }}
            >
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item name="enableAdminPanel" label="Administrative Interface (Global)" valuePropName="checked">
                    <Switch checkedChildren="ENABLED" unCheckedChildren="LOCKED" />
                  </Form.Item>
                  <Form.Item name="requireReauthForSensitiveOperations" label="Sudo Mode Enforcement" valuePropName="checked">
                    <Switch checkedChildren="STRICT" unCheckedChildren="LAX" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="enableIPWhitelist" label="IP Access Filtering (Whitelist)" valuePropName="checked">
                    <Switch checkedChildren="ENFORCED" unCheckedChildren="DISABLED" />
                  </Form.Item>
                  <Form.Item label="Authorized IP Addresses">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Input 
                        placeholder="Add IP address (e.g. 192.168.1.1)" 
                        value={ipInput}
                        onChange={e => setIpInput(e.target.value)}
                        onPressEnter={(e) => {
                          e.preventDefault();
                          const currentIps = form.getFieldValue('adminIPWhitelist') || [];
                          if (ipInput && !currentIps.includes(ipInput)) {
                            form.setFieldsValue({ adminIPWhitelist: [...currentIps, ipInput] });
                            setIpInput('');
                          }
                        }}
                        suffix={
                          <Button 
                            type="link" 
                            size="small" 
                            onClick={() => {
                              const currentIps = form.getFieldValue('adminIPWhitelist') || [];
                              if (ipInput && !currentIps.includes(ipInput)) {
                                form.setFieldsValue({ adminIPWhitelist: [...currentIps, ipInput] });
                                setIpInput('');
                              }
                            }}
                          >
                            ADD
                          </Button>
                        }
                      />
                      <Form.Item name="adminIPWhitelist" noStyle shouldUpdate>
                        {({ getFieldValue }) => {
                            const ips = getFieldValue('adminIPWhitelist') || [];
                            return (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
                                    {ips.map((ip: string) => (
                                        <Tag 
                                            key={ip} 
                                            closable 
                                            onClose={() => {
                                                const current = getFieldValue('adminIPWhitelist');
                                                form.setFieldsValue({ adminIPWhitelist: current.filter((i: string) => i !== ip) });
                                            }}
                                            color="cyan"
                                            style={{ border: '1px solid #30363d', background: '#0d1117' }}
                                        >
                                            {ip}
                                        </Tag>
                                    ))}
                                    {ips.length === 0 && <Text type="secondary" style={{ fontSize: '12px', fontStyle: 'italic' }}>No IPs whitelisted. Access restricted to internal network if enabled.</Text>}
                                </div>
                            );
                        }}
                      </Form.Item>
                    </Space>
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Section 3: Email Configuration */}
          <Col xs={24} xl={8}>
            <Card 
              title={<span><MailOutlined /> SECTION 03: ALERT PROTOCOLS</span>}
              className="admin-chart-card"
            >
              <Form.Item 
                name="adminEmail" 
                label="Primary Alert Recipient"
                rules={[
                  { required: true, message: 'Admin email is required' },
                  { type: 'email', message: 'Enter a valid forensic email' }
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="admin@shadowscan.local" />
              </Form.Item>

              <Form.Item name="sendActivityAlerts" label="Dispatch Threat Alerts" valuePropName="checked">
                <Switch checkedChildren="ACTIVE" unCheckedChildren="OFF" />
              </Form.Item>

              <Form.Item name="alertFrequency" label="Dispatch Chronology">
                <Select>
                  <Option value="real-time">REAL-TIME</Option>
                  <Option value="daily">DAILY RECAP</Option>
                  <Option value="weekly">WEEKLY AUDIT</Option>
                </Select>
              </Form.Item>

              <Tooltip title="Alerts will be dispatched via secure SMTP gateway.">
                <Text type="secondary" style={{ fontSize: '12px' }}><InfoCircleOutlined /> Alert configurations affect critical system notifications.</Text>
              </Tooltip>
            </Card>
          </Col>

          {/* Section 2: API Integrations */}
          <Col xs={24}>
            <Card 
              title={<span><ApiOutlined /> SECTION 02: EXTERNAL DATA BRIDGES</span>}
              className="admin-chart-card"
            >
              <List
                loading={loading}
                itemLayout="horizontal"
                dataSource={integrations}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Switch 
                        checked={item.isActive} 
                        onChange={(val) => handleToggleAPI(item.id, val)} 
                        checkedChildren="ON" 
                        unCheckedChildren="OFF" 
                      />,
                      <Button 
                        size="small"
                        icon={<KeyOutlined />} 
                        onClick={() => handleRotateKey(item.id)}
                        loading={rotating === item.id}
                      >
                        ROTATE
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<ApiOutlined style={{ fontSize: 20, color: item.isActive ? '#00ff88' : '#30363d' }} />}
                      title={<span style={{ color: '#fff' }}>{item.name}</span>}
                      description={
                        <Space split={<Divider type="vertical" />}>
                          <Text type="secondary">ID: {item.id}</Text>
                          <Text type="secondary">
                            <HistoryOutlined /> {dayjs(item.lastChecked).format('MMM D, HH:mm')}
                          </Text>
                          {item.isActive ? (
                            <Tag color="cyan">ACTIVE</Tag>
                          ) : (
                            <Tag color="default">INACTIVE</Tag>
                          )}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </Form>

      {/* Sudo Re-auth Modal */}
      <Modal
        title={<span><KeyOutlined /> SECURITY CLEARANCE REQUIRED</span>}
        open={sudoVisible}
        onOk={handleSudoVerify}
        onCancel={() => {
            setSudoVisible(false);
            setSudoPassword('');
            setSudoCallback(null);
        }}
        okText="VERIFY"
        confirmLoading={sudoLoading}
        className="hacker-modal"
        destroyOnClose
      >
        <div style={{ marginBottom: 16 }}>
            <Text type="secondary">Action requires elevated privileges. Please enter your terminal override password.</Text>
        </div>
        <Input.Password
            placeholder="ADMIN_PASSWORD"
            value={sudoPassword}
            onChange={e => setSudoPassword(e.target.value)}
            onPressEnter={handleSudoVerify}
            autoFocus
            prefix={<KeyOutlined style={{ color: '#8b949e' }} />}
        />
      </Modal>
    </div>
  );
};

export default Settings;

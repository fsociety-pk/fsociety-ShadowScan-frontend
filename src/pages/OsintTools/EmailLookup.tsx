import React, { useState } from 'react';
import { Input, Button, Card, Typography, message, Space, List, Tag, Descriptions, Row, Col, Avatar, Divider, Table } from 'antd';
import { SearchOutlined, MailOutlined, WarningOutlined, UserOutlined, GlobalOutlined, CheckCircleOutlined, LinkOutlined, ExportOutlined, CloseCircleOutlined } from '@ant-design/icons';
import api from '../../api/axiosConfig';

const { Title, Text, Paragraph } = Typography;

const EmailLookup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleLookup = async () => {
    if (!email || !email.includes('@')) {
      message.error('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      const response = await api.post('/tools/email-lookup', { email });
      setResults(response.data);
      message.success('Advanced intelligence discovery complete.');
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to execute forensic lookup');
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceLevel = (score: number) => {
    if (score > 0.8) return { color: 'var(--cyber-blue)', text: 'HIGH CONFIDENCE' };
    if (score > 0.4) return { color: '#faad14', text: 'PARTIAL MATCH' };
    return { color: '#ff4d4f', text: 'LOW CONFIDENCE' };
  };

  const socialColumns = [
    {
      title: 'Platform',
      dataIndex: 'platform',
      key: 'platform',
      render: (text: string) => <Text strong style={{ color: 'var(--text-main)' }}>{text.toUpperCase()}</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: any) => {
        const isFound = status === 'found' || record.verified;
        return isFound ? (
          <Tag color="success" icon={<CheckCircleOutlined />}>IDENTIFIED</Tag>
        ) : (
          <Tag color="error" icon={<CloseCircleOutlined />}>NOT FOUND</Tag>
        );
      }
    },
    {
      title: 'Intelligence',
      key: 'action',
      render: (_: any, record: any) => (
        <Button 
          type="link" 
          href={record.url} 
          target="_blank" 
          icon={<ExportOutlined />} 
          style={{ color: 'var(--cyber-blue)', padding: 0 }}
        >
          Intercept
        </Button>
      ),
    },
  ];

  return (
    <Card style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: 12 }}>
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={4} style={{ color: 'var(--primary)', marginTop: 0 }}>
            [ Advanced forensic enrichment ]
          </Title>
          <Paragraph style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
            Orchestrates lookups across corporate registries, professional networks, and breach databases. 
            Assigns confidence scores based on cross-referenced identifiers.
          </Paragraph>

          <div style={{ display: 'flex', gap: 10 }}>
            <Input
              size="large"
              placeholder="target@company.com"
              prefix={<MailOutlined style={{ color: 'var(--cyber-blue)' }} />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onPressEnter={handleLookup}
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
            />
            <Button
              type="primary"
              size="large"
              icon={<SearchOutlined />}
              loading={loading}
              onClick={handleLookup}
              className="cyber-btn"
              style={{ borderRadius: 10, height: 48 }}
            >
              START ENRICHMENT
            </Button>
          </div>
        </div>

        {results && (
          <div style={{ marginTop: 20 }}>
            <Row gutter={[24, 24]}>
              {/* Profile Overview */}
              <Col xs={24} lg={8}>
                <Card 
                  title={<span style={{ color: 'var(--cyber-blue)' }}><UserOutlined /> Identity Profile</span>} 
                  style={{ background: '#ffffff', border: '1px solid var(--border-color)' }}
                >
                  <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <Avatar size={100} src={results.profile.avatar} icon={<UserOutlined />} style={{ border: '2px solid var(--cyber-blue)', marginBottom: 15 }} />
                    <Title level={4} style={{ color: 'var(--text-main)', margin: 0 }}>{results.profile.name}</Title>
                    <Space style={{ marginTop: 8 }}>
                        <Tag color={results.email_type === 'corporate' ? 'blue' : 'default'}>{results.email_type.toUpperCase()}</Tag>
                        {results.profile.verified && <Tag color="success">VERIFIED</Tag>}
                    </Space>
                  </div>

                  <Descriptions column={1} size="small" style={{ marginTop: 10 }} bordered={false}>
                    <Descriptions.Item label={<Text type="secondary">Score</Text>}>
                        <Tag color={getConfidenceLevel(results.profile.confidence_score).color}>
                            {getConfidenceLevel(results.profile.confidence_score).text} ({Math.round(results.profile.confidence_score * 100)}%)
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label={<Text type="secondary">Loc</Text>}>{results.profile.location || 'Unknown'}</Descriptions.Item>
                    <Descriptions.Item label={<Text type="secondary">Sources</Text>}>
                        {results.profile.sources.join(', ') || 'Public Probing'}
                    </Descriptions.Item>
                    <Divider style={{ borderColor: 'var(--border-color)', margin: '12px 0' }} />
                    <Descriptions.Item label={<Text type="secondary">Bio</Text>}>
                        <Text style={{ fontSize: '0.9em' }}>{results.profile.bio || 'No public bio found.'}</Text>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>

              {/* Enrichment Data */}
              <Col xs={24} lg={16}>
                <Row gutter={[0, 24]}>
                  {/* Professional & Business Info */}
                  <Col span={24}>
                    <Card 
                      title={<span style={{ color: 'var(--cyber-blue)' }}><GlobalOutlined /> Professional Intelligence</span>}
                      style={{ background: '#ffffff', border: '1px solid var(--border-color)' }}
                    >
                        <Row gutter={16}>
                            <Col span={12}>
                                <Descriptions column={1} size="small">
                                    <Descriptions.Item label="Company">{results.professional.company || 'N/A'}</Descriptions.Item>
                                    <Descriptions.Item label="Position">{results.professional.title || 'N/A'}</Descriptions.Item>
                                </Descriptions>
                            </Col>
                            <Col span={12}>
                                <Descriptions column={1} size="small">
                                    <Descriptions.Item label="Domain">{results.professional.domain || 'N/A'}</Descriptions.Item>
                                    <Descriptions.Item label="Department">{results.professional.department || 'N/A'}</Descriptions.Item>
                                </Descriptions>
                            </Col>
                        </Row>
                    </Card>
                  </Col>

                  {/* Social Footprint mapping */}
                  <Col span={24}>
                    <Card 
                      title={<span style={{ color: 'var(--cyber-blue)' }}><LinkOutlined /> Social Footprint Mapping</span>}
                      style={{ background: '#ffffff', border: '1px solid var(--border-color)' }}
                    >
                        <Table 
                            dataSource={results.social_profiles} 
                            columns={socialColumns} 
                            size="small" 
                            pagination={{ pageSize: 5 }}
                            rowKey={(record) => record.platform + record.url}
                        />
                    </Card>
                  </Col>

                  {/* Breach Analysis */}
                  <Col span={24}>
                    <Card 
                      title={<span style={{ color: results.breaches.length > 0 ? '#ff4d4f' : 'var(--cyber-blue)' }}><WarningOutlined /> Risk Exposure (Breaches)</span>}
                      style={{ background: '#ffffff', border: '1px solid var(--border-color)' }}
                    >
                      <List
                        dataSource={results.breaches}
                        renderItem={(item: any) => (
                          <List.Item style={{ borderColor: 'var(--border-color)' }}>
                            <List.Item.Meta
                              title={<Text strong style={{ color: 'var(--text-main)' }}>{item.breach_name}</Text>}
                              description={
                                <div>
                                  <Space split={<Divider type="vertical" />}>
                                    <Text type="secondary">{item.date}</Text>
                                    <Tag color={item.severity === 'high' ? 'error' : item.severity === 'medium' ? 'warning' : 'default'} style={{ fontSize: '0.75em' }}>
                                        {item.severity.toUpperCase()} RISK
                                    </Tag>
                                  </Space>
                                  <div style={{ marginTop: 8 }}>
                                    {item.exposed_data.map((cls: string) => <Tag key={cls} style={{ fontSize: '0.7em', color: '#ff4d4f', background: 'rgba(255, 77, 79, 0.1)', borderColor: 'rgba(255, 77, 79, 0.2)' }}>{cls}</Tag>)}
                                  </div>
                                </div>
                              }
                            />
                          </List.Item>
                        )}
                        locale={{ emptyText: <Text type="secondary">No integrity compromises detected in known databases.</Text> }}
                      />
                    </Card>
                  </Col>
                </Row>
              </Col>
            </Row>
          </div>
        )}
      </Space>
    </Card>
  );
};

export default EmailLookup;

import React, { useState } from 'react';
import { Input, Button, Card, Typography, message, Space, List, Tag, Descriptions, Row, Col, Avatar, Divider, Empty } from 'antd';
import { SearchOutlined, MailOutlined, WarningOutlined, UserOutlined, GlobalOutlined, CheckCircleOutlined, LinkOutlined, ExportOutlined } from '@ant-design/icons';
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
    if (score > 0.8) return { color: '#00ff41', text: 'HIGH CONFIDENCE' };
    if (score > 0.4) return { color: '#faad14', text: 'PARTIAL MATCH' };
    return { color: '#ff4d4f', text: 'LOW CONFIDENCE' };
  };

  return (
    <Card style={{ background: '#0d1117', border: '1px solid #30363d' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={4} style={{ color: '#00ff41', marginTop: 0 }}>
            [ Advanced forensic enrichment ]
          </Title>
          <Paragraph style={{ color: '#8b949e', marginBottom: 20 }}>
            Orchestrates lookups across corporate registries (Hunter, Clearbit), professional networks, and breach databases. 
            Assigns confidence scores based on cross-referenced identifiers.
          </Paragraph>

          <div style={{ display: 'flex', gap: 10 }}>
            <Input
              size="large"
              placeholder="target@company.com"
              prefix={<MailOutlined style={{ color: '#00ff41' }} />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onPressEnter={handleLookup}
              style={{ background: '#010409', borderColor: '#30363d', color: '#00ff41' }}
            />
            <Button
              type="primary"
              size="large"
              icon={<SearchOutlined />}
              loading={loading}
              onClick={handleLookup}
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
                  title={<span style={{ color: '#00ff41' }}><UserOutlined /> Identity Profile</span>} 
                  style={{ background: '#010409', border: '1px solid #30363d' }}
                >
                  <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <Avatar size={100} src={results.profile.avatar} icon={<UserOutlined />} style={{ border: '2px solid #00ff41', marginBottom: 15 }} />
                    <Title level={4} style={{ color: '#e6edf3', margin: 0 }}>{results.profile.name}</Title>
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
                    <Divider style={{ borderColor: '#30363d', margin: '12px 0' }} />
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
                      title={<span style={{ color: '#00ff41' }}><GlobalOutlined /> Professional Intelligence</span>}
                      style={{ background: '#010409', border: '1px solid #30363d' }}
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

                  {/* Social Footprint */}
                  <Col span={24}>
                    <Card 
                      title={<span style={{ color: '#00ff41' }}><LinkOutlined /> Social Footprint Mapping</span>}
                      style={{ background: '#010409', border: '1px solid #30363d' }}
                      bodyStyle={{ padding: 0 }}
                    >
                        <List
                            dataSource={results.social_profiles}
                            size="small"
                            renderItem={(item: any) => (
                                <List.Item 
                                    style={{ padding: '12px 20px', borderBottom: '1px solid #30363d' }}
                                    actions={[
                                        <Button type="link" href={item.url} target="_blank" icon={<ExportOutlined />} style={{ color: '#00ff41' }}>Intercept</Button>
                                    ]}
                                >
                                    <List.Item.Meta
                                        avatar={<Avatar src={`https://www.google.com/s2/favicons?domain=${new URL(item.url).hostname}&sz=32`} />}
                                        title={<Space><Text strong style={{ color: '#e6edf3' }}>{item.platform}</Text> {item.verified && <CheckCircleOutlined style={{ color: '#00ff41' }} />}</Space>}
                                        description={<Text type="secondary">@{item.username || results.email.split('@')[0]}</Text>}
                                    />
                                </List.Item>
                            )}
                            locale={{ emptyText: <div style={{ padding: 20 }}><Empty description="No social patterns detected." /></div> }}
                        />
                    </Card>
                  </Col>

                  {/* Breach Analysis */}
                  <Col span={24}>
                    <Card 
                      title={<span style={{ color: results.breaches.length > 0 ? '#ff4d4f' : '#00ff41' }}><WarningOutlined /> Risk Exposure (Breaches)</span>}
                      style={{ background: '#010409', border: '1px solid #30363d' }}
                    >
                      <List
                        dataSource={results.breaches}
                        renderItem={(item: any) => (
                          <List.Item style={{ borderColor: '#30363d' }}>
                            <List.Item.Meta
                              title={<Text strong style={{ color: '#e6edf3' }}>{item.breach_name}</Text>}
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

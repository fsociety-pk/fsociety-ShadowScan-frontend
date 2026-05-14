import React, { useState } from 'react';
import { Card, Input, Button, Typography, Space, Tag, Empty, Row, Col, Collapse, Descriptions } from 'antd';
import { GlobalOutlined, SearchOutlined, SafetyCertificateOutlined, BugOutlined, DatabaseOutlined } from '@ant-design/icons';
import api from '../../api/axiosConfig';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const NetworkRecon: React.FC = () => {
  const [target, setTarget] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleSearch = async () => {
    if (!target) return;
    setLoading(true);
    try {
      const response = await api.post('/tools/network-recon', { target });
      setResults(response.data);
    } catch (error) {
      console.error('Network recon failed', error);
    } finally {
      setLoading(false);
    }
  };

  const renderShodan = (data: any) => {
    if (!data) return <Empty description="No Shodan data found" />;
    return (
      <Descriptions bordered size="small" column={1}>
        <Descriptions.Item label="Org">{data.org}</Descriptions.Item>
        <Descriptions.Item label="ISP">{data.isp}</Descriptions.Item>
        <Descriptions.Item label="OS">{data.os || 'Unknown'}</Descriptions.Item>
        <Descriptions.Item label="Ports">{data.ports?.join(', ')}</Descriptions.Item>
        <Descriptions.Item label="Last Update">{data.last_update}</Descriptions.Item>
      </Descriptions>
    );
  };

  const renderVT = (data: any) => {
    if (!data || !data.data) return <Empty description="No VirusTotal data found" />;
    const attr = data.data.attributes;
    return (
      <div>
        <div style={{ marginBottom: 15 }}>
          <Text strong>Reputation Score:</Text> 
          <Tag color={attr.reputation > 0 ? 'success' : attr.reputation < 0 ? 'error' : 'default'} style={{ marginLeft: 10 }}>
            {attr.reputation}
          </Tag>
        </div>
        <Title level={5}>Analysis Results</Title>
        <Row gutter={16}>
          <Col span={8}>
            <Card size="small" title="Harmless" styles={{ header: { color: 'var(--success)' } }}>{attr.last_analysis_stats.harmless}</Card>
          </Col>
          <Col span={8}>
            <Card size="small" title="Malicious" styles={{ header: { color: 'var(--error)' } }}>{attr.last_analysis_stats.malicious}</Card>
          </Col>
          <Col span={8}>
            <Card size="small" title="Suspicious" styles={{ header: { color: 'var(--warning)' } }}>{attr.last_analysis_stats.suspicious}</Card>
          </Col>
        </Row>
      </div>
    );
  };

  return (
    <div style={{ padding: '20px 0' }}>
      <Card variant="borderless" style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: 12 }}>
        <Space orientation="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <GlobalOutlined style={{ fontSize: 48, color: 'var(--primary)', marginBottom: 15 }} />
            <Title level={3}>Network & Host Intelligence</Title>
            <Paragraph type="secondary">
              Analyze IP addresses or Domains across Shodan, VirusTotal, AbuseIPDB, and Censys to discover exposed services and security reputation.
            </Paragraph>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <Input 
              size="large" 
              placeholder="Enter IP address or Domain (e.g., 8.8.8.8 or google.com)" 
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              prefix={<GlobalOutlined style={{ color: 'var(--text-muted)' }} />}
              onPressEnter={handleSearch}
            />
            <Button 
              type="primary" 
              size="large" 
              icon={<SearchOutlined />} 
              onClick={handleSearch}
              loading={loading}
              style={{ minWidth: 150 }}
            >
              Analyze
            </Button>
          </div>

          {results && (
            <div style={{ marginTop: 20 }}>
              <Title level={4} style={{ marginBottom: 20 }}>Intelligence Report for: {results.target}</Title>
              
              <Collapse defaultActiveKey={['shodan', 'vt']} ghost expandIconPosition="end">
                <Panel 
                  header={<span style={{ fontWeight: 600 }}><DatabaseOutlined /> Shodan Infrastructure Analysis</span>} 
                  key="shodan"
                  style={{ marginBottom: 16, background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: 8 }}
                >
                  {renderShodan(results.shodan)}
                </Panel>

                <Panel 
                  header={<span style={{ fontWeight: 600 }}><SafetyCertificateOutlined /> VirusTotal Security Reputation</span>} 
                  key="vt"
                  style={{ marginBottom: 16, background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: 8 }}
                >
                  {renderVT(results.virustotal)}
                </Panel>

                <Panel 
                  header={<span style={{ fontWeight: 600 }}><BugOutlined /> AbuseIPDB Reputation Check</span>} 
                  key="abuse"
                  style={{ marginBottom: 16, background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: 8 }}
                >
                  {results.abuseipdb ? (
                    <Descriptions bordered size="small" column={1}>
                      <Descriptions.Item label="Abuse Confidence Score">
                        <Tag color={results.abuseipdb.data.abuseConfidenceScore > 50 ? 'error' : 'success'}>
                          {results.abuseipdb.data.abuseConfidenceScore}%
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Total Reports">{results.abuseipdb.data.totalReports}</Descriptions.Item>
                      <Descriptions.Item label="Usage Type">{results.abuseipdb.data.usageType || 'N/A'}</Descriptions.Item>
                      <Descriptions.Item label="Country">{results.abuseipdb.data.countryName}</Descriptions.Item>
                    </Descriptions>
                  ) : <Empty description="No AbuseIPDB data found" />}
                </Panel>

                <Panel 
                  header={<span style={{ fontWeight: 600 }}><GlobalOutlined /> Censys Host Discovery</span>} 
                  key="censys"
                  style={{ marginBottom: 16, background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: 8 }}
                >
                  {results.censys ? (
                    <pre style={{ color: 'var(--text-main)', fontSize: '12px', overflow: 'auto', maxHeight: 300, fontFamily: 'monospace' }}>
                      {JSON.stringify(results.censys, null, 2)}
                    </pre>
                  ) : <Empty description="No Censys data found" />}
                </Panel>
              </Collapse>
            </div>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default NetworkRecon;

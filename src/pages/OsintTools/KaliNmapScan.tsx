import React, { useState } from 'react';
import { Form, Input, Button, Card, Spin, Alert, Table, Tag, Space, Divider, Statistic, Row, Col, Select } from 'antd';
import { RadarChartOutlined, SearchOutlined } from '@ant-design/icons';
import api from '../../api/axiosConfig';
import { useParams } from 'react-router-dom';

interface NmapPort {
  number: number;
  status: string;
  protocol: string;
}

interface NmapResult {
  tool: string;
  target: string;
  scanType: string;
  timestamp: string;
  ports: NmapPort[];
  hostStatus: string;
  osDetection: string | null;
  method: string;
  summary: {
    openPorts: number;
    scanCompleted: boolean;
  };
}

const commonPorts: Record<number, string> = {
  22: 'SSH',
  80: 'HTTP',
  443: 'HTTPS',
  3306: 'MySQL',
  5432: 'PostgreSQL',
  27017: 'MongoDB',
  6379: 'Redis',
  8080: 'HTTP-Alt',
  8443: 'HTTPS-Alt',
  3389: 'RDP',
};

const KaliNmapScan: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<NmapResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { caseId } = useParams<{ caseId?: string }>();

  const handleScan = async (values: { target: string; scanType: string }) => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await api.post(
        '/kali-tools/nmap',
        {
          target: values.target,
          scanType: values.scanType,
          caseId: caseId || undefined,
        },
        {
          timeout: 30000,
        }
      );

      setResults(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Nmap scan failed');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Port',
      dataIndex: 'number',
      key: 'port',
      render: (port: number) => <strong style={{ color: 'var(--neon-green)' }}>{port}</strong>,
    },
    {
      title: 'Service',
      dataIndex: 'number',
      key: 'service',
      render: (port: number) => commonPorts[port] || 'Unknown',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color="red">{status.toUpperCase()}</Tag>,
    },
    {
      title: 'Protocol',
      dataIndex: 'protocol',
      key: 'protocol',
      render: (protocol: string) => <Tag color="blue">{protocol.toUpperCase()}</Tag>,
    },
  ];

  const scanTypeDescriptions: Record<string, string> = {
    basic: 'Scan top 1000 TCP ports with service version detection',
    aggressive: 'Aggressive scanning with OS detection and traceroute',
    stealth: 'Stealthy SYN scan for evading detection',
  };

  return (
    <div style={{ padding: '20px 0' }}>
      <Card
        title={
          <Space>
            <RadarChartOutlined style={{ color: 'var(--neon-green)' }} />
            <span>Nmap - Network & Port Scanning</span>
          </Space>
        }
        style={{ marginBottom: 20 }}
      >
        <Alert
          message="Responsibility Notice"
          description="Only scan systems you own or have explicit permission to scan. Unauthorized network scanning may be illegal."
          type="warning"
          showIcon
          style={{ marginBottom: 15 }}
        />

        <Form form={form} onFinish={handleScan} layout="vertical">
          <Form.Item
            name="target"
            label="Target Host (IP or Hostname)"
            rules={[{ required: true, message: 'Please enter a target host' }]}
          >
            <Input
              placeholder="e.g., example.com or 192.168.1.1"
              prefix={<SearchOutlined />}
              disabled={loading}
            />
          </Form.Item>

          <Form.Item
            name="scanType"
            label="Scan Type"
            initialValue="basic"
            rules={[{ required: true }]}
          >
            <Select
              disabled={loading}
              options={[
                { label: 'Basic (Recommended) - Top 1000 ports', value: 'basic' },
                { label: 'Aggressive - Full OS detection', value: 'aggressive' },
                { label: 'Stealth - SYN scan', value: 'stealth' },
              ]}
            />
          </Form.Item>

          <Card style={{ background: '#ffffff', marginBottom: 15 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: 0 }}>
              {form.getFieldValue('scanType') && scanTypeDescriptions[form.getFieldValue('scanType')]}
            </p>
          </Card>

          <Button
            type="primary"
            htmlType="submit"
            icon={<SearchOutlined />}
            loading={loading}
            block
            style={{ background: 'var(--neon-green)', borderColor: 'var(--neon-green)' }}
          >
            Start Network Scan
          </Button>
        </Form>
      </Card>

      {error && <Alert message={error} type="error" showIcon closable style={{ marginBottom: 20 }} />}

      {loading && (
        <Card style={{ textAlign: 'center', padding: 50 }}>
          <Spin size="large" tip="Scanning network and ports..." />
          <p style={{ color: 'var(--text-muted)', marginTop: 20 }}>This may take a minute...</p>
        </Card>
      )}

      {results && !loading && (
        <>
          <Card style={{ marginBottom: 20 }}>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Statistic
                  title="Open Ports Detected"
                  value={results.summary.openPorts}
                  valueStyle={{ color: results.summary.openPorts > 0 ? '#ff6b6b' : 'var(--neon-green)' }}
                />
              </Col>
              <Col xs={24} sm={12}>
                <Statistic
                  title="Scan Status"
                  value={results.summary.scanCompleted ? 'Completed' : 'Partial'}
                  valueStyle={{ color: results.summary.scanCompleted ? 'var(--neon-green)' : '#ffd700' }}
                />
              </Col>
            </Row>
          </Card>

          <Divider />

          {results.ports.length > 0 ? (
            <>
              <Card title={<span>Open Ports ({results.ports.length})</span>} style={{ marginBottom: 20 }}>
                <Table
                  columns={columns}
                  dataSource={results.ports.map((p, idx) => ({ ...p, key: idx }))}
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 800 }}
                />
              </Card>
            </>
          ) : (
            <Card style={{ marginBottom: 20, background: '#ffffff' }}>
              <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                ✅ No open ports detected in the scanned range.
              </p>
            </Card>
          )}

          <Card style={{ marginTop: 20, background: '#ffffff' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>
              <strong>Target:</strong> {results.target} | <strong>Scan Type:</strong> {results.scanType} | <strong>Scan Time:</strong> {new Date(results.timestamp).toLocaleString()}
            </p>
          </Card>
        </>
      )}
    </div>
  );
};

export default KaliNmapScan;

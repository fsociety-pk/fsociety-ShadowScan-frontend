import React, { useState } from 'react';
import { Form, Input, Button, Card, Spin, Alert, Descriptions, Tag, Space, Collapse } from 'antd';
import { GlobalOutlined, SearchOutlined } from '@ant-design/icons';
import api from '../../api/axiosConfig';
import { useParams } from 'react-router-dom';

interface WhoisResult {
  tool: string;
  target: string;
  timestamp: string;
  data: Record<string, string>;
  method: string;
  summary: {
    registrar: string | null;
    registrationDate: string | null;
    expirationDate: string | null;
    nameServers: string[];
    organization: string | null;
    address: string | null;
    email: string | null;
    phone: string | null;
  };
}

const KaliWhoisLookup: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<WhoisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { caseId } = useParams<{ caseId?: string }>();

  const handleSearch = async (values: { target: string }) => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const token = localStorage.getItem('token');
      const response = await api.post(
        '/kali-tools/whois',
        {
          target: values.target,
          caseId: caseId || undefined,
        }
      );

      setResults(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Whois lookup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px 0' }}>
      <Card
        style={{ marginBottom: 20, border: '1px solid var(--border-color)', borderRadius: 12 }}
        bodyStyle={{ padding: 24 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div className="cyber-icon-wrapper" style={{ width: 50, height: 50, flexShrink: 0 }}>
            <GlobalOutlined style={{ color: '#fff', fontSize: 24 }} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, background: 'var(--cyber-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>DNS Lookup</div>
            <div style={{ color: 'var(--cyber-purple)', fontSize: 13, fontWeight: 500 }}>Domain and IP Intelligence</div>
          </div>
        </div>
        <Form form={form} onFinish={handleSearch} layout="vertical">
          <Form.Item
            name="target"
            label="Target Domain or IP Address"
            rules={[{ required: true, message: 'Please enter a domain or IP' }]}
          >
            <Input
              placeholder="e.g., example.com or 8.8.8.8"
              prefix={<GlobalOutlined />}
              disabled={loading}
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            icon={<SearchOutlined />}
            loading={loading}
            size="large"
            block
            className="cyber-btn"
            style={{
              height: 50, borderRadius: 10,
              background: 'var(--cyber-gradient)',
              border: 'none', fontWeight: 700, fontSize: 16, color: '#fff'
            }}
          >
            Lookup Domain/IP Information
          </Button>
        </Form>
      </Card>

      {error && <Alert message={error} type="error" showIcon closable style={{ marginBottom: 20 }} />}

      {loading && (
        <Card style={{ textAlign: 'center', padding: 50 }}>
          <Spin size="large" tip="Performing Whois lookup..." />
        </Card>
      )}

      {results && !loading && (
        <>
          <Card title={<span>Whois Summary</span>} style={{ marginBottom: 20 }}>
            <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
              <Descriptions.Item label="Registrar">
                <Tag color="blue">{results.summary.registrar || 'N/A'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Organization">
                {results.summary.organization || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Registration Date">
                <Tag color="green">{results.summary.registrationDate || 'N/A'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Expiration Date">
                <Tag color="red">{results.summary.expirationDate || 'N/A'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                <span style={{ fontFamily: 'monospace' }}>{results.summary.email || 'N/A'}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                {results.summary.phone || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Address" span={2}>
                {results.summary.address || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Name Servers" span={2}>
                <div>
                  {results.summary.nameServers.length > 0 ? (
                    results.summary.nameServers.map((ns, idx) => (
                      <Tag key={idx} color="purple" style={{ marginBottom: 5 }}>
                        {ns}
                      </Tag>
                    ))
                  ) : (
                    <span>N/A</span>
                  )}
                </div>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Collapse
            items={[
              {
                key: 'raw',
                label: <span>Raw Whois Data</span>,
                children: (
                  <div style={{ maxHeight: 400, overflow: 'auto', background: '#f8fafc', padding: 16, borderRadius: 8, border: '1px solid var(--border-color)' }}>
                    <pre style={{ color: 'var(--text-main)', fontSize: 13, margin: 0, fontFamily: 'monospace' }}>
                      {JSON.stringify(results.data, null, 2)}
                    </pre>
                  </div>
                ),
              },
            ]}
          />

          <Card style={{ marginTop: 20, background: '#ffffff' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>
              <strong>Detection Method:</strong> {results.method} | <strong>Lookup Time:</strong> {new Date(results.timestamp).toLocaleString()}
            </p>
          </Card>
        </>
      )}
    </div>
  );
};

export default KaliWhoisLookup;

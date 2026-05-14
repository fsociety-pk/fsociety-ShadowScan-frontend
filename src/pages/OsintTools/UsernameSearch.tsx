import React, { useState } from 'react';
import { Input, Button, Table, Card, Tag, Typography, message, Space, Tooltip } from 'antd';
import { SearchOutlined, CheckCircleOutlined, CloseCircleOutlined, UserOutlined, WarningOutlined, ExportOutlined } from '@ant-design/icons';
import api from '../../api/axiosConfig';

const { Title, Text, Paragraph } = Typography;

const UsernameSearch: React.FC = () => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);

  const handleSearch = async () => {
    if (!username) {
      message.warning('Please enter a username to search.');
      return;
    }

    setLoading(true);
    setResults([]);
    setSummary(null);

    try {
      const response = await api.post('/tools/username-lookup', { username });
      const { matches, summary } = response.data;
      
      setResults(matches.map((m: any, index: number) => ({ ...m, key: index })));
      setSummary(summary);
      message.success(`Scan complete. Found ${summary.found} matches.`);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to execute network scan');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Platform',
      dataIndex: 'platform',
      key: 'platform',
      render: (text: string) => <Text strong style={{ color: 'var(--text-main)' }}>{text}</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        if (status === 'found') {
          return <Tag color="success" icon={<CheckCircleOutlined />}>FOUND</Tag>;
        }
        if (status === 'suspended') {
          return <Tag color="warning" icon={<WarningOutlined />}>SUSPENDED</Tag>;
        }
        return <Tag color="error" icon={<CloseCircleOutlined />}>NOT FOUND</Tag>;
      }
    },
    {
        title: 'Confidence',
        dataIndex: 'confidence',
        key: 'confidence',
        render: (score: number) => (
            <Tooltip title={`Signature match reliability: ${Math.round(score * 100)}%`}>
                <Tag color={score > 0.9 ? 'blue' : 'default'} style={{ cursor: 'help' }}>
                    {Math.round(score * 100)}%
                </Tag>
            </Tooltip>
        )
    },
    {
      title: 'Intelligence',
      key: 'action',
      render: (_: any, record: any) => (
        record.status === 'found' || record.status === 'suspended' ? (
          <Button 
            type="link" 
            href={record.url} 
            target="_blank" 
            icon={<ExportOutlined />}
            style={{ padding: 0, color: 'var(--cyber-blue)' }}
          >
            Intercept
          </Button>
        ) : <Text type="secondary">N/A</Text>
      ),
    },
  ];

  return (
    <Card style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: 12 }}>
      <Title level={4} style={{ color: 'var(--primary)', marginTop: 0 }}>
        [ Advanced Username Intelligence ]
      </Title>
      <Paragraph style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
        Conducts multi-signature content analysis across 300+ platforms. Unlike basic status checks, 
        this engine verifies HTML markers to distinguish between active, deleted, and suspended accounts.
      </Paragraph>

      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <Input
            size="large"
            placeholder="target_alias"
            prefix={<UserOutlined style={{ color: 'var(--cyber-blue)' }} />}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onPressEnter={handleSearch}
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
          />
          <Button
            type="primary"
            size="large"
            icon={<SearchOutlined />}
            loading={loading}
            onClick={handleSearch}
            className="cyber-btn"
            style={{ borderRadius: 10, height: 48 }}
          >
            START DEEP SCAN
          </Button>
        </div>

        {summary && (
            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                <Space split={<Text type="secondary">|</Text>}>
                    <Text strong style={{ color: 'var(--text-main)' }}>Scanned: {summary.total_scanned}</Text>
                    <Text style={{ color: 'var(--cyber-blue)', fontWeight: 600 }}>Identified: {summary.found}</Text>
                    <Text style={{ color: '#faad14', fontWeight: 600 }}>Suspended: {summary.suspended}</Text>
                </Space>
            </div>
        )}

        {results.length > 0 && (
          <Table
            columns={columns}
            dataSource={results}
            pagination={{ pageSize: 15 }}
            size="small"
            style={{ background: '#ffffff', borderRadius: 8, border: '1px solid var(--border-color)' }}
          />
        )}
      </Space>
    </Card>
  );
};

export default UsernameSearch;

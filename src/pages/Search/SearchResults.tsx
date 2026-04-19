import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Typography, Card, List, Tag, Spin, Row, Col, Space, Empty, Tabs } from 'antd';
import { FolderOpenOutlined, DatabaseOutlined, SearchOutlined } from '@ant-design/icons';
import api from '../../api/axiosConfig';

const { Title, Text, Paragraph } = Typography;

const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ cases: any[], entities: any[] }>({
    cases: [],
    entities: []
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (query) {
      fetchResults();
    }
  }, [query]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/search?q=${query}`);
      setResults(response.data);
    } catch (error) {
      console.error('Search failed', error);
    } finally {
      setLoading(false);
    }
  };

  const renderCases = () => (
    <List
      dataSource={results.cases}
      renderItem={(item) => (
        <Card 
          key={item._id} 
          style={{ background: '#0d1117', border: '1px solid #30363d', marginBottom: 15 }}
          hoverable
          onClick={() => navigate(`/cases/${item._id}`)}
        >
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={4} style={{ color: '#00ff88', margin: 0 }}>{item.title}</Title>
              <Space style={{ marginTop: 5 }}>
                <Tag color="blue">{item.category}</Tag>
                <Tag color="error">{item.priority.toUpperCase()}</Tag>
              </Space>
            </Col>
            <Col style={{ textAlign: 'right' }}>
              <Tag color="cyan">{item.status}</Tag>
              <div style={{ color: '#8b949e', fontSize: '0.8em', marginTop: 5 }}>
                {new Date(item.createdAt).toLocaleDateString()}
              </div>
            </Col>
          </Row>
        </Card>
      )}
      locale={{ emptyText: <Empty description="No cases matching your query." /> }}
    />
  );

  const renderEntities = () => (
    <List
      dataSource={results.entities}
      renderItem={(item) => (
        <List.Item 
          style={{ border: '1px solid #30363d', background: '#0d1117', padding: '15px 20px', borderRadius: 8, marginBottom: 10, cursor: 'pointer' }}
          onClick={() => navigate(`/cases/${item.relatedCase?._id}`)}
        >
          <List.Item.Meta
            avatar={<DatabaseOutlined style={{ fontSize: 24, color: '#00ff88' }} />}
            title={<Text style={{ color: '#00ff88' }}>{item.value}</Text>}
            description={
              <div>
                <Tag color="cyan">{item.type.toUpperCase()}</Tag>
                <Text type="secondary" style={{ color: '#8b949e' }}>Linked to: {item.relatedCase?.title || 'Unknown Case'}</Text>
              </div>
            }
          />
        </List.Item>
      )}
      locale={{ emptyText: <Empty description="No logged entities matching your query." /> }}
    />
  );

  if (loading) return <div style={{ textAlign: 'center', marginTop: 100 }}><Spin size="large" tip="Scanning private dossier..." /></div>;

  const totalResults = results.cases.length + results.entities.length;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <Title level={2} style={{ color: '#00ff88' }}>
        <SearchOutlined /> [ Intelligence Search ]
      </Title>
      <Paragraph style={{ color: '#8b949e', marginBottom: 20 }}>
        Query: <Text strong style={{ color: '#e6edf3' }}>"{query}"</Text> - Found {totalResults} private matches.
      </Paragraph>

      <Tabs 
        defaultActiveKey="1" 
        items={[
          {
            key: '1',
            label: <span><FolderOpenOutlined /> Investigation Cases ({results.cases.length})</span>,
            children: renderCases(),
          },
          {
            key: '2',
            label: <span><DatabaseOutlined /> Logged Entities ({results.entities.length})</span>,
            children: renderEntities(),
          },
        ]} 
      />
    </div>
  );
};

export default SearchResults;

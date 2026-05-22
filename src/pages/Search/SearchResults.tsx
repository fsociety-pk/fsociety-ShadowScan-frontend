import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Typography, Card, List, Tag, Spin, Row, Col, Space, Empty, Tabs, Avatar, Tooltip, Badge, Button } from 'antd';
import ProfessionalProgressCircle from '../../components/ProfessionalProgressCircle';
import { DatabaseOutlined, SearchOutlined, MailOutlined, UserOutlined, PhoneOutlined, GlobalOutlined, CheckCircleOutlined, ExclamationCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import api from '../../api/axiosConfig';

const { Title, Text, Paragraph } = Typography;

interface Finding {
  _id: string;
  findingType: string;
  source: string;
  email?: string;
  username?: string;
  phone?: string;
  domain?: string;
  confidence: number;
  isVerified: boolean;
  tags: string[];
  createdAt: string;
  caseId: { _id: string; title?: string } | string;
  data: Record<string, unknown>;
}

interface CaseResult {
  _id: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
}

interface EntityResult {
  _id: string;
  value: string;
  type: string;
  relatedCase?: {
    _id: string;
    title?: string;
  };
}

interface SearchSummary {
  total?: number;
  [key: string]: unknown;
}

interface SearchResultsState {
  cases: CaseResult[];
  entities: EntityResult[];
  findings?: Finding[];
  summary?: SearchSummary;
}

const getFindingCaseId = (finding: Finding): string => (
  typeof finding.caseId === 'string' ? finding.caseId : finding.caseId._id
);

const getFindingCaseTitle = (finding: Finding): string => (
  typeof finding.caseId === 'string' ? 'System Intelligence' : finding.caseId.title || 'System Intelligence'
);

const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResultsState>({
    cases: [],
    entities: []
  });

  const navigate = useNavigate();

  const fetchResults = useCallback(async () => {
    if (!query) return;

    setLoading(true);
    try {
      const [globalRes, findingsRes] = await Promise.all([
        api.get(`/search?q=${query}`),
        api.get(`/search/findings/search?q=${query}`)
      ]);
      
      setResults({
        cases: globalRes.data.cases || [],
        entities: globalRes.data.entities || [],
        findings: findingsRes.data.findings || [],
        summary: findingsRes.data.summary
      });
    } catch (error) {
      console.error('Search failed', error);
      try {
        const response = await api.get(`/search?q=${query}`);
        setResults(response.data);
      } catch (err) {
        console.error('Fallback search failed', err);
      }
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);


  const getIconByType = (type: string) => {
    switch(type) {
      case 'email_lookup': return <MailOutlined />;
      case 'username_search': return <UserOutlined />;
      case 'phone_lookup': return <PhoneOutlined />;
      case 'breach': return <ExclamationCircleOutlined />;
      case 'metadata': return <GlobalOutlined />;
      default: return <SearchOutlined />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'email_lookup': 'Email Lookup',
      'username_search': 'Username Search',
      'phone_lookup': 'Phone Lookup',
      'breach': 'Breach Detected',
      'metadata': 'Legacy Record'
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'email_lookup': 'blue',
      'username_search': 'purple',
      'phone_lookup': 'green',
      'breach': 'red',
      'metadata': 'orange'
    };
    return colors[type] || 'default';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'var(--success)';
    if (confidence >= 60) return 'var(--warning)';
    return 'var(--error)';
  };

  const renderFindings = () => (
    <List
      dataSource={results.findings || []}
      renderItem={(item: Finding) => (
        <Card 
          key={item._id}
          hoverable
          onClick={() => navigate(`/cases/${getFindingCaseId(item)}`)}
          style={{ marginBottom: 16 }}
          styles={{ body: { padding: 20 } }}
        >
          <Row gutter={24} align="middle">
            <Col xs={24} sm={16}>
              <Space orientation="vertical" style={{ width: '100%' }}>
                <Row align="middle" gutter={12}>
                  <Col>
                    <Avatar style={{ backgroundColor: 'var(--primary)', color: '#fff' }} icon={getIconByType(item.findingType)} />
                  </Col>
                  <Col>
                    <Title level={4} style={{ margin: 0, fontSize: '18px' }}>
                      {getTypeLabel(item.findingType)}
                    </Title>
                  </Col>
                  <Col>
                    <Tag color={getTypeColor(item.findingType)}>{item.source}</Tag>
                  </Col>
                  {item.isVerified && (
                    <Col>
                      <Tooltip title="Verified Findings"><CheckCircleOutlined style={{ color: 'var(--success)', fontSize: 18 }} /></Tooltip>
                    </Col>
                  )}
                </Row>
                
                <Space wrap style={{ marginTop: 8 }}>
                  {item.email && <Text code>{item.email}</Text>}
                  {item.username && <Text code>{item.username}</Text>}
                  {item.phone && <Text code>{item.phone}</Text>}
                  {item.domain && <Text code>{item.domain}</Text>}
                </Space>

                <div style={{ marginTop: 8 }}>
                  <Text type="secondary" style={{ fontSize: '13px' }}>
                    Linked to Case: <Text strong style={{ color: 'var(--primary)' }}>{getFindingCaseTitle(item)}</Text>
                  </Text>
                </div>
              </Space>
            </Col>

            <Col xs={24} sm={8} style={{ textAlign: 'right' }}>
              <Space orientation="vertical" align="end">
                <ProfessionalProgressCircle
                  percent={item.confidence}
                  size={50}
                  colors={[getConfidenceColor(item.confidence), getConfidenceColor(item.confidence)]}
                />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </Space>
            </Col>
          </Row>
        </Card>
      )}
      locale={{ emptyText: <Empty description="No relevant intelligence findings found." /> }}
    />
  );

  const renderCases = () => (
    <List
      dataSource={results.cases}
      renderItem={(item: CaseResult) => (
        <Card 
          key={item._id} 
          hoverable
          onClick={() => navigate(`/cases/${item._id}`)}
          style={{ marginBottom: 16 }}
        >
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={4} style={{ margin: 0, fontSize: '18px' }}>{item.title}</Title>
              <Space style={{ marginTop: 8 }}>
                <Tag color="blue">{item.category}</Tag>
                <Tag color={item.priority === 'High' || item.priority === 'Critical' ? 'error' : 'default'}>{item.priority}</Tag>
              </Space>
            </Col>
            <Col style={{ textAlign: 'right' }}>
              <Tag color={item.status === 'Active' ? 'success' : 'default'}>{item.status}</Tag>
              <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: 8 }}>
                {new Date(item.createdAt).toLocaleDateString()}
              </div>
            </Col>
          </Row>
        </Card>
      )}
      locale={{ emptyText: <Empty description="No investigation dossiers matching your query." /> }}
    />
  );

  const renderEntities = () => (
    <List
      dataSource={results.entities}
      renderItem={(item: EntityResult) => (
        <Card 
          key={item._id}
          hoverable
          style={{ marginBottom: 12 }}
          styles={{ body: { padding: '12px 20px' } }}
          onClick={() => navigate(`/cases/${item.relatedCase?._id}`)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
            <DatabaseOutlined style={{ fontSize: 20, color: 'var(--primary)' }} />
            <div style={{ flex: 1 }}>
              <Text strong style={{ fontSize: '16px' }}>{item.value}</Text>
              <div style={{ marginTop: 4 }}>
                <Tag>{item.type.toUpperCase()}</Tag>
                <Text type="secondary" style={{ fontSize: '12px' }}>Linked to: {item.relatedCase?.title || 'Unknown dossier'}</Text>
              </div>
            </div>
          </div>
        </Card>
      )}
      locale={{ emptyText: <Empty description="No extracted entities matching your query." /> }}
    />
  );

  if (loading) return <div style={{ textAlign: 'center', marginTop: 100 }}><Spin size="large" tip="Scanning dossiers..." /></div>;

  const findingsCount = results.findings?.length || 0;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 60 }}>
      <Button 
        type="text" 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate(-1)} 
        style={{ marginBottom: 20, color: 'var(--text-muted)' }}
      >
        Back
      </Button>

      <div style={{ marginBottom: 30 }}>
        <Title level={2} style={{ marginBottom: 8 }}>Intelligence Search Results</Title>
        <Paragraph style={{ color: 'var(--text-muted)' }}>
          Results for: <Text strong style={{ color: 'var(--text-main)' }}>"{query}"</Text>
        </Paragraph>
      </div>

      <Tabs 
        defaultActiveKey={findingsCount > 0 ? '3' : '1'}
        type="line"
        items={[
          {
            key: '3',
            label: <span>Findings <Badge count={findingsCount} style={{ backgroundColor: 'var(--primary)', marginLeft: 8 }} /></span>,
            children: <div style={{ marginTop: 20 }}>{renderFindings()}</div>,
          },
          {
            key: '1',
            label: <span>Investigations ({results.cases.length})</span>,
            children: <div style={{ marginTop: 20 }}>{renderCases()}</div>,
          },
          {
            key: '2',
            label: <span>Entities ({results.entities.length})</span>,
            children: <div style={{ marginTop: 20 }}>{renderEntities()}</div>,
          }
        ]} 
      />
    </div>
  );
};

export default SearchResults;

import React, { useEffect, useState } from 'react';
import { Card, Typography, Row, Col, Tag, Button, Spin, message, Input, Select, Space, Popconfirm } from 'antd';
import { FolderOpenOutlined, SearchOutlined, FilterOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface InvestigationCase {
  _id: string;
  title: string;
  description: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: string;
  createdAt: string;
}

interface ParsedDescription {
  summary: string;
  indicators: {
    emails: number;
    phones: number;
    usernames: number;
    ips: number;
    domains: number;
  };
}

const clampText = (text: string, maxLength = 180): string => {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength).trim()}...`;
};

const buildSmartDescription = (raw: string): ParsedDescription => {
  const text = String(raw || '').trim();
  if (!text) {
    return {
      summary: 'No case brief available yet.',
      indicators: { emails: 0, phones: 0, usernames: 0, ips: 0, domains: 0 },
    };
  }

  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const labeled = lines
    .map((line) => {
      const idx = line.indexOf(':');
      if (idx <= 0) return null;
      const key = line.slice(0, idx).trim().toLowerCase();
      const value = line.slice(idx + 1).trim();
      return value ? { key, value } : null;
    })
    .filter((entry): entry is { key: string; value: string } => !!entry);

  const summaryParts: string[] = [];
  const contact = labeled.find((entry) => entry.key === 'contact')?.value;
  const friend = labeled.find((entry) => entry.key === 'friend' || entry.key === 'associate')?.value;
  const note = labeled.find((entry) => entry.key === 'note')?.value;
  const location = labeled.find((entry) => entry.key === 'location')?.value;

  if (contact) summaryParts.push(`Primary contact ${contact}`);
  if (friend) summaryParts.push(`linked with ${friend}`);
  if (location) summaryParts.push(`last seen ${location}`);
  if (note) summaryParts.push(note);

  const fallbackNarrative = lines.slice(0, 2).join('. ');
  const summary = clampText(
    summaryParts.length > 0 ? summaryParts.join('. ') : fallbackNarrative || text
  );

  return {
    summary,
    indicators: {
      emails: (text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || []).length,
      phones: (text.match(/\+?\d[\d\s().-]{7,}\d/g) || []).length,
      usernames: (text.match(/(?:username\s*:\s*|@)[a-z0-9._-]{3,}/gi) || []).length,
      ips: (text.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g) || []).length,
      domains: (text.match(/\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}\b/gi) || []).length,
    },
  };
};

const CaseList: React.FC = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState<InvestigationCase[]>([]);
  const [filteredCases, setFilteredCases] = useState<InvestigationCase[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchText, setSearchText] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    fetchCases();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchText, priorityFilter, categoryFilter, cases]);

  const fetchCases = async () => {
    try {
      const response = await api.get('/cases');
      setCases(response.data);
      setFilteredCases(response.data);
    } catch (_error) {
      message.error('Failed to load investigation cases');
    } finally {
      setLoading(false);
    }
  };

  const deleteCase = async (id: string) => {
    try {
      await api.delete(`/cases/${id}`);
      message.success('Case deleted successfully');
      fetchCases();
    } catch (_error) {
      message.error('Failed to delete case');
    }
  };

  const applyFilters = () => {
    let result = cases;
    
    if (searchText) {
      result = result.filter(c => 
        c.title.toLowerCase().includes(searchText.toLowerCase()) || 
        c.description.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    if (priorityFilter) {
      result = result.filter(c => c.priority === priorityFilter);
    }
    
    if (categoryFilter) {
      result = result.filter(c => c.category === categoryFilter);
    }
    
    setFilteredCases(result);
  };

  const getPriorityColor = (prio: string) => {
    if (prio === 'Low') return 'default';
    if (prio === 'Medium') return 'processing';
    if (prio === 'High') return 'warning';
    return 'error';
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: 100 }}><Spin size="large" /></div>;
  }

  return (
    <div style={{ paddingBottom: 40 }}>
      <div style={{ marginBottom: 30 }}>
        <Title level={2} style={{ marginBottom: 4 }}>My Investigations</Title>
        <Paragraph style={{ color: 'var(--text-muted)' }}>
          Manage your active and past intelligence operations.
        </Paragraph>
      </div>
      
      {/* Search and Filters */}
      <Card style={{ marginBottom: 30 }} bodyStyle={{ padding: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={12}>
            <Input 
              prefix={<SearchOutlined style={{ color: 'var(--text-muted)' }} />} 
              placeholder="Filter cases by title or objective..." 
              size="large"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={24} md={12}>
            <Space style={{ width: '100%', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
               <FilterOutlined style={{ color: 'var(--text-muted)' }} />
               <Select 
                size="large" 
                placeholder="Priority" 
                allowClear 
                style={{ width: 140 }}
                onChange={val => setPriorityFilter(val)}
              >
                <Option value="Low">Low</Option>
                <Option value="Medium">Medium</Option>
                <Option value="High">High</Option>
                <Option value="Critical">Critical</Option>
              </Select>
              
              <Select 
                size="large" 
                placeholder="Category" 
                allowClear 
                style={{ width: 140 }}
                onChange={val => setCategoryFilter(val)}
              >
                <Option value="Cyber">Cyber</Option>
                <Option value="Physical">Physical</Option>
                <Option value="Corporate">Corporate</Option>
                <Option value="Personal">Personal</Option>
              </Select>
            </Space>
          </Col>
        </Row>
      </Card>

      <Row gutter={[24, 24]}>
        {filteredCases.map((c) => (
          (() => {
            const parsed = buildSmartDescription(c.description);
            return (
          <Col xs={24} sm={12} lg={8} key={c._id}>
            <Card
              hoverable
              style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
              bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column' }}
              actions={[
                <Button type="text" icon={<FolderOpenOutlined />} onClick={() => navigate(`/cases/${c._id}`)}>Open</Button>,
                <Popconfirm title="Delete Case?" description="Are you sure you want to delete this case and all its findings?" onConfirm={() => deleteCase(c._id)}>
                  <Button type="text" danger icon={<DeleteOutlined />}>Delete</Button>
                </Popconfirm>
              ]}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <Title level={5} style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</Title>
                <Tag color={getPriorityColor(c.priority)}>{c.priority}</Tag>
              </div>
              
              <div style={{ marginBottom: 16 }}>
                <Tag>{c.category}</Tag>
                <Tag color={c.status === 'Active' ? 'success' : 'default'}>{c.status}</Tag>
              </div>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                {parsed.indicators.emails > 0 && <Tag color="geekblue">Email {parsed.indicators.emails}</Tag>}
                {parsed.indicators.phones > 0 && <Tag color="green">Phone {parsed.indicators.phones}</Tag>}
                {parsed.indicators.usernames > 0 && <Tag color="purple">Username {parsed.indicators.usernames}</Tag>}
                {parsed.indicators.ips > 0 && <Tag color="cyan">IP {parsed.indicators.ips}</Tag>}
                {parsed.indicators.domains > 0 && <Tag color="orange">Domain {parsed.indicators.domains}</Tag>}
              </div>

              <Text type="secondary" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>
                {parsed.summary}
              </Text>
              
              <div style={{ marginTop: 16, fontSize: '12px', color: 'var(--text-muted)' }}>
                Created: {new Date(c.createdAt).toLocaleDateString()}
              </div>
            </Card>
          </Col>
            );
          })()
        ))}
        {filteredCases.length === 0 && (
          <Col span={24} style={{ textAlign: 'center', padding: '60px 0' }}>
            <FolderOpenOutlined style={{ fontSize: 48, color: 'var(--border-color)', marginBottom: 16 }} />
            <br />
            <Text type="secondary">No cases found. Start a new investigation.</Text>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default CaseList;

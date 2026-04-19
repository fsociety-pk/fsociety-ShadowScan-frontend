import React, { useEffect, useState } from 'react';
import { Card, Typography, Row, Col, Tag, Button, Spin, message, Input, Select, Space } from 'antd';
import { FolderOpenOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';

const { Title, Text } = Typography;
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
    } catch (error) {
      message.error('Failed to load investigation cases');
    } finally {
      setLoading(false);
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
    <div>
      <Title level={2} style={{ color: '#00ff88', borderBottom: '1px solid #30363d', paddingBottom: 10 }}>
        [ My Investigations - Workspace ]
      </Title>
      
      {/* Search and Filters */}
      <Card style={{ background: '#0d1117', border: '1px solid #30363d', marginBottom: 25, borderRadius: 8 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={12}>
            <Input 
              prefix={<SearchOutlined style={{ color: '#00ff88' }} />} 
              placeholder="Filter cases by title, notes, or entities..." 
              size="large"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ background: '#010409', borderColor: '#30363d', color: '#00ff88' }}
            />
          </Col>
          <Col xs={24} md={12}>
            <Space style={{ width: '100%', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
               <FilterOutlined style={{ color: '#8b949e' }} />
               <Select 
                size="large" 
                placeholder="Priority" 
                allowClear 
                style={{ width: 150 }}
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
                style={{ width: 150 }}
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
          <Col xs={24} sm={12} md={8} key={c._id}>
            <Card
              hoverable
              style={{ background: '#0d1117', border: '1px solid #30363d', height: '100%' }}
              actions={[
                <Button type="primary" ghost icon={<FolderOpenOutlined />} onClick={() => navigate(`/cases/${c._id}`)}>OPEN CASE</Button>
              ]}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Title level={4} style={{ color: '#00ff88', marginTop: 0 }}>{c.title}</Title>
                <Tag color={getPriorityColor(c.priority)}>{c.priority.toUpperCase()}</Tag>
              </div>
              
              <div style={{ marginBottom: 15 }}>
                <Tag color="blue">{c.category}</Tag>
                <Tag color="cyan">{c.status}</Tag>
              </div>
              
              <Text type="secondary" style={{ display: 'block', height: 44, overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 15 }}>
                {c.description}
              </Text>
              
              <div style={{ marginTop: 15, fontSize: '0.85em', color: '#6e7681', borderTop: '1px solid #21262d', paddingTop: 10 }}>
                Created: {new Date(c.createdAt).toLocaleDateString()}
              </div>
            </Card>
          </Col>
        ))}
        {filteredCases.length === 0 && (
          <Col span={24} style={{ textAlign: 'center', padding: '50px 0' }}>
            <FolderOpenOutlined style={{ fontSize: 48, color: '#30363d', marginBottom: 15 }} />
            <br />
            <Text type="secondary" style={{ color: '#8b949e' }}>No investigation cases found. Start a new case to begin.</Text>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default CaseList;

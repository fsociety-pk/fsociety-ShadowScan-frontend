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

  const deleteCase = async (id: string) => {
    try {
      await api.delete(`/cases/${id}`);
      message.success('Case deleted successfully');
      fetchCases();
    } catch (error) {
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
              
              <Text type="secondary" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>
                {c.description}
              </Text>
              
              <div style={{ marginTop: 16, fontSize: '12px', color: 'var(--text-muted)' }}>
                Created: {new Date(c.createdAt).toLocaleDateString()}
              </div>
            </Card>
          </Col>
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

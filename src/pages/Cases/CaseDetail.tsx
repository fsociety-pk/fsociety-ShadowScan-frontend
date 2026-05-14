import React, { useEffect, useState } from 'react';
import { Card, Typography, Descriptions, Tag, Button, Input, message, Spin, Tabs, Table, Empty, Row, Col, Space } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { SaveOutlined, ArrowLeftOutlined, SnippetsOutlined, SearchOutlined, EditOutlined } from '@ant-design/icons';
import api from '../../api/axiosConfig';
import ReportGenerator from '../../components/ReportGenerator';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

interface InvestigationCase {
  _id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  clues: string[];
  toolsSuggested: string[];
  notes: string;
  targetProfile?: {
    name?: string;
    email?: string;
    phone?: string;
    organization?: string;
    location?: string;
    socialMedia?: string;
    additionalNotes?: string;
  };
}

interface Finding {
  _id: string;
  findingType: string;
  source: string;
  email?: string;
  username?: string;
  phone?: string;
  domain?: string;
  confidence: number;
  createdAt: string;
  data: Record<string, any>;
}

const CaseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [investigation, setInvestigation] = useState<InvestigationCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingNotes, setSavingNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [findings, setFindings] = useState<Finding[]>([]);
  const [findingsLoading, setFindingsLoading] = useState(false);

  useEffect(() => {
    fetchCaseData();
  }, [id]);

  const fetchFindings = async () => {
    if (!id) return;
    setFindingsLoading(true);
    try {
      const response = await api.get(`/search/findings/case/${id}`);
      if (response.data.success) {
        setFindings(response.data.findings);
      }
    } catch (error) {
      console.error('Error fetching findings:', error);
    } finally {
      setFindingsLoading(false);
    }
  };

  useEffect(() => {
    if (investigation?._id) {
      fetchFindings();
    }
  }, [investigation?._id]);

  const fetchCaseData = async () => {
    try {
      const response = await api.get(`/cases/${id}`);
      setInvestigation(response.data);
      setNotes(response.data.notes || '');
    } catch (error) {
      message.error('Unauthorized or Case not found');
      navigate('/cases');
    } finally {
      setLoading(false);
    }
  };

  const saveNotes = async () => {
    setSavingNotes(true);
    try {
      await api.put(`/cases/${id}`, { notes });
      message.success('Intelligence notes saved.');
    } catch (error) {
      message.error('Failed to save notes.');
    } finally {
      setSavingNotes(false);
    }
  };

  const getPriorityColor = (prio: string) => {
    if (prio === 'Low') return 'default';
    if (prio === 'Medium') return 'processing';
    if (prio === 'High') return 'warning';
    return 'error';
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: 100 }}><Spin size="large" /></div>;
  if (!investigation) return null;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 60 }}>
      <Button 
        type="text" 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/cases')} 
        style={{ marginBottom: 20, color: 'var(--text-muted)' }}
      >
        Back to Investigations
      </Button>

      <Row gutter={24} align="middle" style={{ marginBottom: 30 }}>
        <Col flex="auto">
          <Title level={2} style={{ margin: 0 }}>{investigation.title}</Title>
          <Space style={{ marginTop: 10 }}>
            <Tag color="blue">{investigation.category}</Tag>
            <Tag color={getPriorityColor(investigation.priority)}>{investigation.priority.toUpperCase()}</Tag>
            <Tag color={investigation.status === 'Active' ? 'success' : 'default'}>{investigation.status.toUpperCase()}</Tag>
          </Space>
        </Col>
        <Col>
          <Space>
            <Button 
              icon={<EditOutlined />} 
              onClick={() => navigate(`/cases/${investigation._id}/edit`)}
              size="large"
            >
              Edit Case
            </Button>
            <ReportGenerator 
              caseId={investigation._id} 
              caseTitle={investigation.title}
              onReportGenerated={fetchFindings}
            />
          </Space>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col xs={24} lg={16}>
          <Card 
            title={<span><SnippetsOutlined /> Objective & Intelligence Briefing</span>} 
            style={{ marginBottom: 24 }}
          >
            <Paragraph style={{ fontSize: '16px', lineHeight: '1.6', color: 'var(--text-main)' }}>
              {investigation.description}
            </Paragraph>
            
            {investigation.clues && investigation.clues.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <Title level={5}>Known Clues & Leads</Title>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {investigation.clues.map((clue, idx) => (
                    <Tag key={idx} style={{ padding: '4px 12px', fontSize: '13px' }}>{clue}</Tag>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <Card style={{ marginBottom: 24 }} bodyStyle={{ padding: 0 }}>
            <Tabs
              defaultActiveKey="findings"
              type="card"
              items={[
                {
                  key: 'findings',
                  label: <span style={{ padding: '0 12px' }}><SearchOutlined /> Findings ({findings.length})</span>,
                  children: (
                    <div style={{ padding: 16 }}>
                      <Spin spinning={findingsLoading}>
                        {findings.length === 0 ? (
                          <Empty 
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description="No findings linked to this case. Use OSINT tools to gather intelligence." 
                          />
                        ) : (
                          <Table
                            columns={[
                              {
                                title: 'Type',
                                dataIndex: 'findingType',
                                key: 'findingType',
                                render: (text) => (
                                  <Tag color="blue">{text.toUpperCase().replace(/_/g, ' ')}</Tag>
                                ),
                              },
                              {
                                title: 'Entity',
                                dataIndex: 'email',
                                key: 'entity',
                                render: (_, record) => (
                                  <Text strong style={{ color: 'var(--text-main)' }}>
                                    {record.email || record.username || record.phone || record.domain || '—'}
                                  </Text>
                                ),
                              },
                              {
                                title: 'Confidence',
                                dataIndex: 'confidence',
                                key: 'confidence',
                                width: 120,
                                render: (confidence) => (
                                  <Tag
                                    color={
                                      confidence >= 80
                                        ? 'success'
                                        : confidence >= 60
                                          ? 'warning'
                                          : 'error'
                                    }
                                  >
                                    {confidence}%
                                  </Tag>
                                ),
                              },
                              {
                                title: 'Date',
                                dataIndex: 'createdAt',
                                key: 'createdAt',
                                width: 120,
                                render: (date) => new Date(date).toLocaleDateString(),
                              },
                            ]}
                            dataSource={findings}
                            rowKey="_id"
                            pagination={{ pageSize: 10 }}
                            size="small"
                          />
                        )}
                      </Spin>
                    </div>
                  ),
                },
                {
                  key: 'notes',
                  label: <span style={{ padding: '0 12px' }}>📝 Intelligence Log</span>,
                  children: (
                    <div style={{ padding: 16 }}>
                      <TextArea 
                        rows={15} 
                        value={notes} 
                        onChange={e => setNotes(e.target.value)}
                        placeholder="Record detailed observations, timestamps, and investigation progress..."
                        style={{ marginBottom: 16, fontSize: '15px' }}
                      />
                      <div style={{ textAlign: 'right' }}>
                        <Button 
                          type="primary" 
                          icon={<SaveOutlined />} 
                          onClick={saveNotes} 
                          loading={savingNotes}
                          size="large"
                        >
                          Save Intelligence Log
                        </Button>
                      </div>
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Target Profile" style={{ marginBottom: 24 }}>
            {investigation.targetProfile ? (
              <Descriptions column={1} size="small" labelStyle={{ color: 'var(--text-muted)' }}>
                <Descriptions.Item label="Name">{investigation.targetProfile.name || 'Unknown'}</Descriptions.Item>
                <Descriptions.Item label="Email">{investigation.targetProfile.email || 'None'}</Descriptions.Item>
                <Descriptions.Item label="Phone">{investigation.targetProfile.phone || 'None'}</Descriptions.Item>
                <Descriptions.Item label="Org">{investigation.targetProfile.organization || 'None'}</Descriptions.Item>
                <Descriptions.Item label="Location">{investigation.targetProfile.location || 'None'}</Descriptions.Item>
                <Descriptions.Item label="Social">{investigation.targetProfile.socialMedia || 'None'}</Descriptions.Item>
              </Descriptions>
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No profile data available." />
            )}
          </Card>

          <Card title="Suggested Toolset">
            {investigation.toolsSuggested && investigation.toolsSuggested.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {investigation.toolsSuggested.map((tool, i) => (
                  <Tag key={i} color="default">{tool}</Tag>
                ))}
              </div>
            ) : (
              <Text type="secondary">No tools suggested for this case.</Text>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CaseDetail;

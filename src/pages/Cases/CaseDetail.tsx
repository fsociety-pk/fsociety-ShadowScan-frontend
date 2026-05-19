import React, { useEffect, useState } from 'react';
import { Card, Typography, Descriptions, Tag, Button, Input, message, Spin, Tabs, Table, Empty, Row, Col, Space } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { SaveOutlined, ArrowLeftOutlined, SnippetsOutlined, SearchOutlined, EditOutlined } from '@ant-design/icons';
import api from '../../api/axiosConfig';
import ReportGenerator from '../../components/ReportGenerator';
import ReactMarkdown from 'react-markdown';

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

interface Report {
  id: string;
  _id?: string;
  title: string;
  content: string;
  template: 'fbi' | 'corporate';
  riskLevel: string;
  findings_count: number;
  generatedAt: string;
  syntheticDataUsed?: boolean;
  visualReport?: {
    target: string;
    summary: string;
    riskLevel: string;
    confidenceScore: number;
    tags: string[];
    entitiesByType: Record<string, string[]>;
    highlightedFindings: string[];
    relationshipGraph: {
      nodes: { id: string; label: string; type: string; color: string }[];
      edges: { source: string; target: string; relation: string; strength: 'weak' | 'medium' | 'strong' }[];
    };
  };
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
  const [reports, setReports] = useState<Report[]>([]);

  const edgeStyle: Record<'weak' | 'medium' | 'strong', { color: string; width: number; opacity: number }> = {
    weak: { color: '#94a3b8', width: 1, opacity: 0.45 },
    medium: { color: '#38bdf8', width: 2, opacity: 0.7 },
    strong: { color: '#8b5cf6', width: 3, opacity: 0.95 },
  };

  const riskColor = (risk: string) => {
    const value = (risk || '').toLowerCase();
    if (value.includes('critical')) return '#ef4444';
    if (value.includes('high')) return '#f97316';
    if (value.includes('medium')) return '#eab308';
    return '#22c55e';
  };

  const tagColorFor = (tag: string) => {
    const value = tag.toLowerCase();
    if (value.includes('critical') || value.includes('high')) return 'red';
    if (value.includes('medium')) return 'gold';
    if (value.includes('low')) return 'green';
    if (value.startsWith('findings:')) return 'purple';
    return 'blue';
  };

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

  const fetchReports = async () => {
    if (!id) return;
    try {
      const response = await api.get(`/reports/case/${id}`);
      if (response.data.success && response.data.reports) {
        setReports(response.data.reports);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  useEffect(() => {
    if (investigation?._id) {
      fetchFindings();
      fetchReports();
    }
  }, [investigation?._id]);

  const fetchCaseData = async () => {
    try {
      const response = await api.get(`/cases/${id}`);
      setInvestigation(response.data);
      setNotes(response.data.notes || '');
    } catch (_error) {
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
    } catch (_error) {
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
              onReportGenerated={() => {
                fetchFindings();
                fetchReports();
              }}
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

          <Card style={{ marginBottom: 24 }} styles={{ body: { padding: 0 } }}>
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
                ...(reports.length > 0 ? [{
                  key: 'report',
                  label: <span style={{ padding: '0 12px' }}>📊 AI Intelligence Report</span>,
                  children: (
                    <div style={{ padding: 16 }}>
                      {reports[0].visualReport ? (
                        <div style={{ color: '#e6edf3' }}>
                          <div style={{ marginBottom: 14, fontSize: 14, color: '#cbd5e1' }}>
                            {reports[0].visualReport.summary}
                          </div>
                          
                          <Row gutter={12} style={{ marginBottom: 12 }}>
                            <Col xs={24} md={8}>
                              <Card size="small" styles={{ body: { background: '#111827' } }}>
                                <div style={{ color: '#94a3b8', fontSize: 11, textTransform: 'uppercase' }}>Risk Level</div>
                                <div style={{ color: riskColor(reports[0].visualReport.riskLevel), fontWeight: 800, fontSize: 20 }}>
                                  {reports[0].visualReport.riskLevel}
                                </div>
                              </Card>
                            </Col>
                            <Col xs={24} md={8}>
                              <Card size="small" styles={{ body: { background: '#111827' } }}>
                                <div style={{ color: '#94a3b8', fontSize: 11, textTransform: 'uppercase' }}>Confidence</div>
                                <div style={{ color: '#38bdf8', fontWeight: 800, fontSize: 20 }}>
                                  {reports[0].visualReport.confidenceScore}%
                                </div>
                              </Card>
                            </Col>
                            <Col xs={24} md={8}>
                              <Card size="small" styles={{ body: { background: '#111827' } }}>
                                <div style={{ color: '#94a3b8', fontSize: 11, textTransform: 'uppercase' }}>Relationship Links</div>
                                <div style={{ color: '#a78bfa', fontWeight: 800, fontSize: 20 }}>
                                  {reports[0].visualReport.relationshipGraph.edges.length}
                                </div>
                              </Card>
                            </Col>
                          </Row>

                          <Space wrap style={{ marginBottom: 16 }}>
                            {reports[0].visualReport.tags.map((tag) => (
                              <Tag key={tag} color={tagColorFor(tag)}>{tag}</Tag>
                            ))}
                          </Space>

                          <Row gutter={12} style={{ marginBottom: 12 }}>
                            {Object.entries(reports[0].visualReport.entitiesByType).map(([type, values]) => (
                              <Col xs={24} md={12} key={type}>
                                <Card size="small" styles={{ body: { background: '#111827' } }}>
                                  <div style={{ color: '#93c5fd', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', fontSize: 11 }}>
                                    {type}
                                  </div>
                                  <Space wrap>
                                    {values.slice(0, 10).map((value) => (
                                      <Tag key={value}>{value}</Tag>
                                    ))}
                                  </Space>
                                </Card>
                              </Col>
                            ))}
                          </Row>

                          <Card size="small" styles={{ body: { background: '#0b1220' } }} style={{ marginBottom: 12 }}>
                            <div style={{ color: '#a5b4fc', fontWeight: 700, marginBottom: 10 }}>Relationship Graph</div>
                            <div style={{ position: 'relative', minHeight: 340, border: '1px solid #1f2937', borderRadius: 10, background: 'radial-gradient(circle at center, #0f172a 0%, #020617 100%)', overflow: 'hidden' }}>
                              {reports[0].visualReport.relationshipGraph.edges.map((edge, idx) => {
                                const sourceIndex = reports[0].visualReport?.relationshipGraph.nodes.findIndex((n) => n.id === edge.source) ?? 0;
                                const targetIndex = reports[0].visualReport?.relationshipGraph.nodes.findIndex((n) => n.id === edge.target) ?? 0;
                                const x1 = sourceIndex === 0 ? 160 : 200 + ((sourceIndex * 133) % 400);
                                const y1 = sourceIndex === 0 ? 170 : 60 + ((sourceIndex * 91) % 240);
                                const x2 = targetIndex === 0 ? 160 : 200 + ((targetIndex * 133) % 400);
                                const y2 = targetIndex === 0 ? 170 : 60 + ((targetIndex * 91) % 240);
                                const style = edgeStyle[edge.strength];
                                return (
                                  <svg key={`${edge.source}-${edge.target}-${idx}`} width="100%" height="340" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                                    <line
                                      x1={x1}
                                      y1={y1}
                                      x2={x2}
                                      y2={y2}
                                      stroke={style.color}
                                      strokeWidth={style.width}
                                      strokeOpacity={style.opacity}
                                      strokeDasharray={edge.strength === 'weak' ? '4,4' : undefined}
                                    />
                                  </svg>
                                );
                              })}

                              {reports[0].visualReport.relationshipGraph.nodes.map((node, idx) => {
                                const isTarget = node.id === 'target';
                                const x = isTarget ? 160 : 200 + ((idx * 133) % 400);
                                const y = isTarget ? 170 : 60 + ((idx * 91) % 240);
                                return (
                                  <div
                                    key={node.id}
                                    style={{
                                      position: 'absolute',
                                      left: x - (isTarget ? 42 : 34),
                                      top: y - 18,
                                      background: isTarget ? 'linear-gradient(135deg, #0ea5e9, #8b5cf6)' : '#0f172a',
                                      color: '#e2e8f0',
                                      border: `1px solid ${node.color}`,
                                      borderRadius: 999,
                                      padding: isTarget ? '6px 14px' : '4px 10px',
                                      fontSize: isTarget ? 12 : 11,
                                      fontWeight: isTarget ? 700 : 600,
                                      boxShadow: isTarget ? '0 0 20px rgba(59,130,246,0.55)' : `0 0 14px ${node.color}55`,
                                      whiteSpace: 'nowrap',
                                      zIndex: 10
                                    }}
                                  >
                                    {node.label}
                                  </div>
                                );
                              })}
                            </div>
                          </Card>

                          <Card size="small" styles={{ body: { background: '#111827' } }} style={{ marginBottom: 12 }}>
                            <div style={{ color: '#fbbf24', fontWeight: 700, marginBottom: 8 }}>Highlighted Findings</div>
                            <ul style={{ margin: 0, paddingLeft: 18, color: '#e5e7eb' }}>
                              {reports[0].visualReport.highlightedFindings.map((item, idx) => (
                                <li key={`${idx}-${item}`} style={{ marginBottom: 6 }}>{item}</li>
                              ))}
                            </ul>
                          </Card>
                          
                          <Card size="small" styles={{ body: { background: '#111827' } }}>
                            <div style={{ color: '#38bdf8', fontWeight: 700, marginBottom: 8 }}>Formatted Report</div>
                            <div style={{ color: '#e6edf3', fontFamily: 'monospace', lineHeight: 1.6, background: '#0d1117', padding: 15, borderRadius: 8 }}>
                              <ReactMarkdown>{reports[0].content}</ReactMarkdown>
                            </div>
                          </Card>
                        </div>
                      ) : (
                        <div style={{ color: '#e6edf3', fontFamily: 'monospace', lineHeight: 1.6, background: '#0d1117', padding: 15, borderRadius: 8 }}>
                          <ReactMarkdown>{reports[0].content}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  )
                }] : []),
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

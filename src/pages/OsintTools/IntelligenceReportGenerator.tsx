import React, { useState } from 'react';
import {
  Card,
  Button,
  Alert,
  Tabs,
  Tag,
  Row,
  Col,
  Statistic,
  Divider,
  Table,
  Badge,
  Progress,
  Empty,
} from 'antd';
import {
  DownloadOutlined,
  PrinterOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  FileTextOutlined,
  GlobalOutlined,
  ApartmentOutlined,
  BulbOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import api from '../../api/axiosConfig';
import { useParams } from 'react-router-dom';

interface Entity {
  type: string;
  value: string;
  platform?: string;
  confidence: number;
}

interface Relationship {
  entity1: string;
  entity2: string;
  type: string;
  strength: number;
  evidence: string[];
}

interface RiskIndicator {
  category: string;
  severity: string;
  description: string;
  evidence: string[];
}

interface IntelligenceReport {
  reportId: string;
  generatedAt: string;
  target: {
    username?: string;
    email?: string;
  };
  executiveSummary: {
    overview: string;
    profileCount: number;
    platformsDiscovered: string[];
    riskLevel: string;
  };
  targetProfile: {
    primaryIdentifiers: Entity[];
    secondaryIdentifiers: Entity[];
    platforms: any[];
  };
  digitalFootprintAnalysis: {
    totalFindings: number;
    platformDistribution: { [key: string]: number };
    exposureRisk: number;
    dataExposureRisks: string[];
  };
  relationshipAnalysis: {
    detectedRelationships: Relationship[];
    connectionStrength: number;
    clusterAnalysis: string[];
  };
  riskAssessment: {
    overallRiskScore: number;
    riskLevel: string;
    indicators: RiskIndicator[];
  };
  keyFindings: any[];
  investigationNotes: string;
  recommendations: string[];
}

const IntelligenceReportGenerator: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const [report, setReport] = useState<IntelligenceReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [scanStatus, setScanStatus] = useState('');

  const generateReport = async () => {
    if (!caseId) {
      setError('Case ID is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (username) {
        setScanStatus('Running Sherlock on username...');
        try {
          await api.post('/kali-tools/sherlock', { username, caseId }, { timeout: 120000 });
        } catch (e) {
          console.warn('Sherlock encountered an error, continuing...', e);
        }
      }

      if (email) {
        setScanStatus('Running TheHarvester on email domain...');
        const domain = email.split('@')[1];
        if (domain) {
          try {
            await api.post('/kali-tools/theharvester', { domain, source: 'google', caseId }, { timeout: 120000 });
          } catch (e) {
            console.warn('TheHarvester encountered an error, continuing...', e);
          }
        }
      }

      setScanStatus('Aggregating findings and generating Intelligence Report...');
      const response = await api.post(
        '/intelligence/generate',
        {
          caseId,
          username,
          email,
          phone,
        }
      );

      if (response.data.success) {
        setReport(response.data.report);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate report');
    } finally {
      setLoading(false);
      setScanStatus('');
    }
  };

  const getRiskColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'high':
        return 'red';
      case 'medium':
        return 'orange';
      case 'low':
        return 'green';
      default:
        return 'default';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'medium':
        return <WarningOutlined style={{ color: '#faad14' }} />;
      case 'low':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      default:
        return null;
    }
  };

  if (!report) {
    return (
      <div style={{ padding: '24px' }}>
        <Card title={<span><ThunderboltOutlined /> Intelligence Auto-Scan Generator</span>} style={{ maxWidth: '800px' }}>
          {error && <Alert message="Error" description={error} type="error" showIcon closable />}

          <div style={{ marginBottom: '16px' }}>
            <p style={{ color: 'var(--text-muted)', fontWeight: 'bold' }}>
              Generate comprehensive OSINT intelligence reports with entity extraction, relationship analysis,
              and risk assessment.
            </p>
          </div>

          <Divider />

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--primary)', fontWeight: 600 }}>
              <UserOutlined /> Target Username (Optional)
            </label>
            <input
              type="text"
              className="ant-input"
              placeholder="Enter username to analyze..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                marginBottom: '16px',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--primary)', fontWeight: 600 }}>
              <MailOutlined /> Target Email (Optional)
            </label>
            <input
              type="email"
              className="ant-input"
              placeholder="Enter email to analyze..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
              }}
            />
          </div>

          {/* Contact number search hidden temporarily as per request 
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--primary)', fontWeight: 600 }}>
              <PhoneOutlined /> Target Contact Number (Optional)
            </label>
            <input
              type="tel"
              placeholder="Enter phone number to analyze..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                color: 'var(--text-main)',
              }}
            />
          </div>
          */}

          <Button
            type="primary"
            size="large"
            loading={loading}
            onClick={generateReport}
            icon={<ThunderboltOutlined />}
            style={{
              width: '100%',
              fontWeight: 'bold',
            }}
          >
            {loading ? (scanStatus || 'Running Auto Scan...') : 'Generate Intelligence Report'}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Report Header */}
      <Card
        style={{
          marginBottom: '24px',
          border: '1.5px solid var(--border-color)',
        }}
      >
        <Row gutter={16} style={{ marginBottom: '16px' }}>
          <Col xs={24} sm={12}>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>
              INTELLIGENCE REPORT
            </h1>
            <p style={{ color: 'var(--cyber-blue)', margin: '0', fontSize: '14px', fontWeight: 600 }}>
              Report ID: {report.reportId}
            </p>
            <p style={{ color: 'var(--text-muted)', margin: '8px 0 0 0', fontSize: '12px' }}>
              Generated: {new Date(report.generatedAt).toLocaleString()}
            </p>
          </Col>
          <Col xs={24} sm={12} style={{ textAlign: 'right' }}>
            <Row gutter={8} justify="end" style={{ marginTop: '8px' }}>
              <Col>
                <Button icon={<ReloadOutlined />} onClick={generateReport} loading={loading}>
                  Regenerate
                </Button>
              </Col>
              <Col>
                <Button icon={<DownloadOutlined />} type="primary">
                  Export JSON
                </Button>
              </Col>
              <Col>
                <Button icon={<PrinterOutlined />}>Print</Button>
              </Col>
            </Row>
          </Col>
        </Row>

        {/* Risk Level Summary */}
        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <div
              style={{
                textAlign: 'center',
                padding: '12px',
                borderRadius: '4px',
                background: '#f8fafc',
                border: `2px solid ${report.riskAssessment.riskLevel === 'High' ? '#ff4d4f' : report.riskAssessment.riskLevel === 'Medium' ? '#faad14' : '#52c41a'}`,
              }}
            >
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 4px 0', fontWeight: 600 }}>Risk Level</p>
              <Tag
                color={getRiskColor(report.riskAssessment.riskLevel)}
                style={{ fontSize: '14px', padding: '4px 12px' }}
              >
                {report.riskAssessment.riskLevel}
              </Tag>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div style={{ textAlign: 'center', padding: '12px' }}>
              <Statistic
                title="Risk Score"
                value={report.riskAssessment.overallRiskScore}
                suffix="/ 100"
                valueStyle={{ color: 'var(--cyber-blue)', fontSize: '20px', fontWeight: 700 }}
                prefix={
                  <div style={{ display: 'inline-block', marginRight: '4px' }}>
                    <Progress
                      type="circle"
                      percent={report.riskAssessment.overallRiskScore}
                      width={40}
                      strokeColor={
                        report.riskAssessment.overallRiskScore >= 70
                          ? '#ff4d4f'
                          : report.riskAssessment.overallRiskScore >= 40
                            ? '#faad14'
                            : '#52c41a'
                      }
                    />
                  </div>
                }
              />
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div style={{ textAlign: 'center', padding: '12px' }}>
              <Statistic
                title="Platforms Discovered"
                value={report.executiveSummary.profileCount}
                valueStyle={{ color: 'var(--cyber-purple)', fontSize: '20px', fontWeight: 700 }}
              />
            </div>
          </Col>
        </Row>
      </Card>

      <Tabs
        defaultActiveKey="1"
        items={[
          {
            key: '1',
            label: <span><FileTextOutlined /> Executive Summary</span>,
            children: (
              <Card>
                <p style={{ lineHeight: '1.8', color: 'var(--text-main)' }}>{report.executiveSummary.overview}</p>
                <Divider />
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <h4 style={{ color: 'var(--cyber-blue)' }}>Platforms Discovered:</h4>
                    <div>
                      {report.executiveSummary.platformsDiscovered.map((platform, idx) => (
                        <Tag key={idx} color="cyan" style={{ marginBottom: '4px' }}>
                          {platform}
                        </Tag>
                      ))}
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <h4 style={{ color: 'var(--cyber-blue)' }}>Statistics:</h4>
                    <p>
                      <strong>Total Findings:</strong> {report.digitalFootprintAnalysis.totalFindings}
                    </p>
                    <p>
                      <strong>Exposure Risk:</strong> {report.digitalFootprintAnalysis.exposureRisk}%
                    </p>
                  </Col>
                </Row>
              </Card>
            ),
          },
          {
            key: '2',
            label: <span><UserOutlined /> Target Profile</span>,
            children: (
              <Card>
                <h3 style={{ color: 'var(--cyber-purple)' }}>Primary Identifiers</h3>
                <Table
                  dataSource={report.targetProfile.primaryIdentifiers}
                  columns={[
                    {
                      title: 'Type',
                      dataIndex: 'type',
                      key: 'type',
                      render: (type) => (
                        <Tag color="blue">{type.toUpperCase()}</Tag>
                      ),
                    },
                    {
                      title: 'Value',
                      dataIndex: 'value',
                      key: 'value',
                    },
                    {
                      title: 'Confidence',
                      dataIndex: 'confidence',
                      key: 'confidence',
                      render: (confidence) => (
                        <Tag color={confidence > 0.9 ? 'green' : 'orange'}>
                          {(confidence * 100).toFixed(0)}%
                        </Tag>
                      ),
                    },
                  ]}
                  pagination={false}
                />

                <Divider />

                <h3 style={{ color: 'var(--cyber-purple)' }}>Secondary Identifiers</h3>
                {report.targetProfile.secondaryIdentifiers.length > 0 ? (
                  <Table
                    dataSource={report.targetProfile.secondaryIdentifiers}
                    columns={[
                      {
                        title: 'Type',
                        dataIndex: 'type',
                        key: 'type',
                        render: (type) => (
                          <Tag color="blue">{type.toUpperCase()}</Tag>
                        ),
                      },
                      {
                        title: 'Value',
                        dataIndex: 'value',
                        key: 'value',
                      },
                      {
                        title: 'Confidence',
                        dataIndex: 'confidence',
                        key: 'confidence',
                        render: (confidence) => (
                          <Tag color={confidence > 0.9 ? 'green' : 'orange'}>
                            {(confidence * 100).toFixed(0)}%
                          </Tag>
                        ),
                      },
                    ]}
                    pagination={false}
                  />
                ) : (
                  <Empty description="No secondary identifiers found" />
                )}
              </Card>
            ),
          },
          {
            key: '3',
            label: <span><GlobalOutlined /> Digital Footprint</span>,
            children: (
              <Card>
                <h3 style={{ color: 'var(--cyber-blue)', marginBottom: '16px' }}>Platform Distribution</h3>
                <Table
                  dataSource={Object.entries(report.digitalFootprintAnalysis.platformDistribution).map(
                    ([platform, count], idx) => ({
                      key: idx,
                      platform,
                      count,
                    })
                  )}
                  columns={[
                    {
                      title: 'Platform',
                      dataIndex: 'platform',
                      key: 'platform',
                    },
                    {
                      title: 'Findings',
                      dataIndex: 'count',
                      key: 'count',
                      render: (count) => <Badge count={count} style={{ backgroundColor: 'var(--cyber-blue)' }} />,
                    },
                  ]}
                  pagination={false}
                />

                <Divider />

                <h3 style={{ color: 'var(--cyber-blue)', marginBottom: '16px' }}>Data Exposure Risks</h3>
                {report.digitalFootprintAnalysis.dataExposureRisks.map((risk, idx) => (
                  <Alert
                    key={idx}
                    message={risk}
                    type="warning"
                    showIcon
                    style={{ marginBottom: '8px' }}
                  />
                ))}

                <Divider />

                <h3 style={{ color: 'var(--cyber-blue)', marginBottom: '16px' }}>Exposure Risk Score</h3>
                <Progress
                  percent={report.digitalFootprintAnalysis.exposureRisk}
                  format={(percent) => `${percent}%`}
                  strokeColor={
                    report.digitalFootprintAnalysis.exposureRisk > 70
                      ? '#ff4d4f'
                      : report.digitalFootprintAnalysis.exposureRisk > 40
                        ? '#faad14'
                        : '#52c41a'
                  }
                />
              </Card>
            ),
          },
          {
            key: '4',
            label: <span><ApartmentOutlined /> Relationships</span>,
            children: (
              <Card>
                {report.relationshipAnalysis.detectedRelationships.length > 0 ? (
                  <>
                    <p style={{ color: 'var(--cyber-blue)', marginBottom: '16px' }}>
                      <strong>Connection Strength:</strong>{' '}
                      {(report.relationshipAnalysis.connectionStrength * 100).toFixed(1)}%
                    </p>

                    <Table
                      dataSource={report.relationshipAnalysis.detectedRelationships}
                      columns={[
                        {
                          title: 'Entity 1',
                          dataIndex: 'entity1',
                          key: 'entity1',
                          render: (entity) => <Tag color="cyan">{entity}</Tag>,
                        },
                        {
                          title: 'Relationship',
                          dataIndex: 'type',
                          key: 'type',
                          render: (type) => <Tag color="magenta">{type}</Tag>,
                        },
                        {
                          title: 'Entity 2',
                          dataIndex: 'entity2',
                          key: 'entity2',
                          render: (entity) => <Tag color="cyan">{entity}</Tag>,
                        },
                        {
                          title: 'Strength',
                          dataIndex: 'strength',
                          key: 'strength',
                          render: (strength) => (
                            <Progress
                              type="circle"
                              percent={strength * 100}
                              width={40}
                              format={(percent) => `${percent}%`}
                            />
                          ),
                        },
                      ]}
                      expandable={{
                        expandedRowRender: (record) => (
                          <div>
                            <h4 style={{ color: 'var(--cyber-blue)' }}>Evidence:</h4>
                            {record.evidence.map((ev, idx) => (
                              <p key={idx}>• {ev}</p>
                            ))}
                          </div>
                        ),
                      }}
                      pagination={false}
                    />

                    {report.relationshipAnalysis.clusterAnalysis.length > 0 && (
                      <>
                        <Divider />
                        <h3 style={{ color: 'var(--cyber-blue)' }}>Cluster Analysis</h3>
                        {report.relationshipAnalysis.clusterAnalysis.map((cluster, idx) => (
                          <Alert key={idx} message={cluster} type="info" showIcon style={{ marginBottom: '8px' }} />
                        ))}
                      </>
                    )}
                  </>
                ) : (
                  <Empty description="No relationships detected" />
                )}
              </Card>
            ),
          },
          {
            key: '5',
            label: <span><WarningOutlined /> Risk Assessment</span>,
            children: (
              <Card>
                {report.riskAssessment.indicators.map((indicator, idx) => (
                  <Card
                    key={idx}
                    style={{
                      marginBottom: '16px',
                      borderLeft: `4px solid ${indicator.severity === 'High' ? '#ff4d4f' : indicator.severity === 'Medium' ? '#faad14' : '#52c41a'}`,
                    }}
                  >
                    <Row gutter={16}>
                      <Col xs={24} sm={2}>
                        {getSeverityIcon(indicator.severity)}
                      </Col>
                      <Col xs={24} sm={22}>
                        <h4 style={{ color: 'var(--cyber-blue)', marginTop: '0' }}>{indicator.category}</h4>
                        <p style={{ marginBottom: '8px' }}>{indicator.description}</p>
                        <div style={{ marginTop: '8px' }}>
                          {indicator.evidence.map((ev, eIdx) => (
                            <Tag key={eIdx} color="red" style={{ marginRight: '4px', marginBottom: '4px' }}>
                              {ev}
                            </Tag>
                          ))}
                        </div>
                      </Col>
                    </Row>
                  </Card>
                ))}
              </Card>
            ),
          },
          {
            key: '6',
            label: <span><BulbOutlined /> Key Findings</span>,
            children: (
              <Card>
                {report.keyFindings.map((finding, idx) => (
                  <Card
                    key={idx}
                    style={{
                      marginBottom: '16px',
                      background: '#f8fafc',
                      borderLeft: '4px solid var(--cyber-blue)',
                    }}
                  >
                    <Row gutter={16} align="middle">
                      <Col xs={24} sm={2}>
                        <CheckCircleOutlined style={{ fontSize: '20px', color: 'var(--cyber-blue)' }} />
                      </Col>
                      <Col xs={24} sm={22}>
                        <h4 style={{ color: 'var(--cyber-blue)', marginTop: '0' }}>{finding.finding}</h4>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>
                          Confidence: <Tag color="green">{(finding.confidence * 100).toFixed(0)}%</Tag>
                        </p>
                        <div style={{ marginTop: '8px' }}>
                          {finding.evidence && finding.evidence.length > 0 && (
                            <>
                              <strong>Evidence:</strong>
                              <ul style={{ marginTop: '4px', paddingLeft: '20px' }}>
                                {finding.evidence.map((ev: string, eIdx: number) => (
                                  <li key={eIdx} style={{ color: 'var(--text-main)' }}>
                                    {ev}
                                  </li>
                                ))}
                              </ul>
                            </>
                          )}
                        </div>
                      </Col>
                    </Row>
                  </Card>
                ))}
              </Card>
            ),
          },
          {
            key: '7',
            label: <span><CheckCircleOutlined /> Recommendations</span>,
            children: (
              <Card>
                <h3 style={{ color: 'var(--cyber-blue)', marginBottom: '16px' }}>Investigation Recommendations</h3>
                <p style={{ whiteSpace: 'pre-wrap', color: 'var(--text-main)', lineHeight: '1.8' }}>
                  {report.investigationNotes}
                </p>

                <Divider />

                <h3 style={{ color: 'var(--cyber-blue)', marginBottom: '16px' }}>Recommended Actions</h3>
                <ol style={{ paddingLeft: '20px' }}>
                  {report.recommendations.map((rec, idx) => (
                    <li key={idx} style={{ marginBottom: '12px', color: 'var(--text-main)', lineHeight: '1.6' }}>
                      {rec}
                    </li>
                  ))}
                </ol>
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
};

export default IntelligenceReportGenerator;

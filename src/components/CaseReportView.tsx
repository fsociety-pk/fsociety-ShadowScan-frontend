import React from 'react';
import { Alert, Button, Card, Col, Divider, Row, Space, Tag, Timeline, Typography } from 'antd';
import { CopyOutlined, DownloadOutlined, FileTextOutlined, RadarChartOutlined, SafetyOutlined, UserOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';

const { Paragraph, Text, Title } = Typography;

export interface CaseReportVisual {
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
}

export interface CaseReport {
  id: string;
  title: string;
  content: string;
  template: 'fbi' | 'corporate';
  riskLevel: string;
  findings_count: number;
  generatedAt: string;
  syntheticDataUsed?: boolean;
  visualReport?: CaseReportVisual;
}

interface CaseReportViewProps {
  report: CaseReport;
  caseTitle: string;
  onDownloadPdf?: () => void;
  onCopyText?: () => void;
  copiedToClipboard?: boolean;
}

const riskColor = (risk: string) => {
  const value = (risk || '').toLowerCase();
  if (value.includes('critical')) return '#dc2626';
  if (value.includes('high')) return '#ea580c';
  if (value.includes('medium')) return '#ca8a04';
  return '#16a34a';
};

const tagColorFor = (tag: string) => {
  const value = tag.toLowerCase();
  if (value.includes('critical') || value.includes('high')) return 'red';
  if (value.includes('medium')) return 'gold';
  if (value.includes('low')) return 'green';
  if (value.startsWith('findings:')) return 'blue';
  return 'geekblue';
};

const CaseReportView: React.FC<CaseReportViewProps> = ({
  report,
  caseTitle,
  onDownloadPdf,
  onCopyText,
  copiedToClipboard = false,
}) => {
  const visual = report.visualReport;
  const entityGroups = visual ? Object.entries(visual.entitiesByType) : [];
  const highlightedFindings = visual?.highlightedFindings || [];

  return (
    <div style={{ background: '#ffffff', borderRadius: 20, padding: 0, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
      <Card
        bordered={false}
        style={{
          borderRadius: 0,
          overflow: 'hidden',
          background: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
          marginBottom: 0,
        }}
        styles={{ body: { padding: '30px 32px 26px' } }}
      >
        <Row gutter={[16, 16]} align="middle" justify="space-between">
          <Col xs={24} lg={16}>
            <Space direction="vertical" size={8}>
              <Tag color="blue" style={{ width: 'fit-content', borderRadius: 999, padding: '4px 12px', fontWeight: 700 }}>
                CASE DOSSIER
              </Tag>
              <Title level={2} style={{ color: '#0f172a', margin: 0 }}>
                {report.title || caseTitle}
              </Title>
              <Paragraph style={{ color: '#475569', marginBottom: 0, maxWidth: 760, fontSize: 15, lineHeight: 1.75 }}>
                {visual?.summary || 'Structured intelligence summary generated from the case findings and profile data.'}
              </Paragraph>
            </Space>
          </Col>
          <Col xs={24} lg={8}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
              <Tag color={report.riskLevel.toLowerCase().includes('critical') ? 'red' : report.riskLevel.toLowerCase().includes('high') ? 'volcano' : report.riskLevel.toLowerCase().includes('medium') ? 'gold' : 'green'} style={{ fontSize: 12, padding: '5px 12px', borderRadius: 999 }}>
                {report.riskLevel.toUpperCase()} RISK
              </Tag>
              <Text style={{ color: '#64748b', fontSize: 12 }}>
                <FileTextOutlined style={{ marginRight: 6 }} /> Generated {new Date(report.generatedAt).toLocaleString()}
              </Text>
              <Space wrap style={{ justifyContent: 'flex-end' }}>
                {onDownloadPdf && (
                  <Button type="primary" icon={<DownloadOutlined />} onClick={onDownloadPdf} style={{ borderRadius: 10, fontWeight: 700, boxShadow: '0 10px 20px rgba(14, 165, 233, 0.18)' }}>
                    Download PDF
                  </Button>
                )}
                {onCopyText && (
                  <Button icon={<CopyOutlined />} onClick={onCopyText} style={{ borderRadius: 10, fontWeight: 600 }}>
                    {copiedToClipboard ? 'Copied' : 'Copy Report'}
                  </Button>
                )}
              </Space>
            </div>
          </Col>
        </Row>
      </Card>

      {report.syntheticDataUsed && (
        <Alert
          type="info"
          showIcon
          style={{ margin: 20, borderRadius: 14 }}
          message="Structured report generated from case dossier data"
          description="No linked findings were stored, so the report engine used the raw findings, clues, and profile fields already attached to this case."
        />
      )}

      <div style={{ padding: '20px 20px 0' }}>
        <Row gutter={[16, 16]} style={{ marginBottom: 18 }}>
        {[
          { label: 'Risk Confidence', value: `${visual?.confidenceScore ?? 0}%`, color: riskColor(visual?.riskLevel || report.riskLevel) },
          { label: 'Findings', value: String(report.findings_count), color: '#0ea5e9' },
          { label: 'Entity Groups', value: String(entityGroups.length), color: '#7c3aed' },
          { label: 'Highlights', value: String(highlightedFindings.length), color: '#16a34a' },
        ].map((stat) => (
          <Col xs={24} sm={12} lg={6} key={stat.label}>
            <Card bordered style={{ borderRadius: 16, borderColor: '#e5e7eb', boxShadow: '0 8px 20px rgba(15, 23, 42, 0.04)' }}>
              <Text style={{ display: 'block', fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: '#64748b' }}>
                {stat.label}
              </Text>
              <div style={{ fontSize: 26, fontWeight: 800, color: stat.color, marginTop: 6 }}>{stat.value}</div>
            </Card>
          </Col>
        ))}
        </Row>

        <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card
            title={<span><UserOutlined style={{ marginRight: 8, color: '#0ea5e9' }} />Identity Summary</span>}
            bordered
            style={{ borderRadius: 16, marginBottom: 16, borderColor: '#e5e7eb', boxShadow: '0 8px 20px rgba(15, 23, 42, 0.04)' }}
          >
            <Row gutter={[12, 12]}>
              {entityGroups.length > 0 ? entityGroups.map(([type, values]) => (
                <Col xs={24} md={12} key={type}>
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: 14, padding: 14, background: '#f8fbff', minHeight: 108 }}>
                    <Text style={{ display: 'block', fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: '#64748b', marginBottom: 8 }}>
                      {type}
                    </Text>
                    <Space wrap>
                      {values.slice(0, 10).map((value) => (
                        <Tag key={value} color={tagColorFor(type)} style={{ margin: 0, borderRadius: 999, padding: '3px 10px' }}>
                          {value}
                        </Tag>
                      ))}
                    </Space>
                  </div>
                </Col>
              )) : (
                <Col span={24}>
                  <Text style={{ color: '#64748b' }}>No structured entities were extracted from this case.</Text>
                </Col>
              )}
            </Row>
          </Card>

          <Card
            title={<span><RadarChartOutlined style={{ marginRight: 8, color: '#7c3aed' }} />Relationship Overview</span>}
            bordered
            style={{ borderRadius: 16, marginBottom: 16, borderColor: '#e5e7eb', boxShadow: '0 8px 20px rgba(15, 23, 42, 0.04)' }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              {visual?.tags?.map((tag) => (
                <Tag key={tag} color={tagColorFor(tag)} style={{ borderRadius: 999, padding: '4px 12px', margin: 0 }}>
                  {tag}
                </Tag>
              ))}
            </div>
            <Divider style={{ margin: '12px 0' }} />
            {visual?.relationshipGraph.edges.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {visual.relationshipGraph.edges.slice(0, 10).map((edge, index) => {
                  const source = visual.relationshipGraph.nodes.find((node) => node.id === edge.source)?.label || edge.source;
                  const target = visual.relationshipGraph.nodes.find((node) => node.id === edge.target)?.label || edge.target;
                  return (
                    <div key={`${edge.source}-${edge.target}-${index}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 12, background: '#ffffff' }}>
                      <Tag color={edge.strength === 'strong' ? 'red' : edge.strength === 'medium' ? 'blue' : 'default'} style={{ margin: 0 }}>
                        {edge.strength.toUpperCase()}
                      </Tag>
                      <Text style={{ color: '#0f172a', fontWeight: 600 }}>{source}</Text>
                      <Text style={{ color: '#64748b' }}>→</Text>
                      <Text style={{ color: '#0f172a', fontWeight: 600 }}>{target}</Text>
                      <Text style={{ marginLeft: 'auto', color: '#64748b' }}>{edge.relation}</Text>
                    </div>
                  );
                })}
              </div>
            ) : (
              <Text style={{ color: '#64748b' }}>No confirmed relationship links were detected.</Text>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card
            title={<span><SafetyOutlined style={{ marginRight: 8, color: '#16a34a' }} />Key Findings</span>}
            bordered
            style={{ borderRadius: 16, marginBottom: 16, borderColor: '#e5e7eb', boxShadow: '0 8px 20px rgba(15, 23, 42, 0.04)' }}
          >
            <Timeline
              items={highlightedFindings.length > 0 ? highlightedFindings.map((finding, index) => ({
                children: <Text style={{ color: '#0f172a' }}>{finding}</Text>,
                color: index % 3 === 0 ? 'blue' : index % 3 === 1 ? 'green' : 'gold',
              })) : [
                { children: <Text style={{ color: '#64748b' }}>No highlighted findings available.</Text> },
              ]}
            />
          </Card>

          <Card
            title={<span><FileTextOutlined style={{ marginRight: 8, color: '#0ea5e9' }} />Narrative Brief</span>}
            bordered
            style={{ borderRadius: 16, borderColor: '#e5e7eb', boxShadow: '0 8px 20px rgba(15, 23, 42, 0.04)' }}
          >
            <div style={{ color: '#0f172a', lineHeight: 1.8 }}>
              <ReactMarkdown>{report.content}</ReactMarkdown>
            </div>
          </Card>
        </Col>
        </Row>
      </div>
    </div>
  );
};

export default CaseReportView;
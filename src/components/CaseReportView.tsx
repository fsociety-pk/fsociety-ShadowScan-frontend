import React from 'react';
import { Alert, Button, Card, Col, Divider, Row, Space, Tag, Timeline, Typography } from 'antd';
import { CopyOutlined, DownloadOutlined, FileTextOutlined, RadarChartOutlined, SafetyOutlined, UserOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import { MailOutlined, PhoneOutlined, GlobalOutlined, CompassOutlined, SafetyCertificateOutlined, LinkOutlined, ApiOutlined } from '@ant-design/icons';

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

  const getEntityIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('email')) return <MailOutlined style={{ color: '#0ea5e9', fontSize: 20 }} />;
    if (t.includes('phone') || t.includes('number') || t.includes('contact')) return <PhoneOutlined style={{ color: '#10b981', fontSize: 20 }} />;
    if (t.includes('social') || t.includes('account') || t.includes('username') || t.includes('telegram') || t.includes('discord')) return <GlobalOutlined style={{ color: '#8b5cf6', fontSize: 20 }} />;
    if (t.includes('location')) return <CompassOutlined style={{ color: '#f59e0b', fontSize: 20 }} />;
    if (t.includes('name') || t.includes('friend') || t.includes('associate')) return <UserOutlined style={{ color: '#ec4899', fontSize: 20 }} />;
    return <SafetyCertificateOutlined style={{ color: '#64748b', fontSize: 20 }} />;
  };

  const getEntityTheme = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('email')) return { bg: '#f0f9ff', border: '#bae6fd', color: '#0ea5e9' };
    if (t.includes('phone') || t.includes('number') || t.includes('contact')) return { bg: '#f0fdf4', border: '#bbf7d0', color: '#10b981' };
    if (t.includes('social') || t.includes('account') || t.includes('username') || t.includes('telegram') || t.includes('discord')) return { bg: '#f5f3ff', border: '#ddd6fe', color: '#8b5cf6' };
    if (t.includes('location')) return { bg: '#fffbeb', border: '#fde68a', color: '#f59e0b' };
    if (t.includes('name') || t.includes('friend') || t.includes('associate')) return { bg: '#fdf2f8', border: '#fbcfe8', color: '#ec4899' };
    return { bg: '#f8fafc', border: '#e2e8f0', color: '#64748b' };
  };

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
          <Title level={4} style={{ color: '#0f172a', marginBottom: 16 }}>
            <SafetyOutlined style={{ color: '#0ea5e9', marginRight: 8 }} />
            Entity Extraction Matrix
          </Title>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            {entityGroups.length > 0 ? entityGroups.map(([type, values]) => {
              const theme = getEntityTheme(type);
              return (
                <Col xs={24} md={12} key={type}>
                  <Card
                    bordered={false}
                    style={{
                      background: theme.bg,
                      border: `1px solid ${theme.border}`,
                      borderRadius: 16,
                      height: '100%',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
                    }}
                    styles={{ body: { padding: 20 } }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                      <div style={{ background: '#ffffff', width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        {getEntityIcon(type)}
                      </div>
                      <Text style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: theme.color }}>
                        {type.replace(/_/g, ' ')}
                      </Text>
                    </div>
                    <Space direction="vertical" style={{ width: '100%' }} size={8}>
                      {values.map((value) => (
                        <div key={value} style={{ background: '#ffffff', border: `1px solid ${theme.border}`, padding: '8px 12px', borderRadius: 8, fontSize: 14, color: '#1e293b', wordBreak: 'break-all', fontWeight: 500 }}>
                          {value}
                        </div>
                      ))}
                    </Space>
                  </Card>
                </Col>
              );
            }) : (
              <Col span={24}>
                <Card style={{ borderRadius: 16, textAlign: 'center', padding: 30, border: '1px dashed #cbd5e1' }}>
                  <Text style={{ color: '#64748b' }}>No structured entities were extracted from this case.</Text>
                </Card>
              </Col>
            )}
          </Row>

          <Card
            title={<span><ApiOutlined style={{ marginRight: 8, color: '#7c3aed' }} />Relationship Matrix Graph</span>}
            bordered
            style={{ borderRadius: 16, marginBottom: 16, borderColor: '#e5e7eb', boxShadow: '0 8px 20px rgba(15, 23, 42, 0.04)' }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {visual?.tags?.map((tag) => (
                <Tag key={tag} color={tagColorFor(tag)} style={{ borderRadius: 6, padding: '4px 12px', margin: 0, fontWeight: 600 }}>
                  {tag.toUpperCase()}
                </Tag>
              ))}
            </div>
            {visual?.relationshipGraph.edges.length ? (
              <div style={{ background: '#0f172a', padding: 24, borderRadius: 16, position: 'relative', overflow: 'hidden' }}>
                {/* Cyberpunk grid background */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.05, backgroundImage: 'linear-gradient(#38bdf8 1px, transparent 1px), linear-gradient(90deg, #38bdf8 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'relative', zIndex: 1 }}>
                  {visual.relationshipGraph.edges.map((edge, index) => {
                    const source = visual.relationshipGraph.nodes.find((node) => node.id === edge.source)?.label || edge.source;
                    const target = visual.relationshipGraph.nodes.find((node) => node.id === edge.target)?.label || edge.target;
                    
                    const strColor = edge.strength === 'strong' ? '#ef4444' : edge.strength === 'medium' ? '#3b82f6' : '#64748b';
                    
                    return (
                      <div key={`${edge.source}-${edge.target}-${index}`} style={{ display: 'flex', alignItems: 'stretch' }}>
                        <div style={{ width: 140, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 14px', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                          <Text style={{ color: '#e2e8f0', fontWeight: 600, fontSize: 13, wordBreak: 'break-word' }}>{source}</Text>
                        </div>
                        
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '0 10px' }}>
                          <div style={{ color: strColor, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>
                            {edge.relation}
                          </div>
                          <div style={{ width: '100%', height: 2, background: `linear-gradient(90deg, rgba(255,255,255,0) 0%, ${strColor} 50%, rgba(255,255,255,0) 100%)`, position: 'relative' }}>
                            <div style={{ position: 'absolute', right: '25%', top: -4, width: 0, height: 0, borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderLeft: `6px solid ${strColor}` }} />
                          </div>
                          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, marginTop: 4, fontFamily: 'monospace' }}>
                            STRENGTH: {edge.strength.toUpperCase()}
                          </div>
                        </div>

                        <div style={{ width: 140, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 14px', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                          <Text style={{ color: '#e2e8f0', fontWeight: 600, fontSize: 13, wordBreak: 'break-word' }}>{target}</Text>
                        </div>
                      </div>
                    );
                  })}
                </div>
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
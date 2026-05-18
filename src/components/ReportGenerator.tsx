/**
 * ReportGenerator — Modal component for generating AI-powered OSINT case reports.
 * Supports FBI and Corporate report templates. Fetches report from the backend,
 * then offers PDF download and clipboard copy actions.
 */
import React, { useState } from 'react';
import { Modal, Button, Select, message, Spin, Space, Tabs, Divider, Tooltip, Tag, Row, Col, Card, Alert } from 'antd';
import { FileTextOutlined, DownloadOutlined, CopyOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import api from '../api/axiosConfig';

interface ReportGeneratorProps {
  caseId: string;
  caseTitle: string;
  onReportGenerated?: () => void;
}

interface Report {
  id: string;
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

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ caseId, caseTitle, onReportGenerated }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [template, setTemplate] = useState<'fbi' | 'corporate'>('corporate');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  /** Calls the backend report generation endpoint with the selected template. */
  const generateReport = async () => {
    if (!caseId) {
      message.error('Case ID is required');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/reports/generate', { caseId, template });
      if (response.data.success) {
        setReport(response.data.report);
        message.success(`${template.toUpperCase()} report generated successfully!`);
        if (onReportGenerated) onReportGenerated();
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string; error?: string } } };
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to generate report. Ensure you have findings and an API key configured.';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  /** Downloads the generated report as a PDF blob from the backend. */
  const downloadPDF = async () => {
    if (!report?.id) return;
    try {
      const response = await api.get(`/reports/${report.id}/export/pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${caseTitle}-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      message.success('Report downloaded as PDF!');
    } catch {
      message.error('Failed to download PDF');
    }
  };

  /** Copies the raw markdown content to the system clipboard. */
  const copyToClipboard = () => {
    if (!report?.content) return;
    navigator.clipboard.writeText(report.content);
    setCopiedToClipboard(true);
    message.success('Report copied to clipboard!');
    setTimeout(() => setCopiedToClipboard(false), 2000);
  };

  return (
    <>
      <Tooltip title="Generate AI-powered professional report from findings">
        <Button
          type="primary"
          icon={<FileTextOutlined />}
          onClick={() => setIsModalOpen(true)}
          style={{ marginRight: 10 }}
        >
          GENERATE REPORT
        </Button>
      </Tooltip>

      <Modal
        title={`[REPORT GENERATION ENGINE] - ${caseTitle}`}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setReport(null);
        }}
        footer={null}
        width={900}
        style={{ backgroundColor: '#0d1117' }}
        styles={{ body: { backgroundColor: '#f8fafc', color: 'var(--text-main)' } }}
      >
        {!report ? (
          <div>
            {/* Template selector */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ color: 'var(--cyber-blue)', fontWeight: 'bold' }}>Select Report Template:</label>
              <Select
                value={template}
                onChange={value => setTemplate(value)}
                options={[
                  { label: 'Law Enforcement / FBI Style', value: 'fbi' },
                  { label: 'Corporate Intelligence Report', value: 'corporate' },
                ]}
                style={{ width: '100%', marginTop: 10 }}
              />
              <p style={{ fontSize: 12, color: '#8b949e', marginTop: 10 }}>
                • <strong>FBI Style:</strong> Formal law enforcement format with structured sections
                <br />
                • <strong>Corporate:</strong> Business intelligence format with risk assessment
              </p>
            </div>

            <Divider style={{ borderColor: 'var(--border-color)' }} />

            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <Button
                type="primary"
                size="large"
                onClick={generateReport}
                loading={loading}
                disabled={loading}
                style={{ minWidth: 200 }}
              >
                {loading ? 'GENERATING REPORT...' : 'GENERATE REPORT'}
              </Button>
            </div>

            {loading && (
              <div style={{ textAlign: 'center', marginTop: 20 }}>
                <Spin tip="Analyzing findings and generating report..." />
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Action buttons */}
            <Space style={{ marginBottom: 20 }}>
              <Button type="primary" icon={<DownloadOutlined />} onClick={downloadPDF}>
                Download PDF
              </Button>
              <Button
                icon={<CopyOutlined />}
                onClick={copyToClipboard}
                type={copiedToClipboard ? 'primary' : 'default'}
              >
                {copiedToClipboard ? 'Copied!' : 'Copy Text'}
              </Button>
            </Space>

            {report.syntheticDataUsed && (
              <Alert
                type="info"
                title="Report generated from case dossier data"
                description="No linked findings were saved for this case, so the report engine used your raw findings, clues, and profile fields."
                style={{ marginBottom: 16 }}
              />
            )}

            {/* Report viewer — formatted and raw tabs */}
            <div style={{
              backgroundColor: '#0d1117',
              borderRadius: 6,
              padding: 20,
              maxHeight: '60vh',
              overflowY: 'auto',
            }}>
              <Tabs
                items={[
                  ...(report.visualReport
                    ? [
                        {
                          key: 'visual',
                          label: 'Visual Intelligence',
                          children: (
                            <div style={{ color: '#e6edf3' }}>
                              <div style={{ marginBottom: 14, fontSize: 14, color: '#cbd5e1' }}>
                                {report.visualReport.summary}
                              </div>

                              <Row gutter={12} style={{ marginBottom: 12 }}>
                                <Col xs={24} md={8}>
                                  <Card size="small" styles={{ body: { background: '#111827' } }}>
                                    <div style={{ color: '#94a3b8', fontSize: 11, textTransform: 'uppercase' }}>Risk Level</div>
                                    <div style={{ color: riskColor(report.visualReport.riskLevel), fontWeight: 800, fontSize: 20 }}>
                                      {report.visualReport.riskLevel}
                                    </div>
                                  </Card>
                                </Col>
                                <Col xs={24} md={8}>
                                  <Card size="small" styles={{ body: { background: '#111827' } }}>
                                    <div style={{ color: '#94a3b8', fontSize: 11, textTransform: 'uppercase' }}>Confidence</div>
                                    <div style={{ color: '#38bdf8', fontWeight: 800, fontSize: 20 }}>
                                      {report.visualReport.confidenceScore}%
                                    </div>
                                  </Card>
                                </Col>
                                <Col xs={24} md={8}>
                                  <Card size="small" styles={{ body: { background: '#111827' } }}>
                                    <div style={{ color: '#94a3b8', fontSize: 11, textTransform: 'uppercase' }}>Relationship Links</div>
                                    <div style={{ color: '#a78bfa', fontWeight: 800, fontSize: 20 }}>
                                      {report.visualReport.relationshipGraph.edges.length}
                                    </div>
                                  </Card>
                                </Col>
                              </Row>

                              <Space wrap style={{ marginBottom: 16 }}>
                                {report.visualReport.tags.map((tag) => (
                                  <Tag key={tag} color={tagColorFor(tag)}>{tag}</Tag>
                                ))}
                              </Space>

                              <Row gutter={12} style={{ marginBottom: 12 }}>
                                {Object.entries(report.visualReport.entitiesByType).map(([type, values]) => (
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
                                <div style={{ position: 'relative', minHeight: 240, border: '1px solid #1f2937', borderRadius: 10, background: 'radial-gradient(circle at center, #0f172a 0%, #020617 100%)' }}>
                                  {report.visualReport.relationshipGraph.edges.map((edge, idx) => {
                                    const sourceIndex = report.visualReport?.relationshipGraph.nodes.findIndex((n) => n.id === edge.source) ?? 0;
                                    const targetIndex = report.visualReport?.relationshipGraph.nodes.findIndex((n) => n.id === edge.target) ?? 0;
                                    const x1 = sourceIndex === 0 ? 120 : 180 + ((sourceIndex * 103) % 520);
                                    const y1 = sourceIndex === 0 ? 120 : 40 + ((sourceIndex * 71) % 170);
                                    const x2 = targetIndex === 0 ? 120 : 180 + ((targetIndex * 103) % 520);
                                    const y2 = targetIndex === 0 ? 120 : 40 + ((targetIndex * 71) % 170);
                                    const style = edgeStyle[edge.strength];
                                    return (
                                      <svg key={`${edge.source}-${edge.target}-${idx}`} width="100%" height="240" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
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

                                  {report.visualReport.relationshipGraph.nodes.map((node, idx) => {
                                    const isTarget = node.id === 'target';
                                    const x = isTarget ? 120 : 180 + ((idx * 103) % 520);
                                    const y = isTarget ? 120 : 40 + ((idx * 71) % 170);
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
                                          animation: `pulseNode ${isTarget ? 2 : 2.8}s ease-in-out infinite`,
                                          whiteSpace: 'nowrap',
                                        }}
                                      >
                                        {node.label}
                                      </div>
                                    );
                                  })}
                                </div>
                              </Card>

                              <Card size="small" styles={{ body: { background: '#111827' } }}>
                                <div style={{ color: '#fbbf24', fontWeight: 700, marginBottom: 8 }}>Highlighted Findings</div>
                                <ul style={{ margin: 0, paddingLeft: 18, color: '#e5e7eb' }}>
                                  {report.visualReport.highlightedFindings.map((item, idx) => (
                                    <li key={`${idx}-${item}`} style={{ marginBottom: 6 }}>{item}</li>
                                  ))}
                                </ul>
                              </Card>
                            </div>
                          ),
                        },
                      ]
                    : []),
                  {
                    key: 'rendered',
                    label: 'Formatted Report',
                    children: (
                      <div style={{ color: '#e6edf3', fontFamily: 'monospace', lineHeight: 1.6 }}>
                        <ReactMarkdown>{report.content}</ReactMarkdown>
                      </div>
                    ),
                  },
                  {
                    key: 'raw',
                    label: 'Raw Markdown',
                    children: (
                      <pre style={{
                        backgroundColor: '#f8fafc',
                        padding: 15,
                        borderRadius: 4,
                        overflowX: 'auto',
                        color: 'var(--cyber-blue)',
                        fontSize: 12,
                      }}>
                        {report.content}
                      </pre>
                    ),
                  },
                ]}
              />
            </div>

            <Divider style={{ borderColor: 'var(--border-color)' }} />

            {/* Report metadata */}
            <div style={{ color: '#8b949e', fontSize: 12 }}>
              <p>
                <strong>Template:</strong> {report.template.toUpperCase()} |{' '}
                <strong>Risk Level:</strong> {report.riskLevel} |{' '}
                <strong>Findings:</strong> {report.findings_count}
              </p>
              <p>
                <strong>Generated:</strong> {new Date(report.generatedAt).toLocaleString()}
              </p>
            </div>

            <Button block onClick={() => setReport(null)} style={{ marginTop: 15 }}>
              Generate Another Report
            </Button>
          </div>
        )}

        <style>
          {`
            @keyframes pulseNode {
              0% { transform: scale(1); opacity: 0.9; }
              50% { transform: scale(1.05); opacity: 1; }
              100% { transform: scale(1); opacity: 0.9; }
            }
          `}
        </style>
      </Modal>
    </>
  );
};

export default ReportGenerator;

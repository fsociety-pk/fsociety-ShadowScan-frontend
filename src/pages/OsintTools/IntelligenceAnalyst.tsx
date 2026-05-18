/**
 * IntelligenceAnalyst — AI-powered OSINT entity extraction and risk assessment tool.
 * Paste any raw intelligence text; the Claude-backed backend extracts entities,
 * maps relationships, scores risk, and returns a structured intelligence report.
 */
import React, { useState, useRef } from 'react';
import {
  Card, Button, Input, Typography, message, Tag, Row, Col,
  Progress, Divider, Space, Timeline, Badge, Tooltip,
} from 'antd';
import {
  SearchOutlined, FileTextOutlined, WarningOutlined, SafetyOutlined,
  GlobalOutlined, UserOutlined, DownloadOutlined, ApartmentOutlined, BulbOutlined,
  RadarChartOutlined, ThunderboltOutlined, ClockCircleOutlined,
  ExclamationCircleOutlined, CheckCircleOutlined, InfoCircleOutlined,
  RobotOutlined, CloseCircleOutlined, MinusCircleOutlined,
  MailOutlined, PhoneOutlined, TagOutlined, BankOutlined, EnvironmentOutlined
} from '@ant-design/icons';
import api from '../../api/axiosConfig';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const EXAMPLE = `Target: John Doe
Email: johndoe@example.com, jdoe@corp.io
Phone: +1-800-555-0199
Username: @johndoe99
Organization: Acme Corp Ltd.
Location: New York, USA
GitHub: https://github.com/johndoe99
Twitter: https://twitter.com/johndoe99
LinkedIn profile found
IP: 203.0.113.45
Domain: acmecorp.io`;

const RISK_COLOR: Record<string, string> = { High: '#ff4d4f', Medium: '#faad14', Low: 'var(--cyber-blue)' };
const RISK_BG: Record<string, string> = { High: 'rgba(255,77,79,0.1)', Medium: 'rgba(250,173,20,0.1)', Low: 'rgba(14,165,233,0.1)' };
const CONF_COLOR = (c: number) => c >= 0.9 ? 'var(--cyber-blue)' : c >= 0.75 ? '#faad14' : '#ff4d4f';

const Section: React.FC<{ icon: React.ReactNode; title: string; accent?: string; children: React.ReactNode }> = ({ icon, title, accent = 'var(--cyber-blue)', children }) => (
  <Card style={{ background: '#ffffff', border: `1px solid var(--border-color)`, borderRadius: 12, marginBottom: 20 }}
    styles={{ body: { padding: '20px 24px' } }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
      <span style={{ color: accent, fontSize: 18 }}>{icon}</span>
      <Text strong style={{ color: accent, fontSize: 14, letterSpacing: 1.5, textTransform: 'uppercase' }}>{title}</Text>
    </div>
    {children}
  </Card>
);

const EntityPill: React.FC<{ label: string; color?: string }> = ({ label, color = 'var(--cyber-blue)' }) => (
  <Tag style={{ background: `${color}15`, border: `1px solid ${color}40`, color, borderRadius: 20, padding: '2px 12px', margin: '3px', fontSize: 12 }}>{label}</Tag>
);

/**
 * Typed shape for the intelligence report returned by the backend.
 * Fields are kept flexible since the AI output schema may vary.
 */
interface OsintReport {
  reportId: string;
  target: { label: string };
  generatedAt: string;
  executiveSummary: { overview: string; riskScore: number; totalEntitiesExtracted: number; platformsDetected: number };
  riskAssessment: { riskLevel: string; overallRiskScore: number; indicators: { category: string; severity: string; description: string; evidence: string[] }[] };
  targetProfile: { names: string[]; emails: string[]; phones: string[]; usernames: string[]; organizations: string[]; locations: string[] };
  digitalFootprintAnalysis: { platforms: string[]; domains: string[]; ipAddresses: string[]; exposureScore: number; dataExposureRisks: string[] };
  relationshipAnalysis: { relationships: { entity1: string; entity2: string; relation: string; strength: string }[]; clusterNotes: string };
  keyFindings: { finding: string; confidence: number; category: string }[];
  recommendations: string[];
  investigationNotes: string;
}

const IntelligenceAnalyst: React.FC = () => {
  const [targetData, setTargetData] = useState('');
  const [targetLabel, setTargetLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<OsintReport | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const analyze = async () => {
    if (!targetData.trim() || targetData.trim().length < 10) {
      message.error('Please provide at least 10 characters of target data.');
      return;
    }
    setLoading(true);
    setReport(null);
    try {
      const res = await api.post('/osint-analyst/analyze', { targetData, targetLabel: targetLabel.trim() || undefined });
      setReport(res.data.report);
      message.success('Intelligence report generated successfully.');
      setTimeout(() => reportRef.current?.scrollIntoView({ behavior: 'smooth' }), 200);
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      message.error(apiErr.response?.data?.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const exportJSON = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `osint-report-${report.reportId}.json`;
    a.click();
    URL.revokeObjectURL(url);
    message.success('Report exported as JSON.');
  };

  const riskLevel: string = report?.riskAssessment?.riskLevel || 'Low';

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', fontFamily: 'Inter, monospace' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--cyber-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#fff' }}>
            <RobotOutlined />
          </div>
          <div>
            <Title level={3} style={{ margin: 0, color: 'var(--cyber-blue)', letterSpacing: 2 }}>
              [ AI OSINT INTELLIGENCE ANALYST ]
            </Title>
            <Text style={{ color: '#4b5563', fontSize: 12, letterSpacing: 1.5 }}>
              AUTOMATED ENTITY EXTRACTION • RELATIONSHIP MAPPING • RISK ASSESSMENT
            </Text>
          </div>
        </div>
        <Paragraph style={{ color: '#6b7280', marginBottom: 0, fontSize: 13, lineHeight: 1.7 }}>
          Paste any publicly available information about a target — emails, usernames, social profiles, IPs, bios, news articles, forum posts, or raw text. The engine will extract entities, map relationships, assess exposure risks, and generate a structured intelligence report.
        </Paragraph>
      </div>

      {/* Input Card */}
      <Card style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: 14, marginBottom: 24 }}
        styles={{ body: { padding: 24 } }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <div style={{ marginBottom: 8 }}>
              <Text style={{ color: '#6b7280', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase' }}>
                <UserOutlined /> Target Label (optional)
              </Text>
            </div>
            <Input
              placeholder="e.g. John Doe / @handle"
              value={targetLabel}
              onChange={e => setTargetLabel(e.target.value)}
              style={{ background: '#f8fafc', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
            />
          </Col>
          <Col xs={24}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ color: '#6b7280', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase' }}>
                <FileTextOutlined /> Raw Intelligence Data
              </Text>
              <Button
                size="small"
                type="text"
                style={{ color: 'var(--cyber-blue)', fontSize: 11 }}
                onClick={() => setTargetData(EXAMPLE)}
              >
                Load Example
              </Button>
            </div>
            <TextArea
              rows={10}
              placeholder="Paste any text here — emails, usernames, social links, IP addresses, bios, leaked data snippets, forum posts, news excerpts..."
              value={targetData}
              onChange={e => setTargetData(e.target.value)}
              style={{ background: '#f8fafc', borderColor: 'var(--border-color)', color: 'var(--text-main)', fontFamily: 'monospace', fontSize: 13, resize: 'vertical' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
              <Text style={{ color: '#374151', fontSize: 11 }}>
                {targetData.length} characters • Analysis uses pattern extraction on provided text only
              </Text>
              <Button
                type="primary"
                size="large"
                icon={loading ? <RadarChartOutlined spin /> : <SearchOutlined />}
                loading={loading}
                onClick={analyze}
                style={{ background: 'var(--cyber-gradient)', border: 'none', color: '#fff', fontWeight: 700, letterSpacing: 1, minWidth: 200 }}
              >
                {loading ? 'ANALYZING...' : 'INITIATE ANALYSIS'}
              </Button>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Report Output */}
      {report && (
        <div ref={reportRef}>
          {/* Report Header Banner */}
          <div style={{
            background: 'linear-gradient(135deg,rgba(0,255,136,0.08),rgba(0,212,255,0.05))',
            border: '1px solid rgba(0,255,136,0.3)',
            borderRadius: 14,
            padding: '20px 28px',
            marginBottom: 24,
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: 300, height: '100%', background: 'radial-gradient(circle at top right,rgba(0,212,255,0.07),transparent)', pointerEvents: 'none' }} />
            <Row align="middle" justify="space-between">
              <Col>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Badge dot color={RISK_COLOR[riskLevel]} style={{ width: 10, height: 10 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 8, background: RISK_BG[riskLevel], border: `1px solid ${RISK_COLOR[riskLevel]}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: RISK_COLOR[riskLevel] }}>
                      {riskLevel === 'High' ? <CloseCircleOutlined /> : riskLevel === 'Medium' ? <MinusCircleOutlined /> : <CheckCircleOutlined />}
                    </div>
                  </Badge>
                  <div>
                    <Text style={{ color: '#9ca3af', fontSize: 10, letterSpacing: 2, display: 'block' }}>OSINT INTELLIGENCE REPORT</Text>
                    <Text strong style={{ color: 'var(--text-main)', fontSize: 18 }}>{report.target.label}</Text>
                    <Text style={{ color: '#4b5563', fontSize: 10, display: 'block', marginTop: 2 }}>{report.reportId}</Text>
                  </div>
                </div>
              </Col>
              <Col>
                <Space orientation="vertical" size={4} style={{ textAlign: 'right' }}>
                  <Tag color={riskLevel === 'High' ? 'error' : riskLevel === 'Medium' ? 'warning' : 'success'} style={{ fontSize: 12, padding: '2px 12px' }}>
                    {riskLevel.toUpperCase()} RISK
                  </Tag>
                  <Text style={{ color: '#4b5563', fontSize: 11 }}>
                    <ClockCircleOutlined /> {new Date(report.generatedAt).toLocaleString()}
                  </Text>
                  <Button size="small" icon={<DownloadOutlined />} onClick={exportJSON} style={{ color: 'var(--cyber-blue)', borderColor: 'var(--cyber-blue)', background: 'transparent' }}>
                    Export JSON
                  </Button>
                </Space>
              </Col>
            </Row>
            <Divider style={{ borderColor: 'rgba(14,165,233,0.15)', margin: '16px 0' }} />
            <Text style={{ color: '#9ca3af', fontSize: 13, lineHeight: 1.7, fontStyle: 'italic' }}>
              {report.executiveSummary.overview}
            </Text>
            <Row gutter={32} style={{ marginTop: 16 }}>
              {[
                { label: 'Risk Score', value: `${report.executiveSummary.riskScore}/100`, color: RISK_COLOR[riskLevel] },
                { label: 'Entities Found', value: report.executiveSummary.totalEntitiesExtracted, color: 'var(--cyber-purple)' },
                { label: 'Platforms', value: report.executiveSummary.platformsDetected, color: '#a78bfa' },
              ].map(s => (
                <Col key={s.label}>
                  <Text style={{ color: '#4b5563', fontSize: 10, letterSpacing: 1.5, display: 'block', textTransform: 'uppercase' }}>{s.label}</Text>
                  <Text strong style={{ color: s.color, fontSize: 22 }}>{s.value}</Text>
                </Col>
              ))}
            </Row>
          </div>

          <Row gutter={[20, 20]}>
            {/* Left Column */}
            <Col xs={24} lg={14}>
              {/* Target Profile */}
              <Section icon={<UserOutlined />} title="Target Profile">
                <Row gutter={[16, 16]}>
                  {[
                    { label: 'Names', items: report.targetProfile.names, icon: <UserOutlined />, color: 'var(--cyber-purple)' },
                    { label: 'Emails', items: report.targetProfile.emails, icon: <MailOutlined />, color: '#ff6b6b' },
                    { label: 'Phones', items: report.targetProfile.phones, icon: <PhoneOutlined />, color: '#ffd700' },
                    { label: 'Usernames', items: report.targetProfile.usernames, icon: <TagOutlined />, color: '#a78bfa' },
                    { label: 'Organizations', items: report.targetProfile.organizations, icon: <BankOutlined />, color: 'var(--cyber-blue)' },
                    { label: 'Locations', items: report.targetProfile.locations, icon: <EnvironmentOutlined />, color: '#fb923c' },
                  ].map(group => group.items.length > 0 && (
                    <Col xs={24} sm={12} key={group.label}>
                      <Text style={{ color: '#4b5563', fontSize: 10, letterSpacing: 1.5, display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>
                        {group.icon} {group.label}
                      </Text>
                      <div>{group.items.map((item: string) => <EntityPill key={item} label={item} color={group.color} />)}</div>
                    </Col>
                  ))}
                </Row>
              </Section>

              {/* Digital Footprint */}
              <Section icon={<GlobalOutlined />} title="Digital Footprint Analysis" accent="var(--cyber-purple)">
                {report.digitalFootprintAnalysis.platforms.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <Text style={{ color: '#4b5563', fontSize: 10, letterSpacing: 1.5, display: 'block', marginBottom: 8, textTransform: 'uppercase' }}>Platforms Detected</Text>
                    <div>{report.digitalFootprintAnalysis.platforms.map((p: string) => <EntityPill key={p} label={p} color="var(--cyber-purple)" />)}</div>
                  </div>
                )}
                {report.digitalFootprintAnalysis.domains.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <Text style={{ color: '#4b5563', fontSize: 10, letterSpacing: 1.5, display: 'block', marginBottom: 8, textTransform: 'uppercase' }}>Domains</Text>
                    <div>{report.digitalFootprintAnalysis.domains.map((d: string) => <EntityPill key={d} label={d} color="#a78bfa" />)}</div>
                  </div>
                )}
                {report.digitalFootprintAnalysis.ipAddresses.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <Text style={{ color: '#4b5563', fontSize: 10, letterSpacing: 1.5, display: 'block', marginBottom: 8, textTransform: 'uppercase' }}>IP Addresses</Text>
                    <div>{report.digitalFootprintAnalysis.ipAddresses.map((ip: string) => <EntityPill key={ip} label={ip} color="#ff6b6b" />)}</div>
                  </div>
                )}
                <div>
                  <Text style={{ color: '#4b5563', fontSize: 10, letterSpacing: 1.5, display: 'block', marginBottom: 10, textTransform: 'uppercase' }}>Exposure Score</Text>
                  <Progress
                    percent={report.digitalFootprintAnalysis.exposureScore}
                    strokeColor={RISK_COLOR[riskLevel]}
                    trailColor="#1f2937"
                    format={p => <Text style={{ color: RISK_COLOR[riskLevel], fontWeight: 700 }}>{p}%</Text>}
                  />
                </div>
                {report.digitalFootprintAnalysis.dataExposureRisks.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    {report.digitalFootprintAnalysis.dataExposureRisks.map((risk: string, i: number) => (
                      <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                        <ExclamationCircleOutlined style={{ color: '#faad14', marginTop: 2, flexShrink: 0 }} />
                        <Text style={{ color: '#9ca3af', fontSize: 12 }}>{risk}</Text>
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              {/* Relationship Analysis */}
              <Section icon={<ApartmentOutlined />} title="Relationship Analysis" accent="#a78bfa">
                {report.relationshipAnalysis.relationships.length === 0 ? (
                  <Text style={{ color: '#4b5563', fontSize: 13 }}>Insufficient entity overlap to establish confirmed relationships.</Text>
                ) : (
                  <>
                    <Text style={{ color: '#6b7280', fontSize: 12, display: 'block', marginBottom: 16 }}>
                      {report.relationshipAnalysis.clusterNotes}
                    </Text>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {report.relationshipAnalysis.relationships.map((r: any, i: number) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                          <Tag style={{ background: r.strength === 'Strong' ? 'rgba(14, 165, 233, 0.1)' : r.strength === 'Moderate' ? 'rgba(250,173,20,0.1)' : 'rgba(107,114,128,0.1)', color: r.strength === 'Strong' ? 'var(--cyber-blue)' : r.strength === 'Moderate' ? '#faad14' : '#6b7280', border: 'none', fontSize: 9, letterSpacing: 1 }}>
                            {r.strength.toUpperCase()}
                          </Tag>
                          <Text style={{ color: 'var(--cyber-purple)', fontSize: 12, fontFamily: 'monospace' }}>{r.entity1}</Text>
                          <Text style={{ color: '#374151' }}>→</Text>
                          <Text style={{ color: '#a78bfa', fontSize: 12, fontFamily: 'monospace' }}>{r.entity2}</Text>
                          <Text style={{ color: '#4b5563', fontSize: 11, marginLeft: 'auto' }}>{r.relation}</Text>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </Section>
            </Col>

            {/* Right Column */}
            <Col xs={24} lg={10}>
              {/* Risk Assessment */}
              <Section icon={<WarningOutlined />} title="Risk Assessment" accent={RISK_COLOR[riskLevel]}>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <Progress
                      type="circle"
                      percent={report.riskAssessment.overallRiskScore}
                      size={120}
                      strokeColor={RISK_COLOR[riskLevel]}
                      trailColor="#1f2937"
                      format={p => (
                        <div>
                          <div style={{ color: RISK_COLOR[riskLevel], fontSize: 22, fontWeight: 900 }}>{p}</div>
                          <div style={{ color: '#4b5563', fontSize: 9, letterSpacing: 1 }}>/ 100</div>
                        </div>
                      )}
                    />
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <Tag style={{ background: RISK_BG[riskLevel], color: RISK_COLOR[riskLevel], border: `1px solid ${RISK_COLOR[riskLevel]}40`, fontSize: 13, padding: '4px 16px', letterSpacing: 2 }}>
                      {riskLevel.toUpperCase()} RISK
                    </Tag>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {report.riskAssessment.indicators.map((ind: any, i: number) => (
                    <div key={i} style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: 8, border: `1px solid ${RISK_COLOR[ind.severity]}40` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <Text strong style={{ color: 'var(--text-main)', fontSize: 12 }}>{ind.category}</Text>
                        <Tag style={{ background: RISK_BG[ind.severity], color: RISK_COLOR[ind.severity], border: 'none', fontSize: 9 }}>{ind.severity}</Tag>
                      </div>
                      <Text style={{ color: '#6b7280', fontSize: 11, lineHeight: 1.5, display: 'block' }}>{ind.description}</Text>
                      {ind.evidence.length > 0 && (
                        <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {ind.evidence.slice(0, 3).map((e: string, j: number) => (
                            <Tag key={j} style={{ background: '#ffffff', border: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: 10, margin: 0 }}>{e.length > 30 ? e.slice(0, 30) + '…' : e}</Tag>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Section>

              {/* Key Findings */}
              <Section icon={<BulbOutlined />} title="Key Findings" accent="#ffd700">
                <Timeline
                  items={report.keyFindings.map((f: OsintReport['keyFindings'][number]) => ({
                    dot: <div style={{ width: 10, height: 10, borderRadius: '50%', background: CONF_COLOR(f.confidence), marginTop: 2 }} />,
                    children: (
                      <div style={{ paddingBottom: 4 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                          <Text style={{ color: 'var(--text-main)', fontSize: 12, lineHeight: 1.5, flex: 1 }}>{f.finding}</Text>
                          <Tooltip title={`${Math.round(f.confidence * 100)}% confidence`}>
                            <Tag style={{ background: `${CONF_COLOR(f.confidence)}15`, color: CONF_COLOR(f.confidence), border: 'none', fontSize: 9, flexShrink: 0 }}>
                              {Math.round(f.confidence * 100)}%
                            </Tag>
                          </Tooltip>
                        </div>
                        <Tag style={{ background: '#f8fafc', border: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: 9, marginTop: 4 }}>{f.category}</Tag>
                      </div>
                    ),
                  }))}
                />
              </Section>

              {/* Recommendations */}
              <Section icon={<SafetyOutlined />} title="Recommendations" accent="var(--cyber-blue)">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {report.recommendations.map((rec: string, i: number) => (
                    <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                      <CheckCircleOutlined style={{ color: 'var(--cyber-blue)', marginTop: 2, flexShrink: 0 }} />
                      <Text style={{ color: '#9ca3af', fontSize: 12, lineHeight: 1.5 }}>{rec}</Text>
                    </div>
                  ))}
                </div>
              </Section>
            </Col>
          </Row>

          {/* Investigation Notes */}
          <Card style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: 12, marginBottom: 20 }}
            styles={{ body: { padding: '16px 24px' } }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <InfoCircleOutlined style={{ color: '#374151', marginTop: 2 }} />
              <Text style={{ color: '#374151', fontSize: 11, lineHeight: 1.7 }}>
                <strong style={{ color: '#4b5563' }}>INVESTIGATION NOTES: </strong>{report.investigationNotes}
              </Text>
            </div>
          </Card>

          {/* Regenerate button */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <Button
              onClick={() => { setReport(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              style={{ color: '#4b5563', borderColor: 'var(--border-color)', background: 'transparent' }}
              icon={<ThunderboltOutlined />}
            >
              New Analysis
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntelligenceAnalyst;

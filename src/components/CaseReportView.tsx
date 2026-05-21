import React from 'react';
import { Alert, Button, Card, Col, Row, Space, Tag, Timeline, Typography } from 'antd';
import {
  CopyOutlined, DownloadOutlined, FileTextOutlined, SafetyOutlined,
  UserOutlined, MailOutlined, PhoneOutlined, GlobalOutlined,
  CompassOutlined, ApiOutlined, WarningOutlined, CheckCircleOutlined,
  ClockCircleOutlined, WifiOutlined, DollarOutlined, CarOutlined,
} from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import './CaseReportView.css';

const { Text, Title } = Typography;

// ── Types ──────────────────────────────────────────────────────────────────
export interface CaseReportVisual {
  target: string;
  summary: string;
  riskLevel: string;
  confidenceScore: number;
  tags: string[];
  entitiesByType: Record<string, string[]>;
  highlightedFindings: string[];
  timeline?: { date?: string; event: string }[];
  riskFactors?: string[];
  recommendations?: string[];
  digitalFootprint?: {
    socialAccounts?: string[];
    emails?: string[];
    phoneNumbers?: string[];
    ipAddresses?: string[];
    domains?: string[];
    wallets?: string[];
    usernames?: string[];
  };
  relationships?: {
    source: string; sourceType: string;
    target: string; targetType: string;
    relation: string; strength: 'weak' | 'medium' | 'strong';
  }[];
  relationshipGraph?: {
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

// ── Helpers ─────────────────────────────────────────────────────────────────
const riskBg = (r: string) => {
  const v = (r || '').toLowerCase();
  if (v.includes('critical')) return { bg: '#fef2f2', border: '#fecaca', text: '#dc2626', badge: 'red' as const };
  if (v.includes('high'))     return { bg: '#fff7ed', border: '#fed7aa', text: '#ea580c', badge: 'volcano' as const };
  if (v.includes('medium'))   return { bg: '#fefce8', border: '#fde68a', text: '#ca8a04', badge: 'gold' as const };
  return { bg: '#f0fdf4', border: '#bbf7d0', text: '#16a34a', badge: 'green' as const };
};

const entityTheme = (type: string) => {
  const t = type.toLowerCase();
  if (t.includes('email'))   return { bg: '#f0f9ff', border: '#bae6fd', color: '#0ea5e9', icon: <MailOutlined /> };
  if (t.includes('phone') || t.includes('number') || t.includes('contact')) return { bg: '#f0fdf4', border: '#bbf7d0', color: '#10b981', icon: <PhoneOutlined /> };
  if (t.includes('social') || t.includes('account') || t.includes('username') || t.includes('telegram') || t.includes('discord') || t.includes('twitter') || t.includes('github')) return { bg: '#f5f3ff', border: '#ddd6fe', color: '#8b5cf6', icon: <GlobalOutlined /> };
  if (t.includes('ip') || t.includes('address')) return { bg: '#ecfeff', border: '#a5f3fc', color: '#06b6d4', icon: <WifiOutlined /> };
  if (t.includes('location') || t.includes('city')) return { bg: '#fffbeb', border: '#fde68a', color: '#f59e0b', icon: <CompassOutlined /> };
  if (t.includes('name') || t.includes('alias') || t.includes('associate') || t.includes('friend')) return { bg: '#fdf2f8', border: '#fbcfe8', color: '#ec4899', icon: <UserOutlined /> };
  if (t.includes('domain'))  return { bg: '#fff7ed', border: '#fed7aa', color: '#f97316', icon: <GlobalOutlined /> };
  if (t.includes('org') || t.includes('company') || t.includes('employer')) return { bg: '#f0fdf4', border: '#bbf7d0', color: '#10b981', icon: <SafetyOutlined /> };
  if (t.includes('wallet') || t.includes('crypto')) return { bg: '#fdf4ff', border: '#f0abfc', color: '#a855f7', icon: <DollarOutlined /> };
  if (t.includes('vehicle') || t.includes('car')) return { bg: '#f8fafc', border: '#cbd5e1', color: '#64748b', icon: <CarOutlined /> };
  return { bg: '#f8fafc', border: '#e2e8f0', color: '#64748b', icon: <FileTextOutlined /> };
};

const strengthColor = (s: string) => s === 'strong' ? '#ef4444' : s === 'medium' ? '#3b82f6' : '#94a3b8';

const uniqueStrings = (items: string[] = []) => {
  const map = new Map<string, string>();
  items.forEach((item) => {
    const cleaned = String(item || '').trim();
    if (!cleaned) return;
    const key = cleaned.toLowerCase();
    if (!map.has(key)) map.set(key, cleaned);
  });
  return Array.from(map.values());
};

const uniqueTimeline = (items: { date?: string; event: string }[] = []) => {
  const map = new Map<string, { date?: string; event: string }>();
  items.forEach((entry) => {
    const date = String(entry?.date || '').trim();
    const event = String(entry?.event || '').trim();
    if (!event) return;
    const key = `${date.toLowerCase()}|${event.toLowerCase()}`;
    if (!map.has(key)) map.set(key, { date, event });
  });
  return Array.from(map.values());
};

const uniqueEdges = (items: { source: string; target: string; relation: string; strength: 'weak' | 'medium' | 'strong' }[] = []) => {
  const map = new Map<string, { source: string; target: string; relation: string; strength: 'weak' | 'medium' | 'strong' }>();
  items.forEach((edge) => {
    const source = String(edge?.source || '').trim();
    const target = String(edge?.target || '').trim();
    const relation = String(edge?.relation || '').trim();
    const strength = edge?.strength || 'weak';
    if (!source || !target) return;
    const key = `${source.toLowerCase()}|${target.toLowerCase()}|${relation.toLowerCase()}|${strength}`;
    if (!map.has(key)) map.set(key, { source, target, relation, strength });
  });
  return Array.from(map.values());
};

// ── Component ────────────────────────────────────────────────────────────────
const CaseReportView: React.FC<CaseReportViewProps> = ({
  report, caseTitle, onDownloadPdf, onCopyText, copiedToClipboard = false,
}) => {
  const v = report.visualReport;
  const risk = riskBg(v?.riskLevel || report.riskLevel);
  const entityGroups = v?.entitiesByType
    ? Object.entries(v.entitiesByType)
      .map(([type, values]) => [type, uniqueStrings(values as string[])] as [string, string[]])
      .filter(([, values]) => values.length > 0)
    : [];
  const edges = uniqueEdges(v?.relationshipGraph?.edges || []);
  const nodes = v?.relationshipGraph?.nodes || [];
  const highlightedFindings = uniqueStrings(v?.highlightedFindings || []);
  const timeline = uniqueTimeline(v?.timeline || []);
  const riskFactors = uniqueStrings(v?.riskFactors || []);
  const recommendations = uniqueStrings(v?.recommendations || []);
  const tags = uniqueStrings(v?.tags || []);
  // compute a simple presentation-only duplicates count (original - deduped)
  let duplicatesCount = 0;
  if (v) {
    duplicatesCount += Math.max(0, (v.highlightedFindings || []).length - highlightedFindings.length);
    duplicatesCount += Math.max(0, (v.timeline || []).length - timeline.length);
    duplicatesCount += Math.max(0, (v.riskFactors || []).length - riskFactors.length);
    duplicatesCount += Math.max(0, (v.recommendations || []).length - recommendations.length);
    duplicatesCount += Math.max(0, (v.tags || []).length - tags.length);
      const fp = (v.digitalFootprint || {}) as Record<string, string[] | undefined>;
      const fpKeys = ['emails','phoneNumbers','usernames','socialAccounts','ipAddresses','domains','wallets'];
      fpKeys.forEach((k) => {
        const arr = fp[k] || [];
        duplicatesCount += Math.max(0, arr.length - uniqueStrings(arr).length);
      });
      if (v.entitiesByType) {
        Object.values(v.entitiesByType).forEach((vals) => {
          const arr = Array.isArray(vals) ? vals as string[] : [];
          const orig = arr.length;
          const uniq = uniqueStrings(arr).length;
          duplicatesCount += Math.max(0, orig - uniq);
        });
      }
  }

  const footprint = v?.digitalFootprint || {};
  const footprintItems = [
    { label: 'Email Addresses',    items: uniqueStrings(footprint.emails || []),        theme: entityTheme('email') },
    { label: 'Phone Numbers',      items: uniqueStrings(footprint.phoneNumbers || []),   theme: entityTheme('phone') },
    { label: 'Usernames',          items: uniqueStrings(footprint.usernames || []),      theme: entityTheme('username') },
    { label: 'Social Accounts',    items: uniqueStrings(footprint.socialAccounts || []), theme: entityTheme('social') },
    { label: 'IP Addresses',       items: uniqueStrings(footprint.ipAddresses || []),    theme: entityTheme('ip') },
    { label: 'Domains',            items: uniqueStrings(footprint.domains || []),        theme: entityTheme('domain') },
    { label: 'Crypto Wallets',     items: uniqueStrings(footprint.wallets || []),        theme: entityTheme('wallet') },
  ].filter(f => f.items.length > 0);

  return (
    <div className="case-report-view" style={{ background: '#f8fafc', minHeight: 400 }}>

      {/* ── Banner ── */}
      <div className="case-report-banner" style={{
        background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 60%)',
        padding: '36px 36px 28px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* subtle grid */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'linear-gradient(#e6eefc 1px,transparent 1px),linear-gradient(90deg,#e6eefc 1px,transparent 1px)', backgroundSize: '28px 28px' }} />
        <Row gutter={[16, 16]} align="middle" style={{ position: 'relative', zIndex: 1 }}>
          <Col xs={24} lg={16}>
            <Tag style={{ borderRadius: 999, padding: '3px 14px', fontWeight: 700, marginBottom: 12, fontSize: 12, background: '#f3f4f6', color: '#374151', border: '1px solid #e6eefc' }}>
              {(v?.riskLevel || report.riskLevel).toUpperCase()} RISK LEVEL
            </Tag>
            <Title level={2} style={{ color: '#0f172a', margin: '0 0 10px', fontWeight: 800 }}>
              {report.title || caseTitle}
            </Title>
            <Text style={{ color: '#475569', fontSize: 14, lineHeight: 1.7, display: 'block', maxWidth: 680 }}>
              {v?.summary || 'AI-generated intelligence report from case dossier data.'}
            </Text>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
              {tags.map(tag => (
                <Tag key={tag} style={{ borderRadius: 6, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: '#e2e8f0', margin: 0, fontSize: 11 }}>
                  {tag}
                </Tag>
              ))}
              {duplicatesCount > 0 && (
                <Tag className="case-report-dedup-badge" style={{ marginLeft: 8, borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#e2e8f0', fontSize: 11 }}>
                  Deduped • {duplicatesCount}
                </Tag>
              )}
            </div>
          </Col>
          <Col xs={24} lg={8}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-end' }}>
              {/* Confidence ring */}
                <div style={{ textAlign: 'center', background: '#ffffff', border: '1px solid #e6eefc', borderRadius: 12, padding: '12px 20px' }}>
                  <div style={{ fontSize: 42, fontWeight: 900, color: risk.text, lineHeight: 1 }}>{v?.confidenceScore ?? '--'}</div>
                  <div style={{ fontSize: 11, color: '#6b7280', letterSpacing: 2, marginTop: 4 }}>CONFIDENCE</div>
                </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end' }}>
                {onDownloadPdf && (
                  <Button type="primary" icon={<DownloadOutlined />} onClick={onDownloadPdf} style={{ borderRadius: 8, fontWeight: 700, background: '#0ea5e9', border: 'none', color: '#fff' }}>
                    PDF
                  </Button>
                )}
                {onCopyText && (
                  <Button icon={<CopyOutlined />} onClick={onCopyText} style={{ borderRadius: 8, fontWeight: 600, background: '#f3f4f6', border: '1px solid #e6eefc', color: '#0f172a' }}>
                    {copiedToClipboard ? 'Copied!' : 'Copy'}
                  </Button>
                )}
              </div>
              <Text style={{ color: '#475569', fontSize: 12 }}>
                <ClockCircleOutlined style={{ marginRight: 6 }} />
                {new Date(report.generatedAt).toLocaleString('en-PK')}
              </Text>
            </div>
          </Col>
        </Row>
      </div>

      {report.syntheticDataUsed && (
        <Alert type="info" showIcon style={{ margin: '16px 24px 0', borderRadius: 12 }}
          message="AI processed raw findings directly from case dossier"
          description="No linked findings were stored in the findings database, so the report was generated from the raw text you entered in the New Case section." />
      )}

      <div style={{ padding: '24px 24px 40px' }}>

        {/* ── Stat pills ── */}
        <Row gutter={[12, 12]} style={{ marginBottom: 24 }}>
          {[
            { label: 'Entity Groups', value: entityGroups.length, color: '#8b5cf6' },
            { label: 'Findings', value: report.findings_count, color: '#0ea5e9' },
            { label: 'Relationships', value: edges.length, color: '#f59e0b' },
            { label: 'Risk Factors', value: (v?.riskFactors || []).length, color: '#ef4444' },
          ].map(s => (
            <Col xs={12} sm={6} key={s.label}>
              <div className="case-report-stat-card" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '16px 20px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: '#64748b', letterSpacing: 1, marginTop: 2 }}>{s.label.toUpperCase()}</div>
              </div>
            </Col>
          ))}
        </Row>

        <Row gutter={[20, 20]}>

          {/* ── LEFT COLUMN ── */}
          <Col xs={24} lg={15}>

            {/* Entity Extraction Matrix */}
            {entityGroups.length > 0 && (
              <Card className="case-report-panel" bordered={false} style={{ borderRadius: 16, marginBottom: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}
                title={<span style={{ fontWeight: 700, color: '#1e293b' }}><SafetyOutlined style={{ color: '#0ea5e9', marginRight: 8 }} />Entity Extraction Matrix</span>}>
                <Row gutter={[12, 12]}>
                  {entityGroups.map(([type, values]) => {
                    const theme = entityTheme(type);
                    return (
                      <Col xs={24} md={12} key={type}>
                        <div style={{ background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 16, height: '100%' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                            <div style={{ background: '#fff', width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.color, fontSize: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                              {theme.icon}
                            </div>
                            <Text style={{ fontWeight: 700, fontSize: 12, letterSpacing: 0.8, textTransform: 'uppercase', color: theme.color }}>
                              {type}
                            </Text>
                            <Tag style={{ marginLeft: 'auto', margin: 0, background: theme.color, color: '#fff', border: 'none', borderRadius: 999, fontSize: 10 }}>
                              {(values as string[]).length}
                            </Tag>
                          </div>
                          <Space direction="vertical" style={{ width: '100%' }} size={6}>
                            {(values as string[]).map((val, i) => (
                              <div key={`${val}-${i}`} className="case-report-list-item" style={{ background: '#fff', border: `1px solid ${theme.border}`, padding: '7px 12px', borderRadius: 8, fontSize: 13, color: '#1e293b', wordBreak: 'break-all', fontWeight: 500 }}>
                                {val}
                              </div>
                            ))}
                          </Space>
                        </div>
                      </Col>
                    );
                  })}
                </Row>
              </Card>
            )}

            {/* Relationship Matrix Graph */}
            {edges.length > 0 && (
              <Card className="case-report-panel" bordered={false} style={{ borderRadius: 16, marginBottom: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}
                title={<span style={{ fontWeight: 700, color: '#1e293b' }}><ApiOutlined style={{ color: '#7c3aed', marginRight: 8 }} />Relationship Matrix Graph</span>}>
                <div style={{ background: '#0f172a', borderRadius: 16, padding: 24, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', inset: 0, opacity: 0.06, backgroundImage: 'linear-gradient(#38bdf8 1px,transparent 1px),linear-gradient(90deg,#38bdf8 1px,transparent 1px)', backgroundSize: '20px 20px' }} />
                  <Space direction="vertical" style={{ width: '100%', position: 'relative', zIndex: 1 }} size={14}>
                    {edges.map((edge, i) => {
                      const src = nodes.find(n => n.id === edge.source)?.label || edge.source;
                      const tgt = nodes.find(n => n.id === edge.target)?.label || edge.target;
                      const sc  = strengthColor(edge.strength);
                      return (
                        <div key={`${edge.source}-${edge.target}-${edge.relation}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: '0 0 160px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', color: '#e2e8f0', fontSize: 12, fontWeight: 600, textAlign: 'center', wordBreak: 'break-all' }}>
                            {src}
                          </div>
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                            <span style={{ color: sc, fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>{edge.relation}</span>
                            <div style={{ width: '100%', height: 2, background: `linear-gradient(90deg, transparent, ${sc}, transparent)`, position: 'relative' }}>
                              <div style={{ position: 'absolute', right: '22%', top: -4, width: 0, height: 0, borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderLeft: `6px solid ${sc}` }} />
                            </div>
                            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 9, fontFamily: 'monospace' }}>{edge.strength.toUpperCase()}</span>
                          </div>
                          <div style={{ flex: '0 0 160px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', color: '#e2e8f0', fontSize: 12, fontWeight: 600, textAlign: 'center', wordBreak: 'break-all' }}>
                            {tgt}
                          </div>
                        </div>
                      );
                    })}
                  </Space>
                </div>
              </Card>
            )}

            {/* Digital Footprint */}
            {footprintItems.length > 0 && (
              <Card className="case-report-panel" bordered={false} style={{ borderRadius: 16, marginBottom: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}
                title={<span style={{ fontWeight: 700, color: '#1e293b' }}><WifiOutlined style={{ color: '#06b6d4', marginRight: 8 }} />Digital Footprint</span>}>
                <Row gutter={[12, 12]}>
                  {footprintItems.map(({ label, items, theme }) => (
                    <Col xs={24} sm={12} key={label}>
                      <div style={{ background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 14 }}>
                        <Text style={{ display: 'block', fontWeight: 700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: theme.color, marginBottom: 10 }}>
                          {label} ({items.length})
                        </Text>
                        <Space direction="vertical" style={{ width: '100%' }} size={4}>
                          {items.map((item, i) => (
                            <div key={`${item}-${i}`} className="case-report-list-item" style={{ background: '#fff', padding: '5px 10px', borderRadius: 6, fontSize: 12, color: '#334155', wordBreak: 'break-all', border: `1px solid ${theme.border}` }}>
                              {item}
                            </div>
                          ))}
                        </Space>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card>
            )}

            {/* Narrative Report */}
            <Card className="case-report-panel case-report-narrative" bordered={false} style={{ borderRadius: 16, marginBottom: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}
              title={<span style={{ fontWeight: 700, color: '#1e293b' }}><FileTextOutlined style={{ color: '#0ea5e9', marginRight: 8 }} />Full Intelligence Narrative</span>}>
              <div className="case-report-markdown" style={{ color: '#1e293b', lineHeight: 1.85, fontSize: 14 }}>
                <ReactMarkdown>{report.content}</ReactMarkdown>
              </div>
            </Card>
          </Col>

          {/* ── RIGHT COLUMN ── */}
          <Col xs={24} lg={9}>

            {/* Key Findings */}
            {highlightedFindings.length > 0 && (
              <Card className="case-report-panel" bordered={false} style={{ borderRadius: 16, marginBottom: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}
                title={<span style={{ fontWeight: 700, color: '#1e293b' }}><CheckCircleOutlined style={{ color: '#10b981', marginRight: 8 }} />Key Findings</span>}>
                <Timeline
                  items={highlightedFindings.map((f, i) => ({
                    color: i % 3 === 0 ? 'blue' : i % 3 === 1 ? 'green' : 'gold',
                    children: <Text style={{ color: '#334155', fontSize: 13 }}>{f}</Text>,
                  }))}
                />
              </Card>
            )}

            {/* Timeline */}
            {timeline.length > 0 && (
              <Card className="case-report-panel" bordered={false} style={{ borderRadius: 16, marginBottom: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}
                title={<span style={{ fontWeight: 700, color: '#1e293b' }}><ClockCircleOutlined style={{ color: '#6366f1', marginRight: 8 }} />Investigation Timeline</span>}>
                <Timeline
                  items={timeline.map((t) => ({
                    color: 'blue',
                    children: (
                      <div>
                        {t.date && <Text style={{ color: '#94a3b8', fontSize: 11, display: 'block' }}>{t.date}</Text>}
                        <Text style={{ color: '#334155', fontSize: 13 }}>{t.event}</Text>
                      </div>
                    ),
                  }))}
                />
              </Card>
            )}

            {/* Risk Factors */}
            {riskFactors.length > 0 && (
              <Card className="case-report-panel" bordered={false} style={{ borderRadius: 16, marginBottom: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #fecaca', background: '#fff5f5' }}
                title={<span style={{ fontWeight: 700, color: '#dc2626' }}><WarningOutlined style={{ marginRight: 8 }} />Risk Factors</span>}>
                <Space direction="vertical" style={{ width: '100%' }} size={8}>
                  {riskFactors.map((rf, i) => (
                    <div key={`${rf}-${i}`} className="case-report-list-item" style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#991b1b' }}>
                      ⚠ {rf}
                    </div>
                  ))}
                </Space>
              </Card>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <Card className="case-report-panel" bordered={false} style={{ borderRadius: 16, marginBottom: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #bbf7d0', background: '#f0fdf4' }}
                title={<span style={{ fontWeight: 700, color: '#15803d' }}><CheckCircleOutlined style={{ marginRight: 8 }} />Recommendations</span>}>
                <Space direction="vertical" style={{ width: '100%' }} size={8}>
                  {recommendations.map((rec, i) => (
                    <div key={`${rec}-${i}`} className="case-report-list-item" style={{ background: '#fff', border: '1px solid #bbf7d0', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#166534', display: 'flex', gap: 8 }}>
                      <span style={{ color: '#16a34a', flexShrink: 0 }}>→</span>
                      {rec}
                    </div>
                  ))}
                </Space>
              </Card>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default CaseReportView;
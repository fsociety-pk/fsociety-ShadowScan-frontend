import React, { useState } from 'react';
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

// ── Scrollable panel body wrapper ────────────────────────────────────────────
const ScrollBody: React.FC<{ maxHeight?: number; children: React.ReactNode }> = ({
  maxHeight = 420, children,
}) => (
  <div className="crv-scroll-body" style={{ maxHeight, overflowY: 'auto', overflowX: 'hidden' }}>
    {children}
  </div>
);

// ── Collapsible entity group ─────────────────────────────────────────────────
const EntityGroup: React.FC<{ type: string; values: string[] }> = ({ type, values }) => {
  const [open, setOpen] = useState(true);
  const theme = entityTheme(type);
  return (
    <div className="crv-entity-group" style={{ background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 12, overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="crv-entity-group-header"
        style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px' }}
      >
        <div style={{ background: '#fff', width: 30, height: 30, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.color, fontSize: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', flexShrink: 0 }}>
          {theme.icon}
        </div>
        <Text style={{ fontWeight: 700, fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase', color: theme.color, flex: 1, textAlign: 'left' }}>
          {type}
        </Text>
        <Tag style={{ margin: 0, background: theme.color, color: '#fff', border: 'none', borderRadius: 999, fontSize: 10, flexShrink: 0 }}>
          {values.length}
        </Tag>
        <span style={{ color: theme.color, fontSize: 12, marginLeft: 4, flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(0deg)' : 'rotate(-90deg)', display: 'inline-block' }}>▾</span>
      </button>
      {open && (
        <div style={{ padding: '0 14px 12px', display: 'flex', flexDirection: 'column', gap: 5 }}>
          {values.map((val, i) => (
            <div key={`${val}-${i}`} className="crv-list-item" style={{ background: '#fff', border: `1px solid ${theme.border}`, padding: '6px 11px', borderRadius: 7, fontSize: 12.5, color: '#1e293b', wordBreak: 'break-all', fontWeight: 500 }}>
              {val}
            </div>
          ))}
        </div>
      )}
    </div>
  );
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

  const edges             = uniqueEdges(v?.relationshipGraph?.edges || []);
  const nodes             = v?.relationshipGraph?.nodes || [];
  const highlightedFindings = uniqueStrings(v?.highlightedFindings || []);
  const timeline          = uniqueTimeline(v?.timeline || []);
  const riskFactors       = uniqueStrings(v?.riskFactors || []);
  const recommendations   = uniqueStrings(v?.recommendations || []);
  const tags              = uniqueStrings(v?.tags || []);

  let duplicatesCount = 0;
  if (v) {
    duplicatesCount += Math.max(0, (v.highlightedFindings || []).length - highlightedFindings.length);
    duplicatesCount += Math.max(0, (v.timeline || []).length - timeline.length);
    duplicatesCount += Math.max(0, (v.riskFactors || []).length - riskFactors.length);
    duplicatesCount += Math.max(0, (v.recommendations || []).length - recommendations.length);
    duplicatesCount += Math.max(0, (v.tags || []).length - tags.length);
    const fp = (v.digitalFootprint || {}) as Record<string, string[] | undefined>;
    ['emails','phoneNumbers','usernames','socialAccounts','ipAddresses','domains','wallets'].forEach((k) => {
      const arr = fp[k] || [];
      duplicatesCount += Math.max(0, arr.length - uniqueStrings(arr).length);
    });
    if (v.entitiesByType) {
      Object.values(v.entitiesByType).forEach((vals) => {
        const arr = Array.isArray(vals) ? vals as string[] : [];
        duplicatesCount += Math.max(0, arr.length - uniqueStrings(arr).length);
      });
    }
  }

  const footprint = v?.digitalFootprint || {};
  const footprintItems = [
    { label: 'Email Addresses',  items: uniqueStrings(footprint.emails || []),        theme: entityTheme('email') },
    { label: 'Phone Numbers',    items: uniqueStrings(footprint.phoneNumbers || []),   theme: entityTheme('phone') },
    { label: 'Usernames',        items: uniqueStrings(footprint.usernames || []),      theme: entityTheme('username') },
    { label: 'Social Accounts',  items: uniqueStrings(footprint.socialAccounts || []), theme: entityTheme('social') },
    { label: 'IP Addresses',     items: uniqueStrings(footprint.ipAddresses || []),    theme: entityTheme('ip') },
    { label: 'Domains',          items: uniqueStrings(footprint.domains || []),        theme: entityTheme('domain') },
    { label: 'Crypto Wallets',   items: uniqueStrings(footprint.wallets || []),        theme: entityTheme('wallet') },
  ].filter(f => f.items.length > 0);

  // ── shared card style ──
  const cardStyle: React.CSSProperties = {
    borderRadius: 14,
    border: '1px solid #e2e8f0',
    boxShadow: '0 2px 14px rgba(0,0,0,0.03)',
  };

  return (
    <div className="crv-root" style={{ background: '#f1f5f9', minHeight: 400 }}>

      {/* ══════════════ BANNER ══════════════ */}
      <div className="crv-banner" style={{
        background: '#fff',
        borderBottom: '1px solid #e2e8f0',
        padding: 'clamp(18px,3vw,36px) clamp(18px,3vw,36px) clamp(16px,2.5vw,28px)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div className="crv-banner-grid" />
        <Row gutter={[20, 16]} align="middle" style={{ position: 'relative', zIndex: 1 }}>
          <Col xs={24} lg={17}>
            <Tag className="crv-risk-tag" style={{ borderRadius: 999, padding: '3px 14px', fontWeight: 700, marginBottom: 10, fontSize: 11, background: risk.bg, color: risk.text, border: `1px solid ${risk.border}` }}>
              {(v?.riskLevel || report.riskLevel).toUpperCase()} RISK LEVEL
            </Tag>
            <Title level={2} style={{ color: '#0f172a', margin: '0 0 8px', fontWeight: 800, fontSize: 'clamp(18px,2.2vw,26px)', lineHeight: 1.3 }}>
              {report.title || caseTitle}
            </Title>
            <Text style={{ color: '#64748b', fontSize: 13.5, lineHeight: 1.7, display: 'block', maxWidth: 700 }}>
              {v?.summary || 'AI-generated intelligence report from case dossier data.'}
            </Text>
            {tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
                {tags.map(tag => (
                  <Tag key={tag} className="crv-tag" style={{ borderRadius: 6, fontSize: 11, margin: 0 }}>{tag}</Tag>
                ))}
                {duplicatesCount > 0 && (
                  <Tag className="crv-dedup-tag" style={{ borderRadius: 6, fontSize: 11, margin: 0 }}>
                    Deduped • {duplicatesCount}
                  </Tag>
                )}
              </div>
            )}
          </Col>
          <Col xs={24} lg={7}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
              <div className="crv-confidence" style={{ textAlign: 'center', background: risk.bg, border: `1px solid ${risk.border}`, borderRadius: 14, padding: '14px 24px', minWidth: 110 }}>
                <div style={{ fontSize: 44, fontWeight: 900, color: risk.text, lineHeight: 1 }}>{v?.confidenceScore ?? '--'}</div>
                <div style={{ fontSize: 10, color: risk.text, opacity: 0.7, letterSpacing: 2.5, marginTop: 4, fontWeight: 700 }}>CONFIDENCE</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {onDownloadPdf && (
                  <Button type="primary" icon={<DownloadOutlined />} onClick={onDownloadPdf} style={{ borderRadius: 8, fontWeight: 700, background: '#0ea5e9', border: 'none' }}>PDF</Button>
                )}
                {onCopyText && (
                  <Button icon={<CopyOutlined />} onClick={onCopyText} style={{ borderRadius: 8, fontWeight: 600, background: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a' }}>
                    {copiedToClipboard ? 'Copied!' : 'Copy'}
                  </Button>
                )}
              </div>
              <Text style={{ color: '#94a3b8', fontSize: 11.5 }}>
                <ClockCircleOutlined style={{ marginRight: 5 }} />
                {new Date(report.generatedAt).toLocaleString('en-PK')}
              </Text>
            </div>
          </Col>
        </Row>
      </div>

      {/* ══════════════ ALERT ══════════════ */}
      {report.syntheticDataUsed && (
        <div style={{ padding: '14px 20px 0' }}>
          <Alert type="info" showIcon style={{ borderRadius: 10 }}
            message="AI processed raw findings directly from case dossier"
            description="No linked findings were stored in the findings database, so the report was generated from the raw text you entered in the New Case section." />
        </div>
      )}

      {/* ══════════════ BODY ══════════════ */}
      <div style={{ padding: 'clamp(14px,2vw,22px)' }}>

        {/* ── STAT PILLS ── */}
        <Row gutter={[10, 10]} style={{ marginBottom: 18 }}>
          {[
            { label: 'Entity Groups', value: entityGroups.length, color: '#8b5cf6', bg: '#f5f3ff' },
            { label: 'Findings',      value: report.findings_count, color: '#0ea5e9', bg: '#f0f9ff' },
            { label: 'Relationships', value: edges.length, color: '#f59e0b', bg: '#fffbeb' },
            { label: 'Risk Factors',  value: riskFactors.length, color: '#ef4444', bg: '#fef2f2' },
          ].map(s => (
            <Col xs={12} sm={6} key={s.label}>
              <div className="crv-stat" style={{ background: '#fff', border: `1px solid #e2e8f0`, borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 30, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 10, color: '#94a3b8', letterSpacing: 1, marginTop: 4, fontWeight: 700 }}>{s.label.toUpperCase()}</div>
              </div>
            </Col>
          ))}
        </Row>

        {/* ══════════════ MAIN 3-COL GRID ══════════════ */}
        <Row gutter={[16, 16]} align="stretch">

          {/* ── COL 1 — Entity Matrix + Digital Footprint ── */}
          <Col xs={24} lg={8} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {entityGroups.length > 0 && (
              <Card className="crv-panel" bordered={false} style={{ ...cardStyle, flex: '1 1 auto' }}
                title={<span className="crv-card-title"><SafetyOutlined style={{ color: '#0ea5e9' }} /> Entity Extraction Matrix</span>}>
                <ScrollBody maxHeight={500}>
                  <Space direction="vertical" style={{ width: '100%' }} size={8}>
                    {entityGroups.map(([type, values]) => (
                      <EntityGroup key={type} type={type} values={values as string[]} />
                    ))}
                  </Space>
                </ScrollBody>
              </Card>
            )}

            {footprintItems.length > 0 && (
              <Card className="crv-panel" bordered={false} style={{ ...cardStyle, flex: '0 0 auto' }}
                title={<span className="crv-card-title"><WifiOutlined style={{ color: '#06b6d4' }} /> Digital Footprint</span>}>
                <ScrollBody maxHeight={380}>
                  <Space direction="vertical" style={{ width: '100%' }} size={8}>
                    {footprintItems.map(({ label, items, theme }) => (
                      <div key={label} style={{ background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 10, padding: '10px 12px' }}>
                        <Text style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 10.5, letterSpacing: 1, textTransform: 'uppercase', color: theme.color, marginBottom: 8 }}>
                          <span style={{ color: theme.color, fontSize: 13 }}>{theme.icon}</span>
                          {label} <Tag style={{ margin: 0, background: theme.color, color: '#fff', border: 'none', borderRadius: 999, fontSize: 10 }}>{items.length}</Tag>
                        </Text>
                        <Space direction="vertical" style={{ width: '100%' }} size={4}>
                          {items.map((item, i) => (
                            <div key={`${item}-${i}`} className="crv-list-item" style={{ background: '#fff', padding: '5px 10px', borderRadius: 6, fontSize: 12, color: '#334155', wordBreak: 'break-all', border: `1px solid ${theme.border}` }}>
                              {item}
                            </div>
                          ))}
                        </Space>
                      </div>
                    ))}
                  </Space>
                </ScrollBody>
              </Card>
            )}
          </Col>

          {/* ── COL 2 — Key Findings + Narrative ── */}
          <Col xs={24} lg={8} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {highlightedFindings.length > 0 && (
              <Card className="crv-panel" bordered={false} style={{ ...cardStyle, flex: '0 0 auto' }}
                title={<span className="crv-card-title"><CheckCircleOutlined style={{ color: '#10b981' }} /> Key Findings Matrix</span>}>
                <ScrollBody maxHeight={260}>
                  <Timeline items={highlightedFindings.map((f, i) => ({
                    color: i % 3 === 0 ? 'blue' : i % 3 === 1 ? 'green' : 'gold',
                    children: <Text style={{ color: '#334155', fontSize: 13, fontWeight: 500 }}>{f}</Text>,
                  }))} />
                </ScrollBody>
              </Card>
            )}

            <Card className="crv-panel crv-narrative-panel" bordered={false} style={{ ...cardStyle, flex: '1 1 auto' }}
              title={<span className="crv-card-title"><FileTextOutlined style={{ color: '#0ea5e9' }} /> Full Forensic Narrative</span>}>
              <ScrollBody maxHeight={560}>
                <div className="crv-markdown" style={{ color: '#1e293b', lineHeight: 1.85, fontSize: 13.5 }}>
                  <ReactMarkdown>{report.content}</ReactMarkdown>
                </div>
              </ScrollBody>
            </Card>
          </Col>

          {/* ── COL 3 — Risk + Recommendations + Timeline ── */}
          <Col xs={24} lg={8} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {riskFactors.length > 0 && (
              <Card className="crv-panel" bordered={false} style={{ ...cardStyle, border: '1px solid #fecaca', background: '#fffafa', flex: '0 0 auto' }}
                title={<span className="crv-card-title" style={{ color: '#dc2626' }}><WarningOutlined /> Risk Factors</span>}>
                <ScrollBody maxHeight={260}>
                  <Space direction="vertical" style={{ width: '100%' }} size={8}>
                    {riskFactors.map((rf, i) => (
                      <div key={`${rf}-${i}`} className="crv-list-item crv-risk-item" style={{ background: '#fff5f5', borderLeft: '3px solid #dc2626', border: '1px solid #fee2e2', borderLeftWidth: 3, borderRadius: '0 8px 8px 0', padding: '9px 13px', fontSize: 13, color: '#991b1b', fontWeight: 600 }}>
                        ⚠ {rf}
                      </div>
                    ))}
                  </Space>
                </ScrollBody>
              </Card>
            )}

            {recommendations.length > 0 && (
              <Card className="crv-panel" bordered={false} style={{ ...cardStyle, border: '1px solid #bbf7d0', background: '#f9fffe', flex: '0 0 auto' }}
                title={<span className="crv-card-title" style={{ color: '#15803d' }}><CheckCircleOutlined /> Recommendations</span>}>
                <ScrollBody maxHeight={260}>
                  <Space direction="vertical" style={{ width: '100%' }} size={8}>
                    {recommendations.map((rec, i) => (
                      <div key={`${rec}-${i}`} className="crv-list-item crv-rec-item" style={{ background: '#f0fdf4', border: '1px solid #dcfce7', borderLeftWidth: 3, borderLeftColor: '#16a34a', borderRadius: '0 8px 8px 0', padding: '9px 13px', fontSize: 13, color: '#166534', display: 'flex', gap: 8, fontWeight: 500 }}>
                        <span style={{ color: '#16a34a', flexShrink: 0 }}>→</span>{rec}
                      </div>
                    ))}
                  </Space>
                </ScrollBody>
              </Card>
            )}

            {timeline.length > 0 && (
              <Card className="crv-panel" bordered={false} style={{ ...cardStyle, flex: '1 1 auto' }}
                title={<span className="crv-card-title"><ClockCircleOutlined style={{ color: '#6366f1' }} /> Investigation Timeline</span>}>
                <ScrollBody maxHeight={380}>
                  <Timeline items={timeline.map((t) => ({
                    color: 'blue',
                    children: (
                      <div>
                        {t.date && <Text style={{ color: '#64748b', fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 2, fontFamily: 'monospace' }}>{t.date}</Text>}
                        <Text style={{ color: '#334155', fontSize: 13, fontWeight: 500 }}>{t.event}</Text>
                      </div>
                    ),
                  }))} />
                </ScrollBody>
              </Card>
            )}
          </Col>
        </Row>

        {/* ══════════════ RELATIONSHIP MAP ══════════════ */}
        {edges.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <Card className="crv-panel" bordered={false} style={{ ...cardStyle }}
              title={<span className="crv-card-title"><ApiOutlined style={{ color: '#7c3aed' }} /> Panoramic Entity Relationship Map</span>}>
              <div style={{ background: '#0f172a', borderRadius: 12, padding: 'clamp(14px,2vw,28px)', position: 'relative', overflow: 'hidden' }}>
                <div className="crv-graph-grid" />
                <Row gutter={[14, 12]} style={{ position: 'relative', zIndex: 1 }}>
                  {edges.map((edge, i) => {
                    const src = nodes.find(n => n.id === edge.source)?.label || edge.source;
                    const tgt = nodes.find(n => n.id === edge.target)?.label || edge.target;
                    const sc  = strengthColor(edge.strength);
                    return (
                      <Col xs={24} md={12} xl={8} key={`${edge.source}-${edge.target}-${edge.relation}-${i}`}>
                        <div className="crv-edge-card" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                          <div style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 7, padding: '7px 9px', color: '#f1f5f9', fontSize: 11.5, fontWeight: 700, textAlign: 'center', wordBreak: 'break-all', minWidth: 0 }}>
                            {src}
                          </div>
                          <div style={{ flex: '0 0 70px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <span style={{ color: sc, fontSize: 9.5, fontWeight: 800, letterSpacing: 0.3, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: 68, textOverflow: 'ellipsis' }}>{edge.relation}</span>
                            <div style={{ width: '100%', height: 2, background: `linear-gradient(90deg,transparent,${sc},transparent)`, position: 'relative' }}>
                              <div style={{ position: 'absolute', right: '10%', top: -4, width: 0, height: 0, borderTop: '4px solid transparent', borderBottom: '4px solid transparent', borderLeft: `5px solid ${sc}` }} />
                            </div>
                            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 8, fontFamily: 'monospace' }}>{edge.strength.toUpperCase()}</span>
                          </div>
                          <div style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 7, padding: '7px 9px', color: '#f1f5f9', fontSize: 11.5, fontWeight: 700, textAlign: 'center', wordBreak: 'break-all', minWidth: 0 }}>
                            {tgt}
                          </div>
                        </div>
                      </Col>
                    );
                  })}
                </Row>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseReportView;
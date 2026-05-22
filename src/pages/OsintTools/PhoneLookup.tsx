/**
 * PhoneLookup — NexusOSINT-powered WhatsApp profile and PhoneInfoga intelligence tool.
 * Redesigned for clean, non-technical user-friendly result display.
 * Smart detection: only shows sections/fields that have real data.
 */
import React, { useState, useEffect, useRef } from 'react';
import { Button, Tag, Row, Col, Alert, Avatar, Progress } from 'antd';
import {
  SearchOutlined, SafetyCertificateOutlined, WhatsAppOutlined, UserOutlined,
  CalendarOutlined, MobileOutlined, AlertOutlined, EyeOutlined, GlobalOutlined,
  DownloadOutlined, CheckCircleOutlined, CloseCircleOutlined, InfoCircleOutlined,
  WifiOutlined, PhoneOutlined, EnvironmentOutlined, TeamOutlined,
  LinkOutlined, WarningOutlined, StarOutlined,
} from '@ant-design/icons';
import PhoneInputPkg from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import api from '../../api/axiosConfig';
import CyberConsoleLoader from '../../components/CyberConsoleLoader';

const PhoneInput = (PhoneInputPkg as { default?: typeof PhoneInputPkg }).default || PhoneInputPkg;
// Typography helpers not used in this component

// ── Types ────────────────────────────────────────────────────────────────────

interface WhatsAppProfile {
  phone?: string;
  name?: string;
  status?: string;
  image?: string;
  is_business?: boolean;
  last_updated?: string;
}

interface NexusResult {
  targetPhone: string;
  last_updated: string;
  source: string;
  exists: boolean;
  whatsapp?: WhatsAppProfile | null;
  phoneinfoga?: {
    country_code: number;
    country?: string;
    international: string;
    e164: string;
    carrier: string;
    line_type: string;
    exists: boolean;
    reputation: {
      score: number;
      level: 'Low' | 'Medium' | 'High';
      reports: string[];
      socialMedia: boolean;
      disposable: boolean;
      notes: string[];
    };
    footprint: {
      externalApis: string[];
      phoneBooks: string[];
      searchEngines: string[];
      reputationReports: string[];
      socialMediaHints: string[];
      disposableIndicators: string[];
      buckets?: {
        socialMedia: string[];
        disposableProviders: string[];
        reputation: string[];
        individuals: string[];
        general: string[];
      };
    };
    sources: string[];
    success: boolean;
  } | null;
}

interface PhoneLookupProps {
  onScanStateChange?: (isScanning: boolean) => void;
}

// ── Smart helpers ─────────────────────────────────────────────────────────────

/** Returns true only if the value is a real, non-placeholder string */
const hasValue = (v: string | number | undefined | null): boolean => {
  if (v === null || v === undefined) return false;
  const s = String(v).trim().toLowerCase();
  return s !== '' && s !== 'n/a' && s !== 'unknown' && s !== 'null' && s !== 'undefined' && s !== '0' && s !== 'none';
};

/** Extract domain label from a URL for friendly display */
const friendlyUrl = (url: string): string => {
  try {
    const u = new URL(url);
    return u.hostname.replace('www.', '');
  } catch {
    return url.length > 60 ? url.slice(0, 57) + '…' : url;
  }
};

/** Parse a URL into { label, icon, color } for rich display */
const categorizeUrl = (url: string): { label: string; category: string; color: string } => {
  const lower = url.toLowerCase();
  if (lower.includes('facebook')) return { label: 'Facebook', category: 'Social', color: '#1877f2' };
  if (lower.includes('instagram')) return { label: 'Instagram', category: 'Social', color: '#e1306c' };
  if (lower.includes('twitter') || lower.includes('x.com')) return { label: 'Twitter / X', category: 'Social', color: '#1da1f2' };
  if (lower.includes('linkedin')) return { label: 'LinkedIn', category: 'Social', color: '#0077b5' };
  if (lower.includes('tiktok')) return { label: 'TikTok', category: 'Social', color: '#010101' };
  if (lower.includes('snapchat')) return { label: 'Snapchat', category: 'Social', color: '#fffc00' };
  if (lower.includes('telegram')) return { label: 'Telegram', category: 'Messaging', color: '#2ca5e0' };
  if (lower.includes('whatsapp')) return { label: 'WhatsApp', category: 'Messaging', color: '#25D366' };
  if (lower.includes('truecaller')) return { label: 'Truecaller', category: 'Directory', color: '#0073e6' };
  if (lower.includes('numverify') || lower.includes('numinfo')) return { label: 'Number Lookup', category: 'Directory', color: '#7c3aed' };
  if (lower.includes('google')) return { label: 'Google Search', category: 'Search', color: '#ea4335' };
  if (lower.includes('bing')) return { label: 'Bing Search', category: 'Search', color: '#00809d' };
  if (lower.includes('duckduckgo')) return { label: 'DuckDuckGo', category: 'Search', color: '#de5833' };
  if (lower.includes('spamcalls') || lower.includes('shouldianswer') || lower.includes('hiya') || lower.includes('callapp')) return { label: 'Spam Check', category: 'Reputation', color: '#ef4444' };
  return { label: friendlyUrl(url), category: 'Web', color: '#64748b' };
};

/** Filter out placeholder / empty / generic items */
const cleanList = (items: string[]): string[] => {
  const bad = [
    /^(n\/a|unknown|none|null|undefined)$/i,
    /^(national numbering plan lookup|public caller.id|carrier allocation|spam \/ scam reputation|community caller|breach\/exposure|whatsapp registration check|telegram presence|signal \/ messenger|no disposable|possible disposable|country context|carrier context)$/i,
    /^phon(e)?infoga (local|cli|module)/i,
    /^(numbering.plan heuristics|carrier inference engine)$/i,
  ];
  return Array.from(new Set(items || []))
    .map(s => (s || '').trim())
    .filter(s => s.length > 2 && !bad.some(rx => rx.test(s)));
};

/** Extract only real URLs from a list */
const realUrls = (items: string[]): string[] =>
  cleanList(items).filter(s => /^https?:\/\//i.test(s));

/** Extract non-URL text items */
const textItems = (items: string[]): string[] =>
  cleanList(items).filter(s => !/^https?:\/\//i.test(s));

// ── Progress steps (kept stable to avoid effect re-runs) ─────────────────────
const STEPS = [
  'Initializing NexusOSINT telemetry…',
  'Probing PhoneInfoga carrier database…',
  'Authenticating WhatsApp sandbox credentials…',
  'Resolving display name registries…',
  'Downloading profile photo matrices…',
  'Fetching status bio signatures…',
  'Evaluating account classifications…',
  'Formulating forensic intelligence record…',
];

// ── Sub-components ───────────────────────────────────────────────────────────

/** A clean info row — only renders if value exists */
const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode; show?: boolean }> = ({
  icon, label, value, show = true,
}) => {
  if (!show) return null;
  return (
    <div className="pl-info-row">
      <div className="pl-info-icon">{icon}</div>
      <div className="pl-info-content">
        <span className="pl-info-label">{label}</span>
        <span className="pl-info-value">{value}</span>
      </div>
    </div>
  );
};

/** Renders a friendly link chip */
const LinkChip: React.FC<{ url: string }> = ({ url }) => {
  const { label, color } = categorizeUrl(url);
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="pl-link-chip" style={{ borderColor: color + '40', color }}>
      <LinkOutlined style={{ fontSize: 11 }} />
      <span>{label}</span>
    </a>
  );
};

/** Section block that only renders if it has content */
const Section: React.FC<{ title: string; icon: React.ReactNode; color: string; children: React.ReactNode; show?: boolean }> = ({
  title, icon, color, children, show = true,
}) => {
  if (!show) return null;
  return (
    <div className="pl-section">
      <div className="pl-section-header" style={{ color }}>
        <span className="pl-section-icon" style={{ background: color + '15', color }}>{icon}</span>
        <span>{title}</span>
      </div>
      {children}
    </div>
  );
};

/** Reputation score gauge */
const ReputationGauge: React.FC<{ score: number; level: string }> = ({ score, level }) => {
  const color = level === 'High' ? '#ef4444' : level === 'Medium' ? '#f59e0b' : '#10b981';
  const label = level === 'High' ? 'High Risk' : level === 'Medium' ? 'Moderate' : 'Clean';
  return (
    <div className="pl-gauge">
      <div className="pl-gauge-header">
        <span className="pl-gauge-label">Reputation Score</span>
        <span className="pl-gauge-score" style={{ color }}>{score}/100 — {label}</span>
      </div>
      <Progress percent={score} strokeColor={color} trailColor="#f1f5f9" showInfo={false} strokeWidth={8} style={{ margin: 0 }} />
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

const PhoneLookup: React.FC<PhoneLookupProps> = ({ onScanStateChange }) => {
  const [phone, setPhone] = useState('');
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [nexusData, setNexusData] = useState<NexusResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [targetPhone, setTargetPhone] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentStep, setCurrentStep] = useState('System Idle');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const pfi = nexusData?.phoneinfoga;
  const wa  = nexusData?.whatsapp;

  

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (scanning) {
      let idx = 0;
      interval = setInterval(() => { setCurrentStep(STEPS[idx % STEPS.length]); idx++; }, 2500);
    } else {
      setCurrentStep('System Idle');
    }
    onScanStateChange?.(scanning);
    return () => clearInterval(interval);
  }, [scanning, onScanStateChange]);

  const handleLookup = async () => {
    if (!phone || phone.trim().length < 5) { setError('Please enter a valid target phone number.'); return; }
    const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
    setTargetPhone(formattedPhone);
    setNexusData(null);
    setError(null);
    setProgress(0);
    setElapsedTime(0);
    setScanning(true);

    let seconds = 0;
    timerRef.current = setInterval(() => { seconds += 1; setElapsedTime(seconds); }, 1000);
    let sim = 0;
    const progInterval = setInterval(() => {
      sim += Math.random() * 5.5;
      if (sim >= 96) sim = 96;
      setProgress(Math.floor(sim));
    }, 450);

    try {
      const response = await api.post('/tools/nexus-lookup', { phone: formattedPhone });
      clearInterval(progInterval);
      if (timerRef.current) clearInterval(timerRef.current);
      setProgress(100);
      if (response.data) setNexusData(response.data as NexusResult);
    } catch (err: unknown) {
      clearInterval(progInterval);
      if (timerRef.current) clearInterval(timerRef.current);
      setProgress(100);
      const apiErr = err as { response?: { data?: { message?: string } } };
      setError(apiErr.response?.data?.message || 'Failed to connect to intelligence engine.');
    } finally {
      setScanning(false);
    }
  };

  const downloadPfp = () => {
    if (!wa?.image) return;
    const a = document.createElement('a');
    a.href = wa.image;
    a.download = `pfp_${targetPhone.replace(/\D/g, '')}.jpg`;
    a.target = '_blank';
    a.click();
  };

  // ── Derived display data ────────────────────────────────────────────────────

  const socialUrls   = realUrls([...(pfi?.footprint.buckets?.socialMedia     || pfi?.footprint.socialMediaHints     || [])]);
  const reputUrls    = realUrls([...(pfi?.footprint.buckets?.reputation       || pfi?.footprint.reputationReports    || [])]);
  const dirUrls      = realUrls([...(pfi?.footprint.buckets?.individuals      || pfi?.footprint.phoneBooks           || [])]);
  const searchUrls   = realUrls([...(pfi?.footprint.buckets?.general          || pfi?.footprint.searchEngines        || [])]);
  const disposUrls   = realUrls([...(pfi?.footprint.buckets?.disposableProviders || pfi?.footprint.disposableIndicators || [])]);
  const allLinks     = [...socialUrls, ...reputUrls, ...dirUrls, ...searchUrls, ...disposUrls];

  const repNotes     = textItems([...(pfi?.reputation.reports || []), ...(pfi?.reputation.notes || [])]);

  const showPfi      = !!pfi && pfi.success;
  const showWa       = !!wa;
  const hasAnything  = showPfi || showWa;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="pl-root">

      {/* ══ SEARCH CARD ══ */}
      <div className="pl-search-card">
        <div className="pl-search-header">
          <div className="pl-search-icon-wrap">
            <WhatsAppOutlined style={{ color: '#fff', fontSize: 22 }} />
          </div>
          <div>
            <div className="pl-search-title">Phone Intelligence Lookup</div>
            <div className="pl-search-sub">Carrier details · WhatsApp profile · Digital footprint · Reputation signals</div>
          </div>
        </div>
        <Row gutter={[14, 14]} align="bottom">
          <Col xs={24} md={18}>
            <label className="pl-input-label">TARGET PHONE NUMBER</label>
            <PhoneInput
              country={'pk'} value={phone}
              onChange={(val: string) => setPhone(val)}
              disabled={scanning}
              inputStyle={{ width: '100%', height: 50, background: '#f8fafc', border: '1.5px solid #e2e8f0', color: '#1e293b', fontSize: 15, borderRadius: 12, fontWeight: 600 }}
              buttonStyle={{ background: '#f8fafc', borderColor: '#e2e8f0', borderTopLeftRadius: 12, borderBottomLeftRadius: 12 }}
              dropdownStyle={{ background: '#ffffff', color: '#1e293b' }}
            />
          </Col>
          <Col xs={24} md={6}>
            <Button type="primary" onClick={handleLookup} loading={scanning} icon={<SearchOutlined />} size="large" className="pl-lookup-btn">
              {scanning ? 'Scanning…' : 'Run Lookup'}
            </Button>
          </Col>
        </Row>
      </div>

      {error && <Alert message={error} type="error" showIcon closable style={{ marginBottom: 20, borderRadius: 12 }} onClose={() => setError(null)} />}

      {/* ══ LOADER ══ */}
      {scanning && (
        <div style={{ marginBottom: 24 }}>
          <CyberConsoleLoader percent={progress} target={targetPhone} currentStep={currentStep} opName="Phone Intelligence Enumeration" />
        </div>
      )}

      {/* ══ RESULTS ══ */}
      {hasAnything && !scanning && (
        <div className="pl-results">

          {/* ── TOP SUMMARY BAR ── */}
          <div className="pl-summary-bar">
            <div className="pl-summary-target">
              <PhoneOutlined style={{ color: '#0ea5e9' }} />
              <span className="pl-summary-phone">{pfi?.international || targetPhone}</span>
              {hasValue(pfi?.country) && (
                <Tag className="pl-summary-tag" color="blue">{pfi?.country}</Tag>
              )}
              {pfi?.exists === true && <Tag className="pl-summary-tag" color="green"><CheckCircleOutlined /> Registered</Tag>}
              {pfi?.exists === false && <Tag className="pl-summary-tag" color="red"><CloseCircleOutlined /> Not Found</Tag>}
              {wa && <Tag className="pl-summary-tag" color="green" style={{ background: '#dcfce7', color: '#15803d', border: 'none' }}><WhatsAppOutlined /> WhatsApp Active</Tag>}
            </div>
            <div className="pl-summary-meta">
              <span className="pl-meta-chip"><EyeOutlined /> Scan complete in {elapsedTime}s</span>
            </div>
          </div>

          <Row gutter={[16, 16]}>

            {/* ══ LEFT COLUMN — CARRIER + REPUTATION ══ */}
            <Col xs={24} lg={showWa ? 8 : 12}>

              {/* WhatsApp Profile Card */}
              {showWa && (
                <div className="pl-card pl-wa-card">
                  <div className="pl-wa-top">
                    <div className="pl-wa-avatar-wrap">
                      {wa.image ? (
                        <Avatar size={88} src={wa.image} icon={<UserOutlined />} className="pl-wa-avatar" />
                      ) : (
                        <div className="pl-wa-avatar-placeholder"><UserOutlined style={{ fontSize: 32, color: '#94a3b8' }} /></div>
                      )}
                      <div className="pl-wa-badge"><WhatsAppOutlined /></div>
                    </div>
                    <div className="pl-wa-identity">
                      {hasValue(wa.name) && <div className="pl-wa-name">{wa.name}</div>}
                      <div className="pl-wa-phone">{wa.phone || targetPhone}</div>
                      <div className="pl-wa-tags">
                        <Tag color={wa.is_business ? 'purple' : 'cyan'} style={{ margin: 0, fontWeight: 700, borderRadius: 6 }}>
                          {wa.is_business ? '🏢 Business' : '👤 Personal'}
                        </Tag>
                        <Tag color="green" style={{ margin: 0, fontWeight: 700, borderRadius: 6 }}>
                          <SafetyCertificateOutlined /> Active
                        </Tag>
                      </div>
                    </div>
                  </div>

                  {hasValue(wa.status) && (
                    <div className="pl-wa-status">
                      <span className="pl-wa-status-label">About</span>
                      <span className="pl-wa-status-text">"{wa.status}"</span>
                    </div>
                  )}

                  <div className="pl-wa-actions">
                    {wa.image && (
                      <Button icon={<DownloadOutlined />} onClick={downloadPfp} className="pl-pfp-btn" size="small">
                        Download Profile Photo
                      </Button>
                    )}
                    {wa.last_updated && (
                      <span className="pl-wa-updated"><CalendarOutlined /> {new Date(wa.last_updated).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Carrier Intelligence */}
              {showPfi && (
                <div className="pl-card">
                  <div className="pl-card-title"><WifiOutlined style={{ color: '#0ea5e9' }} /> Carrier Intelligence</div>
                  <div className="pl-info-list">
                    <InfoRow icon={<PhoneOutlined />} label="Phone Number" value={<code className="pl-code">{pfi!.international}</code>} show={hasValue(pfi!.international)} />
                    <InfoRow icon={<EnvironmentOutlined />} label="Country" value={pfi!.country} show={hasValue(pfi!.country)} />
                    <InfoRow icon={<WifiOutlined />} label="Mobile Carrier" value={pfi!.carrier} show={hasValue(pfi!.carrier) && pfi!.carrier !== 'Unknown (requires numverify)'} />
                    <InfoRow
                      icon={<MobileOutlined />}
                      label="Line Type"
                      value={<Tag color="purple" style={{ margin: 0, fontWeight: 700, borderRadius: 6 }}>{pfi!.line_type}</Tag>}
                      show={hasValue(pfi!.line_type)}
                    />
                    <InfoRow
                      icon={pfi!.exists ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                      label="Number Status"
                      value={
                        <Tag color={pfi!.exists ? 'green' : 'red'} style={{ margin: 0, fontWeight: 700, borderRadius: 6 }}>
                          {pfi!.exists ? 'Active & Registered' : 'Not Detected'}
                        </Tag>
                      }
                      show={typeof pfi!.exists === 'boolean'}
                    />
                  </div>
                </div>
              )}

              {/* Reputation Card */}
              {showPfi && (
                <div className={`pl-card pl-rep-card pl-rep-${pfi!.reputation.level.toLowerCase()}`}>
                  <div className="pl-card-title">
                    <SafetyCertificateOutlined style={{ color: pfi!.reputation.level === 'High' ? '#ef4444' : pfi!.reputation.level === 'Medium' ? '#f59e0b' : '#10b981' }} />
                    {' '}Reputation Assessment
                  </div>
                  <ReputationGauge score={pfi!.reputation.score} level={pfi!.reputation.level} />

                  <div className="pl-rep-flags">
                    {pfi!.reputation.socialMedia && (
                      <div className="pl-rep-flag pl-rep-flag-info">
                        <TeamOutlined /> Likely active on messaging platforms
                      </div>
                    )}
                    {pfi!.reputation.disposable && (
                      <div className="pl-rep-flag pl-rep-flag-warn">
                        <WarningOutlined /> Disposable-number pattern detected
                      </div>
                    )}
                    {!pfi!.reputation.disposable && !pfi!.reputation.socialMedia && (
                      <div className="pl-rep-flag pl-rep-flag-ok">
                        <CheckCircleOutlined /> No negative signals found
                      </div>
                    )}
                  </div>

                  {repNotes.length > 0 && (
                    <div className="pl-rep-notes">
                      {repNotes.map((note, i) => (
                        <div key={i} className="pl-rep-note"><InfoCircleOutlined style={{ color: '#64748b', flexShrink: 0 }} />{note}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Col>

            {/* ══ RIGHT COLUMN — DIGITAL FOOTPRINT ══ */}
            {showPfi && allLinks.length > 0 && (
              <Col xs={24} lg={showWa ? 16 : 12}>
                <div className="pl-card pl-footprint-card">
                  <div className="pl-card-title"><GlobalOutlined style={{ color: '#7c3aed' }} /> Digital Footprint</div>
                  <p className="pl-footprint-intro">
                    These are public sources where this number appears or can be searched. Click any link to open.
                  </p>

                  <Section title="Social Media Profiles" icon={<TeamOutlined />} color="#1877f2" show={socialUrls.length > 0}>
                    <div className="pl-link-grid">
                      {socialUrls.map((url, i) => <LinkChip key={i} url={url} />)}
                    </div>
                  </Section>

                  <Section title="Directory Listings" icon={<UserOutlined />} color="#0ea5e9" show={dirUrls.length > 0}>
                    <div className="pl-link-grid">
                      {dirUrls.map((url, i) => <LinkChip key={i} url={url} />)}
                    </div>
                  </Section>

                  <Section title="Reputation & Spam Reports" icon={<AlertOutlined />} color="#ef4444" show={reputUrls.length > 0}>
                    <div className="pl-link-grid">
                      {reputUrls.map((url, i) => <LinkChip key={i} url={url} />)}
                    </div>
                  </Section>

                  <Section title="Search Engines" icon={<SearchOutlined />} color="#64748b" show={searchUrls.length > 0}>
                    <p className="pl-section-note">Click to search this number on major search engines.</p>
                    <div className="pl-link-grid">
                      {searchUrls.map((url, i) => <LinkChip key={i} url={url} />)}
                    </div>
                  </Section>

                  <Section title="Disposable / Temp Providers" icon={<WarningOutlined />} color="#f59e0b" show={disposUrls.length > 0}>
                    <div className="pl-link-grid">
                      {disposUrls.map((url, i) => <LinkChip key={i} url={url} />)}
                    </div>
                  </Section>

                  {allLinks.length === 0 && (
                    <div className="pl-empty-state">
                      <StarOutlined style={{ fontSize: 28, color: '#cbd5e1', marginBottom: 8 }} />
                      <div>No public digital footprint found for this number.</div>
                    </div>
                  )}
                </div>
              </Col>
            )}

            {/* WhatsApp not found notice */}
            {!showWa && nexusData && (
              <Col xs={24}>
                <Alert
                  message="No WhatsApp profile found"
                  description="This number either isn't registered on WhatsApp, has a private profile, or the lookup returned no data."
                  type="warning" showIcon style={{ borderRadius: 12 }}
                />
              </Col>
            )}
          </Row>

          {/* Footer */}
          <div className="pl-footer">
            <span>🔍 NexusOSINT Core</span>
            <span>·</span>
            <span>Scan completed in {elapsedTime}s</span>
            <span>·</span>
            <span>All data sourced from public records</span>
          </div>
        </div>
      )}

      <style>{`
        .pl-root { padding: 10px 0; font-family: 'DM Sans', 'Nunito', system-ui, sans-serif; }

        /* ── Search Card ── */
        .pl-search-card { background: #fff; border-radius: 16px; padding: 24px; margin-bottom: 20px; border: 1px solid #f1f5f9; box-shadow: 0 4px 20px rgba(0,0,0,0.04); }
        .pl-search-header { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; }
        .pl-search-icon-wrap { width: 48px; height: 48px; flex-shrink: 0; background: linear-gradient(135deg,#25D366,#128C7E); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .pl-search-title { font-weight: 800; font-size: 18px; color: #1e293b; }
        .pl-search-sub { color: #64748b; font-size: 13px; margin-top: 2px; }
        .pl-input-label { font-size: 11px; font-weight: 700; color: #64748b; letter-spacing: 1px; display: block; margin-bottom: 6px; }
        .pl-lookup-btn { width: 100%; height: 50px; border-radius: 12px; background: linear-gradient(135deg,#25D366,#128C7E); border: none; font-weight: 700; font-size: 15px; color: #fff; box-shadow: 0 4px 12px rgba(37,211,102,0.25); }

        /* ── Summary Bar ── */
        .pl-summary-bar { background: #fff; border-radius: 14px; border: 1px solid #e2e8f0; padding: 14px 20px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.03); }
        .pl-summary-target { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .pl-summary-phone { font-size: 17px; font-weight: 800; color: #0f172a; font-family: 'JetBrains Mono', monospace; }
        .pl-summary-tag { margin: 0; font-weight: 700; border-radius: 6px; }
        .pl-summary-meta { display: flex; gap: 8px; flex-wrap: wrap; }
        .pl-meta-chip { background: #f1f5f9; border-radius: 8px; padding: 4px 12px; font-size: 12px; color: #64748b; font-weight: 600; display: flex; align-items: center; gap: 6px; }

        /* ── Card base ── */
        .pl-card { background: #fff; border-radius: 14px; border: 1px solid #e8edf3; padding: 18px 20px; margin-bottom: 14px; box-shadow: 0 2px 12px rgba(0,0,0,0.03); }
        .pl-card-title { font-weight: 700; font-size: 13.5px; color: #1e293b; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; letter-spacing: 0.01em; }

        /* ── WhatsApp Card ── */
        .pl-wa-card { border: 1.5px solid #dcfce7; }
        .pl-wa-top { display: flex; gap: 16px; align-items: flex-start; margin-bottom: 14px; }
        .pl-wa-avatar-wrap { position: relative; flex-shrink: 0; }
        .pl-wa-avatar { border: 3px solid #25D366; box-shadow: 0 4px 16px rgba(37,211,102,0.2); }
        .pl-wa-avatar-placeholder { width: 88px; height: 88px; border-radius: 50%; background: #f1f5f9; border: 3px solid #e2e8f0; display: flex; align-items: center; justify-content: center; }
        .pl-wa-badge { position: absolute; bottom: 2px; right: 2px; background: #25D366; color: #fff; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 12px; border: 2px solid #fff; }
        .pl-wa-identity { flex: 1; min-width: 0; }
        .pl-wa-name { font-size: 17px; font-weight: 800; color: #0f172a; margin-bottom: 3px; word-break: break-word; }
        .pl-wa-phone { font-size: 13px; color: #64748b; font-family: monospace; margin-bottom: 8px; }
        .pl-wa-tags { display: flex; gap: 6px; flex-wrap: wrap; }
        .pl-wa-status { background: #f8fafc; border-radius: 10px; padding: 10px 14px; margin-bottom: 12px; border-left: 3px solid #25D366; }
        .pl-wa-status-label { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px; }
        .pl-wa-status-text { font-size: 13.5px; color: #334155; font-style: italic; font-weight: 500; }
        .pl-wa-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .pl-pfp-btn { border-radius: 8px; font-weight: 700; background: #f0fdf4; border: 1.5px solid #86efac; color: #15803d; }
        .pl-pfp-btn:hover { background: #dcfce7 !important; border-color: #4ade80 !important; color: #15803d !important; }
        .pl-wa-updated { font-size: 11.5px; color: #94a3b8; display: flex; align-items: center; gap: 5px; }

        /* ── Info rows ── */
        .pl-info-list { display: flex; flex-direction: column; gap: 0; }
        .pl-info-row { display: flex; align-items: center; gap: 12px; padding: 9px 0; border-bottom: 1px solid #f1f5f9; }
        .pl-info-row:last-child { border-bottom: none; padding-bottom: 0; }
        .pl-info-icon { width: 28px; height: 28px; border-radius: 7px; background: #f8fafc; display: flex; align-items: center; justify-content: center; color: #64748b; font-size: 13px; flex-shrink: 0; border: 1px solid #f1f5f9; }
        .pl-info-content { flex: 1; display: flex; justify-content: space-between; align-items: center; gap: 8px; min-width: 0; }
        .pl-info-label { font-size: 12px; color: #94a3b8; font-weight: 600; flex-shrink: 0; }
        .pl-info-value { font-size: 13px; color: #1e293b; font-weight: 600; text-align: right; word-break: break-all; }
        .pl-code { background: #f1f5f9; border-radius: 5px; padding: 2px 7px; font-size: 12px; color: #0f172a; font-family: monospace; border: 1px solid #e2e8f0; }

        /* ── Reputation ── */
        .pl-rep-card { border-left: 3px solid #e2e8f0; }
        .pl-rep-card.pl-rep-high { border-left-color: #ef4444; }
        .pl-rep-card.pl-rep-medium { border-left-color: #f59e0b; }
        .pl-rep-card.pl-rep-low { border-left-color: #10b981; }
        .pl-gauge { margin-bottom: 14px; }
        .pl-gauge-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
        .pl-gauge-label { font-size: 12px; color: #64748b; font-weight: 600; }
        .pl-gauge-score { font-size: 13px; font-weight: 800; }
        .pl-rep-flags { display: flex; flex-direction: column; gap: 6px; margin-bottom: 10px; }
        .pl-rep-flag { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; padding: 8px 12px; border-radius: 8px; }
        .pl-rep-flag-info { background: #eff6ff; color: #1d4ed8; }
        .pl-rep-flag-warn { background: #fef9c3; color: #854d0e; }
        .pl-rep-flag-ok { background: #f0fdf4; color: #15803d; }
        .pl-rep-notes { display: flex; flex-direction: column; gap: 5px; }
        .pl-rep-note { display: flex; align-items: flex-start; gap: 8px; font-size: 12.5px; color: #475569; padding: 6px 10px; background: #f8fafc; border-radius: 7px; }

        /* ── Footprint ── */
        .pl-footprint-card { min-height: 200px; }
        .pl-footprint-intro { font-size: 13px; color: #64748b; margin: 0 0 16px; line-height: 1.6; }
        .pl-section { margin-bottom: 18px; }
        .pl-section:last-child { margin-bottom: 0; }
        .pl-section-header { display: flex; align-items: center; gap: 8px; font-size: 12.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 10px; }
        .pl-section-icon { width: 26px; height: 26px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 13px; flex-shrink: 0; }
        .pl-section-note { font-size: 12px; color: #94a3b8; margin: -4px 0 8px; }
        .pl-link-grid { display: flex; flex-wrap: wrap; gap: 7px; }
        .pl-link-chip { display: inline-flex; align-items: center; gap: 5px; padding: 5px 12px; border-radius: 8px; border: 1.5px solid; font-size: 12.5px; font-weight: 700; text-decoration: none; background: #fff; transition: all 0.15s ease; white-space: nowrap; }
        .pl-link-chip:hover { filter: brightness(0.92); transform: translateY(-1px); box-shadow: 0 3px 10px rgba(0,0,0,0.1); }
        .pl-empty-state { text-align: center; padding: 32px; color: #94a3b8; font-size: 13px; display: flex; flex-direction: column; align-items: center; gap: 4px; }

        /* ── Footer ── */
        .pl-footer { margin-top: 16px; padding: 12px 16px; background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; display: flex; gap: 10px; align-items: center; flex-wrap: wrap; font-size: 12px; color: #94a3b8; font-weight: 500; }

        /* ── Results container ── */
        .pl-results { animation: pl-fadein 0.4s ease both; }
        @keyframes pl-fadein { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  );
};

export default PhoneLookup;
/**
 * KaliSherlockSearch — Username OSINT scanner powered by Sherlock.
 * Probes 350+ social platforms. Smart filter bar lets users instantly
 * slice results by status: Found · Not Found · Rate Limited · Error.
 */
import React, { useState, useEffect, useRef } from 'react';
import { Form, Input, Button, Card, Tag, Row, Col } from 'antd';
import CyberConsoleLoader from '../../components/CyberConsoleLoader';
import {
  SearchOutlined, CheckCircleOutlined, CloseCircleOutlined,
  LinkOutlined, EyeOutlined, SafetyCertificateOutlined, AlertOutlined,
  AimOutlined, WarningOutlined, StopOutlined,
} from '@ant-design/icons';
import api from '../../api/axiosConfig';

// ── Types ─────────────────────────────────────────────────────────────────────

interface FoundPlatform {
  platform: string;
  url: string;
  status: 'found' | 'not_found' | 'rate_limit' | 'error';
  statusCode: number;
  message?: string;
}

type SherlockFilter = 'all' | 'found' | 'not_found' | 'rate_limit' | 'error';

interface ScanStats {
  threatLevel: string;
  exposureCount: number;
  elapsedTime: number;
}

interface KaliSherlockSearchProps {
  onScanStateChange?: (isScanning: boolean) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const getPlatformFavicon = (url: string): string => {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
  } catch {
    return '';
  }
};

const normalizePlatforms = (platforms: any[]): FoundPlatform[] =>
  platforms.map((p) => {
    const raw = String(p?.status || (p?.found ? 'found' : 'not_found')).toLowerCase();
    const status: FoundPlatform['status'] =
      raw === 'found' ? 'found'
        : raw === 'rate_limit' ? 'rate_limit'
          : raw === 'error' ? 'error'
            : 'not_found';

    return {
      platform: p?.platform || p?.name || 'Unknown',
      url: p?.url || p?.link || '',
      status,
      statusCode: typeof p?.statusCode === 'number'
        ? p.statusCode
        : status === 'found' ? 200 : status === 'rate_limit' ? 429 : status === 'error' ? 500 : 404,
      message: p?.message || p?.detail || '',
    };
  });

// ── Status label/colour maps ──────────────────────────────────────────────────

const STATUS_META: Record<SherlockFilter, {
  label: string;
  bg: string;
  border: string;
  text: string;
  icon: React.ReactNode;
}> = {
  all: { label: 'All', bg: '#f8fafc', border: '#e2e8f0', text: '#475569', icon: <AimOutlined /> },
  found: { label: 'Found', bg: '#dcfce7', border: '#86efac', text: '#15803d', icon: <CheckCircleOutlined /> },
  not_found: { label: 'Not Found', bg: '#f1f5f9', border: '#cbd5e1', text: '#64748b', icon: <CloseCircleOutlined /> },
  rate_limit: { label: 'Rate Limited', bg: '#ffedd5', border: '#fdba74', text: '#ea580c', icon: <WarningOutlined /> },
  error: { label: 'Error', bg: '#fee2e2', border: '#fca5a5', text: '#dc2626', icon: <StopOutlined /> },
};

const SCAN_STEPS = [
  'Initializing forensic sandbox...',
  'Loading Sherlock database (450+ sites)...',
  'Opening validation sockets...',
  'Interrogating identity signatures...',
  'Resolving username across social matrices...',
  'Cross-referencing security policies...',
  'Evaluating profile checksums...',
  'Compiling exposure matrices...',
];

// ── Component ─────────────────────────────────────────────────────────────────

const KaliSherlockSearch: React.FC<KaliSherlockSearchProps> = ({ onScanStateChange }) => {
  const [form] = Form.useForm();

  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [platforms, setPlatforms] = useState<FoundPlatform[]>([]);
  const [activeFilter, setActiveFilter] = useState<SherlockFilter>('all');
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [targetUsername, setTargetUsername] = useState('');
  const [currentStep, setCurrentStep] = useState('System Idle');
  const [scanStats, setScanStats] = useState<ScanStats>({
    threatLevel: 'CLEAN',
    exposureCount: 0,
    elapsedTime: 0,
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Scanning step cycle ──
  useEffect(() => {
    if (onScanStateChange) onScanStateChange(scanning);

    if (scanning) {
      let idx = 0;
      stepIntervalRef.current = setInterval(() => {
        setCurrentStep(SCAN_STEPS[idx % SCAN_STEPS.length]);
        idx++;
      }, 2500);
    } else {
      setCurrentStep('System Idle');
      if (stepIntervalRef.current) {
        clearInterval(stepIntervalRef.current);
        stepIntervalRef.current = null;
      }
    }

    return () => {
      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
    };
  }, [scanning, onScanStateChange]);

  // ── Cleanup on unmount ──
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
    };
  }, []);

  // ── Search handler ────────────────────────────────────────────────────────

  const handleSearch = async (values: { username: string }) => {
    const username = values.username.trim();

    if (!username) {
      setError('Username cannot be empty');
      return;
    }

    // Reset state
    setTargetUsername(username);
    setPlatforms([]);
    setProgress(0);
    setDone(false);
    setError(null);
    setScanning(true);
    setActiveFilter('all');
    setScanStats({ threatLevel: 'CLEAN', exposureCount: 0, elapsedTime: 0 });

    // Elapsed-time ticker
    let seconds = 0;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      seconds += 1;
      setScanStats((prev) => ({ ...prev, elapsedTime: seconds }));
    }, 1000);

    // Simulated progress bar (caps at 96 % until real response arrives)
    let sim = 0;
    const progressInterval = setInterval(() => {
      sim = Math.min(sim + Math.random() * 4, 96);
      setProgress(Math.floor(sim));
    }, 600);

    try {
      const response = await api.post(
        '/kali-tools/sherlock',
        { username },
        { timeout: 300_000 }
      );

      clearInterval(progressInterval);
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      setProgress(100);

      const data = response.data || {};
      const platformsList = data.platforms;

      if (!Array.isArray(platformsList)) {
        throw new Error('Invalid response format from server');
      }

      if (platformsList.length === 0) {
        setError(`No platforms returned for username "${username}". The tool may have failed on the server — check server logs.`);
        setDone(false);
        return;
      }

      const parsed = normalizePlatforms(platformsList);
      setPlatforms(parsed);

      const found = parsed.filter((p) => p.status === 'found').length;
      setScanStats((prev) => ({
        ...prev,
        exposureCount: found,
        threatLevel: found > 10 ? 'EXPANSIVE' : found > 4 ? 'MODERATE' : 'SECURE',
      }));

      setDone(true);
    } catch (err: any) {
      clearInterval(progressInterval);
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      setProgress(0);

      const networkTimeout = err?.code === 'ECONNABORTED' || String(err?.message || '').toLowerCase().includes('timeout');
      const networkChanged = err?.code === 'ERR_NETWORK_CHANGED' || String(err?.message || '').toLowerCase().includes('network');
      const errorMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        (networkTimeout
          ? 'Sherlock scan timed out. Try again or increase backend Sherlock timeout settings.'
          : networkChanged
            ? 'Network changed during scan request. Please retry the search.'
            : err?.message) ||
        'Scan failed. Please try again.';

      setError(errorMsg);
      setPlatforms([]);
      setDone(false);
    } finally {
      setScanning(false);
    }
  };

  // ── Derived filter counts ─────────────────────────────────────────────────

  const counts: Record<SherlockFilter, number> = {
    all: platforms.length,
    found: platforms.filter((p) => p.status === 'found').length,
    not_found: platforms.filter((p) => p.status === 'not_found').length,
    rate_limit: platforms.filter((p) => p.status === 'rate_limit').length,
    error: platforms.filter((p) => p.status === 'error').length,
  };

  const filtered = activeFilter === 'all'
    ? platforms
    : platforms.filter((p) => p.status === activeFilter);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ padding: '10px 0' }}>

      {/* ── Search Card ── */}
      <Card style={{
        marginBottom: 24,
        background: '#ffffff',
        borderRadius: 16,
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        border: '1px solid #f1f5f9',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{
            width: 48, height: 48, flexShrink: 0,
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <AimOutlined style={{ color: '#fff', fontSize: 22 }} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 19, color: '#1e293b' }}>Username OSINT Matrix</div>
            <div style={{ color: '#64748b', fontSize: 13, fontWeight: 500 }}>
              Audit username exposure across hundreds of social networks using Sherlock
            </div>
          </div>
        </div>

        <Form form={form} onFinish={handleSearch} layout="vertical">
          <Row gutter={16} align="bottom">
            <Col xs={24} md={18}>
              <Form.Item
                name="username"
                rules={[{ required: true, message: 'Please enter a target username' }]}
                style={{ marginBottom: 0 }}
              >
                <Input
                  size="large"
                  placeholder="Enter target username (e.g. john_doe)"
                  prefix={<AimOutlined style={{ color: '#6366f1' }} />}
                  disabled={scanning}
                  style={{ height: 50, fontSize: 15, borderRadius: 12, border: '1.5px solid #e2e8f0' }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Button
                type="primary"
                htmlType="submit"
                loading={scanning}
                icon={<SearchOutlined />}
                size="large"
                style={{
                  width: '100%',
                  height: 50,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: 15,
                  boxShadow: '0 4px 12px rgba(99,102,241,0.2)',
                }}
              >
                {scanning ? 'Scanning...' : 'Search Username'}
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* ── Error Banner ── */}
      {error && (
        <div style={{
          marginBottom: 20,
          padding: '14px 20px',
          borderRadius: 12,
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#991b1b',
          fontSize: 13,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <StopOutlined style={{ fontSize: 16, color: '#dc2626', flexShrink: 0 }} />
          {error}
        </div>
      )}

      {/* ── Scanning Loader ── */}
      {scanning && (
        <div style={{ marginBottom: 24 }}>
          <CyberConsoleLoader
            percent={progress}
            target={targetUsername}
            currentStep={currentStep}
            opName="Username Footprint Audit"
          />
        </div>
      )}

      {/* ── Results ── */}
      {done && !scanning && (
        <>
          {/* ── Stats Row ── */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            {[
              {
                icon: (
                  <AlertOutlined style={{
                    fontSize: 18,
                    color: scanStats.threatLevel === 'EXPANSIVE' ? '#ef4444'
                      : scanStats.threatLevel === 'MODERATE' ? '#f59e0b'
                        : '#10b981',
                  }} />
                ),
                label: 'FOOTPRINT STATUS',
                value: scanStats.threatLevel,
                color: scanStats.threatLevel === 'EXPANSIVE' ? '#ef4444'
                  : scanStats.threatLevel === 'MODERATE' ? '#f59e0b'
                    : '#10b981',
              },
              {
                icon: <EyeOutlined style={{ fontSize: 18, color: '#6366f1' }} />,
                label: 'PROFILES DISCOVERED',
                value: `${scanStats.exposureCount} locations`,
                color: '#1e293b',
              },
              {
                icon: <SafetyCertificateOutlined style={{ fontSize: 18, color: '#3b82f6' }} />,
                label: 'ELAPSED TIME',
                value: `${scanStats.elapsedTime}s`,
                color: '#1e293b',
              },
            ].map((s, i) => (
              <Col xs={24} sm={8} key={i}>
                <Card
                  style={{
                    borderRadius: 16,
                    border: '1px solid #f1f5f9',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                    background: 'linear-gradient(135deg,#ffffff,#f8fafc)',
                  }}
                  bodyStyle={{ padding: 20 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    {s.icon}
                    <span style={{ color: '#64748b', fontWeight: 600, fontSize: 12, letterSpacing: 0.5 }}>
                      {s.label}
                    </span>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
                </Card>
              </Col>
            ))}
          </Row>

          {/* ── Smart Filter Bar ── */}
          <div style={{ marginBottom: 20 }}>
            <div style={{
              fontSize: 12,
              color: '#94a3b8',
              fontWeight: 600,
              letterSpacing: 1,
              marginBottom: 10,
              textTransform: 'uppercase',
            }}>
              Filter Results
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {(Object.keys(STATUS_META) as SherlockFilter[]).map((key) => {
                const meta = STATUS_META[key];
                const count = counts[key];
                const active = activeFilter === key;

                return (
                  <button
                    key={key}
                    onClick={() => setActiveFilter(key)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '7px 14px',
                      borderRadius: 999,
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: 13,
                      border: `2px solid ${active ? meta.border : '#e2e8f0'}`,
                      background: active ? meta.bg : '#ffffff',
                      color: active ? meta.text : '#64748b',
                      boxShadow: active ? `0 0 0 3px ${meta.border}55` : 'none',
                      transition: 'all 0.15s ease',
                      outline: 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (!active) (e.currentTarget).style.borderColor = meta.border;
                    }}
                    onMouseLeave={(e) => {
                      if (!active) (e.currentTarget).style.borderColor = '#e2e8f0';
                    }}
                  >
                    <span style={{ fontSize: 13 }}>{meta.icon}</span>
                    {meta.label}
                    <span style={{
                      background: active ? meta.text : '#e2e8f0',
                      color: active ? '#fff' : '#475569',
                      borderRadius: 999,
                      padding: '1px 8px',
                      fontSize: 11,
                      fontWeight: 800,
                      minWidth: 22,
                      textAlign: 'center',
                    }}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Platform Grid ── */}
          {filtered.length > 0 ? (
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CheckCircleOutlined style={{ color: '#10b981', fontSize: 18 }} />
                  <span style={{ color: '#1e293b', fontWeight: 700, fontSize: 15 }}>
                    {activeFilter === 'all' ? 'All Platforms' : STATUS_META[activeFilter].label}
                    {' '}&mdash; &ldquo;{targetUsername}&rdquo;
                  </span>
                  <span style={{ marginLeft: 'auto', fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>
                    {filtered.length} result{filtered.length !== 1 ? 's' : ''}
                  </span>
                </div>
              }
              style={{
                borderRadius: 16,
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
              }}
              bodyStyle={{ padding: '16px 20px' }}
            >
              <Row gutter={[14, 14]}>
                {filtered.map((p, idx) => {
                  const meta = STATUS_META[p.status];
                  return (
                    <Col key={idx} xs={24} sm={12} lg={8}>
                      <a
                        href={p.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: 'none', display: 'block' }}
                      >
                        <div
                          style={{
                            border: '1px solid #f1f5f9',
                            background: '#f8fafc',
                            borderRadius: 14,
                            padding: '14px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 14,
                            cursor: 'pointer',
                            transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
                          }}
                          onMouseEnter={(e) => {
                            const d = e.currentTarget as HTMLDivElement;
                            d.style.borderColor = '#6366f1';
                            d.style.background = '#ffffff';
                            d.style.boxShadow = '0 8px 24px rgba(99,102,241,0.08)';
                            d.style.transform = 'translateY(-2px)';
                          }}
                          onMouseLeave={(e) => {
                            const d = e.currentTarget as HTMLDivElement;
                            d.style.borderColor = '#f1f5f9';
                            d.style.background = '#f8fafc';
                            d.style.boxShadow = 'none';
                            d.style.transform = 'translateY(0)';
                          }}
                        >
                          {/* Favicon */}
                          <div style={{
                            width: 42,
                            height: 42,
                            borderRadius: 10,
                            background: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid #e2e8f0',
                            flexShrink: 0,
                          }}>
                            {p.url ? (
                              <img
                                src={getPlatformFavicon(p.url)}
                                alt={p.platform}
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                                }}
                                style={{ width: 22, height: 22, objectFit: 'contain' }}
                              />
                            ) : (
                              <LinkOutlined style={{ color: '#94a3b8', fontSize: 16 }} />
                            )}
                          </div>

                          {/* Platform info */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>
                              {p.platform}
                            </div>
                            <div style={{
                              fontSize: 11,
                              color: '#94a3b8',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              fontFamily: 'monospace',
                              marginTop: 2,
                            }}>
                              {p.url || p.message || '—'}
                            </div>
                          </div>

                          {/* Status badge */}
                          <Tag style={{
                            margin: 0,
                            fontWeight: 700,
                            fontSize: 11,
                            borderRadius: 6,
                            padding: '3px 9px',
                            border: `1px solid ${meta.border}`,
                            background: meta.bg,
                            color: meta.text,
                            flexShrink: 0,
                          }}>
                            {meta.icon}{' '}
                            {p.status === 'found' ? 'FOUND'
                              : p.status === 'rate_limit' ? 'RATE LIMIT'
                                : p.status === 'error' ? 'ERROR'
                                  : 'NOT FOUND'}
                          </Tag>
                        </div>
                      </a>
                    </Col>
                  );
                })}
              </Row>
            </Card>
          ) : (
            <Card style={{
              textAlign: 'center',
              padding: '48px 24px',
              borderRadius: 16,
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
            }}>
              <CloseCircleOutlined style={{ fontSize: 48, color: '#cbd5e1', marginBottom: 16 }} />
              <div style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>
                No {activeFilter !== 'all' ? STATUS_META[activeFilter].label : ''} Results
              </div>
              <div style={{ color: '#64748b', fontSize: 14 }}>
                {activeFilter !== 'all'
                  ? `No platforms with status "${STATUS_META[activeFilter].label}" for "${targetUsername}".`
                  : `Username "${targetUsername}" was not found on any platform.`}
              </div>
              {activeFilter !== 'all' && (
                <button
                  onClick={() => setActiveFilter('all')}
                  style={{
                    marginTop: 16,
                    padding: '8px 20px',
                    borderRadius: 999,
                    cursor: 'pointer',
                    border: '1.5px solid #6366f1',
                    background: '#ffffff',
                    color: '#6366f1',
                    fontWeight: 700,
                    fontSize: 13,
                    outline: 'none',
                  }}
                >
                  Show All Results
                </button>
              )}
            </Card>
          )}
        </>
      )}

      {/* ── Global animation styles ── */}
      <style>{`
        .blink { animation: blink-anim 1s step-end infinite; }
        @keyframes blink-anim { 50% { opacity: 0; } }
      `}</style>
    </div>
  );
};

export default KaliSherlockSearch;
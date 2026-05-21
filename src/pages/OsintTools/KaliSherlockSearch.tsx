/**
 * KaliSherlockSearch — Username OSINT scanner powered by the Sherlock backend tool.
 * Probes 350+ social platforms and displays discovered profile cards.
 * Features a simulated radar animation and dynamic step readout during the scan.
 */
import React, { useState, useEffect, useRef } from 'react';
import { Form, Input, Button, Card, Tag, Row, Col, Progress, Segmented } from 'antd';
import {
  SearchOutlined, CheckCircleOutlined, CloseCircleOutlined,
  LinkOutlined, EyeOutlined, SafetyCertificateOutlined, AlertOutlined,
  AimOutlined,
} from '@ant-design/icons';
import api from '../../api/axiosConfig';

interface FoundPlatform {
  platform: string;
  url: string;
  status: 'found' | 'not_found' | 'rate_limit' | 'error';
  statusCode: number;
  message?: string;
}

type SherlockFilter = 'all' | 'found' | 'not_found' | 'rate_limit' | 'error';

/** Extracts a favicon URL from a platform profile URL using Google's favicon service. */
const getPlatformFavicon = (url: string) => {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
  } catch {
    return '';
  }
};

interface KaliSherlockSearchProps {
  onScanStateChange?: (isScanning: boolean) => void;
}

const KaliSherlockSearch: React.FC<KaliSherlockSearchProps> = ({ onScanStateChange }) => {
  const [form] = Form.useForm();
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [foundPlatforms, setFoundPlatforms] = useState<FoundPlatform[]>([]);
  const [resultFilter, setResultFilter] = useState<SherlockFilter>('all');
  const [done, setDone] = useState(false);
  const [targetUsername, setTargetUsername] = useState('');
  const [scanStats, setScanStats] = useState({
    threatLevel: 'CLEAN',
    exposureCount: 0,
    elapsedTime: 0,
  });

  const [currentStep, setCurrentStep] = useState('System Idle');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const normalizePlatforms = (platforms: any[]): FoundPlatform[] =>
    platforms.map((platform) => {
      const status: FoundPlatform['status'] = platform?.status
        ? platform.status
        : platform?.found
          ? 'found'
          : 'not_found';
      return {
        platform: platform?.platform || platform?.name || 'Unknown Platform',
        url: platform?.url || platform?.link || '',
        status,
        statusCode: typeof platform?.statusCode === 'number'
          ? platform.statusCode
          : status === 'found'
            ? 200
            : status === 'rate_limit'
              ? 429
              : status === 'error'
                ? 500
                : 404,
        message: platform?.message || platform?.detail || '',
      };
    });

  // Status messages cycled during scan animation
  const steps = [
    'Initializing forensic sandbox...',
    'Loading Sherlock database matrix (450+ profiles)...',
    'Opening threat validation sockets...',
    'Interrogating global identity signatures...',
    'Resolving username across social matrices...',
    'Analyzing security policies on target nodes...',
    'Cross-referencing rate limit parameters...',
    'Evaluating cryptographic profile checksums...',
    'Compiling username exposure matrices...',
  ];

  // Rotate the step text every 2.5 seconds while scanning
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (scanning) {
      let idx = 0;
      interval = setInterval(() => {
        setCurrentStep(steps[idx % steps.length]);
        idx++;
      }, 2500);
    } else {
      setCurrentStep('System Idle');
    }
    if (onScanStateChange) {
      onScanStateChange(scanning);
    }
    return () => clearInterval(interval);
  }, [scanning, onScanStateChange]);

  const handleSearch = async (values: { username: string }) => {
    const username = values.username.trim();
    setTargetUsername(username);
    setFoundPlatforms([]);
    setProgress(0);
    setDone(false);
    setScanning(true);

    // Elapsed-time counter
    let seconds = 0;
    timerRef.current = setInterval(() => {
      seconds += 1;
      setScanStats(prev => ({ ...prev, elapsedTime: seconds }));
    }, 1000);

    // Smoothly increment a simulated progress bar up to 96% before the response arrives
    let simulatedProgress = 0;
    const progressInterval = setInterval(() => {
      simulatedProgress += Math.random() * 6;
      if (simulatedProgress >= 96) simulatedProgress = 96;
      setProgress(Math.floor(simulatedProgress));
    }, 500);

    try {
      const response = await api.post('/kali-tools/sherlock', { username });

      clearInterval(progressInterval);
      if (timerRef.current) clearInterval(timerRef.current);
      setProgress(100);

      const platforms = normalizePlatforms(response.data?.platforms || []);
      setFoundPlatforms(platforms);

      const discovered = platforms.filter((p) => p.status === 'found');
      let threat = 'SECURE';
      if (discovered.length > 10) threat = 'EXPANSIVE';
      else if (discovered.length > 4) threat = 'MODERATE';

      setScanStats(prev => ({
        ...prev,
        threatLevel: threat,
        exposureCount: discovered.length,
      }));
      setDone(true);
    } catch {
      clearInterval(progressInterval);
      if (timerRef.current) clearInterval(timerRef.current);
      setProgress(100);
      setDone(true);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div style={{ padding: '10px 0' }}>
      {/* Search Input Card */}
      <Card style={{
        marginBottom: 24, background: '#ffffff', borderRadius: 16,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)', border: '1px solid #f1f5f9',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{
            width: 48, height: 48, flexShrink: 0,
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
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
                  placeholder="Enter target username (e.g. thehusnain)"
                  prefix={<AimOutlined style={{ color: '#6366f1' }} />}
                  disabled={scanning}
                  className="cyber-input"
                  style={{ height: 50, fontSize: 15 }}
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
                  width: '100%', height: 50, borderRadius: 12,
                  background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                  border: 'none', fontWeight: 700, fontSize: 15,
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
                }}
              >
                {scanning ? 'Auditing...' : 'Search Username'}
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* Radar scanning animation */}
      {scanning && (
        <Card
          style={{
            marginBottom: 24, borderRadius: 16, background: '#0f172a',
            border: '1px solid #1e293b', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)', overflow: 'hidden',
          }}
          bodyStyle={{ padding: '40px 24px' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div className="radar-container" style={{ position: 'relative', width: 140, height: 140, marginBottom: 28 }}>
              <div className="radar-circle" />
              <div className="radar-sweep" />
              <div className="radar-core" />
              <AimOutlined style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)', color: '#6366f1',
                fontSize: 32, animation: 'pulse 1.5s infinite',
              }} />
            </div>

            <div style={{ color: '#38bdf8', fontFamily: 'monospace', fontSize: 14, fontWeight: 700, letterSpacing: '1px', marginBottom: 6 }}>
              [SYSTEM ACTIVE: FORENSIC INVESTIGATION IN PROGRESS]
            </div>

            <div style={{ color: '#fff', fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
              Auditing Username: <span style={{ color: '#6366f1', fontFamily: 'monospace' }}>"{targetUsername}"</span>
            </div>

            <div style={{ width: '100%', maxWidth: 500, margin: '16px auto 12px' }}>
              <Progress
                percent={progress}
                strokeColor={{ from: '#6366f1', to: '#a855f7' }}
                trailColor="#1e293b"
                status="active"
                showInfo={false}
                strokeWidth={8}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: 12, marginTop: 6, fontFamily: 'monospace' }}>
                <span>PROBING NODES</span>
                <span style={{ color: '#38bdf8', fontWeight: 700 }}>{progress}% COMPLETE</span>
              </div>
            </div>

            <div style={{
              background: 'rgba(30, 41, 59, 0.7)', border: '1px solid #334155',
              padding: '12px 20px', borderRadius: 8, width: '100%', maxWidth: 500,
              textAlign: 'center', fontFamily: 'monospace', fontSize: 12,
              color: '#38bdf8', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
            }}>
              <span className="blink">{'>'}</span> {currentStep}
            </div>
          </div>
        </Card>
      )}

      {/* Scan results */}
      {done && !scanning && (
        <>
          {/* Stats Dashboard */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={8}>
              <Card
                style={{
                  borderRadius: 16, border: '1px solid #f1f5f9',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                  background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
                }}
                bodyStyle={{ padding: 20 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <AlertOutlined style={{
                    fontSize: 18,
                    color: scanStats.threatLevel === 'EXPANSIVE' ? '#ef4444'
                      : scanStats.threatLevel === 'MODERATE' ? '#f59e0b' : '#10b981',
                  }} />
                  <span style={{ color: '#64748b', fontWeight: 600, fontSize: 13 }}>FOOTPRINT STATUS</span>
                </div>
                <div style={{
                  fontSize: 22, fontWeight: 800, letterSpacing: '0.5px',
                  color: scanStats.threatLevel === 'EXPANSIVE' ? '#ef4444'
                    : scanStats.threatLevel === 'MODERATE' ? '#f59e0b' : '#10b981',
                }}>
                  {scanStats.threatLevel}
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={8}>
              <Card
                style={{
                  borderRadius: 16, border: '1px solid #f1f5f9',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                  background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
                }}
                bodyStyle={{ padding: 20 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <EyeOutlined style={{ fontSize: 18, color: '#6366f1' }} />
                  <span style={{ color: '#64748b', fontWeight: 600, fontSize: 13 }}>PROFILES DISCOVERED</span>
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#1e293b' }}>
                  {scanStats.exposureCount} <span style={{ fontSize: 14, color: '#64748b', fontWeight: 500 }}>locations</span>
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={8}>
              <Card
                style={{
                  borderRadius: 16, border: '1px solid #f1f5f9',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                  background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
                }}
                bodyStyle={{ padding: 20 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <SafetyCertificateOutlined style={{ fontSize: 18, color: '#3b82f6' }} />
                  <span style={{ color: '#64748b', fontWeight: 600, fontSize: 13 }}>ELAPSED TIME</span>
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#1e293b' }}>
                  {scanStats.elapsedTime} <span style={{ fontSize: 14, color: '#64748b', fontWeight: 500 }}>seconds</span>
                </div>
              </Card>
            </Col>
          </Row>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <div style={{ color: '#475569', fontSize: 13, fontWeight: 600 }}>
              Showing {foundPlatforms.filter((p) => resultFilter === 'all' || p.status === resultFilter).length} of {foundPlatforms.length} results
            </div>
            <Segmented
              value={resultFilter}
              onChange={(value) => setResultFilter(value as SherlockFilter)}
              options={[
                { label: 'All', value: 'all' },
                { label: 'Confirmed', value: 'found' },
                { label: 'Not Found', value: 'not_found' },
                { label: 'Rate Limit', value: 'rate_limit' },
                { label: 'Error', value: 'error' },
              ]}
            />
          </div>

          {/* Platform discovery grid */}
          {foundPlatforms.length > 0 ? (
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CheckCircleOutlined style={{ color: '#10b981', fontSize: 18 }} />
                  <span style={{ color: '#1e293b', fontWeight: 700, fontSize: 16 }}>
                    Discovered Profiles for "{targetUsername}"
                  </span>
                </div>
              }
              style={{
                borderRadius: 16, border: '1px solid #e2e8f0',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
              }}
            >
              <Row gutter={[16, 16]}>
                {foundPlatforms
                  .filter((p) => resultFilter === 'all' || p.status === resultFilter)
                  .map((p, idx) => (
                  <Col key={idx} xs={24} sm={12} lg={8}>
                    <a href={p.url || '#'} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                      <div
                        style={{
                          border: '1px solid #f1f5f9', background: '#f8fafc', borderRadius: 14,
                          padding: '16px', display: 'flex', alignItems: 'center', gap: 14,
                          cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.01)',
                        }}
                        onMouseEnter={e => {
                          const div = e.currentTarget as HTMLDivElement;
                          div.style.borderColor = '#6366f1';
                          div.style.background = '#ffffff';
                          div.style.boxShadow = '0 10px 25px rgba(99, 102, 241, 0.08)';
                          div.style.transform = 'translateY(-3px)';
                        }}
                        onMouseLeave={e => {
                          const div = e.currentTarget as HTMLDivElement;
                          div.style.borderColor = '#f1f5f9';
                          div.style.background = '#f8fafc';
                          div.style.boxShadow = '0 2px 4px rgba(0,0,0,0.01)';
                          div.style.transform = 'translateY(0)';
                        }}
                      >
                        {/* Platform favicon */}
                        <div style={{
                          width: 44, height: 44, borderRadius: 10, background: '#ffffff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: '1px solid #e2e8f0', flexShrink: 0,
                        }}>
                          <img
                            src={getPlatformFavicon(p.url)}
                            alt={p.platform}
                            onError={e => {
                              (e.currentTarget as HTMLImageElement).src =
                                'https://www.google.com/s2/favicons?sz=64&domain=github.com';
                            }}
                            style={{ width: 24, height: 24, objectFit: 'contain' }}
                          />
                        </div>

                        {/* Platform name and URL */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>{p.platform}</div>
                          <div style={{
                            fontSize: 11, color: '#64748b', overflow: 'hidden',
                            textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            fontFamily: 'monospace', marginTop: 2,
                          }}>
                            {p.url}
                          </div>
                        </div>

                        {/* Found badge */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                          <Tag style={{
                            margin: 0, fontWeight: 700, fontSize: 11, borderRadius: 6,
                            padding: '2px 8px', border: 'none',
                            background: p.status === 'found' ? '#dcfce7' : p.status === 'rate_limit' ? '#ffedd5' : p.status === 'error' ? '#fee2e2' : '#f1f5f9',
                            color: p.status === 'found' ? '#15803d' : p.status === 'rate_limit' ? '#ea580c' : p.status === 'error' ? '#dc2626' : '#64748b',
                          }}>
                            {p.status === 'found' ? 'CONFIRMED' : p.status === 'not_found' ? 'NOT FOUND' : p.status === 'rate_limit' ? 'RATE LIMIT' : 'ERROR'}
                          </Tag>
                          <LinkOutlined style={{ color: '#6366f1', fontSize: 13 }} />
                        </div>
                      </div>
                    </a>
                  </Col>
                ))}
              </Row>
            </Card>
          ) : (
            <Card style={{
              textAlign: 'center', padding: '48px 24px', borderRadius: 16,
              border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
            }}>
              <CloseCircleOutlined style={{ fontSize: 44, color: '#94a3b8', marginBottom: 16 }} />
              <div style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>
                No Active Profiles Found
              </div>
              <div style={{ color: '#64748b', fontSize: 14 }}>
                Username "{targetUsername}" was not registered on any platform.
              </div>
            </Card>
          )}
        </>
      )}

      {/* Shared radar + input animation styles */}
      <style>{`
        .cyber-input {
          border: 1.5px solid #e2e8f0 !important;
          background: #f8fafc !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .cyber-input:hover {
          border-color: #6366f1 !important;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.1) !important;
          background: #ffffff !important;
        }
        .cyber-input:focus {
          border-color: #6366f1 !important;
          background: #ffffff !important;
          box-shadow: 0 0 15px rgba(99, 102, 241, 0.25) !important;
        }

        .radar-container { display: flex; align-items: center; justify-content: center; }
        .radar-circle {
          position: absolute; width: 100%; height: 100%;
          border: 1px solid rgba(99, 102, 241, 0.15); border-radius: 50%;
        }
        .radar-sweep {
          position: absolute; width: 100%; height: 100%; border-radius: 50%;
          background: conic-gradient(from 0deg at 50% 50%, rgba(99, 102, 241, 0.25) 0deg, transparent 90deg);
          animation: radar-sweep 3s linear infinite;
        }
        .radar-core {
          position: absolute; width: 8px; height: 8px;
          background: #6366f1; border-radius: 50%; box-shadow: 0 0 12px #6366f1;
        }

        @keyframes radar-sweep { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          50% { transform: translate(-50%, -50%) scale(1.15); opacity: 0.6; }
        }

        .blink { animation: blink-anim 1s step-end infinite; }
        @keyframes blink-anim { 50% { opacity: 0; } }
      `}</style>
    </div>
  );
};

export default KaliSherlockSearch;

/**
 * PhoneLookup — NexusOSINT-powered WhatsApp profile and PhoneInfoga intelligence tool.
 * Queries live profile photos, display name, status bio, and account classification.
 * Features a simulated radar animation and dynamic step readout during the scan.
 */
import React, { useState, useEffect, useRef } from 'react';
import { Button, Card, Tag, Row, Col, Alert, Descriptions, Avatar, Typography } from 'antd';
import {
  SearchOutlined, SafetyCertificateOutlined, WhatsAppOutlined, UserOutlined,
  CalendarOutlined, MobileOutlined, AlertOutlined, EyeOutlined, GlobalOutlined
} from '@ant-design/icons';
import PhoneInputPkg from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import api from '../../api/axiosConfig';
import CyberConsoleLoader from '../../components/CyberConsoleLoader';

// react-phone-input-2 ships CommonJS default — handle both module formats
const PhoneInput = (PhoneInputPkg as { default?: typeof PhoneInputPkg }).default || PhoneInputPkg;

const { Text } = Typography;

/** Shape of the WhatsApp profile data returned by the backend. */
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

const PhoneLookup: React.FC<PhoneLookupProps> = ({ onScanStateChange }) => {
  const [phone, setPhone] = useState('');
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [nexusData, setNexusData] = useState<NexusResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [targetPhone, setTargetPhone] = useState('');

  const [scanStats, setScanStats] = useState({
    threatLevel: 'SECURE',
    status: 'ACTIVE',
    elapsedTime: 0,
  });

  const [currentStep, setCurrentStep] = useState('System Idle');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phoneInfoga = nexusData?.phoneinfoga;

  const renderLinks = (items: string[]) => {
    const unique = Array.from(new Set(items || []));
    if (unique.length === 0) return <span style={{ color: '#94a3b8' }}>No records</span>;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {unique.map((item) => {
          const isUrl = /^https?:\/\//i.test(item);
          return isUrl ? (
            <a key={item} href={item} target="_blank" rel="noopener noreferrer" style={{ color: '#0f4c81', fontSize: 12, textDecoration: 'none', wordBreak: 'break-all' }}>
              {item}
            </a>
          ) : (
            <div key={item} style={{ color: '#334155', fontSize: 12, wordBreak: 'break-word' }}>{item}</div>
          );
        })}
      </div>
    );
  };

  // Status messages cycled during scan animation
  const steps = [
    'Initializing NexusOSINT telemetry...',
    'Probing PhoneInfoga carriers database...',
    'Authenticating WhatsApp sandbox credentials...',
    'Establishing contact query parameters...',
    'Resolving display name registries...',
    'Downloading profile photo matrices...',
    'Fetching status bio signatures...',
    'Evaluating account business classifications...',
    'Formulating profile forensic record...',
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

  const handleLookup = async () => {
    if (!phone || phone.trim().length < 5) {
      setError('Please enter a valid target phone number.');
      return;
    }

    const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
    setTargetPhone(formattedPhone);
    setNexusData(null);
    setError(null);
    setProgress(0);
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
      simulatedProgress += Math.random() * 5.5;
      if (simulatedProgress >= 96) simulatedProgress = 96;
      setProgress(Math.floor(simulatedProgress));
    }, 450);

    try {
      const response = await api.post('/tools/nexus-lookup', { phone: formattedPhone });

      clearInterval(progressInterval);
      if (timerRef.current) clearInterval(timerRef.current);
      setProgress(100);

      if (response.data) {
        const data: NexusResult = response.data;
        setNexusData(data);

        const threat = data.whatsapp?.is_business ? 'COMMERCIAL' : 'SECURE';
        setScanStats(prev => ({
          ...prev,
          threatLevel: threat,
          status: data.whatsapp?.name ? 'RESOLVED' : 'UNKNOWN',
        }));
      }
    } catch (err: unknown) {
      clearInterval(progressInterval);
      if (timerRef.current) clearInterval(timerRef.current);
      setProgress(100);
      const apiErr = err as { response?: { data?: { message?: string } } };
      setError(apiErr.response?.data?.message || 'Failed to connect to WhatsApp engine.');
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
            background: 'linear-gradient(135deg, #25D366, #128C7E)',
            borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <WhatsAppOutlined style={{ color: '#fff', fontSize: 22 }} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 19, color: '#1e293b' }}>NexusOSINT Intelligence Matrix</div>
            <div style={{ color: '#64748b', fontSize: 13, fontWeight: 500 }}>
              Query live PhoneInfoga carrier details, WhatsApp profile photos, bio text status updates, and account configurations
            </div>
          </div>
        </div>

        <Row gutter={16} align="bottom">
          <Col xs={24} md={18}>
            <div style={{ marginBottom: 0 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 6, display: 'block' }}>
                TARGET PHONE NUMBER
              </label>
              <PhoneInput
                country={'pk'}
                value={phone}
                onChange={(val: string) => setPhone(val)}
                disabled={scanning}
                inputStyle={{
                  width: '100%', height: '50px', background: '#f8fafc',
                  border: '1.5px solid #e2e8f0', color: '#1e293b', fontSize: '15px',
                  borderRadius: '12px', fontWeight: 600, fontFamily: 'Space Grotesk, sans-serif',
                }}
                buttonStyle={{
                  background: '#f8fafc', borderColor: '#e2e8f0',
                  borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px',
                }}
                dropdownStyle={{ background: '#ffffff', color: '#1e293b', fontFamily: 'Space Grotesk, sans-serif' }}
              />
            </div>
          </Col>
          <Col xs={24} md={6}>
            <Button
              type="primary"
              onClick={handleLookup}
              loading={scanning}
              icon={<SearchOutlined />}
              size="large"
              style={{
                width: '100%', height: 50, borderRadius: 12,
                background: 'linear-gradient(135deg, #25D366, #128C7E)',
                border: 'none', fontWeight: 700, fontSize: 15,
                boxShadow: '0 4px 12px rgba(37, 211, 102, 0.2)', color: '#fff',
              }}
            >
              {scanning ? 'Resolving...' : 'Lookup Intelligence'}
            </Button>
          </Col>
        </Row>
      </Card>

      {error && (
        <Alert message={error} type="error" showIcon closable style={{ marginBottom: 24, borderRadius: 12 }} />
      )}

      {/* Radar scanning animation */}
      {/* ── Scanning Loader ── */}
      {scanning && (
        <div style={{ marginBottom: 24 }}>
          <CyberConsoleLoader
            percent={progress}
            target={targetPhone}
            currentStep={currentStep}
            opName="Phone Threat & Footprint Enumeration"
          />
        </div>
      )}

      {/* Scan results */}
      {nexusData && !scanning && (
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
                  <AlertOutlined style={{ fontSize: 18, color: '#25D366' }} />
                  <span style={{ color: '#64748b', fontWeight: 600, fontSize: 13 }}>CLASSIFICATION</span>
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#25D366', letterSpacing: '0.5px' }}>
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
                  <span style={{ color: '#64748b', fontWeight: 600, fontSize: 13 }}>FORENSIC RESOLUTION</span>
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#1e293b' }}>{scanStats.status}</div>
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

          {/* PhoneInfoga intelligence dashboard */}
          {phoneInfoga && (
            <Card
              style={{
                marginBottom: 24,
                borderRadius: 20,
                overflow: 'hidden',
                border: '1px solid #dbeafe',
                boxShadow: '0 14px 34px rgba(2, 132, 199, 0.08)',
              }}
              bodyStyle={{ padding: 0 }}
            >
              <div style={{
                padding: '22px 24px',
                background: 'linear-gradient(135deg, #0f172a 0%, #0ea5e9 55%, #22c55e 100%)',
                color: '#fff',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <GlobalOutlined style={{ fontSize: 20 }} />
                      <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: 0.4 }}>PhoneInfoga Intelligence Matrix</span>
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>
                      Existence, telecom metadata, footprinting, reputation, social-media, and disposable-number signals.
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <Tag color={phoneInfoga.exists ? 'green' : 'red'} style={{ margin: 0, border: 'none', fontWeight: 800, padding: '4px 10px', borderRadius: 8 }}>
                      {phoneInfoga.exists ? 'NUMBER EXISTS' : 'NO CLEAR SIGNAL'}
                    </Tag>
                    <Tag color="blue" style={{ margin: 0, border: 'none', fontWeight: 800, padding: '4px 10px', borderRadius: 8 }}>
                      REPUTATION {phoneInfoga.reputation.level.toUpperCase()}
                    </Tag>
                  </div>
                </div>
              </div>

              <div style={{ padding: 24, background: '#ffffff' }}>
                <Row gutter={[16, 16]} style={{ marginBottom: 18 }}>
                  <Col xs={24} sm={12} lg={6}>
                    <Card size="small" style={{ borderRadius: 14, border: '1px solid #e2e8f0', background: 'linear-gradient(135deg, #f8fafc, #ffffff)' }} bodyStyle={{ padding: 16 }}>
                      <Text style={{ color: '#64748b', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Exists</Text>
                      <div style={{ fontSize: 22, fontWeight: 800, color: phoneInfoga.exists ? '#10b981' : '#ef4444', marginTop: 6 }}>
                        {phoneInfoga.exists ? 'Yes' : 'No'}
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <Card size="small" style={{ borderRadius: 14, border: '1px solid #e2e8f0', background: 'linear-gradient(135deg, #f8fafc, #ffffff)' }} bodyStyle={{ padding: 16 }}>
                      <Text style={{ color: '#64748b', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Country</Text>
                      <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginTop: 6 }}>
                        {phoneInfoga.country || `+${phoneInfoga.country_code || 'N/A'}`}
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <Card size="small" style={{ borderRadius: 14, border: '1px solid #e2e8f0', background: 'linear-gradient(135deg, #f8fafc, #ffffff)' }} bodyStyle={{ padding: 16 }}>
                      <Text style={{ color: '#64748b', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Carrier</Text>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginTop: 6, lineHeight: 1.3 }}>
                        {phoneInfoga.carrier}
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <Card size="small" style={{ borderRadius: 14, border: '1px solid #e2e8f0', background: 'linear-gradient(135deg, #f8fafc, #ffffff)' }} bodyStyle={{ padding: 16 }}>
                      <Text style={{ color: '#64748b', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Line Type</Text>
                      <div style={{ marginTop: 8 }}>
                        <Tag color="purple" style={{ fontWeight: 800, borderRadius: 8, padding: '4px 10px', border: 'none' }}>
                          {(phoneInfoga.line_type || 'Unknown').toUpperCase()}
                        </Tag>
                      </div>
                    </Card>
                  </Col>
                </Row>

                <Row gutter={[16, 16]} style={{ marginBottom: 18 }}>
                  <Col xs={24} lg={12}>
                    <Card title="Telecom Identity" size="small" style={{ borderRadius: 16, border: '1px solid #e2e8f0' }} bodyStyle={{ background: '#f8fafc', borderRadius: 12 }}>
                      <Descriptions column={1} size="small" bordered={false}>
                        <Descriptions.Item label={<strong>International Format</strong>}>
                          <Text strong>{phoneInfoga.international || 'N/A'}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label={<strong>E.164 Format</strong>}>
                          <Text strong>{phoneInfoga.e164 || 'N/A'}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label={<strong>Country Code</strong>}>
                          <Tag color="geekblue" style={{ fontWeight: 700, borderRadius: 6 }}>
                            +{phoneInfoga.country_code || 'N/A'}
                          </Tag>
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </Col>

                  <Col xs={24} lg={12}>
                    <Card title="Reputation & Disposable Signals" size="small" style={{ borderRadius: 16, border: '1px solid #e2e8f0' }} bodyStyle={{ background: '#f8fafc', borderRadius: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                        <Tag color={phoneInfoga.reputation.level === 'High' ? 'red' : phoneInfoga.reputation.level === 'Medium' ? 'orange' : 'green'} style={{ margin: 0, fontWeight: 800, borderRadius: 8, border: 'none' }}>
                          SCORE {phoneInfoga.reputation.score}
                        </Tag>
                        <Tag color="blue" style={{ margin: 0, fontWeight: 800, borderRadius: 8, border: 'none' }}>
                          {phoneInfoga.reputation.socialMedia ? 'SOCIAL MEDIA LINKABLE' : 'NO SOCIAL MEDIA SIGNAL'}
                        </Tag>
                        <Tag color={phoneInfoga.reputation.disposable ? 'volcano' : 'default'} style={{ margin: 0, fontWeight: 800, borderRadius: 8, border: 'none' }}>
                          {phoneInfoga.reputation.disposable ? 'DISPOSABLE FLAGGED' : 'NO DISPOSABLE FLAG'}
                        </Tag>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {phoneInfoga.reputation.reports.map((item) => (
                          <div key={item} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '8px 12px', color: '#334155', fontSize: 13 }}>
                            {item}
                          </div>
                        ))}
                        {phoneInfoga.reputation.notes.map((item) => (
                          <div key={item} style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '8px 12px', color: '#1d4ed8', fontSize: 13 }}>
                            {item}
                          </div>
                        ))}
                      </div>
                    </Card>
                  </Col>
                </Row>

                <Row gutter={[16, 16]}>
                  <Col xs={24} lg={12}>
                    <Card title={`Social Media (${(phoneInfoga.footprint.buckets?.socialMedia || phoneInfoga.footprint.socialMediaHints || []).length})`} size="small" style={{ borderRadius: 16, border: '1px solid #e2e8f0' }} bodyStyle={{ background: '#f8fafc', borderRadius: 12 }}>
                      {renderLinks(phoneInfoga.footprint.buckets?.socialMedia || phoneInfoga.footprint.socialMediaHints || [])}
                    </Card>
                  </Col>
                  <Col xs={24} lg={12}>
                    <Card title={`Disposable Providers (${(phoneInfoga.footprint.buckets?.disposableProviders || phoneInfoga.footprint.disposableIndicators || []).length})`} size="small" style={{ borderRadius: 16, border: '1px solid #e2e8f0' }} bodyStyle={{ background: '#f8fafc', borderRadius: 12 }}>
                      {renderLinks(phoneInfoga.footprint.buckets?.disposableProviders || phoneInfoga.footprint.disposableIndicators || [])}
                    </Card>
                  </Col>
                  <Col xs={24} lg={12}>
                    <Card title={`Reputation (${(phoneInfoga.footprint.buckets?.reputation || phoneInfoga.footprint.reputationReports || []).length})`} size="small" style={{ borderRadius: 16, border: '1px solid #e2e8f0' }} bodyStyle={{ background: '#f8fafc', borderRadius: 12 }}>
                      {renderLinks(phoneInfoga.footprint.buckets?.reputation || phoneInfoga.footprint.reputationReports || [])}
                    </Card>
                  </Col>
                  <Col xs={24} lg={12}>
                    <Card title={`Individuals (${(phoneInfoga.footprint.buckets?.individuals || phoneInfoga.footprint.phoneBooks || []).length})`} size="small" style={{ borderRadius: 16, border: '1px solid #e2e8f0' }} bodyStyle={{ background: '#f8fafc', borderRadius: 12 }}>
                      {renderLinks(phoneInfoga.footprint.buckets?.individuals || phoneInfoga.footprint.phoneBooks || [])}
                    </Card>
                  </Col>
                  <Col xs={24}>
                    <Card title={`General Search (${(phoneInfoga.footprint.buckets?.general || phoneInfoga.footprint.searchEngines || []).length})`} size="small" style={{ borderRadius: 16, border: '1px solid #e2e8f0' }} bodyStyle={{ background: '#f8fafc', borderRadius: 12 }}>
                      {renderLinks(phoneInfoga.footprint.buckets?.general || phoneInfoga.footprint.searchEngines || [])}
                    </Card>
                  </Col>
                </Row>

                <Card title="Source Matrix" size="small" style={{ borderRadius: 16, border: '1px solid #e2e8f0', marginTop: 16 }} bodyStyle={{ background: '#f8fafc', borderRadius: 12 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {phoneInfoga.sources.map((item) => <Tag key={item} color="geekblue" style={{ margin: 0 }}>{item}</Tag>)}
                  </div>
                </Card>
              </div>
            </Card>
          )}

          {/* WhatsApp profile card */}
          {nexusData.whatsapp ? (
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <WhatsAppOutlined style={{ color: '#10b981', fontSize: 18 }} />
                <span style={{ color: '#1e293b', fontWeight: 700, fontSize: 16 }}>
                  WhatsApp Account Profile Intelligence
                </span>
              </div>
            }
            style={{
              borderRadius: 16, border: '1px solid #e2e8f0',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)', marginBottom: 24,
            }}
          >
            <Row gutter={[24, 24]} align="middle" style={{ padding: '10px 0' }}>
              <Col xs={24} sm={6} style={{ textAlign: 'center', minWidth: 140 }}>
                {nexusData.whatsapp.image ? (
                  <Avatar
                    size={130}
                    src={nexusData.whatsapp.image}
                    icon={<UserOutlined />}
                    style={{ border: '4px solid #25D366', boxShadow: '0 4px 20px rgba(37, 211, 102, 0.25)', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ width: 130, height: 130, borderRadius: 12, border: '4px solid #e6f4ea', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 0 8px rgba(0,0,0,0.02)' }}>
                    <div style={{ color: '#94a3b8', fontSize: 12, textAlign: 'center', padding: 8 }}>
                      No public profile photo
                    </div>
                  </div>
                )}
              </Col>
              <Col xs={24} sm={18}>
                <Descriptions column={1} size="small" bordered={false} style={{ background: '#f8fafc', padding: 16, borderRadius: 12 }}>
                  <Descriptions.Item label={<strong>Target Phone Node</strong>}>
                    <Tag color="cyan" style={{ fontSize: 13, padding: '2px 10px', fontWeight: 700, borderRadius: 6 }}>
                      <MobileOutlined /> {nexusData.whatsapp.phone || targetPhone}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label={<strong>Display Name</strong>}>
                    <Text strong style={{ fontSize: 16, color: '#1e293b', wordBreak: 'break-word' }}>
                      {nexusData.whatsapp.name || <span style={{ color: '#94a3b8' }}>No public display name</span>}
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label={<strong>About Status Update</strong>}>
                    <Text italic style={{ fontSize: 14, color: '#475569', fontWeight: 500 }}>
                      "{nexusData.whatsapp.status || 'No status bio set'}"
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label={<strong>Account Classification</strong>}>
                    <Tag color={nexusData.whatsapp.is_business ? 'green' : 'blue'} style={{ fontWeight: 700, borderRadius: 6 }}>
                      {nexusData.whatsapp.is_business ? 'BUSINESS NODE' : 'PERSONAL NODE'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label={<strong>Network Status</strong>}>
                    <Tag color="success" style={{ fontWeight: 700, borderRadius: 6 }}>
                      <SafetyCertificateOutlined /> VERIFIED REGISTERED
                    </Tag>
                  </Descriptions.Item>
                  {nexusData.whatsapp.last_updated && (
                    <Descriptions.Item label={<strong>Recon Date</strong>}>
                      <Text style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>
                        <CalendarOutlined /> {new Date(nexusData.whatsapp.last_updated).toLocaleString()}
                      </Text>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Col>
            </Row>
          </Card>
          ) : (
            <Alert message="WhatsApp Profile not found for this number." type="warning" showIcon style={{ marginBottom: 24, borderRadius: 12 }} />
          )}

          <Card style={{ borderRadius: 16, background: '#f8fafc', border: '1px solid #e2e8f0' }} bodyStyle={{ padding: 14 }}>
            <p style={{ color: '#64748b', fontSize: 12, margin: 0, fontWeight: 500 }}>
              <strong>Detection Engine:</strong> NexusOSINT Core | <strong>Audit Status:</strong> SUCCESS
            </p>
          </Card>
        </>
      )}

      {/* Shared radar + input animation styles */}
      <style>{`
        .radar-container { display: flex; align-items: center; justify-content: center; }
        .radar-circle {
          position: absolute; width: 100%; height: 100%;
          border: 1px solid rgba(37, 211, 102, 0.15); border-radius: 50%;
        }
        .radar-sweep {
          position: absolute; width: 100%; height: 100%; border-radius: 50%;
          background: conic-gradient(from 0deg at 50% 50%, rgba(37, 211, 102, 0.25) 0deg, transparent 90deg);
          animation: radar-sweep 3s linear infinite;
        }
        .radar-core {
          position: absolute; width: 8px; height: 8px;
          background: #25D366; border-radius: 50%; box-shadow: 0 0 12px #25D366;
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

export default PhoneLookup;

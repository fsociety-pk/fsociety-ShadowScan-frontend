/**
 * PhoneLookup — NexusOSINT-powered WhatsApp profile and PhoneInfoga intelligence tool.
 * Queries live profile photos, display name, status bio, and account classification.
 * Features a simulated radar animation and dynamic step readout during the scan.
 */
import React, { useState, useEffect, useRef } from 'react';
import { Button, Card, Tag, Row, Col, Progress, Alert, Descriptions, Avatar, Typography } from 'antd';
import {
  SearchOutlined, SafetyCertificateOutlined, WhatsAppOutlined, UserOutlined,
  CalendarOutlined, MobileOutlined, AlertOutlined, EyeOutlined, GlobalOutlined
} from '@ant-design/icons';
import PhoneInputPkg from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import api from '../../api/axiosConfig';

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
    international: string;
    e164: string;
    carrier: string;
    line_type: string;
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
              <WhatsAppOutlined style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)', color: '#25D366',
                fontSize: 32, animation: 'pulse 1.5s infinite',
              }} />
            </div>

            <div style={{ color: '#38bdf8', fontFamily: 'monospace', fontSize: 14, fontWeight: 700, letterSpacing: '1px', marginBottom: 6 }}>
              [SYSTEM ACTIVE: CONTACT PROBE BRIDGE IN PROGRESS]
            </div>

            <div style={{ color: '#fff', fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
              Scanning Contact: <span style={{ color: '#25D366', fontFamily: 'monospace' }}>"{targetPhone}"</span>
            </div>

            <div style={{ width: '100%', maxWidth: 500, margin: '16px auto 12px' }}>
              <Progress
                percent={progress}
                strokeColor={{ from: '#25D366', to: '#128C7E' }}
                trailColor="#1e293b"
                status="active"
                showInfo={false}
                strokeWidth={8}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: 12, marginTop: 6, fontFamily: 'monospace' }}>
                <span>PROBING MATRIX</span>
                <span style={{ color: '#38bdf8', fontWeight: 700 }}>{progress}% COMPLETE</span>
              </div>
            </div>

            <div style={{
              background: 'rgba(30, 41, 59, 0.7)', border: '1px solid #334155', padding: '12px 20px',
              borderRadius: 8, width: '100%', maxWidth: 500, textAlign: 'center',
              fontFamily: 'monospace', fontSize: 12, color: '#38bdf8',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
            }}>
              <span className="blink">{'>'}</span> {currentStep}
            </div>
          </div>
        </Card>
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

          {/* PhoneInfoga details card */}
          {nexusData.phoneinfoga && (
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <GlobalOutlined style={{ color: '#3b82f6', fontSize: 18 }} />
                  <span style={{ color: '#1e293b', fontWeight: 700, fontSize: 16 }}>
                    PhoneInfoga Telecom Intelligence
                  </span>
                </div>
              }
              style={{
                borderRadius: 16, border: '1px solid #e2e8f0',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)', marginBottom: 24,
              }}
            >
              <Descriptions column={{ xs: 1, sm: 2, md: 3 }} size="small" bordered={false} style={{ background: '#f8fafc', padding: 16, borderRadius: 12 }}>
                <Descriptions.Item label={<strong>International Format</strong>}>
                  <Text strong>{nexusData.phoneinfoga.international || 'N/A'}</Text>
                </Descriptions.Item>
                <Descriptions.Item label={<strong>E.164 Format</strong>}>
                  <Text strong>{nexusData.phoneinfoga.e164 || 'N/A'}</Text>
                </Descriptions.Item>
                <Descriptions.Item label={<strong>Country Code</strong>}>
                  <Tag color="geekblue" style={{ fontWeight: 700, borderRadius: 6 }}>
                    +{nexusData.phoneinfoga.country_code || 'N/A'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label={<strong>Carrier</strong>}>
                  <Text strong>{nexusData.phoneinfoga.carrier}</Text>
                </Descriptions.Item>
                <Descriptions.Item label={<strong>Line Type</strong>}>
                  <Tag color="purple" style={{ fontWeight: 700, borderRadius: 6 }}>
                    {nexusData.phoneinfoga.line_type.toUpperCase()}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
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
              <Col xs={24} sm={6} style={{ textAlign: 'center' }}>
                <Avatar
                  size={130}
                  src={nexusData.whatsapp.image}
                  icon={<UserOutlined />}
                  style={{ border: '4px solid #25D366', boxShadow: '0 4px 20px rgba(37, 211, 102, 0.25)' }}
                />
              </Col>
              <Col xs={24} sm={18}>
                <Descriptions column={1} size="small" bordered={false} style={{ background: '#f8fafc', padding: 16, borderRadius: 12 }}>
                  <Descriptions.Item label={<strong>Target Phone Node</strong>}>
                    <Tag color="cyan" style={{ fontSize: 13, padding: '2px 10px', fontWeight: 700, borderRadius: 6 }}>
                      <MobileOutlined /> {nexusData.whatsapp.phone || targetPhone}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label={<strong>Display Name</strong>}>
                    <Text strong style={{ fontSize: 16, color: '#1e293b' }}>
                      {nexusData.whatsapp.name || <span style={{ color: '#94a3b8' }}>N/A (Hidden Profile)</span>}
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

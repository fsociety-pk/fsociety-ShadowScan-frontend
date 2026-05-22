/**
 * KaliWhoisLookup — DNS & WHOIS domain intelligence tool.
 * Queries authoritative registries for domain ownership records, name servers,
 * registration/expiration dates, and contact info.
 * Features a simulated radar animation and dynamic step readout during the scan.
 */
import React, { useState, useEffect, useRef } from 'react';
import { Form, Input, Button, Card, Tag, Row, Col, Alert, Descriptions, Collapse } from 'antd';
import {
  GlobalOutlined, SearchOutlined, CheckCircleOutlined,
  AlertOutlined, SafetyCertificateOutlined, EyeOutlined,
  CodeOutlined, CalendarOutlined, ApiOutlined,
} from '@ant-design/icons';
import api from '../../api/axiosConfig';
import CyberConsoleLoader from '../../components/CyberConsoleLoader';

interface WhoisResult {
  tool: string;
  target: string;
  timestamp: string;
  data: Record<string, string>;
  method: string;
  error?: string;
  status?: string;
  summary: {
    registrar: string | null;
    registrationDate: string | null;
    expirationDate: string | null;
    nameServers: string[];
    organization: string | null;
    address: string | null;
    email: string | null;
    phone: string | null;
  };
}

interface KaliWhoisLookupProps {
  onScanStateChange?: (isScanning: boolean) => void;
}

const KaliWhoisLookup: React.FC<KaliWhoisLookupProps> = ({ onScanStateChange }) => {
  const [form] = Form.useForm();
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<WhoisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [targetDomain, setTargetDomain] = useState('');

  const [scanStats, setScanStats] = useState({
    threatLevel: 'SECURE',
    nsCount: 0,
    elapsedTime: 0,
  });

  const [currentStep, setCurrentStep] = useState('System Idle');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Status messages cycled during scan animation
  const steps = [
    'Initializing DNS forensic socket...',
    'Interrogating global WHOIS registries...',
    'Resolving TLD authority routes...',
    'Querying primary name server authoritative records...',
    'Parsing registrar security headers...',
    'Intercepting abuse contacts & DNSSEC policies...',
    'Cross-referencing domain expiration indexes...',
    'Compiling zone transfer data...',
    'Structuring network ownership dossier...',
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

  const handleSearch = async (values: { target: string }) => {
    const domain = values.target.trim();
    
    if (domain.length === 0) {
      setError('Domain/IP cannot be empty');
      return;
    }
    
    setTargetDomain(domain);
    setResults(null);
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
      simulatedProgress += Math.random() * 6;
      if (simulatedProgress >= 96) simulatedProgress = 96;
      setProgress(Math.floor(simulatedProgress));
    }, 450);

    try {
      const response = await api.post('/kali-tools/whois', { target: domain }, { timeout: 30000 });

      clearInterval(progressInterval);
      if (timerRef.current) clearInterval(timerRef.current);
      setProgress(100);

      const data: WhoisResult = response.data;
      
      // Check if we got valid data
      if (data && data.tool === 'Whois') {
        setResults(data);

        let threat = 'SECURE';
        if (!data.summary.registrar) threat = 'UNKNOWN';
        else if (data.summary.nameServers.length === 0) threat = 'SUSPICIOUS';

        setScanStats(prev => ({
          ...prev,
          threatLevel: threat,
          nsCount: data.summary.nameServers.length,
        }));
        
        // Check if there was an error in the response
        if (data.error || data.method === 'Failed') {
          setError(`Lookup completed with limited data: ${data.error || 'Tool unavailable'}`);
        }
      } else {
        setError('Invalid response format from server');
      }
    } catch (err: any) {
      clearInterval(progressInterval);
      if (timerRef.current) clearInterval(timerRef.current);
      setProgress(0);
      
      const errorMsg = err?.response?.data?.message || 
                       err?.response?.data?.error || 
                       err?.message || 
                       'Whois lookup failed. Please try again.';
      
      setError(errorMsg);
      setResults(null);
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
            <GlobalOutlined style={{ color: '#fff', fontSize: 22 }} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 19, color: '#1e293b' }}>DNS & Whois Domain Matrix</div>
            <div style={{ color: '#64748b', fontSize: 13, fontWeight: 500 }}>
              Query ownership details, authoritative name servers, and registrar metadata
            </div>
          </div>
        </div>

        <Form form={form} onFinish={handleSearch} layout="vertical">
          <Row gutter={16} align="bottom">
            <Col xs={24} md={18}>
              <Form.Item
                name="target"
                rules={[{ required: true, message: 'Please enter a target domain or IP' }]}
                style={{ marginBottom: 0 }}
              >
                <Input
                  size="large"
                  placeholder="Enter domain or IP (e.g. google.com or 8.8.8.8)"
                  prefix={<GlobalOutlined style={{ color: '#6366f1' }} />}
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
                {scanning ? 'Resolving...' : 'Lookup DNS/Whois'}
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>

      {error && (
        <Alert message={error} type="error" showIcon closable style={{ marginBottom: 24, borderRadius: 12 }} />
      )}

      {/* ── Scanning Loader ── */}
      {scanning && (
        <div style={{ marginBottom: 24 }}>
          <CyberConsoleLoader
            percent={progress}
            target={targetDomain}
            currentStep={currentStep}
            opName="DNS & WHOIS Domain Intelligence"
          />
        </div>
      )}

      {/* Scan results */}
      {results && !scanning && (
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
                    color: scanStats.threatLevel === 'SUSPICIOUS' ? '#ef4444'
                      : scanStats.threatLevel === 'UNKNOWN' ? '#f59e0b' : '#10b981',
                  }} />
                  <span style={{ color: '#64748b', fontWeight: 600, fontSize: 13 }}>INFRASTRUCTURE HEALTH</span>
                </div>
                <div style={{
                  fontSize: 22, fontWeight: 800, letterSpacing: '0.5px',
                  color: scanStats.threatLevel === 'SUSPICIOUS' ? '#ef4444'
                    : scanStats.threatLevel === 'UNKNOWN' ? '#f59e0b' : '#10b981',
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
                  <span style={{ color: '#64748b', fontWeight: 600, fontSize: 13 }}>RESOLVED NAME SERVERS</span>
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#1e293b' }}>
                  {scanStats.nsCount} <span style={{ fontSize: 14, color: '#64748b', fontWeight: 500 }}>active nodes</span>
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

          {/* Dossier details card */}
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <CheckCircleOutlined style={{ color: '#10b981', fontSize: 18 }} />
                <span style={{ color: '#1e293b', fontWeight: 700, fontSize: 16 }}>
                  Whois Registry Intelligence Dossier: "{targetDomain}"
                </span>
              </div>
            }
            style={{
              borderRadius: 16, border: '1px solid #e2e8f0',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)', marginBottom: 24,
            }}
          >
            <Descriptions
              bordered
              column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
              style={{ background: '#f8fafc', borderRadius: 12, overflow: 'hidden' }}
            >
              <Descriptions.Item label={<strong><ApiOutlined /> Registrar</strong>}>
                <Tag color="blue" style={{ fontWeight: 700 }}>{results.summary.registrar || 'N/A'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label={<strong>Organization</strong>}>
                <span style={{ fontWeight: 600 }}>{results.summary.organization || 'N/A'}</span>
              </Descriptions.Item>
              <Descriptions.Item label={<strong><CalendarOutlined style={{ color: '#16a34a' }} /> Registration Date</strong>}>
                <Tag color="green" style={{ fontWeight: 600 }}>{results.summary.registrationDate || 'N/A'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label={<strong><CalendarOutlined style={{ color: '#dc2626' }} /> Expiration Date</strong>}>
                <Tag color="red" style={{ fontWeight: 600 }}>{results.summary.expirationDate || 'N/A'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label={<strong>Registrar Contact Email</strong>}>
                <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{results.summary.email || 'N/A'}</span>
              </Descriptions.Item>
              <Descriptions.Item label={<strong>Registrar Contact Phone</strong>}>
                <span style={{ fontWeight: 600 }}>{results.summary.phone || 'N/A'}</span>
              </Descriptions.Item>
              <Descriptions.Item label={<strong>Physical Registered Address</strong>} span={2}>
                <span style={{ fontWeight: 500 }}>{results.summary.address || 'N/A'}</span>
              </Descriptions.Item>
              <Descriptions.Item label={<strong>Name Server Authoritative Nodes</strong>} span={2}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {results.summary.nameServers.length > 0 ? (
                    results.summary.nameServers.map((ns, idx) => (
                      <Tag key={idx} color="purple" style={{ borderRadius: 6, fontWeight: 600, padding: '2px 8px' }}>
                        {ns}
                      </Tag>
                    ))
                  ) : (
                    <span>N/A</span>
                  )}
                </div>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Raw WHOIS output (collapsed by default) */}
          <Collapse
            style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}
            items={[
              {
                key: 'raw',
                label: <span style={{ fontWeight: 700, color: '#1e293b' }}><CodeOutlined /> Raw Whois Record Output Matrix</span>,
                children: (
                  <div style={{ maxHeight: 350, overflow: 'auto', background: '#0f172a', padding: 20, borderRadius: 12, border: '1px solid #1e293b' }}>
                    <pre style={{ color: '#38bdf8', fontSize: 13, margin: 0, fontFamily: 'monospace', lineHeight: 1.6 }}>
                      {JSON.stringify(results.data, null, 2)}
                    </pre>
                  </div>
                ),
              },
            ]}
          />

          <Card style={{ marginTop: 24, borderRadius: 16, background: '#f8fafc', border: '1px solid #e2e8f0' }} bodyStyle={{ padding: 14 }}>
            <p style={{ color: '#64748b', fontSize: 12, margin: 0, fontWeight: 500 }}>
              <strong>Detection Engine:</strong> {results.method} | <strong>Audit Timestamp:</strong> {new Date(results.timestamp).toLocaleString()}
            </p>
          </Card>
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

export default KaliWhoisLookup;

import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Alert, Table, Tag, Space, Statistic, Row, Col, Select } from 'antd';
import { RadarChartOutlined, SearchOutlined, AimOutlined } from '@ant-design/icons';
import api from '../../api/axiosConfig';
import { useParams } from 'react-router-dom';
import ProfessionalProgress from '../../components/ProfessionalProgress';

interface NmapPort {
  number: number;
  status: string;
  protocol: string;
}

interface NmapResult {
  tool: string;
  target: string;
  scanType: string;
  timestamp: string;
  ports: NmapPort[];
  hostStatus: string;
  osDetection: string | null;
  method: string;
  summary: {
    openPorts: number;
    scanCompleted: boolean;
  };
}

const commonPorts: Record<number, string> = {
  22: 'SSH',
  80: 'HTTP',
  443: 'HTTPS',
  3306: 'MySQL',
  5432: 'PostgreSQL',
  27017: 'MongoDB',
  6379: 'Redis',
  8080: 'HTTP-Alt',
  8443: 'HTTPS-Alt',
  3389: 'RDP',
};

const SCAN_STEPS = [
  'Initializing raw sockets...',
  'Resolving target DNS signature...',
  'Sending stealth SYN packets...',
  'Interrogating responsive ports...',
  'Tracing network routing paths...',
  'Analyzing port fingerprint states...',
  'Compiling network recon metrics...'
];

const KaliNmapScan: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<NmapResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('System Idle');
  const [targetHost, setTargetHost] = useState('');
  const { caseId } = useParams<{ caseId?: string }>();

  useEffect(() => {
    let stepInterval: ReturnType<typeof setInterval>;
    if (loading) {
      let idx = 0;
      stepInterval = setInterval(() => {
        setCurrentStep(SCAN_STEPS[idx % SCAN_STEPS.length]);
        idx++;
      }, 2500);
    } else {
      setCurrentStep('System Idle');
    }
    return () => clearInterval(stepInterval);
  }, [loading]);

  const handleScan = async (values: { target: string; scanType: string }) => {
    const host = values.target.trim();
    setTargetHost(host);
    setLoading(true);
    setError(null);
    setResults(null);
    setProgress(0);

    // Simulated progress (caps at 96% until response)
    let sim = 0;
    const progressInterval = setInterval(() => {
      sim = Math.min(sim + Math.random() * 6, 96);
      setProgress(Math.floor(sim));
    }, 500);

    try {
      const response = await api.post(
        '/kali-tools/nmap',
        {
          target: host,
          scanType: values.scanType,
          caseId: caseId || undefined,
        },
        {
          timeout: 300000, // 5-minute timeout for large scans
        }
      );
      clearInterval(progressInterval);
      setProgress(100);
      setResults(response.data);
    } catch (err: any) {
      clearInterval(progressInterval);
      setProgress(0);
      setError(err.response?.data?.message || 'Nmap scan failed');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Port',
      dataIndex: 'number',
      key: 'port',
      render: (port: number) => <strong style={{ color: '#4f46e5' }}>{port}</strong>,
    },
    {
      title: 'Service',
      dataIndex: 'number',
      key: 'service',
      render: (port: number) => commonPorts[port] || 'Unknown',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={status.toLowerCase() === 'open' ? 'green' : 'red'}>{status.toUpperCase()}</Tag>,
    },
    {
      title: 'Protocol',
      dataIndex: 'protocol',
      key: 'protocol',
      render: (protocol: string) => <Tag color="blue">{protocol.toUpperCase()}</Tag>,
    },
  ];

  const scanTypeDescriptions: Record<string, string> = {
    basic: 'Scan top 1000 TCP ports with service version detection',
    aggressive: 'Aggressive scanning with OS detection and traceroute',
    stealth: 'Stealthy SYN scan for evading detection',
  };

  return (
    <div style={{ padding: '20px 0' }}>
      <Card
        title={
          <Space>
            <RadarChartOutlined style={{ color: '#4f46e5' }} />
            <span style={{ fontWeight: 700 }}>Nmap - Network & Port Scanning</span>
          </Space>
        }
        style={{ marginBottom: 20, borderRadius: 16, border: '1px solid #e2e8f0' }}
      >
        <Alert
          message="Responsibility Notice"
          description="Only scan systems you own or have explicit permission to scan. Unauthorized network scanning may be illegal."
          type="warning"
          showIcon
          style={{ marginBottom: 15, borderRadius: 8 }}
        />

        <Form form={form} onFinish={handleScan} layout="vertical">
          <Form.Item
            name="target"
            label={<span style={{ fontWeight: 600 }}>Target Host (IP or Hostname)</span>}
            rules={[{ required: true, message: 'Please enter a target host' }]}
          >
            <Input
              placeholder="e.g., example.com or 192.168.1.1"
              prefix={<SearchOutlined />}
              disabled={loading}
              style={{ borderRadius: 10, height: 46 }}
            />
          </Form.Item>

          <Form.Item
            name="scanType"
            label={<span style={{ fontWeight: 600 }}>Scan Type</span>}
            initialValue="basic"
          >
            <Select
              disabled={loading}
              style={{ height: 40 }}
              options={[
                { label: 'Basic scan (Standard TCP)', value: 'basic' },
                { label: 'Aggressive scan (OS, Trace)', value: 'aggressive' },
                { label: 'Stealth - SYN scan', value: 'stealth' },
              ]}
            />
          </Form.Item>

          <Card style={{ background: '#f8fafc', marginBottom: 15, borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <p style={{ color: '#64748b', fontSize: 12, margin: 0, fontWeight: 500 }}>
              {form.getFieldValue('scanType') && scanTypeDescriptions[form.getFieldValue('scanType')]}
            </p>
          </Card>

          <Button
            type="primary"
            htmlType="submit"
            icon={<SearchOutlined />}
            loading={loading}
            block
            style={{
              height: 48, borderRadius: 10,
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              border: 'none', fontWeight: 700, fontSize: 15,
            }}
          >
            {loading ? 'Scanning...' : 'Start Network Scan'}
          </Button>
        </Form>
      </Card>

      {error && <Alert message={error} type="error" showIcon closable style={{ marginBottom: 20, borderRadius: 8 }} />}

      {/* ── Scanning Loader ── */}
      {loading && (
        <Card style={{
          marginBottom: 24, borderRadius: 16,
          border: '1px solid #e6eefc', boxShadow: '0 6px 18px rgba(16,24,40,0.03)',
          background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
        }} bodyStyle={{ padding: '40px 24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="radar-container" style={{ position: 'relative', width: 140, height: 140, marginBottom: 28 }}>
              <div className="radar-circle" />
              <div className="radar-sweep" />
              <div className="radar-core" />
              <AimOutlined style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%,-50%)', color: '#6366f1', fontSize: 32,
                animation: 'pulse 1.5s infinite',
              }} />
            </div>

            <div style={{ color: '#475569', fontFamily: 'monospace', fontSize: 13, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>
              [SYSTEM ACTIVE: PORT SCANNING OPERATION IN PROGRESS]
            </div>
            <div style={{ color: '#1e293b', fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
              Scanning Host: <span style={{ color: '#4f46e5', fontFamily: 'monospace' }}>"{targetHost}"</span>
            </div>

            <div style={{ width: '100%', maxWidth: 520, margin: '0 auto 12px' }}>
              <ProfessionalProgress percent={progress} />
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: 11, marginTop: 6, fontFamily: 'monospace' }}>
                <span>SCANNING SOCKETS</span>
                <span style={{ color: '#4f46e5', fontWeight: 700 }}>{progress}% COMPLETE</span>
              </div>
            </div>

            <div style={{
              background: '#f8fafc', border: '1px solid #e2e8f0',
              padding: '10px 20px', borderRadius: 8, width: '100%', maxWidth: 520,
              textAlign: 'center', fontFamily: 'monospace', fontSize: 12,
              color: '#4f46e5', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
            }}>
              <span className="blink">{'>'}</span> {currentStep}
            </div>
          </div>
        </Card>
      )}

      {results && !loading && (
        <>
          <Card style={{ marginBottom: 20, borderRadius: 16, border: '1px solid #e2e8f0' }}>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Statistic
                  title="Open Ports Detected"
                  value={results.summary.openPorts}
                  valueStyle={{ color: results.summary.openPorts > 0 ? '#ef4444' : '#10b981', fontWeight: 700 }}
                />
              </Col>
              <Col xs={24} sm={12}>
                <Statistic
                  title="Scan Status"
                  value={results.summary.scanCompleted ? 'Completed' : 'Partial'}
                  valueStyle={{ color: results.summary.scanCompleted ? '#10b981' : '#f59e0b', fontWeight: 700 }}
                />
              </Col>
            </Row>
          </Card>

          {results.osDetection && (
            <Card title="OS Detection Result" style={{ marginBottom: 20, borderRadius: 16, border: '1px solid #e2e8f0' }}>
              <p style={{ fontFamily: 'monospace', margin: 0 }}>{results.osDetection}</p>
            </Card>
          )}

          <Card title="Scan Details" style={{ borderRadius: 16, border: '1px solid #e2e8f0' }} bodyStyle={{ padding: 0 }}>
            <Table
              dataSource={results.ports}
              columns={columns}
              rowKey="number"
              pagination={false}
              locale={{ emptyText: 'No open ports found on target.' }}
            />
          </Card>
        </>
      )}

      <style>{`
        .radar-container { display: flex; align-items: center; justify-content: center; }
        .radar-circle {
          position: absolute; width: 100%; height: 100%;
          border: 1.5px solid rgba(99,102,241,0.2); border-radius: 50%;
        }
        .radar-sweep {
          position: absolute; width: 100%; height: 100%; border-radius: 50%;
          background: conic-gradient(from 0deg at 50% 50%, rgba(99,102,241,0.3) 0deg, transparent 90deg);
          animation: radar-sweep 2.5s linear infinite;
        }
        .radar-core {
          position: absolute; width: 10px; height: 10px;
          background: #6366f1; border-radius: 50%; box-shadow: 0 0 14px #6366f1;
        }
        @keyframes radar-sweep { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse {
          0%,100% { transform: translate(-50%,-50%) scale(1); opacity: 1; }
          50%      { transform: translate(-50%,-50%) scale(1.18); opacity: 0.5; }
        }
        .blink { animation: blink-anim 1s step-end infinite; }
        @keyframes blink-anim { 50% { opacity: 0; } }
      `}</style>
    </div>
  );
};

export default KaliNmapScan;

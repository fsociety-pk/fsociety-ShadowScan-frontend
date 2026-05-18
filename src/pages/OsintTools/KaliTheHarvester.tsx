import React, { useState, useRef, useEffect } from 'react';
import { Form, Input, Button, Card, Tag, Space, Row, Col, Statistic } from 'antd';
import {
  MailOutlined, SearchOutlined, CheckCircleOutlined,
  RadarChartOutlined, StopOutlined, GlobalOutlined, InfoCircleOutlined
} from '@ant-design/icons';

interface LogLine {
  type: 'status' | 'log' | 'found_email' | 'error' | 'done';
  message?: string;
  email?: string;
}

const KaliTheHarvester: React.FC = () => {
  const [form] = Form.useForm();
  const [scanning, setScanning] = useState(false);
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [foundEmails, setFoundEmails] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [target, setTarget] = useState('');
  const logsEndRef = useRef<HTMLDivElement>(null);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const stopScan = () => {
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }
    setScanning(false);
    setLogs(prev => [...prev, { type: 'status', message: '[!] Scan stopped by user.' }]);
  };

  const handleSearch = (values: { target: string }) => {
    const targetInput = values.target.trim();
    setTarget(targetInput);
    setLogs([{ type: 'status', message: `[*] Initiating reconnaissance for: ${targetInput}` }]);
    setFoundEmails([]);
    setDone(false);
    setScanning(true);

    const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const url = `${base}/kali-tools/theharvester/stream?target=${encodeURIComponent(targetInput)}`;

    const es = new EventSource(url);
    esRef.current = es;

    es.onmessage = (ev) => {
      try {
        const data: LogLine = JSON.parse(ev.data);
        setLogs(prev => [...prev, data]);

        if (data.type === 'found_email' && data.email) {
          setFoundEmails(prev => {
            if (prev.includes(data.email!)) return prev;
            return [...prev, data.email!];
          });
        }
        if (data.type === 'done') {
          setDone(true);
          setScanning(false);
          es.close();
        }
        if (data.type === 'error') {
          setScanning(false);
          es.close();
        }
      } catch {}
    };

    es.onerror = () => {
      setLogs(prev => [...prev, { type: 'error', message: '[!] Connection lost. Scan may be complete.' }]);
      setScanning(false);
      setDone(true);
      es.close();
    };
  };

  return (
    <div style={{ padding: '20px 0' }}>
      <Card
        style={{ marginBottom: 20, border: '1px solid #e2e8f0', borderRadius: 12 }}
        bodyStyle={{ padding: 24 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div className="cyber-icon-wrapper" style={{ width: 50, height: 50, flexShrink: 0 }}>
            <MailOutlined style={{ color: '#fff', fontSize: 24 }} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, background: 'var(--cyber-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Email & Domain Recon</div>
            <div style={{ color: 'var(--cyber-blue)', fontSize: 13, fontWeight: 500 }}>Deep enumeration using theHarvester across all available sources</div>
          </div>
        </div>
        <Form form={form} onFinish={handleSearch} layout="vertical">

          <Form.Item
            name="target"
            label={<span style={{ fontWeight: 600 }}>Target Email or Domain</span>}
            rules={[{ required: true, message: 'Please enter an email or domain' }]}
            style={{ marginBottom: 16 }}
          >
            <Input
              size="large"
              placeholder="e.g. example@gmail.com or example.com"
              prefix={<GlobalOutlined style={{ color: '#52c41a' }} />}
              disabled={scanning}
              style={{
                borderRadius: 10, fontSize: 15, color: 'var(--text-main)',
                background: '#f8fafc', border: '1.5px solid #e2e8f0'
              }}
            />
          </Form.Item>

          <Space style={{ width: '100%' }}>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SearchOutlined />}
              loading={scanning}
              size="large"
              disabled={scanning}
              className="cyber-btn"
              style={{
                flex: 1, height: 50, borderRadius: 10,
                background: 'var(--cyber-gradient)',
                border: 'none', fontWeight: 700, fontSize: 16, color: '#fff'
              }}
            >
              {scanning ? 'Running Recon...' : 'Initiate Intelligence Gathering'}
            </Button>
            {scanning && (
              <Button
                danger size="large"
                icon={<StopOutlined />}
                onClick={stopScan}
                style={{ height: 46, borderRadius: 10 }}
              >
                Stop
              </Button>
            )}
          </Space>
        </Form>
      </Card>

      {/* Live Terminal Output */}
      {logs.length > 0 && (
        <Card
          style={{ marginBottom: 20, border: '1px solid var(--border-color)', borderRadius: 12, overflow: 'hidden' }}
          bodyStyle={{ padding: 0 }}
        >
          <div style={{
            background: '#f8fafc', padding: '10px 16px',
            display: 'flex', alignItems: 'center', gap: 8,
            borderBottom: '1px solid #e2e8f0'
          }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff4d4f' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f59e0b' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ color: '#475569', fontSize: 13, marginLeft: 8, fontFamily: 'monospace', fontWeight: 600 }}>
              <RadarChartOutlined /> harvester — target: {target}
            </span>
            {scanning && (
              <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="live-pulse" style={{
                  width: 8, height: 8, borderRadius: '50%', background: '#16a34a',
                  display: 'inline-block'
                }} />
                <span style={{ color: '#16a34a', fontSize: 12, fontFamily: 'monospace', fontWeight: 700 }}>LIVE RECON</span>
              </span>
            )}
          </div>

          <div style={{
            background: '#ffffff', padding: '12px 16px',
            maxHeight: 320, overflowY: 'auto',
            fontFamily: 'monospace', fontSize: 13
          }}>
            {logs.map((log, idx) => {
              let color = '#475569';
              if (log.type === 'found_email') color = '#16a34a';
              else if (log.type === 'status') color = '#0284c7';
              else if (log.type === 'error') color = '#dc2626';
              else if (log.type === 'done') color = '#d97706';

              return (
                <div key={idx} style={{ color, lineHeight: '1.7', wordBreak: 'break-all', fontWeight: 500 }}>
                  {log.type === 'found_email' 
                    ? <><span style={{ color: '#16a34a', fontWeight: 700 }}>[+] Found Email:</span> <span style={{ color: 'var(--cyber-blue)' }}>{log.email}</span></>
                    : log.message
                  }
                </div>
              );
            })}
            <div ref={logsEndRef} />
          </div>
        </Card>
      )}

      {done && (
        <>
          <Row gutter={16} style={{ marginBottom: 20 }}>
            <Col span={12}>
              <Card style={{ borderRadius: 12, textAlign: 'center', border: '1px solid #e2e8f0' }}>
                <Statistic
                  title={<span style={{ color: '#64748b', fontWeight: 600 }}>Emails Discovered</span>}
                  value={foundEmails.length}
                  prefix={<MailOutlined style={{ color: '#52c41a' }} />}
                  valueStyle={{ color: '#52c41a', fontWeight: 700, fontSize: 32 }}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card style={{ borderRadius: 12, textAlign: 'center', border: '1px solid #e2e8f0' }}>
                <Statistic
                  title={<span style={{ color: '#64748b', fontWeight: 600 }}>Recon Status</span>}
                  value="Completed"
                  valueStyle={{ color: 'var(--cyber-blue)', fontWeight: 700, fontSize: 24 }}
                />
              </Card>
            </Col>
          </Row>

          {foundEmails.length > 0 && (
            <Card
              title={
                <Space>
                  <CheckCircleOutlined style={{ color: '#22c55e' }} />
                  <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>
                    Extracted Intelligence
                  </span>
                </Space>
              }
              style={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {foundEmails.map((email, idx) => (
                  <Tag 
                    key={idx} 
                    color="blue" 
                    style={{ 
                      padding: '8px 12px', 
                      fontSize: 14, 
                      borderRadius: 6,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      margin: 0
                    }}
                  >
                    <MailOutlined /> {email}
                  </Tag>
                ))}
              </div>
            </Card>
          )}

          {foundEmails.length === 0 && (
            <Card style={{ textAlign: 'center', padding: 40, borderRadius: 12, border: '1px solid #e2e8f0' }}>
              <InfoCircleOutlined style={{ fontSize: 48, color: 'var(--text-muted)', marginBottom: 16 }} />
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>No Results Found</div>
              <div style={{ color: '#64748b' }}>theHarvester did not return any direct email findings for "{target}".</div>
            </Card>
          )}
        </>
      )}

      <style>{`
        .live-pulse {
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
      `}</style>
    </div>
  );
};

export default KaliTheHarvester;

import React, { useState, useRef, useEffect } from 'react';
import { Form, Input, Button, Card, Tag, Space, Row, Col, Statistic, Progress } from 'antd';
import {
  UserOutlined, SearchOutlined, CheckCircleOutlined, CloseCircleOutlined,
  LinkOutlined, RadarChartOutlined, StopOutlined
} from '@ant-design/icons';

interface FoundPlatform {
  platform: string;
  url: string;
  statusCode: number;
}

interface LogLine {
  type: 'status' | 'log' | 'found' | 'not_found' | 'error' | 'done';
  message?: string;
  platform?: string;
  url?: string;
  statusCode?: number;
}

import {
  GithubOutlined, TwitterOutlined, InstagramOutlined, RedditOutlined, LinkedinOutlined,
  YoutubeOutlined, GlobalOutlined
} from '@ant-design/icons';

const getPlatformIcon = (platform: string) => {
  const p = platform.toLowerCase();
  if (p.includes('github')) return <GithubOutlined />;
  if (p.includes('twitter')) return <TwitterOutlined />;
  if (p.includes('instagram')) return <InstagramOutlined />;
  if (p.includes('reddit')) return <RedditOutlined />;
  if (p.includes('linkedin')) return <LinkedinOutlined />;
  if (p.includes('youtube')) return <YoutubeOutlined />;
  return <GlobalOutlined />;
};

const KaliSherlockSearch: React.FC = () => {
  const [form] = Form.useForm();
  const [scanning, setScanning] = useState(false);
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [foundPlatforms, setFoundPlatforms] = useState<FoundPlatform[]>([]);
  const [scannedCount, setScannedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [done, setDone] = useState(false);
  const [targetUsername, setTargetUsername] = useState('');
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

  const handleSearch = (values: { username: string }) => {
    const username = values.username.trim();
    setTargetUsername(username);
    setLogs([{ type: 'status', message: `[*] Initiating scan for: ${username}` }]);
    setFoundPlatforms([]);
    setScannedCount(0);
    setTotalCount(22);
    setDone(false);
    setScanning(true);

    const token = localStorage.getItem('token');
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const url = `${base}/kali-tools/sherlock/stream?username=${encodeURIComponent(username)}`;

    const es = new EventSource(url);
    esRef.current = es;

    es.onmessage = (ev) => {
      try {
        const data: LogLine = JSON.parse(ev.data);
        setLogs(prev => [...prev, data]);

        if (data.type === 'found' && data.platform && data.url) {
          setFoundPlatforms(prev => [...prev, { platform: data.platform!, url: data.url!, statusCode: data.statusCode || 200 }]);
        }
        if (data.type === 'log' || data.type === 'not_found') {
          setScannedCount(prev => prev + 1);
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

  const progress = totalCount > 0 ? Math.round((scannedCount / totalCount) * 100) : 0;

  return (
    <div style={{ padding: '20px 0' }}>
      {/* Search Form */}
      <Card
        style={{ marginBottom: 20, border: '1px solid #e2e8f0', borderRadius: 12 }}
        bodyStyle={{ padding: 24 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div className="cyber-icon-wrapper" style={{ width: 50, height: 50, flexShrink: 0 }}>
            <UserOutlined style={{ color: '#fff', fontSize: 24 }} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, background: 'var(--cyber-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Username Lookup</div>
            <div style={{ color: 'var(--cyber-purple)', fontSize: 13, fontWeight: 500 }}>Search across 20+ social platforms in real-time</div>
          </div>
        </div>

        <Form form={form} onFinish={handleSearch} layout="vertical">
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please enter a username' }]}
            style={{ marginBottom: 16 }}
          >
            <Input
              size="large"
              placeholder="Enter target username  (e.g. thehusnain)"
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
              disabled={scanning}
              style={{
                borderRadius: 10, fontSize: 15, color: '#333',
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
                background: 'linear-gradient(90deg, #1890ff, #722ed1)',
                border: 'none', fontWeight: 700, fontSize: 16, color: '#fff'
              }}
            >
              {scanning ? 'Scanning...' : 'Search Username'}
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
      {(logs.length > 0) && (
        <Card
          style={{ marginBottom: 20, border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}
          bodyStyle={{ padding: 0 }}
        >
          {/* Terminal title bar */}
          <div style={{
            background: '#f8fafc', padding: '10px 16px',
            display: 'flex', alignItems: 'center', gap: 8,
            borderBottom: '1px solid #e2e8f0'
          }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff4d4f' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#faad14' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#52c41a' }} />
            <span style={{ color: '#475569', fontSize: 13, marginLeft: 8, fontFamily: 'monospace', fontWeight: 600 }}>
              <RadarChartOutlined /> osint-scanner — username: {targetUsername}
            </span>
            {scanning && (
              <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%', background: '#52c41a',
                  animation: 'pulse 1.5s infinite', display: 'inline-block'
                }} />
                <span style={{ color: '#52c41a', fontSize: 12, fontFamily: 'monospace', fontWeight: 700 }}>LIVE</span>
              </span>
            )}
          </div>

          {/* Progress bar */}
          {(scanning || done) && (
            <div style={{ background: '#ffffff', padding: '12px 16px 0' }}>
              <Progress
                percent={done ? 100 : progress}
                strokeColor={{ from: '#1890ff', to: '#722ed1' }}
                trailColor='#f1f5f9'
                size="small"
                format={pct => <span style={{ color: '#475569', fontSize: 11, fontWeight: 600 }}>{pct}%</span>}
              />
            </div>
          )}

          {/* Log lines */}
          <div style={{
            background: '#ffffff', padding: '12px 16px',
            maxHeight: 320, overflowY: 'auto',
            fontFamily: 'monospace', fontSize: 13
          }}>
            {logs.map((log, idx) => {
              let color = '#475569';
              let prefix = '';
              if (log.type === 'found') { color = '#52c41a'; prefix = '[+]'; }
              else if (log.type === 'not_found') { color = '#94a3b8'; prefix = '[-]'; }
              else if (log.type === 'status') { color = '#1890ff'; }
              else if (log.type === 'error') { color = '#ff4d4f'; }
              else if (log.type === 'done') { color = '#faad14'; }

              return (
                <div key={idx} style={{ color, lineHeight: '1.7', wordBreak: 'break-all', fontWeight: 500 }}>
                  {log.type === 'found'
                    ? <><span style={{ color: '#52c41a', fontWeight: 700 }}>[+] {log.platform}</span><span style={{ color: '#64748b' }}>{' → '}</span><span style={{ color: '#1890ff' }}>{log.url}</span></>
                    : log.type === 'not_found'
                    ? <span style={{ color: '#94a3b8' }}>[-] {log.platform} — not found</span>
                    : <span>{log.message}</span>
                  }
                </div>
              );
            })}
            <div ref={logsEndRef} />
          </div>
        </Card>
      )}

      {/* Results Summary */}
      {done && (
        <>
          <Row gutter={16} style={{ marginBottom: 20 }}>
            <Col xs={24} sm={8}>
              <Card style={{ borderRadius: 12, textAlign: 'center', border: '1px solid #e2e8f0' }}>
                <Statistic
                  title={<span style={{ color: '#64748b', fontWeight: 600 }}>Platforms Checked</span>}
                  value={totalCount}
                  valueStyle={{ color: '#1890ff', fontWeight: 700, fontSize: 32 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card style={{ borderRadius: 12, textAlign: 'center', border: '1px solid #e2e8f0' }}>
                <Statistic
                  title={<span style={{ color: '#64748b', fontWeight: 600 }}>Profiles Found</span>}
                  value={foundPlatforms.length}
                  valueStyle={{ color: '#1890ff', fontWeight: 700, fontSize: 32 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card style={{ borderRadius: 12, textAlign: 'center', border: '1px solid #e2e8f0' }}>
                <Statistic
                  title={<span style={{ color: '#64748b', fontWeight: 600 }}>Exposure Rate</span>}
                  value={totalCount > 0 ? ((foundPlatforms.length / totalCount) * 100).toFixed(1) : '0.0'}
                  suffix="%"
                  valueStyle={{
                    color: foundPlatforms.length > 10 ? '#ff4d4f' : foundPlatforms.length > 5 ? '#faad14' : '#52c41a',
                    fontWeight: 700, fontSize: 32
                  }}
                />
              </Card>
            </Col>
          </Row>

          {/* Found Profiles Grid */}
          {foundPlatforms.length > 0 && (
            <Card
              title={
                <Space>
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  <span style={{ color: '#333', fontWeight: 700 }}>
                    Profiles Discovered — {foundPlatforms.length} found for "{targetUsername}"
                  </span>
                </Space>
              }
              style={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
            >
              <Row gutter={[12, 12]}>
                {foundPlatforms.map((p, idx) => (
                  <Col key={idx} xs={24} sm={12} lg={8}>
                    <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                      <div style={{
                        border: '1.5px solid #e2e8f0',
                        borderRadius: 10, padding: '14px 16px',
                        display: 'flex', alignItems: 'center', gap: 12,
                        cursor: 'pointer', transition: 'all 0.2s',
                        background: '#fff',
                      }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLDivElement).style.borderColor = '#1890ff';
                          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(24, 144, 255, 0.12)';
                          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLDivElement).style.borderColor = '#e2e8f0';
                          (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                        }}
                      >
                        <div style={{
                          width: 40, height: 40, borderRadius: 10,
                          background: 'linear-gradient(135deg, rgba(14,165,233,0.12), rgba(139,92,246,0.12))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 20, flexShrink: 0
                        }}>
                          {getPlatformIcon(p.platform)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-main)' }}>{p.platform}</div>
                          <div style={{
                            fontSize: 11, color: '#64748b',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                          }}>{p.url}</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                          <Tag color="green" style={{ margin: 0, fontWeight: 600 }}>
                            <CheckCircleOutlined /> Found
                          </Tag>
                          <LinkOutlined style={{ color: 'var(--cyber-blue)', fontSize: 13 }} />
                        </div>
                      </div>
                    </a>
                  </Col>
                ))}
              </Row>
            </Card>
          )}

          {foundPlatforms.length === 0 && (
            <Card style={{ textAlign: 'center', padding: 40, borderRadius: 12, border: '1px solid #e2e8f0' }}>
              <CloseCircleOutlined style={{ fontSize: 48, color: 'var(--text-muted)', marginBottom: 16 }} />
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>No Profiles Found</div>
              <div style={{ color: '#64748b' }}>Username "{targetUsername}" was not found on any scanned platforms.</div>
            </Card>
          )}
        </>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};

export default KaliSherlockSearch;

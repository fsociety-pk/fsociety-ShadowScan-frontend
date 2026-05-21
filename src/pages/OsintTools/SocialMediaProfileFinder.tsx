/**
 * SocialMediaProfileFinder — Multi-platform username and email OSINT scanner.
 * Supports Deep (50+ platforms, 1-3 min) and Quick (15 platforms, ~30 sec) modes.
 * Results are categorised by platform type and displayed in filterable tabs.
 */
import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Spin,
  Alert,
  Table,
  Tag,
  Row,
  Col,
  Tabs,
  Empty,
  Badge,
  Tooltip,
  Result,
} from 'antd';
import ProfessionalProgressCircle from '../../components/ProfessionalProgressCircle';
import ProfessionalProgress from '../../components/ProfessionalProgress';
import {
  LinkOutlined,
  UserOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  ThunderboltOutlined,
  RocketOutlined,
  AimOutlined,
  FireOutlined,
  LaptopOutlined,
  VideoCameraOutlined,
  PlayCircleOutlined,
  UsergroupAddOutlined,
  BulbOutlined,
} from '@ant-design/icons';
import api from '../../api/axiosConfig';

interface SocialProfile {
  platform: string;
  username: string;
  profileUrl: string;
  found: boolean;
  verified: boolean;
  detectionMethod: string;
}

interface SearchResults {
  input: string;
  inputType: 'email' | 'username';
  timestamp: string;
  profiles: SocialProfile[];
  byCategory: {
    social_networks: SocialProfile[];
    developer: SocialProfile[];
    content: SocialProfile[];
    gaming: SocialProfile[];
    other: SocialProfile[];
  };
  summary: {
    totalPlatformsChecked: number;
    profilesFound: number;
    verified: number;
  };
}

/** Maps lowercase platform names to their brand hex colour for visual accent. */
const platformColors: Record<string, string> = {
  twitter: '#1DA1F2',
  x: '#000000',
  instagram: '#E4405F',
  tiktok: '#000000',
  facebook: '#1877F2',
  linkedin: '#0A66C2',
  reddit: '#FF4500',
  github: '#ffffff',
  youtube: '#FF0000',
  twitch: '#9146FF',
  discord: '#5865F2',
  medium: '#000000',
  telegram: '#0088cc',
  whatsapp: '#25D366',
  pinterest: '#E60023',
  snapchat: '#FFFC00',
  spotify: '#1DB954',
  soundcloud: '#FF8800',
  behance: '#1769FF',
  deviantart: '#05CC47',
  flickr: '#0063DC',
  mastodon: '#6364FF',
  bluesky: '#1185FE',
};



interface SocialMediaProfileFinderProps {
  onScanStateChange?: (isScanning: boolean) => void;
}

const SocialMediaProfileFinder: React.FC<SocialMediaProfileFinderProps> = ({ onScanStateChange }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchType, setSearchType] = useState<'full' | 'quick'>('full');
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');

  useEffect(() => {
    if (onScanStateChange) {
      onScanStateChange(loading);
    }
    if (loading) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) return prev;
          return prev + Math.random() * 15;
        });
      }, 500);
      return () => clearInterval(interval);
    }
  }, [loading]);

  const handleSearch = async (values: { input: string }) => {
    setLoading(true);
    setProgress(0);
    setError(null);
    setResults(null);

    try {
      const endpoint = searchType === 'quick' ? '/social-media/quick' : '/social-media/find';
      
      setProgressMessage('Initializing scan...');
      setProgress(10);

      const response = await api.post(
        endpoint,
        { input: values.input.trim() },
        { timeout: 120000 }
      );

      setProgressMessage('Scan complete!');
      setProgress(100);
      setResults(response.data);
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      setError(apiErr.response?.data?.message || 'Search failed. Please try again.');
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const getPlatformColor = (platform: string): string => {
    const key = platform.toLowerCase();
    return platformColors[key] || '#1890ff';
  };

  const profileColumns = [
    {
      title: 'Platform',
      dataIndex: 'platform',
      key: 'platform',
      width: 120,
      render: (text: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: getPlatformColor(text),
              boxShadow: `0 0 8px ${getPlatformColor(text)}`,
            }}
          />
          <strong style={{ color: getPlatformColor(text), textShadow: `0 0 8px ${getPlatformColor(text)}33` }}>
            {text}
          </strong>
        </div>
      ),
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      render: (text: string) => (
        <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--cyber-blue)', textShadow: '0 0 4px rgba(14, 165, 233, 0.3)' }}>
          {text}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'verified',
      key: 'verified',
      width: 100,
      render: (verified: boolean) =>
        verified ? (
          <Tag icon={<CheckCircleOutlined />} color="green" style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981' }}>
            Verified
          </Tag>
        ) : (
          <Tag style={{ background: 'rgba(107, 114, 128, 0.15)', border: '1px solid #6b7280' }}>
            Pending
          </Tag>
        ),
    },
    {
      title: 'Profile URL',
      dataIndex: 'profileUrl',
      key: 'profileUrl',
      render: (url: string) => (
        <Tooltip title="Click to visit profile">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'var(--cyber-blue)',
              textDecoration: 'none',
              fontSize: 11,
              fontWeight: 600,
              textShadow: '0 0 8px rgba(0,255,136,0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <LinkOutlined /> Visit
          </a>
        </Tooltip>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px 0' }}>
      {/* Search Card */}
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 18 }}>
            <ThunderboltOutlined style={{ color: 'var(--cyber-blue)', fontSize: 24 }} />
            <span style={{ background: 'var(--cyber-gradient)', backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent' }}>
              <AimOutlined style={{ marginRight: 8 }} /> SHADOW SCAN - Social Media Finder
            </span>
          </div>
        }
        style={{
          marginBottom: 20,
          background: 'rgba(248, 250, 252, 0.5)',
          border: '1px solid rgba(0, 255, 136, 0.2)',
          borderRadius: 12,
        }}
      >
        <p style={{ color: 'var(--text-muted)', marginBottom: 20, fontSize: 14, fontWeight: 500 }}>
          <FireOutlined style={{ color: '#ff4d4f', marginRight: 8 }} /> Powerful FREE OSINT tool • Searches 50+ major platforms instantly • Find ANY username or email across the internet
        </p>

        <Form form={form} onFinish={handleSearch} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={16}>
              <Form.Item
                name="input"
                label={<span style={{ color: 'var(--primary)', fontWeight: 600 }}>Enter Username or Email</span>}
                rules={[
                  {
                    required: true,
                    message: 'Please enter a username or email address',
                  },
                ]}
              >
                <Input
                  placeholder="e.g., john.doe or john@example.com"
                  prefix={<UserOutlined style={{ color: 'var(--cyber-blue)' }} />}
                  disabled={loading}
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label={<span style={{ color: 'var(--cyber-blue)', fontWeight: 600 }}><ThunderboltOutlined style={{ marginRight: 4 }} /> Mode</span>}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button
                    size="large"
                    type={searchType === 'full' ? 'primary' : 'default'}
                    onClick={() => setSearchType('full')}
                    style={searchType === 'full' ? {
                      background: 'var(--cyber-gradient)',
                      border: 'none',
                      fontWeight: 600,
                    } : {
                      background: 'rgba(14, 165, 233, 0.1)',
                      border: '1px solid rgba(0, 255, 136, 0.3)',
                      color: 'var(--cyber-blue)',
                      fontWeight: 600,
                    }}
                  >
                    Deep
                  </Button>
                  <Button
                    size="large"
                    type={searchType === 'quick' ? 'primary' : 'default'}
                    onClick={() => setSearchType('quick')}
                    style={searchType === 'quick' ? {
                      background: 'var(--cyber-gradient)',
                      border: 'none',
                      fontWeight: 600,
                    } : {
                      background: 'rgba(14, 165, 233, 0.1)',
                      border: '1px solid rgba(0, 255, 136, 0.3)',
                      color: 'var(--cyber-blue)',
                      fontWeight: 600,
                    }}
                  >
                    Quick
                  </Button>
                </div>
              </Form.Item>
            </Col>
          </Row>

          <Button
            type="primary"
            htmlType="submit"
            icon={<RocketOutlined />}
            loading={loading}
            size="large"
            block
            style={{
              background: 'var(--cyber-gradient)',
              border: 'none',
              height: 48,
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: 1,
              textShadow: '0 0 8px rgba(0,0,0,0.2)',
            }}
          >
            {loading ? 'SCANNING...' : <><AimOutlined style={{ marginRight: 8 }} /> SCAN NOW</>}
          </Button>
        </Form>

        {!loading && (
          <Alert
            message={<><BulbOutlined /> Pro Tip</>}
            description={`Use ${searchType === 'quick' ? 'Deep Search for comprehensive results (1-3 min)' : 'Quick Search for fast results on top 15 platforms (30 sec)'}`}
            type="info"
            showIcon
            style={{ marginTop: 15, background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)' }}
          />
        )}
      </Card>

      {error && (
        <Alert
          message="Scan Error"
          description={error}
          type="error"
          showIcon
          closable
          style={{ marginBottom: 20, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}
        />
      )}

      {/* Progress Bar */}
      {loading && (
        <Card
          style={{
            marginBottom: 24, borderRadius: 16,
            border: '1px solid #e6eefc', boxShadow: '0 6px 18px rgba(16,24,40,0.03)', overflow: 'hidden',
            background: 'linear-gradient(135deg, #ffffff, #f8fafc)'
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

            <div style={{ color: '#475569', fontFamily: 'monospace', fontSize: 13, fontWeight: 700, letterSpacing: '1px', marginBottom: 6 }}>
              [SYSTEM ACTIVE: PLATFORM PROFILING IN PROGRESS]
            </div>

            <div style={{ color: '#1e293b', fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
              Target Identifier: <span style={{ color: '#4f46e5', fontFamily: 'monospace' }}>"{form.getFieldValue('input')}"</span>
            </div>

            <div style={{ width: '100%', maxWidth: 500, margin: '16px auto 12px' }}>
              <ProfessionalProgress percent={Math.floor(progress)} />
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: 12, marginTop: 6, fontFamily: 'monospace' }}>
                <span>GRID INTERROGATION</span>
                <span style={{ color: '#4f46e5', fontWeight: 700 }}>{Math.floor(progress)}% COMPLETE</span>
              </div>
            </div>

            <div style={{
              background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px 20px',
              borderRadius: 8, width: '100%', maxWidth: 500, textAlign: 'center',
              fontFamily: 'monospace', fontSize: 12, color: '#4f46e5',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
            }}>
              <span className="blink">{'>'}</span> {progressMessage || 'Scanning multiple network databases...'}
            </div>
          </div>
        </Card>
      )}

      {/* Results Display */}
      {results && !loading && (
        <>
          {/* Header Summary */}
          <Card
            style={{
              marginBottom: 20,
              background: 'rgba(248, 250, 252, 0.5)',
              border: '2px solid rgba(0, 255, 136, 0.3)',
              borderRadius: 12,
            }}
          >
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={6}>
                <div style={{ textAlign: 'center', padding: 10 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 5, letterSpacing: 1 }}>INPUT TYPE</div>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      background: 'var(--cyber-gradient)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      color: 'transparent',
                    }}
                  >
                    {results.inputType === 'email' ? 'EMAIL' : 'USERNAME'}
                  </div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 5, fontFamily: 'monospace' }}>
                    {results.input}
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={6}>
                <div style={{ textAlign: 'center', padding: 10 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 5, letterSpacing: 1 }}>PLATFORMS SCANNED</div>
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 700,
                      color: '#fbbf24',
                      textShadow: '0 0 12px rgba(251, 191, 36, 0.3)',
                    }}
                  >
                    {results.summary.totalPlatformsChecked}
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={6}>
                <div style={{ textAlign: 'center', padding: 10 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 5, letterSpacing: 1 }}>PROFILES FOUND</div>
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 700,
                      color: '#ff6b6b',
                      textShadow: '0 0 12px rgba(255, 107, 107, 0.3)',
                    }}
                  >
                    {results.summary.profilesFound}
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={6}>
                <div style={{ textAlign: 'center', padding: 10 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 5, letterSpacing: 1 }}>VERIFIED</div>
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 700,
                      background: 'var(--cyber-gradient)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      color: 'transparent',
                      textShadow: '0 0 12px rgba(0, 255, 136, 0.3)',
                    }}
                  >
                    {results.summary.verified}
                  </div>
                </div>
              </Col>
            </Row>
          </Card>

          {results.summary.profilesFound > 0 ? (
            <>
              {/* Category Tabs */}
              <Tabs
                defaultActiveKey="all"
                type="card"
                items={[
                  {
                    key: 'all',
                    label: (
                      <span style={{ fontWeight: 600, fontSize: 13 }}>
                        <CheckCircleOutlined style={{ marginRight: 4 }} /> All Profiles <Badge count={results.profiles.length} style={{ background: 'var(--cyber-blue)', color: '#000' }} />
                      </span>
                    ),
                    children: (
                      <Table
                        columns={profileColumns}
                        dataSource={results.profiles.map((p, idx) => ({ ...p, key: idx }))}
                        pagination={{ pageSize: 15, position: ['bottomCenter'] }}
                        scroll={{ x: 800 }}
                        size="small"
                        style={{
                          background: 'rgba(0, 255, 136, 0.02)',
                          borderRadius: 8,
                        }}
                      />
                    ),
                  },
                  {
                    key: 'social',
                    label: (
                      <span style={{ fontWeight: 600, fontSize: 13 }}>
                        <UsergroupAddOutlined style={{ marginRight: 4 }} /> Social <Badge count={results.byCategory.social_networks.length} style={{ background: '#1DA1F2' }} />
                      </span>
                    ),
                    children:
                      results.byCategory.social_networks.length > 0 ? (
                        <Table
                          columns={profileColumns}
                          dataSource={results.byCategory.social_networks.map((p, idx) => ({
                            ...p,
                            key: idx,
                          }))}
                          pagination={{ pageSize: 15 }}
                          scroll={{ x: 800 }}
                          size="small"
                        />
                      ) : (
                        <Empty description="No social network profiles found" style={{ color: 'var(--text-muted)' }} />
                      ),
                  },
                  {
                    key: 'dev',
                    label: (
                      <span style={{ fontWeight: 600, fontSize: 13 }}>
                        <LaptopOutlined style={{ marginRight: 4 }} /> Developer <Badge count={results.byCategory.developer.length} style={{ background: '#6366f1' }} />
                      </span>
                    ),
                    children:
                      results.byCategory.developer.length > 0 ? (
                        <Table
                          columns={profileColumns}
                          dataSource={results.byCategory.developer.map((p, idx) => ({
                            ...p,
                            key: idx,
                          }))}
                          pagination={{ pageSize: 15 }}
                          scroll={{ x: 800 }}
                          size="small"
                        />
                      ) : (
                        <Empty description="No developer profiles found" style={{ color: 'var(--text-muted)' }} />
                      ),
                  },
                  {
                    key: 'content',
                    label: (
                      <span style={{ fontWeight: 600, fontSize: 13 }}>
                        <VideoCameraOutlined style={{ marginRight: 4 }} /> Content <Badge count={results.byCategory.content.length} style={{ background: '#FF0000' }} />
                      </span>
                    ),
                    children:
                      results.byCategory.content.length > 0 ? (
                        <Table
                          columns={profileColumns}
                          dataSource={results.byCategory.content.map((p, idx) => ({
                            ...p,
                            key: idx,
                          }))}
                          pagination={{ pageSize: 15 }}
                          scroll={{ x: 800 }}
                          size="small"
                        />
                      ) : (
                        <Empty description="No content profiles found" style={{ color: 'var(--text-muted)' }} />
                      ),
                  },
                  {
                    key: 'gaming',
                    label: (
                      <span style={{ fontWeight: 600, fontSize: 13 }}>
                        <PlayCircleOutlined style={{ marginRight: 4 }} /> Gaming <Badge count={results.byCategory.gaming.length} style={{ background: '#9146FF' }} />
                      </span>
                    ),
                    children:
                      results.byCategory.gaming.length > 0 ? (
                        <Table
                          columns={profileColumns}
                          dataSource={results.byCategory.gaming.map((p, idx) => ({
                            ...p,
                            key: idx,
                          }))}
                          pagination={{ pageSize: 15 }}
                          scroll={{ x: 800 }}
                          size="small"
                        />
                      ) : (
                        <Empty description="No gaming profiles found" style={{ color: 'var(--text-muted)' }} />
                      ),
                  },
                  {
                    key: 'other',
                    label: (
                      <span style={{ fontWeight: 600, fontSize: 13 }}>
                        <LinkOutlined style={{ marginRight: 4 }} /> Other <Badge count={results.byCategory.other.length} style={{ background: '#10b981' }} />
                      </span>
                    ),
                    children:
                      results.byCategory.other.length > 0 ? (
                        <Table
                          columns={profileColumns}
                          dataSource={results.byCategory.other.map((p, idx) => ({
                            ...p,
                            key: idx,
                          }))}
                          pagination={{ pageSize: 15 }}
                          scroll={{ x: 800 }}
                          size="small"
                        />
                      ) : (
                        <Empty description="No other profiles found" style={{ color: 'var(--text-muted)' }} />
                      ),
                  },
                ]}
              />
            </>
          ) : (
            <Result
              status="info"
              title="No Profiles Found"
              subTitle={`The search didn't find any public profiles for "${results.input}" on the scanned platforms. This account may be private or uses a different username.`}
              style={{
                background: 'rgba(248, 250, 252, 0.5)',
                padding: 40,
                borderRadius: 12,
                border: '1px solid rgba(0, 255, 136, 0.2)',
              }}
            />
          )}

          {/* Footer */}
          <Card
            style={{
              marginTop: 20,
              background: 'rgba(0, 255, 136, 0.03)',
              border: '1px solid rgba(0, 255, 136, 0.1)',
              textAlign: 'center',
            }}
          >
            <small style={{ color: '#6b7280', letterSpacing: 0.5 }}>
              Scan completed on {new Date(results.timestamp).toLocaleString()}
            </small>
          </Card>
        </>
      )}
    </div>
  );
};

export default SocialMediaProfileFinder;

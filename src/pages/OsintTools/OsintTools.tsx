import React, { useState, useEffect } from 'react';
import { Typography, Row, Col, Tag, Card } from 'antd';
import {
  UserOutlined, MailOutlined, WhatsAppOutlined,
  GlobalOutlined, SafetyCertificateOutlined, SettingOutlined,
  PlayCircleOutlined, SyncOutlined
} from '@ant-design/icons';
import { useLocation } from 'react-router-dom';

import EmailLookup from './EmailLookup';
import PhoneLookup from './PhoneLookup';
import KaliSherlockSearch from './KaliSherlockSearch';
import KaliWhoisLookup from './KaliWhoisLookup';

const { Title, Paragraph } = Typography;

type ToolType = 'username' | 'email' | 'phone' | 'dns';

const OsintTools: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const toolParam = searchParams.get('tool');

  const [activeTool, setActiveTool] = useState<ToolType>('username');
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (toolParam) {
      const lower = toolParam.toLowerCase();
      if (['username', 'email', 'phone', 'dns'].includes(lower)) {
        setActiveTool(lower as ToolType);
      }
    }
  }, [toolParam]);

  const toolsList = [
    {
      key: 'username' as ToolType,
      title: 'Username Lookup',
      sub: 'Sherlock Social Recon',
      desc: 'Probe username footprints across 350+ social platforms simultaneously to isolate user nodes.',
      icon: <UserOutlined />,
      color: '#4f46e5',
      badge: 'SHERLOCK'
    },
    {
      key: 'email' as ToolType,
      title: 'Email Intelligence',
      sub: 'Holehe Footprint Matrix',
      desc: 'Verify email registration metadata across 120+ platforms with confirmed breach mapping.',
      icon: <MailOutlined />,
      color: '#ef4444',
      badge: 'HOLEHE'
    },
    {
      key: 'phone' as ToolType,
      title: 'WhatsApp OSINT',
      sub: 'WhatsOSINT Live Probe',
      desc: 'Gather profile display name, about status text, and active avatar from WhatsApp network.',
      icon: <WhatsAppOutlined />,
      color: '#25D366',
      badge: 'WHATSOSINT'
    },
    {
      key: 'dns' as ToolType,
      title: 'DNS & Whois Lookup',
      sub: 'Infrastructure Registrar Audit',
      desc: 'Extract domain ownership records, authoritative name servers, and expiration timeframes.',
      icon: <GlobalOutlined />,
      color: '#3b82f6',
      badge: 'WHOIS'
    },
  ];

  const handleScanStateChange = (scanning: boolean) => {
    setIsScanning(scanning);
  };

  const renderActiveTool = () => {
    switch (activeTool) {
      case 'username':
        return <KaliSherlockSearch onScanStateChange={handleScanStateChange} />;
      case 'email':
        return <EmailLookup onScanStateChange={handleScanStateChange} />;
      case 'phone':
        return <PhoneLookup onScanStateChange={handleScanStateChange} />;
      case 'dns':
        return <KaliWhoisLookup onScanStateChange={handleScanStateChange} />;
      default:
        return <KaliSherlockSearch onScanStateChange={handleScanStateChange} />;
    }
  };

  const activeToolDetails = toolsList.find(t => t.key === activeTool);

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', paddingBottom: 50 }}>
      {/* Header Panel */}
      <div style={{ marginBottom: 30, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <Tag color="geekblue" style={{ borderRadius: 20, padding: '2px 14px', fontWeight: 800, fontSize: 11 }}>ACTIVE FORENSIC RECON</Tag>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: 1.5 }}>
              <SafetyCertificateOutlined style={{ color: '#10b981' }} /> SYSTEM ENCRYPTED
            </span>
          </div>
          <Title level={2} style={{
            background: 'var(--cyber-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: '2.4rem',
            margin: 0,
            fontWeight: 900
          }}>
            OSINT Cyber Recon Armory
          </Title>
          <Paragraph style={{ color: '#64748b', fontSize: '15px', fontWeight: 500, margin: '8px 0 0' }}>
            Execute high-precision open source intelligence scans. Select a forensic utility below.
          </Paragraph>
        </div>
        {isScanning && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(16, 185, 129, 0.1)', padding: '8px 16px', borderRadius: 20, border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <SyncOutlined spin style={{ color: '#10b981', fontSize: 18 }} />
            <span style={{ color: '#10b981', fontWeight: 700, letterSpacing: 1 }}>SCAN IN PROGRESS</span>
          </div>
        )}
      </div>

      <Row gutter={[24, 24]}>
        {/* Left Column: Tool Selection (Hidden when scanning) */}
        {!isScanning && (
          <Col xs={24} lg={8} xl={7}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <SettingOutlined style={{ color: 'var(--cyber-blue)', fontSize: 16 }} />
              <span style={{ fontSize: 13, fontWeight: 800, color: '#1e293b', letterSpacing: 0.5, textTransform: 'uppercase' }}>Select Module</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {toolsList.map(t => {
                const isSelected = activeTool === t.key;
                return (
                  <div
                    key={t.key}
                    onClick={() => setActiveTool(t.key)}
                    style={{
                      background: isSelected ? 'linear-gradient(to right, #ffffff, #f8fafc)' : '#ffffff',
                      border: isSelected ? `2px solid ${t.color}` : '1.5px solid #e2e8f0',
                      borderLeft: isSelected ? `6px solid ${t.color}` : '1.5px solid #e2e8f0',
                      borderRadius: 12,
                      padding: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: isSelected
                        ? `0 12px 24px ${t.color}15`
                        : '0 2px 6px rgba(0,0,0,0.02)',
                      transform: isSelected ? 'translateX(4px)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={e => {
                      if (!isSelected) {
                        const card = e.currentTarget as HTMLDivElement;
                        card.style.borderColor = t.color;
                        card.style.transform = 'translateX(2px)';
                        card.style.boxShadow = '0 6px 16px rgba(0,0,0,0.03)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isSelected) {
                        const card = e.currentTarget as HTMLDivElement;
                        card.style.borderColor = '#e2e8f0';
                        card.style.transform = 'none';
                        card.style.boxShadow = '0 2px 6px rgba(0,0,0,0.02)';
                      }
                    }}
                  >
                    {/* Decorative background logo */}
                    <div style={{
                      position: 'absolute', top: -10, right: -10,
                      fontSize: 60, color: isSelected ? `${t.color}08` : 'transparent',
                      zIndex: 0, pointerEvents: 'none'
                    }}>
                      {t.icon}
                    </div>

                    <div style={{
                      width: 42, height: 42, borderRadius: 10,
                      background: isSelected ? `${t.color}15` : '#f1f5f9',
                      color: isSelected ? t.color : '#64748b',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 20, flexShrink: 0, zIndex: 1
                    }}>
                      {t.icon}
                    </div>

                    <div style={{ flex: 1, zIndex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <div style={{ fontWeight: 800, fontSize: 14, color: '#1e293b' }}>
                          {t.title}
                        </div>
                        {isSelected && <PlayCircleOutlined style={{ color: t.color, fontSize: 16 }} />}
                      </div>
                      <div style={{ fontSize: 11, color: t.color, fontWeight: 700, letterSpacing: 0.5 }}>
                        {t.sub}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Col>
        )}

        {/* Right Column: Active Tool & About Info */}
        <Col xs={24} lg={isScanning ? 24 : 16} xl={isScanning ? 24 : 17}>
          {/* About Card (Hidden when scanning) */}
          {!isScanning && activeToolDetails && (
            <Card
              style={{
                marginBottom: 24,
                borderRadius: 16,
                background: `linear-gradient(135deg, #ffffff 0%, ${activeToolDetails.color}05 100%)`,
                border: `1px solid ${activeToolDetails.color}30`,
                boxShadow: 'none'
              }}
              bodyStyle={{ padding: '20px 24px' }}
            >
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ fontSize: 32, color: activeToolDetails.color, marginTop: 4 }}>
                  {activeToolDetails.icon}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <h3 style={{ margin: 0, color: '#1e293b', fontWeight: 800, fontSize: 18 }}>{activeToolDetails.title}</h3>
                    <Tag color={activeToolDetails.color} style={{ margin: 0, fontWeight: 700 }}>{activeToolDetails.badge}</Tag>
                  </div>
                  <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                    {activeToolDetails.desc}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Active Scanner Viewport */}
          <div className="active-tool-viewport" style={{
            background: '#ffffff',
            borderRadius: 20,
            padding: '8px 24px',
            border: isScanning ? `2px solid ${activeToolDetails?.color || '#e2e8f0'}` : '1.5px solid #e2e8f0',
            boxShadow: isScanning ? `0 10px 40px ${activeToolDetails?.color}30` : '0 10px 30px rgba(0,0,0,0.02)',
            transition: 'all 0.4s ease'
          }}>
            {renderActiveTool()}
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default OsintTools;

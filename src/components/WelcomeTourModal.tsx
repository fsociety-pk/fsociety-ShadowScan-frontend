/**
 * WelcomeTourModal — First-login guided tour popup.
 * Explains the 3-step OSINT workflow to new users.
 * Shown once per user; dismissed state stored in localStorage.
 */
import React, { useState, useEffect } from 'react';
import { Modal, Button, Steps } from 'antd';
import {
  ToolOutlined,
  FileTextOutlined,
  RobotOutlined,
  CheckCircleOutlined,
  RadarChartOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';

const TOUR_SEEN_KEY = 'shadowscan_tour_seen';

const steps = [
    {
    icon: <ToolOutlined style={{ fontSize: 32, color: '#0ea5e9' }} />,
    accent: '#0ea5e9',
    tag: 'STEP 1',
    title: 'Run OSINT Tools',
    description:
      'Navigate to the OSINT Tools panel and choose your reconnaissance engine. Run Sherlock for username discovery, Holehe for email intelligence, PhoneOSINT for phone lookup, or Whois for domain records.',
    tip: 'Tip: You can run multiple tools and combine their outputs.',
  },
  {
    icon: <FileTextOutlined style={{ fontSize: 32, color: '#8b5cf6' }} />,
    accent: '#8b5cf6',
    tag: 'STEP 2',
    title: 'Paste Your Findings',
    description:
      'Copy all raw results from the tools and paste them into the Report Generator textarea. You can also upload screenshots or supporting files as evidence context.',
    tip: 'Tip: The more raw data you paste, the richer your AI report will be.',
  },
  {
    icon: <RobotOutlined style={{ fontSize: 32, color: '#10b981' }} />,
    accent: '#10b981',
    tag: 'STEP 3',
    title: 'Generate AI Report',
    description:
      'Click "Generate Intelligence Report". The Claude AI engine will analyse your pasted findings, extract key entities, assess risk, and produce a professional forensic intelligence report you can download as PDF or copy to clipboard.',
    tip: 'Tip: Use the AI Chatbot if you need guidance at any step.',
  },
];

const WelcomeTourModal: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(0);

  /* Show the tour on first login only */
  useEffect(() => {
    const seen = localStorage.getItem(TOUR_SEEN_KEY);
    if (!seen) {
      // Small delay so the dashboard renders first
      const timer = setTimeout(() => setVisible(true), 700);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(TOUR_SEEN_KEY, 'true');
    setVisible(false);
  };

  const step = steps[current];
  const isLast = current === steps.length - 1;

  return (
    <Modal
      open={visible}
      footer={null}
      closable={false}
      mask={{ closable: false }}
      centered
      width={620}
      styles={{
        mask: { backdropFilter: 'blur(8px)', background: 'rgba(15, 23, 42, 0.5)' },
        body: {
          borderRadius: 24, overflow: 'hidden', padding: 0,
          boxShadow: '0 32px 80px rgba(14, 165, 233, 0.25), 0 8px 32px rgba(0,0,0,0.12)',
          border: '1px solid rgba(14, 165, 233, 0.2)',
        },
      }}
    >
      {/* Modal Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 50%, #10b981 100%)',
        padding: '32px 36px 28px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative blobs */}
        <div style={{
          position: 'absolute', top: -40, right: -40, width: 180, height: 180,
          borderRadius: '50%', background: 'rgba(255,255,255,0.06)',
        }} />
        <div style={{
          position: 'absolute', bottom: -20, left: -20, width: 120, height: 120,
          borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative' }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(255,255,255,0.3)',
          }}>
            <RadarChartOutlined style={{ color: '#fff', fontSize: 26 }} />
          </div>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, letterSpacing: 2, fontWeight: 600, marginBottom: 2 }}>
              SHADOW SCAN OSINT PLATFORM
            </div>
            <div style={{ color: '#ffffff', fontSize: 22, fontWeight: 800, letterSpacing: 0.5 }}>
              Welcome, Operative!
            </div>
          </div>
        </div>

        <p style={{
          color: 'rgba(255,255,255,0.85)', fontSize: 14, marginTop: 16,
          lineHeight: 1.7, position: 'relative', marginBottom: 0,
        }}>
          Here's how the platform works. Follow these <strong style={{ color: '#fff' }}>3 simple steps</strong> to generate a complete AI-powered intelligence report.
        </p>
      </div>

      {/* Step Progress Dots */}
      <div style={{
        padding: '20px 36px 0',
        background: '#f8fafc',
        borderBottom: '1px solid #f1f5f9',
      }}>
        <Steps
          current={current}
          size="small"
          items={steps.map((s, i) => ({
            title: <span style={{
              fontSize: 12, fontWeight: 700,
              color: i === current ? s.accent : i < current ? '#10b981' : '#94a3b8',
            }}>{s.tag}</span>,
            status: i < current ? 'finish' : i === current ? 'process' : 'wait',
          }))}
          style={{ marginBottom: 20 }}
        />
      </div>

      {/* Step Content */}
      <div style={{
        padding: '28px 36px',
        background: '#ffffff',
        minHeight: 220,
      }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          {/* Icon bubble */}
          <div style={{
            width: 68, height: 68, borderRadius: 18, flexShrink: 0,
            background: `linear-gradient(135deg, ${step.accent}18, ${step.accent}08)`,
            border: `2px solid ${step.accent}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {step.icon}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{
              display: 'inline-block',
              background: `${step.accent}15`,
              border: `1px solid ${step.accent}30`,
              color: step.accent,
              fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
              padding: '2px 10px', borderRadius: 20, marginBottom: 8,
            }}>
              {step.tag}
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#1e293b', marginBottom: 12 }}>
              {step.title}
            </div>
            <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.75, marginBottom: 14 }}>
              {step.description}
            </p>
            {/* Tip box */}
            <div style={{
              background: `${step.accent}08`,
              border: `1px solid ${step.accent}25`,
              borderLeft: `3px solid ${step.accent}`,
              borderRadius: '0 8px 8px 0',
              padding: '8px 14px',
              fontSize: 13,
              color: '#64748b',
              fontStyle: 'italic',
            }}>
              {step.tip}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Buttons */}
      <div style={{
        padding: '16px 36px 28px',
        background: '#ffffff',
        borderTop: '1px solid #f1f5f9',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        {/* Skip */}
        <button
          onClick={dismiss}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#94a3b8', fontSize: 13, fontWeight: 600,
            padding: '8px 4px', transition: 'color 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#64748b')}
          onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}
        >
          Skip tour
        </button>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {/* Back */}
          {current > 0 && (
            <Button
              onClick={() => setCurrent(c => c - 1)}
              style={{ borderRadius: 10, fontWeight: 600, height: 40, padding: '0 20px' }}
            >
              ← Back
            </Button>
          )}

          {/* Next / Finish */}
          {isLast ? (
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={dismiss}
              style={{
                borderRadius: 10, fontWeight: 700, height: 40, padding: '0 24px',
                background: 'linear-gradient(135deg, #10b981, #0ea5e9)',
                border: 'none',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
              }}
            >
              Start Scanning!
            </Button>
          ) : (
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={() => setCurrent(c => c + 1)}
              style={{
                borderRadius: 10, fontWeight: 700, height: 40, padding: '0 24px',
                background: `linear-gradient(135deg, ${step.accent}, ${steps[current + 1]?.accent || step.accent})`,
                border: 'none',
                boxShadow: `0 4px 14px ${step.accent}40`,
              }}
            >
              Next Step →
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default WelcomeTourModal;

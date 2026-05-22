import React, { useEffect, useState } from 'react';
import ProfessionalProgress from './ProfessionalProgress';

interface Props {
  percent: number;
  target: string;
  currentStep: string;
  opName?: string;
}

const CyberConsoleLoader: React.FC<Props> = ({
  percent,
  target,
  currentStep,
  opName = 'FORENSIC INVESTIGATION'
}) => {
  const [dots, setDots] = useState('');

  // Subtle pulsing dots for the title
  useEffect(() => {
    const int = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '' : d + '.'));
    }, 500);
    return () => clearInterval(int);
  }, []);

  return (
    <div className="cyber-loader-card">
      {/* High-tech matrix terminal header */}
      <div className="cyber-terminal-meta">
        <div className="meta-left">
          <span className="meta-tag tag-active">SYS: ACTIVE</span>
          <span className="meta-tag tag-sec">SECURE CHANNELS</span>
        </div>
        <div className="meta-right">
          <span className="meta-code">DEC_VAL: 0x77FF</span>
          <span className="meta-code">RATE: 4.8 GB/S</span>
        </div>
      </div>

      {/* Cyber Waveform Signal Visualizer (Digital Oscilloscope / Linear Signal Bars) */}
      <div className="signal-visualizer-container">
        <div className="signal-bar bar-1"></div>
        <div className="signal-bar bar-2"></div>
        <div className="signal-bar bar-3"></div>
        <div className="signal-bar bar-4"></div>
        <div className="signal-bar bar-5"></div>
        <div className="signal-bar bar-6"></div>
        <div className="signal-bar bar-7"></div>
        <div className="signal-bar bar-8"></div>
        <div className="signal-bar bar-9"></div>
        <div className="signal-bar bar-10"></div>
        <div className="signal-bar bar-11"></div>
        <div className="signal-bar bar-12"></div>
      </div>

      {/* Central Scanning Information */}
      <div className="cyber-loader-title">
        [SYSTEM ACTIVE: {opName.toUpperCase()}{dots}]
      </div>
      <div className="cyber-loader-subtitle">
        Target Anchor: <span className="target-glow">"{target}"</span>
      </div>

      {/* Sleek Progress Bar Wrapper */}
      <div className="cyber-progress-container">
        <ProfessionalProgress percent={percent} />
        <div className="progress-footer-stats">
          <span className="footer-label">DATA UPLINK ENRICHMENT</span>
          <span className="footer-percent">{Math.floor(percent)}% COMPLETE</span>
        </div>
      </div>

      {/* Terminal Step Bar */}
      <div className="cyber-step-console">
        <span className="console-prompt">&gt;</span> {currentStep}
      </div>

      <style>{`
        .cyber-loader-card {
          width: 100%;
          max-width: 580px;
          margin: 0 auto;
          padding: 24px;
          background: #ffffff;
          border: 1px solid #e6eefc;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(79, 70, 229, 0.05), inset 0 1px 2px rgba(255, 255, 255, 0.9);
          text-align: center;
        }

        /* High-tech Header Tags */
        .cyber-terminal-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
          font-size: 11px;
          margin-bottom: 24px;
          padding-bottom: 12px;
          border-bottom: 1.5px dashed #e2e8f0;
        }
        .meta-left {
          display: flex;
          gap: 8px;
        }
        .meta-right {
          display: flex;
          gap: 12px;
          color: #94a3b8;
        }
        .meta-tag {
          padding: 2px 8px;
          border-radius: 4px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        .tag-active {
          background: rgba(16, 185, 129, 0.08);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }
        .tag-sec {
          background: rgba(79, 70, 229, 0.05);
          color: #4f46e5;
          border: 1px solid rgba(79, 70, 229, 0.1);
        }
        .meta-code {
          font-weight: 600;
        }

        /* Cyber Waveform Signal Analyzer */
        .signal-visualizer-container {
          display: flex;
          justify-content: center;
          align-items: flex-end;
          gap: 6px;
          height: 48px;
          margin-bottom: 24px;
        }
        .signal-bar {
          width: 6px;
          height: 10px;
          background: linear-gradient(180deg, #4f46e5, #818cf8);
          border-radius: 3px;
          animation: signal-pulse 1.4s ease-in-out infinite;
        }
        .bar-1  { animation-delay: 0.1s; height: 18px; }
        .bar-2  { animation-delay: 0.3s; height: 26px; }
        .bar-3  { animation-delay: 0.5s; height: 38px; }
        .bar-4  { animation-delay: 0.2s; height: 22px; }
        .bar-5  { animation-delay: 0.4s; height: 34px; }
        .bar-6  { animation-delay: 0.7s; height: 44px; }
        .bar-7  { animation-delay: 0.9s; height: 30px; }
        .bar-8  { animation-delay: 0.6s; height: 22px; }
        .bar-9  { animation-delay: 0.8s; height: 38px; }
        .bar-10 { animation-delay: 0.4s; height: 26px; }
        .bar-11 { animation-delay: 0.2s; height: 18px; }
        .bar-12 { animation-delay: 0.5s; height: 10px; }

        @keyframes signal-pulse {
          0%, 100% {
            transform: scaleY(1);
            background: linear-gradient(180deg, #4f46e5, #818cf8);
            opacity: 0.7;
          }
          50% {
            transform: scaleY(2.2);
            background: linear-gradient(180deg, #10b981, #34d399);
            opacity: 1;
            box-shadow: 0 0 10px rgba(16, 185, 129, 0.4);
          }
        }

        /* Titles and Target Label */
        .cyber-loader-title {
          font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
          color: #475569;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 1.5px;
          margin-bottom: 8px;
        }
        .cyber-loader-subtitle {
          font-size: 16px;
          color: #1e293b;
          font-weight: 600;
          margin-bottom: 24px;
        }
        .target-glow {
          color: #4f46e5;
          font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
          font-weight: 700;
        }

        /* Progress Bar area */
        .cyber-progress-container {
          width: 100%;
          margin-bottom: 20px;
        }
        .progress-footer-stats {
          display: flex;
          justify-content: space-between;
          font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
          font-size: 11px;
          color: #64748b;
          margin-top: 6px;
        }
        .footer-percent {
          color: #4f46e5;
          font-weight: 700;
        }

        /* Cyber Step Terminal console block */
        .cyber-step-console {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 12px 20px;
          border-radius: 10px;
          font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
          font-size: 12px;
          color: #4f46e5;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
          text-align: left;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .console-prompt {
          color: #10b981;
          font-weight: 700;
          animation: blink-prompt 1s step-end infinite;
        }
        @keyframes blink-prompt { 50% { opacity: 0; } }
      `}</style>
    </div>
  );
};

export default CyberConsoleLoader;

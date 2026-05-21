import React from 'react';

interface Props {
  percent: number;
  ariaLabel?: string;
  maxWidth?: number | string;
}

const ProfessionalProgress: React.FC<Props> = ({ percent, ariaLabel = 'progress', maxWidth = '100%' }) => {
  const pct = Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <div style={{ width: maxWidth, position: 'relative', padding: '4px 0' }}>
      {/* Tech border outer cage */}
      <div className="tech-progress-cage">
        {/* Inner track */}
        <div className="tech-progress-track">
          {/* Active fill with sliding neon gradient and cyber slatted cells */}
          <div className="tech-progress-fill" style={{ width: `${pct}%` }}>
            <div className="tech-progress-cells" />
            <div className="tech-progress-glow" />
            <div className="tech-progress-laser" />
          </div>
        </div>
      </div>
      <style>{`
        .tech-progress-cage {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          padding: 4px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.04), inset 0 1px 3px rgba(255, 255, 255, 0.8);
        }
        .tech-progress-track {
          width: 100%;
          height: 16px;
          background: #f8fafc;
          border-radius: 8px;
          overflow: hidden;
          position: relative;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.04);
          border: 1px solid #e2e8f0;
        }
        .tech-progress-fill {
          height: 100%;
          width: 0%;
          border-radius: 8px;
          background: linear-gradient(90deg, #6366f1, #3b82f6, #10b981, #3b82f6, #6366f1);
          background-size: 200% 100%;
          animation: tech-gradient-move 3s linear infinite;
          transition: width 500ms cubic-bezier(.1, .9, .2, 1);
          position: relative;
          overflow: hidden;
          box-shadow: 0 0 8px rgba(99, 102, 241, 0.3);
        }
        .tech-progress-cells {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.15) 50%,
            transparent 50%
          );
          background-size: 8px 100%;
          opacity: 0.5;
        }
        .tech-progress-laser {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          width: 30px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.8),
            transparent
          );
          animation: tech-laser-sweep 2s infinite ease-in-out;
        }
        .tech-progress-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          box-shadow: inset 0 0 6px rgba(255, 255, 255, 0.6);
          mix-blend-mode: overlay;
        }

        @keyframes tech-gradient-move {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes tech-laser-sweep {
          0% { transform: translateX(-150%); }
          100% { transform: translateX(500%); }
        }
      `}</style>
    </div>
  );
};

export default ProfessionalProgress;

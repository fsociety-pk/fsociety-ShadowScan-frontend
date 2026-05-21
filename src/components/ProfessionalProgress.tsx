import React from 'react';

interface Props {
  percent: number;
  ariaLabel?: string;
  maxWidth?: number | string;
}

const ProfessionalProgress: React.FC<Props> = ({ percent, ariaLabel = 'progress', maxWidth = '100%' }) => {
  const pct = Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <div style={{ width: maxWidth, position: 'relative' }}>
      <div
        className="pro-progress-light"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label={ariaLabel}
      >
        <div className="pro-progress-light-bar" style={{ width: `${pct}%` }}>
          <div className="pro-progress-shimmer" />
        </div>
      </div>
      <style>{`
        .pro-progress-light {
          width: 100%;
          height: 12px;
          background: #f1f5f9; /* light track */
          border-radius: 999px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.03);
          position: relative;
        }
        .pro-progress-light-bar {
          height: 100%;
          width: 0%;
          background: linear-gradient(90deg, #3b82f6, #6366f1, #a855f7);
          border-radius: 999px;
          transition: width 400ms cubic-bezier(.2,.9,.2,1);
          position: relative;
          overflow: hidden;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }
        .pro-progress-shimmer {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.4) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          background-size: 200% 100%;
          animation: pro-shimmer-anim 1.5s infinite linear;
        }
        @keyframes pro-shimmer-anim {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
};

export default ProfessionalProgress;

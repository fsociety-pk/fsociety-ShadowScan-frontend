import React from 'react';

interface Props {
  percent: number;
  ariaLabel?: string;
  maxWidth?: number | string;
}

const ProfessionalProgress: React.FC<Props> = ({ percent, ariaLabel = 'progress', maxWidth = '100%' }) => {
  const pct = Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <div style={{ width: maxWidth }}>
      <div
        className="pro-progress-light"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label={ariaLabel}
      >
        <div className="pro-progress-light-bar" style={{ width: `${pct}%` }} />
      </div>
      <style>{`
        .pro-progress-light {
          width: 100%;
          height: 12px;
          background: #eef2ff; /* light track */
          border-radius: 999px;
          overflow: hidden;
          border: 1px solid #e6eefc;
        }
        .pro-progress-light-bar {
          height: 100%;
          width: 0%;
          background: linear-gradient(90deg, #60a5fa, #7c3aed, #a78bfa);
          border-radius: 999px;
          transition: width 360ms cubic-bezier(.2,.9,.2,1);
          box-shadow: 0 6px 18px rgba(124,58,237,0.12) inset;
        }
      `}</style>
    </div>
  );
};

export default ProfessionalProgress;

import React from 'react';

interface Props {
  percent: number;
  size?: number;
  strokeWidth?: number;
  colors?: string[]; // gradient colors
  ariaLabel?: string;
}

const ProfessionalProgressCircle: React.FC<Props> = ({ percent, size = 120, strokeWidth = 12, colors = ['#60a5fa', '#7c3aed'], ariaLabel = 'progress-circle' }) => {
  const pct = Math.max(0, Math.min(100, Math.round(percent)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct / 100);
  const id = `pg-${Math.round(Math.random() * 1e8)}`;

  return (
    <div style={{ width: size, height: size, display: 'inline-block' }}>
      <svg width={size} height={size} role="img" aria-label={ariaLabel}>
        <defs>
          <linearGradient id={`${id}-grad`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors[0]} />
            <stop offset="100%" stopColor={colors[1] || colors[0]} />
          </linearGradient>
        </defs>

        <g transform={`translate(${size / 2}, ${size / 2})`}>
          <circle
            r={radius}
            fill="none"
            stroke="#eef2ff"
            strokeWidth={strokeWidth}
          />

          <circle
            r={radius}
            fill="none"
            stroke={`url(#${id}-grad)`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={offset}
            transform={`rotate(-90)`}
            style={{ transition: 'stroke-dashoffset 420ms cubic-bezier(.2,.9,.2,1)' }}
          />

          <text x="0" y="6" textAnchor="middle" style={{ fontSize: Math.max(14, size * 0.16), fontWeight: 800, fill: '#0f172a' }}>
            {pct}%
          </text>
        </g>
      </svg>
    </div>
  );
};

export default ProfessionalProgressCircle;

import React from 'react';

interface RadialGaugeProps {
  score: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export const RadialGauge: React.FC<RadialGaugeProps> = ({
  score,
  size = 140,
  strokeWidth = 12,
  label = 'Readiness Score',
}) => {
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let color = '#34d399'; // Emerald
  if (score < 60) color = '#f87171'; // Rose
  else if (score < 85) color = '#fbbf24'; // Amber

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-bold text-white tracking-tight">{Math.round(score)}%</span>
        </div>
      </div>
      {label && <span className="text-xs text-dark-muted font-medium mt-2 uppercase tracking-wider">{label}</span>}
    </div>
  );
};

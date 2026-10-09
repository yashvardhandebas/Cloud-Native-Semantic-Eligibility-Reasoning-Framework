import React from 'react';
import { ClauseStatus, VerdictType, MutabilityType } from '../types';

interface BadgeProps {
  type?: 'status' | 'verdict' | 'mutability' | 'category' | 'default';
  value: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ type = 'default', value, className = '' }) => {
  let styleClasses = 'bg-white/10 text-white border-white/10';

  if (type === 'status' || type === 'verdict') {
    if (value === 'PASSED' || value === 'ELIGIBLE') {
      styleClasses = 'bg-brand-emerald/15 text-brand-emerald border-brand-emerald/30';
    } else if (value === 'FAILED' || value === 'INELIGIBLE') {
      styleClasses = 'bg-brand-rose/15 text-brand-rose border-brand-rose/30';
    } else if (value === 'UNKNOWN' || value === 'NEEDS_MORE_INFO') {
      styleClasses = 'bg-brand-amber/15 text-brand-amber border-brand-amber/30';
    }
  } else if (type === 'mutability') {
    if (value === 'IMMUTABLE') {
      styleClasses = 'bg-brand-blue/15 text-brand-blue border-brand-blue/30';
    } else {
      styleClasses = 'bg-purple-500/15 text-purple-300 border-purple-500/30';
    }
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border uppercase ${styleClasses} ${className}`}
    >
      {value}
    </span>
  );
};

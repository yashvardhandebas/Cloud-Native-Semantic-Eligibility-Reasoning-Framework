import React from 'react';

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const GlowCard: React.FC<GlowCardProps> = ({ children, className = '', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`glass-card p-6 relative overflow-hidden group cursor-pointer ${className}`}
    >
      {/* Subtle cursor hover background glow overlay */}
      <div className="absolute -inset-px bg-gradient-to-r from-brand-cyan/20 to-brand-magenta/20 rounded-[20px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

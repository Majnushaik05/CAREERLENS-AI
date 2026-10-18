import React from 'react';

interface CareerLensLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textClassName?: string;
  badge?: string;
  className?: string;
}

export const CareerLensLogo: React.FC<CareerLensLogoProps> = ({
  size = 'md',
  showText = false,
  textClassName = '',
  badge,
  className = '',
}) => {
  const sizeMap = {
    xs: { box: 'w-6 h-6', svg: 24, font: 'text-sm' },
    sm: { box: 'w-7 h-7', svg: 28, font: 'text-sm' },
    md: { box: 'w-9 h-9', svg: 36, font: 'text-base' },
    lg: { box: 'w-11 h-11', svg: 44, font: 'text-lg' },
    xl: { box: 'w-14 h-14', svg: 56, font: 'text-2xl' },
  };

  const current = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Executive Optical Lens Mark */}
      <div
        className={`${current.box} rounded-xl bg-slate-950 border border-slate-800 shadow-sm flex items-center justify-center shrink-0 relative overflow-hidden group`}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1"
        >
          {/* Dual Precision Interlocking Optical Lenses */}
          {/* Primary Focus Ring */}
          <circle
            cx="13.5"
            cy="16"
            r="8"
            stroke="#3B82F6"
            strokeWidth="2.2"
          />
          
          {/* Secondary Convergence Lens */}
          <circle
            cx="18.5"
            cy="16"
            r="8"
            stroke="#06B6D4"
            strokeWidth="2.2"
            strokeOpacity="0.9"
          />

          {/* Central High-Precision Focal Iris */}
          <path
            d="M16 11.2C17.6 12.8 18.5 14.3 18.5 16C18.5 17.7 17.6 19.2 16 20.8C14.4 19.2 13.5 17.7 13.5 16C13.5 14.3 14.4 12.8 16 11.2Z"
            fill="#2563EB"
          />
          
          {/* Central White Optical Core */}
          <circle
            cx="16"
            cy="16"
            r="1.8"
            fill="#FFFFFF"
          />

          {/* Upward Career Progression Beam */}
          <path
            d="M21 11L25 7M25 7H21.5M25 7V10.5"
            stroke="#10B981"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Modern High-End Wordmark */}
      {showText && (
        <div className="flex items-center gap-1.5">
          <span className={`font-black tracking-tight text-slate-950 ${current.font} ${textClassName}`}>
            Career<span className="text-blue-600 ml-1">Lens</span>
          </span>
          {badge && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

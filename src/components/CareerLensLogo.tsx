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
    xs: { box: 'w-7 h-7', svg: 26, font: 'text-xs' },
    sm: { box: 'w-8 h-8', svg: 30, font: 'text-sm' },
    md: { box: 'w-10 h-10', svg: 38, font: 'text-base' },
    lg: { box: 'w-12 h-12', svg: 46, font: 'text-lg' },
    xl: { box: 'w-16 h-16', svg: 60, font: 'text-2xl' },
  };

  const current = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* High-Precision Black & Electric Blue Optical Lens Emblem */}
      <div
        className={`${current.box} rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 border border-slate-800 shadow-sm flex items-center justify-center shrink-0 relative overflow-hidden group hover:border-blue-500 hover:shadow-[0_0_16px_rgba(37,99,235,0.25)] transition-all duration-300`}
      >
        {/* Subtle internal refraction flare with electric blue glint */}
        <div className="absolute inset-0 bg-radial from-blue-500/20 via-transparent to-transparent opacity-70 pointer-events-none" />

        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1 relative z-10"
        >
          <defs>
            {/* Deep Obsidian Black to Vivid Electric Blue Gradient */}
            <linearGradient id="lensBlackBlueGrad" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0F172A" />
              <stop offset="45%" stopColor="#1E3A8A" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>

            {/* Electric Blue Core Gradient */}
            <linearGradient id="electricBlueGrad" x1="6" y1="6" x2="34" y2="34" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="50%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>

            {/* Inner Refractive Prism Lens */}
            <linearGradient id="lensIrisGrad" x1="12" y1="12" x2="28" y2="28" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#0F172A" stopOpacity="0.85" />
            </linearGradient>

            {/* Rising Career Trajectory Gradient */}
            <linearGradient id="vectorGrad" x1="20" y1="18" x2="33" y2="7" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#93C5FD" />
            </linearGradient>
          </defs>

          {/* Calibrated Bezel Ring - Obsidian with Blue Accent */}
          <circle
            cx="19"
            cy="21"
            r="13"
            stroke="#1E293B"
            strokeWidth="2.4"
          />

          {/* Electric Blue Optical Outer Track */}
          <circle
            cx="19"
            cy="21"
            r="12.2"
            stroke="url(#electricBlueGrad)"
            strokeWidth="1.8"
            strokeLinecap="round"
          />

          {/* Secondary Precision Convergence Ring */}
          <circle
            cx="22"
            cy="21"
            r="9.5"
            stroke="#60A5FA"
            strokeWidth="1.2"
            strokeDasharray="2 3"
            strokeOpacity="0.9"
          />

          {/* Optical Iris Aperture - Black & Blue Refractive Core */}
          <path
            d="M19 14.5C21.2 16.7 22.5 18.8 22.5 21C22.5 23.2 21.2 25.3 19 27.5C16.8 25.3 15.5 23.2 15.5 21C15.5 18.8 16.8 16.7 19 14.5Z"
            fill="url(#lensIrisGrad)"
            stroke="#2563EB"
            strokeWidth="0.8"
          />

          {/* High-Contrast Focal Core */}
          <circle
            cx="19"
            cy="21"
            r="2.8"
            fill="#0F172A"
            stroke="#60A5FA"
            strokeWidth="1.2"
          />
          <circle
            cx="18.3"
            cy="20.3"
            r="0.9"
            fill="#FFFFFF"
          />

          {/* Upward Career Trajectory Vector - Electric Blue Arrow */}
          <path
            d="M25 15L33 7M33 7H27.5M33 7V12.5"
            stroke="url(#vectorGrad)"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Micro Optical Calibration Points */}
          <circle cx="33" cy="7" r="1.3" fill="#60A5FA" />
          <circle cx="9" cy="31" r="1.3" fill="#2563EB" stroke="#0F172A" strokeWidth="0.6" />
        </svg>
      </div>

      {/* Modern Wordmark: Career (Black) + Lens (Electric Blue) */}
      {showText && (
        <div className="flex items-center gap-2">
          <div className="flex items-baseline">
            <span className={`font-black tracking-tight text-slate-950 ${current.font} ${textClassName}`}>
              Career<span className="text-blue-600 ml-0.5">Lens</span>
            </span>
          </div>
          {badge && (
            <span className="text-[10px] font-extrabold font-mono tracking-wider px-1.5 py-0.5 rounded-md bg-slate-900 text-blue-400 border border-slate-800 shadow-2xs">
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

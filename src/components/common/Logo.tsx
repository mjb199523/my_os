import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export default function Logo({ className = '', size = 32 }: LogoProps) {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-xl overflow-hidden shadow-sm transition-transform duration-200 hover:scale-105 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-xs"
      >
        <defs>
          <linearGradient id="compLogoBg" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0F172A" />
            <stop offset="50%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>

          <linearGradient id="compLogoRing" x1="64" y1="64" x2="448" y2="448" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="50%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>

          <linearGradient id="compLogoCore" x1="160" y1="160" x2="352" y2="352" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>

          <linearGradient id="compLogoAccent" x1="200" y1="180" x2="320" y2="340" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#FFFFFF" />
          </linearGradient>
        </defs>

        {/* Base Container */}
        <rect width="512" height="512" rx="128" fill="url(#compLogoBg)" />
        <rect x="8" y="8" width="496" height="496" rx="120" stroke="rgba(255, 255, 255, 0.14)" strokeWidth="4" />

        {/* Outer Orbit loop */}
        <circle
          cx="256"
          cy="256"
          r="170"
          stroke="url(#compLogoRing)"
          strokeWidth="14"
          strokeDasharray="320 60 120 40"
          strokeLinecap="round"
          opacity="0.85"
        />

        {/* Accent nodes */}
        <circle cx="396" cy="180" r="12" fill="#38BDF8" />
        <circle cx="116" cy="332" r="9" fill="#818CF8" />

        {/* Central Hexagon Nexus */}
        <polygon
          points="256,128 366,192 366,320 256,384 146,320 146,192"
          fill="url(#compLogoCore)"
          stroke="#60A5FA"
          strokeWidth="6"
          strokeLinejoin="round"
        />

        {/* Inner 3D facets */}
        <polygon points="256,132 362,194 256,256" fill="rgba(255, 255, 255, 0.18)" />
        <polygon points="150,194 256,132 256,256" fill="rgba(255, 255, 255, 0.08)" />
        <polygon points="150,194 256,256 150,316" fill="rgba(0, 0, 0, 0.15)" />
        <polygon points="362,194 362,316 256,256" fill="rgba(0, 0, 0, 0.25)" />
        <polygon points="256,256 362,316 256,380" fill="rgba(0, 0, 0, 0.35)" />
        <polygon points="150,316 256,256 256,380" fill="rgba(0, 0, 0, 0.2)" />

        {/* Stylized Work OS monogram */}
        <path
          d="M 196 216 L 226 312 L 256 252 L 286 312 L 316 216"
          stroke="url(#compLogoAccent)"
          strokeWidth="16"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Pulse Dot */}
        <circle cx="256" cy="216" r="9" fill="#38BDF8" />
      </svg>
    </div>
  );
}

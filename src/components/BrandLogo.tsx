import React from 'react';

interface BrandLogoProps {
  size?: number;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 34, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="2"
        y="2"
        width="36"
        height="36"
        rx="9"
        fill="#12162A"
        stroke="url(#quiztime_border)"
        strokeWidth="1.5"
      />
      {/* Intersecting duel prism facets */}
      <path
        d="M20 7L31 18L20 29L9 18L20 7Z"
        fill="url(#quiztime_primary)"
        fillOpacity="0.22"
        stroke="url(#quiztime_primary)"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M20 12.5L25.5 18L20 23.5L14.5 18L20 12.5Z"
        fill="#29C7FF"
      />
      <path
        d="M14 29.5L20 33L26 29.5"
        stroke="#FFB547"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="quiztime_primary" x1="9" y1="7" x2="31" y2="29" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8057FF" />
          <stop offset="1" stopColor="#29C7FF" />
        </linearGradient>
        <linearGradient id="quiztime_border" x1="2" y1="2" x2="38" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8057FF" stopOpacity="0.65" />
          <stop offset="0.55" stopColor="#29C7FF" stopOpacity="0.45" />
          <stop offset="1" stopColor="#FFB547" stopOpacity="0.55" />
        </linearGradient>
      </defs>
    </svg>
  );
};

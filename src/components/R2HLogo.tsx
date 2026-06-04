/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface R2HLogoProps extends React.SVGProps<SVGSVGElement> {
  color?: string;
  className?: string;
}

export default function R2HLogo({ color, ...props }: R2HLogoProps) {
  const strokeColor = color || 'currentColor';
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Outer circular thin border */}
      <circle 
        cx="50" 
        cy="50" 
        r="44" 
        stroke={strokeColor} 
        strokeWidth="4" 
      />
      {/* Dynamic exact lowercase letter shapes matching R2H style */}
      <g stroke={strokeColor} strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round">
        {/* 'r' letter */}
        <path d="M28.5,53 L28.5,41.5 M28.5,42.5 C28.5,38 32.5,38 36.5,38" />
        {/* '2' letter */}
        <path d="M44.5,42 C44.5,37 52.5,37 52.5,42.5 C52.5,47 44.5,51.5 44.5,53 L53.5,53" />
        {/* 'h' letter */}
        <path d="M61.5,29 L61.5,53 M61.5,44.5 C63.5,40.5 71.5,40.5 71.5,45 L71.5,53" />
      </g>
      {/* 'COMMUNICATION' text below */}
      <text 
        x="50" 
        y="68" 
        fill={strokeColor} 
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" 
        fontWeight="800" 
        fontSize="6.2" 
        letterSpacing="0.08em" 
        textAnchor="middle"
      >
        COMMUNICATION
      </text>
    </svg>
  );
}

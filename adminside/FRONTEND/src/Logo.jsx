import React from 'react';

const Logo = ({ size = 200, showText = true, className = "" }) => {
  return (
    <svg 
      width={size} 
      height={size / (showText ? 2.5 : 1)} 
      viewBox={showText ? "0 0 500 200" : "0 0 200 200"} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Emblem Background */}
      <circle cx="100" cy="100" r="90" fill="#1E3A8A" />
      <circle cx="100" cy="100" r="75" fill="white" fillOpacity="0.1" />
      
      {/* Animal silhouette / Path representation */}
      <path 
        d="M60 120C60 120 70 140 100 140C130 140 140 120 140 120" 
        stroke="white" 
        strokeWidth="6" 
        strokeLinecap="round" 
      />
      <path 
        d="M100 60C100 60 115 50 130 65C145 80 140 100 120 110M100 60C100 60 85 50 70 65C55 80 60 100 80 110" 
        fill="white" 
      />
      
      {/* Plus/Health Symbol */}
      <rect x="92" y="75" width="16" height="50" rx="4" fill="#F97316" />
      <rect x="75" y="92" width="50" height="16" rx="4" fill="#F97316" />
      
      {/* Leaf element */}
      <path 
        d="M150 50C165 40 180 50 170 80C160 110 140 100 140 100C140 100 135 60 150 50Z" 
        fill="#22C55E" 
      />
      <path 
        d="M140 100L170 80" 
        stroke="white" 
        strokeWidth="2" 
        strokeLinecap="round" 
      />

      {showText && (
        <>
          <text 
            x="220" 
            y="110" 
            fill="#1E3A8A" 
            style={{ 
              fontSize: '85px', 
              fontWeight: '900', 
              fontFamily: 'Poppins, sans-serif',
              letterSpacing: '-2px'
            }}
          >
            Thrive<tspan fill="#F97316">Vet</tspan>
          </text>
          <text 
            x="224" 
            y="145" 
            fill="#4B5563" 
            style={{ 
              fontSize: '22px', 
              fontWeight: '700', 
              fontFamily: 'Poppins, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '5px'
            }}
          >
            ENTERPRISES PVT. LTD
          </text>
        </>
      )}
    </svg>
  );
};

export default Logo;

import React from 'react';

const AiLogo = ({ className = "w-8 h-8" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6366f1" />
        <stop offset="100%" stopColor="#a855f7" />
      </linearGradient>
    </defs>
    <path 
      d="M20 30C20 24.4772 24.4772 20 30 20H70C75.5228 20 80 24.4772 80 30V60C80 65.5228 75.5228 70 70 70H40L25 80V70C22.2386 70 20 67.7614 20 65V30Z" 
      stroke="url(#logo-gradient)" 
      strokeWidth="6" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    <circle cx="38" cy="45" r="4" fill="url(#logo-gradient)" />
    <circle cx="50" cy="45" r="4" fill="url(#logo-gradient)" />
    <circle cx="62" cy="45" r="4" fill="url(#logo-gradient)" />
  </svg>
);

export default AiLogo;

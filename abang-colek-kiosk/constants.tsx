
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { MENU } from './types';

const SECRET_ITEMS = [
    { name: "KERNEL PANIC", price: 13.37 },
    { name: "BLUE SCREEN", price: 4.04 },
    { name: "DEAD PIXEL", price: 0.00 },
    { name: "SEGFAULT STACK", price: 64.00 },
    { name: "ROOT ACCESS", price: 128.00 },
];

export const LogoComponent: React.FC<{ scale?: number }> = ({ scale = 1 }) => (
    <g transform={`scale(${scale})`}>
        <filter id="logoShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feOffset dx="4" dy="4" result="offsetBlur" />
            <feMerge>
                <feMergeNode in="offsetBlur" />
                <feMergeNode in="SourceGraphic" />
            </feMerge>
        </filter>

        <g filter="url(#logoShadow)">
            {/* Ambient Leaves from the logo image */}
            <g transform="translate(-110, -10) rotate(-25)">
                <path d="M 0 0 C -15 -25, 5 -55, 35 -45 C 55 -25, 25 5, 0 0 Z" fill="#2d5a27" />
                <path d="M 5 -5 C -8 -20, 8 -40, 28 -35 Z" fill="#4caf50" opacity="0.7" />
            </g>
            <g transform="translate(340, -40) rotate(20)">
                <path d="M 0 0 C 15 -25, 45 -55, 75 -45 C 95 -25, 65 5, 0 0 Z" fill="#2d5a27" />
                <path d="M 10 -5 C 22 -20, 38 -40, 58 -35 Z" fill="#4caf50" opacity="0.7" />
            </g>

            {/* ABANG - Hand-drawn black brush style */}
            <text x="110" y="-10" textAnchor="middle" fill="#000" fontFamily="'Permanent Marker', 'Brush Script MT', cursive" fontSize="76" fontWeight="900" transform="rotate(-7)">
                ABANG
            </text>

            {/* COLEX - Red bubble with white outline */}
            <text x="125" y="75" textAnchor="middle" fill="#e41e26" stroke="#fff" strokeWidth="10" strokeLinejoin="round" paintOrder="stroke" fontFamily="'Fredoka One', 'Arial Black', sans-serif" fontSize="120" fontWeight="900" transform="rotate(-4)">
                COLEX
            </text>
            
            {/* The Silhouette Cup inside O of COLEX - detailed as in the logo */}
            <g transform="translate(48, 55) rotate(-4) scale(0.65)">
                 <path d="M -18 -12 L 18 -12 L 12 35 L -12 35 Z" fill="#fff" />
                 <path d="M -2 -14 L -10 -28 L -4 -28 L 4 -14 Z" fill="#fff" />
                 <path d="M -8 -8 Q -12 -5, -8 -2 L 8 -2 Q 12 -5, 8 -8 Z" fill="#e41e26" />
            </g>

            {/* by liurleleh house - Script style */}
            <text x="130" y="125" textAnchor="middle" fill="#fff" fontFamily="'Dancing Script', 'Brush Script MT', cursive" fontSize="36" fontWeight="bold">
                by liurleleh house
            </text>
        </g>
    </g>
);

export const OrderBoxSVG: React.FC<{ modelVolume?: number }> = ({ modelVolume = 0 }) => (
    <svg className="box-svg-layer" viewBox="0 0 400 600" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
        <defs>
            <linearGradient id="metalGradVertical" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{stopColor: 'var(--metal-dark)'}} />
                <stop offset="20%" style={{stopColor: 'var(--metal-light)'}} />
                <stop offset="50%" style={{stopColor: 'var(--metal-mid)'}} />
                <stop offset="80%" style={{stopColor: 'var(--metal-light)'}} />
                <stop offset="100%" style={{stopColor: 'var(--metal-dark)'}} />
            </linearGradient>
            <pattern id="speakerHoles" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
                <circle cx="4" cy="4" r="2.5" fill="#222" />
            </pattern>
        </defs>
        <rect x="160" y="500" width="80" height="2000" fill="url(#metalGradVertical)" stroke="#222" strokeWidth="2"/>
        <path d="M 30 50 C 30 30, 370 30, 370 50 L 370 550 C 370 570, 30 570, 30 550 Z" fill="url(#metalGradVertical)" stroke="#111" strokeWidth="4"/>
        
        <rect x="50" y="495" width="300" height="40" fill="url(#speakerHoles)" rx="4" stroke="#333" strokeWidth="3"/>
        <rect 
            x="50" y="495" width="300" height="40" 
            fill="#ffce00" 
            rx="4" 
            opacity={modelVolume} 
            style={{ 
                filter: 'blur(5px)', 
                mixBlendMode: 'screen',
                transition: 'opacity 0.05s linear' 
            }} 
        />
    </svg>
);

export const MenuBoardSVG: React.FC<{ isSecretMenuOpen: boolean }> = ({ isSecretMenuOpen }) => (
    <svg className="menu-svg-layer" viewBox="0 0 400 600" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
        <defs>
            <linearGradient id="poleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#111" />
                <stop offset="30%" stopColor="#444" />
                <stop offset="50%" stopColor="#666" />
                <stop offset="70%" stopColor="#444" />
                <stop offset="100%" stopColor="#111" />
            </linearGradient>
            <linearGradient id="boardFrame3D" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: '#5c4b35'}} />
                <stop offset="10%" style={{stopColor: '#8c7b65'}} />
                <stop offset="50%" style={{stopColor: '#3a2817'}} />
                <stop offset="90%" style={{stopColor: '#8c7b65'}} />
                <stop offset="100%" style={{stopColor: '#1a1005'}} />
            </linearGradient>
            <pattern id="gridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                 <rect width="20" height="20" fill="#222"/>
                 <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1"/>
            </pattern>
            <style>
                {`
                    @keyframes neonFlicker {
                        0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% { opacity: 1; }
                        20%, 24%, 55% { opacity: 0.8; }
                    }
                    .neon-logo { animation: neonFlicker 4s infinite; }
                    .menu-row { transition: transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275); transform-origin: 50% 12px; }
                    .flipped-out { transform: scaleY(0); opacity: 0; }
                    .flipped-in { transform: scaleY(1); opacity: 1; }
                    ${Array.from({length: 8}, (_, i) => ` .row-${i} { transition-delay: ${i * 0.1}s; } `).join('')}
                `}
            </style>
        </defs>
        
        <rect x="50" y="580" width="20" height="1000" fill="url(#poleGradient)" />
        <rect x="330" y="580" width="20" height="1000" fill="url(#poleGradient)" />

        <g>
            <rect x="0" y="0" width="400" height="600" rx="10" fill="url(#gridPattern)" stroke="url(#boardFrame3D)" strokeWidth="16" />
            
            {/* Header Area with Logo */}
            <g transform="translate(100, 110)" className="neon-logo">
                <LogoComponent scale={0.75} />
            </g>

            {/* Menu Items */}
            <g transform="translate(40, 280)">
                {MENU.map((item, i) => (
                    <g key={i} transform={`translate(0, ${i * 48})`}>
                        <rect x="-10" y="0" width="340" height="32" rx="4" fill={i % 2 === 0 ? "rgba(255,255,255,0.03)" : "transparent"} />
                        <g className={`menu-row row-${i} ${isSecretMenuOpen ? 'flipped-out' : 'flipped-in'}`}>
                            <text x="0" y="22" fill="#ffebcd" fontFamily="monospace" fontSize="24" fontWeight="bold"> {item.name} </text>
                            <text x="320" y="22" textAnchor="end" fill="#ffae42" fontFamily="monospace" fontSize="24"> ${item.price.toFixed(2)} </text>
                        </g>
                        <g className={`menu-row row-${i} ${isSecretMenuOpen ? 'flipped-in' : 'flipped-out'}`}>
                            <text x="0" y="22" fill="#42f5ad" fontFamily="monospace" fontSize="24" fontWeight="bold"> {SECRET_ITEMS[i]?.name || "UNKNOWN"} </text>
                            <text x="320" y="22" textAnchor="end" fill="#267a56" fontFamily="monospace" fontSize="24"> ${SECRET_ITEMS[i]?.price.toFixed(2) || "?.??"} </text>
                        </g>
                        <line x1="0" y1="28" x2="320" y2="28" stroke="#444" strokeDasharray="2 3" strokeWidth="1" />
                    </g>
                ))}
            </g>
        </g>
    </svg>
);

export const PickupWindowSVG: React.FC<{ orderImage?: string | null }> = ({ orderImage }) => (
    <svg className="window-svg-layer" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <defs>
            <pattern id="detailedBricks" x="0" y="0" width="120" height="60" patternUnits="userSpaceOnUse">
                <rect width="120" height="60" fill="var(--brick-red)" />
                <line x1="0" y1="0" x2="120" y2="0" stroke="var(--mortar-dark)" strokeWidth="5"/>
                <line x1="0" y1="30" x2="120" y2="30" stroke="var(--mortar-gap)" strokeWidth="7"/>
            </pattern>
            <linearGradient id="metalGradHoriz" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{stopColor: 'var(--metal-mid)'}} />
                <stop offset="40%" style={{stopColor: 'var(--metal-light)'}} />
                <stop offset="100%" style={{stopColor: 'var(--metal-dark)'}} />
            </linearGradient>
            <radialGradient id="signBacklight" cx="50%" cy="50%" r="70%">
                <stop offset="0%" style={{stopColor: '#fff7d1'}} /> 
                <stop offset="100%" style={{stopColor: '#cfa830'}} /> 
            </radialGradient>
        </defs>

        <rect x="-100" y="-100" width="1200" height="800" fill="url(#detailedBricks)" />

        <g transform="translate(230, 40)">
            <rect x="0" y="0" width="340" height="100" rx="20" ry="20" fill="url(#metalGradHoriz)" stroke="#222" strokeWidth="4"/>
            <rect x="15" y="15" width="310" height="70" rx="12" ry="12" fill="url(#signBacklight)" stroke="#b09235" strokeWidth="2"/>
            <text x="170" y="55" textAnchor="middle" dominantBaseline="middle" className="pickup-sign-text">AMBIL SINI</text>
        </g>

        <g transform="translate(220, 160)">
            <rect x="-20" y="-20" width="400" height="340" fill="#333" stroke="#222" strokeWidth="4"/>
            <g clipPath="url(#windowClip)">
                <clipPath id="windowClip"> <rect x="0" y="0" width="360" height="300" /> </clipPath>
                <rect x="0" y="0" width="360" height="300" fill="#111" />
                {orderImage && (
                    <image href={orderImage} x="0" y="0" width="360" height="300" preserveAspectRatio="xMidYMid slice" />
                )}
            </g>
            <g id="sliding-glass-pane">
                <rect x="0" y="0" width="360" height="300" fill="none" stroke="#666" strokeWidth="12"/>
                <rect x="6" y="6" width="348" height="288" fill="rgba(100, 150, 180, 0.1)" stroke="#87ceeb" strokeWidth="1"/>
            </g>
        </g>
        
        {/* Logo at Pickup Window too */}
        <g transform="translate(680, 480) scale(0.4)">
            <LogoComponent />
        </g>
    </svg>
);

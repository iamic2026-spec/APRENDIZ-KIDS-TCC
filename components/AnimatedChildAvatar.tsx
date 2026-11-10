'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface AnimatedChildAvatarProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isSmiling?: boolean;
}

export const AnimatedChildAvatar: React.FC<AnimatedChildAvatarProps> = ({
  className = '',
  size = 'md',
  isSmiling = true,
}) => {
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 180);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-24 h-24',
    xl: 'w-28 h-28',
  }[size];

  return (
    <div
      className={`relative rounded-full flex items-center justify-center overflow-visible select-none ${sizeClasses} ${className}`}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-sm overflow-visible"
      >
        <defs>
          {/* Skin Gradient */}
          <radialGradient id="childSkin" cx="48%" cy="46%" r="52%">
            <stop offset="0%" stopColor="#FED7AA" />
            <stop offset="75%" stopColor="#FDBA74" />
            <stop offset="100%" stopColor="#FB923C" />
          </radialGradient>

          {/* Hair Gradient */}
          <linearGradient id="childHair" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#78350F" />
            <stop offset="100%" stopColor="#451A03" />
          </linearGradient>

          {/* Rosy Cheeks */}
          <radialGradient id="rosyCheek" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#F43F5E" stopOpacity="0" />
          </radialGradient>

          {/* Cap / Headband Gradient */}
          <linearGradient id="childCap" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
        </defs>

        {/* Back Hair */}
        <circle cx="50" cy="48" r="42" fill="url(#childHair)" />

        {/* Ears */}
        <ellipse cx="14" cy="52" rx="7" ry="9" fill="#FDBA74" />
        <ellipse cx="15" cy="52" rx="4" ry="5" fill="#FB923C" opacity="0.6" />
        <ellipse cx="86" cy="52" rx="7" ry="9" fill="#FDBA74" />
        <ellipse cx="85" cy="52" rx="4" ry="5" fill="#FB923C" opacity="0.6" />

        {/* Head / Face */}
        <ellipse cx="50" cy="53" rx="36" ry="37" fill="url(#childSkin)" />

        {/* Hair Strands / Cap Top */}
        <path
          d="M 16 46 Q 30 20 50 20 Q 70 20 84 46 Q 72 32 50 33 Q 28 32 16 46 Z"
          fill="url(#childHair)"
        />

        {/* Playful Front Hair Fringe / Tuft */}
        <motion.path
          d="M 28 36 Q 38 25 50 34 Q 62 25 72 36 Q 60 28 50 29 Q 40 28 28 36 Z"
          fill="#92400E"
          animate={{ rotate: [-1, 1, -1] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        />

        {/* Cute Sky Blue Baseball Cap / Headband detail */}
        <path
          d="M 22 34 Q 50 14 78 34 Q 72 24 50 22 Q 28 24 22 34 Z"
          fill="url(#childCap)"
        />
        <circle cx="50" cy="22" r="3.5" fill="#F59E0B" />

        {/* Eyes (Blinking Animation) */}
        {blink ? (
          <>
            {/* Left Eye Blink */}
            <path
              d="M 30 52 Q 38 58 44 52"
              stroke="#1E293B"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Right Eye Blink */}
            <path
              d="M 56 52 Q 62 58 70 52"
              stroke="#1E293B"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
          </>
        ) : (
          <>
            {/* Left Eye */}
            <ellipse cx="36" cy="51" rx="7.5" ry="8.5" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1" />
            <circle cx="37" cy="51" r="5" fill="#0284C7" />
            <circle cx="37" cy="51" r="3.5" fill="#0F172A" />
            <circle cx="39" cy="49" r="2" fill="#FFFFFF" />
            <circle cx="35" cy="53" r="1" fill="#FFFFFF" />

            {/* Right Eye */}
            <ellipse cx="64" cy="51" rx="7.5" ry="8.5" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1" />
            <circle cx="63" cy="51" r="5" fill="#0284C7" />
            <circle cx="63" cy="51" r="3.5" fill="#0F172A" />
            <circle cx="65" cy="49" r="2" fill="#FFFFFF" />
            <circle cx="61" cy="53" r="1" fill="#FFFFFF" />

            {/* Friendly Eyebrows */}
            <path d="M 28 41 Q 36 37 44 42" stroke="#451A03" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M 56 42 Q 64 37 72 41" stroke="#451A03" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </>
        )}

        {/* Rosy Cheeks */}
        <circle cx="28" cy="61" r="8" fill="url(#rosyCheek)" />
        <circle cx="72" cy="61" r="8" fill="url(#rosyCheek)" />

        {/* Cute Button Nose */}
        <ellipse cx="50" cy="58" rx="2.5" ry="2" fill="#EA580C" opacity="0.75" />

        {/* Joyful Animated Smile */}
        <path
          d={
            isSmiling
              ? 'M 38 66 Q 50 78 62 66 Q 50 72 38 66 Z'
              : 'M 40 67 Q 50 73 60 67'
          }
          fill={isSmiling ? '#BE123C' : 'none'}
          stroke="#881337"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Tongue in smile */}
        {isSmiling && (
          <path
            d="M 44 71 Q 50 76 56 71 Z"
            fill="#FB7185"
          />
        )}

        {/* Floating Sparkle on cheek */}
        <polygon
          points="78,44 80,47 83,47 81,49 82,52 79,50 76,52 77,49 75,47 78,47"
          fill="#F59E0B"
        />
      </svg>
    </div>
  );
};

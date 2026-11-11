'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

export interface AvatarOption {
  id: string;
  name: string;
  category: 'criança' | 'animal' | 'aventura';
}

export const ANIMATED_AVATAR_LIST: AvatarOption[] = [
  { id: 'child_anim', name: 'Menino Feliz', category: 'criança' },
  { id: 'child_girl', name: 'Menina Estelar', category: 'criança' },
  { id: 'avatar_owl', name: 'Corujinha Pipoca', category: 'animal' },
  { id: 'avatar_lion', name: 'Leãozinho Valente', category: 'animal' },
  { id: 'avatar_bear', name: 'Ursinho Pimpão', category: 'animal' },
  { id: 'avatar_dino', name: 'Dino Sapeca', category: 'animal' },
  { id: 'avatar_bunny', name: 'Coelhinha Saltitante', category: 'animal' },
  { id: 'avatar_astro', name: 'Pequeno Astronauta', category: 'aventura' },
];

interface ChildAvatarRendererProps {
  avatarId: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const ChildAvatarRenderer: React.FC<ChildAvatarRendererProps> = ({
  avatarId,
  size = 'md',
  className = '',
}) => {
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 200);
    }, 3600);
    return () => clearInterval(timer);
  }, []);

  const sizeClasses = {
    xs: 'w-8 h-8',
    sm: 'w-11 h-11',
    md: 'w-16 h-16',
    lg: 'w-24 h-24 sm:w-28 sm:h-28',
    xl: 'w-32 h-32 sm:w-36 sm:h-36',
  }[size];

  // 1. GIRL AVATAR
  if (avatarId === 'child_girl') {
    return (
      <div className={`relative rounded-full flex items-center justify-center overflow-visible select-none ${sizeClasses} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm overflow-visible">
          <defs>
            <radialGradient id="girlSkin" cx="48%" cy="46%" r="52%">
              <stop offset="0%" stopColor="#FED7AA" />
              <stop offset="80%" stopColor="#FDBA74" />
              <stop offset="100%" stopColor="#FB923C" />
            </radialGradient>
            <linearGradient id="girlHair" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#9A3412" />
              <stop offset="100%" stopColor="#431407" />
            </linearGradient>
            <linearGradient id="girlBow" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F43F5E" />
              <stop offset="100%" stopColor="#BE123C" />
            </linearGradient>
          </defs>
          {/* Back Pigtails with gentle motion */}
          <motion.ellipse
            cx="14"
            cy="48"
            rx="12"
            ry="14"
            fill="url(#girlHair)"
            animate={{ rotate: [-3, 3, -3] }}
            transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
          />
          <motion.ellipse
            cx="86"
            cy="48"
            rx="12"
            ry="14"
            fill="url(#girlHair)"
            animate={{ rotate: [3, -3, 3] }}
            transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
          />
          {/* Hair bows */}
          <circle cx="20" cy="40" r="5" fill="url(#girlBow)" />
          <circle cx="80" cy="40" r="5" fill="url(#girlBow)" />
          {/* Head & Ears */}
          <ellipse cx="14" cy="54" rx="6" ry="8" fill="#FDBA74" />
          <ellipse cx="86" cy="54" rx="6" ry="8" fill="#FDBA74" />
          <ellipse cx="50" cy="54" rx="35" ry="36" fill="url(#girlSkin)" />
          {/* Front Bangs */}
          <path d="M 18 42 Q 50 18 82 42 Q 68 28 50 30 Q 32 28 18 42 Z" fill="url(#girlHair)" />
          <path d="M 32 30 Q 50 40 68 30 Q 50 34 32 30 Z" fill="#7C2D12" />
          {/* Eyes with Blinking */}
          {blink ? (
            <>
              <path d="M 30 54 Q 38 60 44 54" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" fill="none" />
              <path d="M 56 54 Q 62 60 70 54" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            </>
          ) : (
            <>
              <ellipse cx="36" cy="53" rx="7" ry="8" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1" />
              <circle cx="37" cy="53" r="4.8" fill="#8B5CF6" />
              <circle cx="37" cy="53" r="3.2" fill="#0F172A" />
              <circle cx="39" cy="51" r="1.8" fill="#FFFFFF" />
              <ellipse cx="64" cy="53" rx="7" ry="8" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1" />
              <circle cx="63" cy="53" r="4.8" fill="#8B5CF6" />
              <circle cx="63" cy="53" r="3.2" fill="#0F172A" />
              <circle cx="65" cy="51" r="1.8" fill="#FFFFFF" />
            </>
          )}
          {/* Blushing cheeks */}
          <circle cx="28" cy="62" r="7" fill="#F43F5E" opacity="0.4" />
          <circle cx="72" cy="62" r="7" fill="#F43F5E" opacity="0.4" />
          {/* Joyful Smile */}
          <path d="M 40 67 Q 50 78 60 67 Q 50 73 40 67 Z" fill="#BE123C" stroke="#881337" strokeWidth="1.5" />
          <circle cx="50" cy="22" r="4" fill="#F59E0B" />
        </svg>
      </div>
    );
  }

  // 2. OWL AVATAR (PIPOCA)
  if (avatarId === 'avatar_owl' || avatarId === 'owl' || avatarId === '🦉') {
    return (
      <div className={`relative rounded-full flex items-center justify-center overflow-visible select-none ${sizeClasses} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm overflow-visible">
          <defs>
            <linearGradient id="owlGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
            <linearGradient id="bellyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="100%" stopColor="#FDE047" />
            </linearGradient>
          </defs>
          {/* Ear tufts */}
          <polygon points="26,35 15,12 40,26" fill="#0369A1" />
          <polygon points="74,35 85,12 60,26" fill="#0369A1" />
          {/* Wings with gentle flap */}
          <motion.ellipse
            cx="14"
            cy="58"
            rx="9"
            ry="18"
            fill="#0369A1"
            animate={{ rotate: [-4, 4, -4] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          />
          <motion.ellipse
            cx="86"
            cy="58"
            rx="9"
            ry="18"
            fill="#0369A1"
            animate={{ rotate: [4, -4, 4] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          />
          {/* Main Body */}
          <ellipse cx="50" cy="54" rx="36" ry="38" fill="url(#owlGrad)" />
          <ellipse cx="50" cy="64" rx="24" ry="26" fill="url(#bellyGrad)" />
          {/* Belly feathers */}
          <path d="M 44 58 Q 50 63 56 58 M 41 68 Q 50 74 59 68" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          {/* Big Owl Eyes */}
          <circle cx="36" cy="46" r="14" fill="#FFFFFF" stroke="#0284C7" strokeWidth="2" />
          <circle cx="64" cy="46" r="14" fill="#FFFFFF" stroke="#0284C7" strokeWidth="2" />
          {blink ? (
            <>
              <path d="M 28 47 Q 36 53 44 47" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M 56 47 Q 64 53 72 47" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" fill="none" />
            </>
          ) : (
            <>
              <circle cx="37" cy="46" r="7" fill="#0F172A" />
              <circle cx="40" cy="43" r="2.8" fill="#FFFFFF" />
              <circle cx="63" cy="46" r="7" fill="#0F172A" />
              <circle cx="66" cy="43" r="2.8" fill="#FFFFFF" />
            </>
          )}
          {/* Beak */}
          <polygon points="45,51 55,51 50,62" fill="#EA580C" />
          {/* Cheeks */}
          <circle cx="22" cy="55" r="5" fill="#F472B6" opacity="0.6" />
          <circle cx="78" cy="55" r="5" fill="#F472B6" opacity="0.6" />
        </svg>
      </div>
    );
  }

  // 3. LION AVATAR
  if (avatarId === 'avatar_lion' || avatarId === 'lion' || avatarId === '🦁') {
    return (
      <div className={`relative rounded-full flex items-center justify-center overflow-visible select-none ${sizeClasses} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm overflow-visible">
          {/* Fluffy animated Mane */}
          <motion.circle
            cx="50"
            cy="50"
            r="44"
            fill="#D97706"
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
          />
          <circle cx="50" cy="50" r="39" fill="#F59E0B" />
          {/* Ears */}
          <circle cx="26" cy="26" r="9" fill="#B45309" />
          <circle cx="26" cy="26" r="5" fill="#FDE68A" />
          <circle cx="74" cy="26" r="9" fill="#B45309" />
          <circle cx="74" cy="26" r="5" fill="#FDE68A" />
          {/* Face */}
          <circle cx="50" cy="52" rx="31" fill="#FDE68A" />
          {/* Eyes */}
          {blink ? (
            <>
              <path d="M 32 48 Q 40 54 46 48" stroke="#451A03" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M 54 48 Q 60 54 68 48" stroke="#451A03" strokeWidth="3" strokeLinecap="round" fill="none" />
            </>
          ) : (
            <>
              <ellipse cx="38" cy="48" rx="5.5" ry="6.5" fill="#451A03" />
              <circle cx="40" cy="46" r="2.2" fill="#FFFFFF" />
              <ellipse cx="62" cy="48" rx="5.5" ry="6.5" fill="#451A03" />
              <circle cx="64" cy="46" r="2.2" fill="#FFFFFF" />
            </>
          )}
          {/* Lion Nose & Whiskers */}
          <polygon points="46,56 54,56 50,62" fill="#9A3412" />
          <path d="M 44 65 Q 50 71 56 65" stroke="#78350F" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <line x1="22" y1="58" x2="36" y2="60" stroke="#B45309" strokeWidth="1.5" />
          <line x1="24" y1="64" x2="36" y2="63" stroke="#B45309" strokeWidth="1.5" />
          <line x1="78" y1="58" x2="64" y2="60" stroke="#B45309" strokeWidth="1.5" />
          <line x1="76" y1="64" x2="64" y2="63" stroke="#B45309" strokeWidth="1.5" />
        </svg>
      </div>
    );
  }

  // 4. BEAR AVATAR
  if (avatarId === 'avatar_bear' || avatarId === 'bear' || avatarId === '🐻') {
    return (
      <div className={`relative rounded-full flex items-center justify-center overflow-visible select-none ${sizeClasses} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm overflow-visible">
          {/* Round Ears with micro bounce */}
          <motion.circle
            cx="24"
            cy="28"
            r="12"
            fill="#78350F"
            animate={{ y: [0, -1.5, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          />
          <circle cx="24" cy="28" r="6" fill="#FDE68A" />
          <motion.circle
            cx="76"
            cy="28"
            r="12"
            fill="#78350F"
            animate={{ y: [0, -1.5, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          />
          <circle cx="76" cy="28" r="6" fill="#FDE68A" />
          {/* Head */}
          <circle cx="50" cy="54" r="38" fill="#92400E" />
          {/* Muzzle */}
          <ellipse cx="50" cy="62" rx="19" ry="16" fill="#FEF3C7" />
          {/* Nose */}
          <ellipse cx="50" cy="57" rx="6" ry="4.5" fill="#1C1917" />
          <path d="M 50 61.5 L 50 67 M 45 67 Q 50 71 55 67" stroke="#1C1917" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* Eyes */}
          {blink ? (
            <>
              <path d="M 32 46 Q 37 50 42 46" stroke="#FEF3C7" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M 58 46 Q 63 50 68 46" stroke="#FEF3C7" strokeWidth="3" strokeLinecap="round" fill="none" />
            </>
          ) : (
            <>
              <circle cx="37" cy="46" r="4.5" fill="#1C1917" />
              <circle cx="39" cy="44" r="1.5" fill="#FFFFFF" />
              <circle cx="63" cy="46" r="4.5" fill="#1C1917" />
              <circle cx="65" cy="44" r="1.5" fill="#FFFFFF" />
            </>
          )}
          {/* Rosy Cheeks */}
          <circle cx="28" cy="58" r="5.5" fill="#F43F5E" opacity="0.45" />
          <circle cx="72" cy="58" r="5.5" fill="#F43F5E" opacity="0.45" />
        </svg>
      </div>
    );
  }

  // 5. DINO AVATAR
  if (avatarId === 'avatar_dino' || avatarId === 'dino' || avatarId === '🦕') {
    return (
      <div className={`relative rounded-full flex items-center justify-center overflow-visible select-none ${sizeClasses} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm overflow-visible">
          {/* Dino Spikes / Crest */}
          <polygon points="50,12 42,24 58,24" fill="#15803D" />
          <polygon points="34,18 28,30 42,28" fill="#15803D" />
          <polygon points="66,18 72,30 58,28" fill="#15803D" />
          {/* Head */}
          <ellipse cx="50" cy="54" rx="36" ry="34" fill="#22C55E" />
          {/* Belly / Snout */}
          <ellipse cx="50" cy="65" rx="24" ry="18" fill="#86EFAC" />
          {/* Cute Nostrils */}
          <circle cx="45" cy="62" r="2" fill="#15803D" />
          <circle cx="55" cy="62" r="2" fill="#15803D" />
          {/* Smile */}
          <path d="M 42 70 Q 50 76 58 70" stroke="#166534" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          {/* Eyes */}
          {blink ? (
            <>
              <path d="M 32 46 Q 38 52 44 46" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M 56 46 Q 62 52 68 46" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" fill="none" />
            </>
          ) : (
            <>
              <ellipse cx="38" cy="46" rx="6.5" ry="7.5" fill="#FFFFFF" stroke="#166534" strokeWidth="1" />
              <circle cx="39" cy="46" r="4.2" fill="#0F172A" />
              <circle cx="41" cy="44" r="1.6" fill="#FFFFFF" />
              <ellipse cx="62" cy="46" rx="6.5" ry="7.5" fill="#FFFFFF" stroke="#166534" strokeWidth="1" />
              <circle cx="61" cy="46" r="4.2" fill="#0F172A" />
              <circle cx="63" cy="44" r="1.6" fill="#FFFFFF" />
            </>
          )}
          <circle cx="28" cy="56" r="5" fill="#F472B6" opacity="0.6" />
          <circle cx="72" cy="56" r="5" fill="#F472B6" opacity="0.6" />
        </svg>
      </div>
    );
  }

  // 6. BUNNY AVATAR
  if (avatarId === 'avatar_bunny' || avatarId === 'bunny' || avatarId === '🐰') {
    return (
      <div className={`relative rounded-full flex items-center justify-center overflow-visible select-none ${sizeClasses} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm overflow-visible">
          {/* Long Ears with twitch motion */}
          <motion.ellipse
            cx="32"
            cy="24"
            rx="10"
            ry="22"
            fill="#FFFFFF"
            stroke="#E2E8F0"
            strokeWidth="1.5"
            animate={{ rotate: [-4, 3, -4] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
          />
          <ellipse cx="32" cy="25" rx="5" ry="15" fill="#FDA4AF" />
          <motion.ellipse
            cx="68"
            cy="24"
            rx="10"
            ry="22"
            fill="#FFFFFF"
            stroke="#E2E8F0"
            strokeWidth="1.5"
            animate={{ rotate: [4, -3, 4] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
          />
          <ellipse cx="68" cy="25" rx="5" ry="15" fill="#FDA4AF" />
          {/* Head */}
          <circle cx="50" cy="58" r="34" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
          {/* Nose */}
          <polygon points="46,60 54,60 50,65" fill="#FB7185" />
          {/* Mouth & Teeth */}
          <path d="M 45 68 Q 50 72 55 68" stroke="#475569" strokeWidth="2" strokeLinecap="round" fill="none" />
          <rect x="47.5" y="68" width="5" height="4" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="0.8" rx="1" />
          {/* Eyes */}
          {blink ? (
            <>
              <path d="M 32 50 Q 38 56 44 50" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M 56 50 Q 62 56 68 50" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" fill="none" />
            </>
          ) : (
            <>
              <circle cx="38" cy="50" r="5" fill="#0F172A" />
              <circle cx="40" cy="48" r="2" fill="#FFFFFF" />
              <circle cx="62" cy="50" r="5" fill="#0F172A" />
              <circle cx="64" cy="48" r="2" fill="#FFFFFF" />
            </>
          )}
          {/* Whiskers */}
          <line x1="20" y1="62" x2="36" y2="64" stroke="#94A3B8" strokeWidth="1.5" />
          <line x1="22" y1="68" x2="36" y2="67" stroke="#94A3B8" strokeWidth="1.5" />
          <line x1="80" y1="62" x2="64" y2="64" stroke="#94A3B8" strokeWidth="1.5" />
          <line x1="78" y1="68" x2="64" y2="67" stroke="#94A3B8" strokeWidth="1.5" />
          <circle cx="28" cy="62" r="5" fill="#FDA4AF" opacity="0.6" />
          <circle cx="72" cy="62" r="5" fill="#FDA4AF" opacity="0.6" />
        </svg>
      </div>
    );
  }

  // 7. ASTRONAUT AVATAR
  if (avatarId === 'avatar_astro' || avatarId === 'astro' || avatarId === '🚀') {
    return (
      <div className={`relative rounded-full flex items-center justify-center overflow-visible select-none ${sizeClasses} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm overflow-visible">
          {/* Helmet Dome */}
          <circle cx="50" cy="50" r="42" fill="#FFFFFF" stroke="#0284C7" strokeWidth="3" />
          {/* Audio Antennas */}
          <rect x="6" y="44" width="6" height="12" rx="3" fill="#0284C7" />
          <rect x="88" y="44" width="6" height="12" rx="3" fill="#0284C7" />
          {/* Visor */}
          <motion.ellipse
            cx="50"
            cy="52"
            rx="30"
            ry="24"
            fill="#0F172A"
            stroke="#38BDF8"
            strokeWidth="2.5"
            animate={{ opacity: [0.95, 1, 0.95] }}
            transition={{ repeat: Infinity, duration: 3 }}
          />
          {/* Visor Glare & Star reflection */}
          <path d="M 30 42 Q 50 32 68 42" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7" />
          <polygon points="62,44 64,48 68,48 65,51 66,55 62,52 58,55 59,51 56,48 60,48" fill="#F59E0B" />
          {/* Little smiling face inside visor */}
          {blink ? (
            <path d="M 44 56 Q 50 60 56 56" stroke="#FEF08A" strokeWidth="2" strokeLinecap="round" fill="none" />
          ) : (
            <>
              <circle cx="43" cy="53" r="2.5" fill="#FEF08A" />
              <circle cx="57" cy="53" r="2.5" fill="#FEF08A" />
              <path d="M 46 59 Q 50 63 54 59" stroke="#FEF08A" strokeWidth="2" strokeLinecap="round" fill="none" />
            </>
          )}
        </svg>
      </div>
    );
  }

  // DEFAULT: BOY / STANDARD ANIMATED CHILD FACE (child_anim)
  return (
    <div className={`relative rounded-full flex items-center justify-center overflow-visible select-none ${sizeClasses} ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm overflow-visible">
        <defs>
          <radialGradient id="childSkinDefault" cx="48%" cy="46%" r="52%">
            <stop offset="0%" stopColor="#FED7AA" />
            <stop offset="75%" stopColor="#FDBA74" />
            <stop offset="100%" stopColor="#FB923C" />
          </radialGradient>
          <linearGradient id="childHairDefault" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#78350F" />
            <stop offset="100%" stopColor="#451A03" />
          </linearGradient>
          <radialGradient id="rosyCheekDefault" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#F43F5E" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="childCapDefault" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
        </defs>
        {/* Back Hair */}
        <circle cx="50" cy="48" r="42" fill="url(#childHairDefault)" />
        {/* Ears */}
        <ellipse cx="14" cy="52" rx="7" ry="9" fill="#FDBA74" />
        <ellipse cx="15" cy="52" rx="4" ry="5" fill="#FB923C" opacity="0.6" />
        <ellipse cx="86" cy="52" rx="7" ry="9" fill="#FDBA74" />
        <ellipse cx="85" cy="52" rx="4" ry="5" fill="#FB923C" opacity="0.6" />
        {/* Head */}
        <ellipse cx="50" cy="53" rx="36" ry="37" fill="url(#childSkinDefault)" />
        {/* Hair Strands */}
        <path d="M 16 46 Q 30 20 50 20 Q 70 20 84 46 Q 72 32 50 33 Q 28 32 16 46 Z" fill="url(#childHairDefault)" />
        {/* Front Fringe with micro motion */}
        <motion.path
          d="M 28 36 Q 38 25 50 34 Q 62 25 72 36 Q 60 28 50 29 Q 40 28 28 36 Z"
          fill="#92400E"
          animate={{ rotate: [-1, 1, -1] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        />
        {/* Baseball Cap */}
        <path d="M 22 34 Q 50 14 78 34 Q 72 24 50 22 Q 28 24 22 34 Z" fill="url(#childCapDefault)" />
        <circle cx="50" cy="22" r="3.5" fill="#F59E0B" />
        {/* Eyes (Blinking Animation) */}
        {blink ? (
          <>
            <path d="M 30 52 Q 38 58 44 52" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <path d="M 56 52 Q 62 58 70 52" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          </>
        ) : (
          <>
            <ellipse cx="36" cy="51" rx="7.5" ry="8.5" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1" />
            <circle cx="37" cy="51" r="5" fill="#0284C7" />
            <circle cx="37" cy="51" r="3.5" fill="#0F172A" />
            <circle cx="39" cy="49" r="2" fill="#FFFFFF" />
            <circle cx="35" cy="53" r="1" fill="#FFFFFF" />
            <ellipse cx="64" cy="51" rx="7.5" ry="8.5" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1" />
            <circle cx="63" cy="51" r="5" fill="#0284C7" />
            <circle cx="63" cy="51" r="3.5" fill="#0F172A" />
            <circle cx="65" cy="49" r="2" fill="#FFFFFF" />
            <circle cx="61" cy="53" r="1" fill="#FFFFFF" />
            <path d="M 28 41 Q 36 37 44 42" stroke="#451A03" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M 56 42 Q 64 37 72 41" stroke="#451A03" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </>
        )}
        {/* Cheeks */}
        <circle cx="28" cy="61" r="8" fill="url(#rosyCheekDefault)" />
        <circle cx="72" cy="61" r="8" fill="url(#rosyCheekDefault)" />
        <ellipse cx="50" cy="58" rx="2.5" ry="2" fill="#EA580C" opacity="0.75" />
        {/* Smile */}
        <path d="M 38 66 Q 50 78 62 66 Q 50 72 38 66 Z" fill="#BE123C" stroke="#881337" strokeWidth="2" strokeLinecap="round" />
        <path d="M 44 71 Q 50 76 56 71 Z" fill="#FB7185" />
        <polygon points="78,44 80,47 83,47 81,49 82,52 79,50 76,52 77,49 75,47 78,47" fill="#F59E0B" />
      </svg>
    </div>
  );
};

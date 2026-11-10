'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { speech } from '../lib/speechService';
import { sounds } from '../lib/soundEffects';

interface MascotPipocaProps {
  mood?: 'neutral' | 'talking' | 'celebrating' | 'encouraging' | 'thinking';
  speechBubbleText?: string;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

export const MascotPipoca: React.FC<MascotPipocaProps> = ({
  mood = 'neutral',
  speechBubbleText,
  size = 'md',
  interactive = true,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isWinking, setIsWinking] = useState(false);

  useEffect(() => {
    const unsubscribe = speech.subscribe((status) => {
      setIsSpeaking(status);
    });

    // Random friendly blink
    const interval = setInterval(() => {
      setIsWinking(true);
      setTimeout(() => setIsWinking(false), 200);
    }, 4500);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const handleMascotClick = () => {
    if (!interactive) return;
    sounds.playPop();
    const greetings = [
      'Olá, amiguinho! Eu sou a corujinha Pipoca! Vamos aprender juntos?',
      'Você é muito inteligente e vai arrasar hoje!',
      'Toque no botão azul com o alto-falante para me ouvir sempre que quiser!',
    ];
    const randomGreet = greetings[Math.floor(Math.random() * greetings.length)];
    speech.speak(randomGreet);
  };

  const dimensions = {
    sm: 'w-20 h-20',
    md: 'w-28 h-28 sm:w-32 sm:h-32',
    lg: 'w-36 h-36 sm:w-44 sm:h-44',
  }[size];

  const effectiveMood = isSpeaking ? 'talking' : mood;

  return (
    <div className="flex flex-col items-center relative select-none">
      {/* Friendly Speech Bubble if text provided */}
      {speechBubbleText && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="mb-3 max-w-xs sm:max-w-md bg-white border-3 border-[#38BDF8] rounded-3xl p-3 sm:p-4 shadow-lg text-[#0F172A] relative"
        >
          <p className="text-base sm:text-lg font-bold leading-relaxed tracking-wide text-center">
            {speechBubbleText}
          </p>
          {/* Arrow pointing to Pipoca */}
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[12px] border-t-[#38BDF8]" />
        </motion.div>
      )}

      {/* Tactile Animated Owl Mascot - Pipoca */}
      <motion.div
        whileHover={interactive ? { scale: 1.06, rotate: [-1, 2, -1] } : {}}
        whileTap={interactive ? { scale: 0.94 } : {}}
        onClick={handleMascotClick}
        className={`${dimensions} relative cursor-pointer flex items-center justify-center`}
        title="Toque na Pipoca para conversar!"
      >
        <svg
          viewBox="0 0 160 160"
          className="w-full h-full drop-shadow-md overflow-visible"
        >
          <defs>
            {/* Feathers Gradient */}
            <linearGradient id="owlBody" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
            <linearGradient id="owlBelly" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="100%" stopColor="#FDE047" />
            </linearGradient>
            <linearGradient id="owlEars" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0284C7" />
              <stop offset="100%" stopColor="#0369A1" />
            </linearGradient>
          </defs>

          {/* Ear Tufts */}
          <polygon points="35,45 20,15 55,35" fill="url(#owlEars)" />
          <polygon points="125,45 140,15 105,35" fill="url(#owlEars)" />

          {/* Left Wing */}
          <motion.path
            d="M 28 65 Q 10 95 28 120 Q 42 100 40 75 Z"
            fill="#0369A1"
            animate={
              effectiveMood === 'celebrating'
                ? { rotate: [-18, 10, -18], y: [-5, 0, -5] }
                : { rotate: 0 }
            }
            transition={{ repeat: Infinity, duration: 0.6 }}
          />

          {/* Right Wing */}
          <motion.path
            d="M 132 65 Q 150 95 132 120 Q 118 100 120 75 Z"
            fill="#0369A1"
            animate={
              effectiveMood === 'celebrating'
                ? { rotate: [18, -10, 18], y: [-5, 0, -5] }
                : { rotate: 0 }
            }
            transition={{ repeat: Infinity, duration: 0.6 }}
          />

          {/* Main Body */}
          <ellipse cx="80" cy="85" rx="55" ry="58" fill="url(#owlBody)" />

          {/* Soft Cream Belly */}
          <ellipse cx="80" cy="98" rx="36" ry="40" fill="url(#owlBelly)" />

          {/* Belly Feathers / Heart markings */}
          <path
            d="M 70 85 Q 80 95 90 85 M 65 102 Q 80 114 95 102 M 72 118 Q 80 125 88 118"
            stroke="#D97706"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Left Eye Sockets & Eyeballs */}
          <circle cx="55" cy="62" r="23" fill="#FFFFFF" stroke="#0284C7" strokeWidth="3" />
          <circle cx="105" cy="62" r="23" fill="#FFFFFF" stroke="#0284C7" strokeWidth="3" />

          {/* Pupils with playful highlights */}
          {isWinking ? (
            <>
              {/* Left Eye Closed Wink */}
              <path d="M 44 64 Q 55 74 66 64" stroke="#0F172A" strokeWidth="4" strokeLinecap="round" fill="none" />
              {/* Right Eye Open */}
              <circle cx="103" cy="62" r="11" fill="#0F172A" />
              <circle cx="107" cy="58" r="4.5" fill="#FFFFFF" />
            </>
          ) : (
            <>
              {/* Normal expressive big eyes */}
              <circle cx="57" cy="62" r="11" fill="#0F172A" />
              <circle cx="61" cy="58" r="4.5" fill="#FFFFFF" />
              <circle cx="54" cy="66" r="2" fill="#FFFFFF" />

              <circle cx="103" cy="62" r="11" fill="#0F172A" />
              <circle cx="107" cy="58" r="4.5" fill="#FFFFFF" />
              <circle cx="100" cy="66" r="2" fill="#FFFFFF" />
            </>
          )}

          {/* Cute Rosy Cheeks */}
          <circle cx="34" cy="78" r="7" fill="#F472B6" opacity="0.6" />
          <circle cx="126" cy="78" r="7" fill="#F472B6" opacity="0.6" />

          {/* Owl Beak with Talking Animation */}
          <motion.polygon
            points="70,72 90,72 80,88"
            fill="#EA580C"
            stroke="#C2410C"
            strokeWidth="1.5"
            animate={
              isSpeaking
                ? { scaleY: [1, 1.4, 0.9, 1.3, 1], y: [0, 2, -1, 2, 0] }
                : { scaleY: 1, y: 0 }
            }
            transition={{ repeat: Infinity, duration: 0.3 }}
          />

          {/* Cute Orange Feet */}
          <ellipse cx="64" cy="144" rx="10" ry="6" fill="#EA580C" />
          <ellipse cx="96" cy="144" rx="10" ry="6" fill="#EA580C" />

          {/* Graduation Cap / Sparkle for reading achievement */}
          {effectiveMood === 'celebrating' && (
            <motion.g
              animate={{ rotate: [-6, 6, -6], scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
            >
              <polygon points="80,10 50,22 80,32 110,22" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
              <line x1="102" y1="25" x2="108" y2="38" stroke="#D97706" strokeWidth="2.5" />
              <circle cx="108" cy="40" r="3" fill="#D97706" />
            </motion.g>
          )}
        </svg>

        {/* Pulsing indicator when speaking */}
        {isSpeaking && (
          <div className="absolute -top-2 -right-2 bg-yellow-400 text-amber-900 text-xs font-black px-2 py-0.5 rounded-full border-2 border-white shadow-md animate-bounce">
            Falando!
          </div>
        )}
      </motion.div>
    </div>
  );
};

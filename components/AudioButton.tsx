'use client';

import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';
import { speech } from '../lib/speechService';
import { sounds } from '../lib/soundEffects';

interface AudioButtonProps {
  textToSpeak: string;
  label?: string;
  variant?: 'primary' | 'secondary' | 'compact' | 'large';
  className?: string;
  autoPlayOnInit?: boolean;
}

export const AudioButton: React.FC<AudioButtonProps> = ({
  textToSpeak,
  label = 'Ouvir',
  variant = 'primary',
  className = '',
  autoPlayOnInit = false,
}) => {
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    const unsub = speech.subscribe((isSpeaking) => {
      setSpeaking(isSpeaking);
    });

    if (autoPlayOnInit && textToSpeak) {
      // Delay slightly for smooth page entry
      const timer = setTimeout(() => {
        speech.speak(textToSpeak);
      }, 350);
      return () => {
        unsub();
        clearTimeout(timer);
      };
    }

    return () => unsub();
  }, [textToSpeak, autoPlayOnInit]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playPop();
    speech.speak(textToSpeak);
  };

  const isPrimary = variant === 'primary' || variant === 'large';
  const isLarge = variant === 'large';
  const isCompact = variant === 'compact';

  const baseStyles = isPrimary
    ? 'bg-[#0284C7] hover:bg-[#0369A1] text-white border-b-4 border-[#0369A1] active:border-b-0'
    : 'bg-[#F59E0B] hover:bg-[#D97706] text-[#78350F] border-b-4 border-[#B45309] active:border-b-0';

  if (isCompact) {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label="Ouvir instrução de áudio"
        className={`relative inline-flex items-center justify-center w-12 h-12 rounded-full cursor-pointer btn-tactile shadow-md ${baseStyles} ${className}`}
      >
        {speaking && (
          <span className="absolute inset-0 rounded-full border-2 border-sky-400 animate-sound-wave" />
        )}
        <Volume2 className={`w-6 h-6 ${speaking ? 'animate-pulse text-yellow-300' : ''}`} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Ouvir em áudio"
      className={`relative inline-flex items-center justify-center gap-2.5 font-extrabold rounded-full cursor-pointer btn-tactile shadow-md transition-transform ${
        isLarge
          ? 'min-h-[64px] px-6 py-3 text-xl sm:text-2xl'
          : 'min-h-[54px] px-5 py-2.5 text-lg'
      } ${baseStyles} ${className}`}
    >
      {/* Concentric sound wave pulse when speaking */}
      {speaking && (
        <>
          <span className="absolute -inset-1 rounded-full border-2 border-sky-300 opacity-75 animate-ping pointer-events-none" />
          <span className="absolute -inset-2 rounded-full border-2 border-sky-400 opacity-50 animate-sound-wave pointer-events-none" />
        </>
      )}

      <Volume2 className={`${isLarge ? 'w-8 h-8' : 'w-6 h-6'} ${speaking ? 'animate-bounce text-yellow-300' : ''}`} />
      <span className="tracking-wide">{speaking ? 'Ouvindo...' : label}</span>
      {speaking && <Sparkles className="w-5 h-5 text-yellow-300 animate-spin" />}
    </button>
  );
};

'use client';

import React, { useEffect } from 'react';
import { Star, Trophy, Sparkles, ArrowRight, Check } from 'lucide-react';
import { sounds } from '../lib/soundEffects';
import { speech } from '../lib/speechService';
import { MascotPipoca } from './MascotPipoca';

interface CelebrationModalProps {
  isOpen: boolean;
  leveledUp: boolean;
  childName: string;
  starsCount: number;
  currentLevel: number;
  isLastActivityInLevel: boolean;
  onNext: () => void;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  isOpen,
  leveledUp,
  childName,
  starsCount,
  currentLevel,
  isLastActivityInLevel,
  onNext,
}) => {
  useEffect(() => {
    if (isOpen) {
      if (leveledUp) {
        sounds.playLevelUp();
        speech.speak(
          childName
            ? `Parabéns, muito bem! Viva, ${childName}! Você subiu para o Nível ${currentLevel}!`
            : `Parabéns, muito bem! Você subiu para o Nível ${currentLevel}!`
        );
      }
    }
  }, [isOpen, leveledUp, childName, currentLevel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl border-4 border-amber-300 relative animate-scale-up">
        {/* Confetti or Stars Glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2">
          <div className="w-24 h-24 rounded-full bg-amber-400 border-4 border-white shadow-xl flex items-center justify-center text-5xl animate-bounce">
            {leveledUp ? '🏆' : '⭐'}
          </div>
        </div>

        {/* Mascot */}
        <div className="mt-8 mb-3 flex justify-center">
          <MascotPipoca size="sm" mood="celebrating" />
        </div>

        {/* Celebratory Title */}
        {leveledUp ? (
          <div>
            <span className="text-xs font-black uppercase text-amber-600 tracking-widest bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
              Conquista Especial!
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-amber-900 mt-2">
              Subiu de Nível! 🚀
            </h2>
            <p className="text-base sm:text-lg font-bold text-slate-700 mt-1">
              {childName ? `${childName}, você alcançou o ` : 'Você alcançou o '}
              <strong className="text-sky-600">Nível {currentLevel}</strong>!
            </p>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800">
              Muito Bem! 🎉
            </h2>
            <p className="text-base sm:text-lg font-bold text-slate-600 mt-1">
              Você ganhou mais uma estrelinha!
            </p>
          </div>
        )}

        {/* Stars counter pill */}
        <div className="my-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-50 border-2 border-amber-300 text-amber-900 font-black text-xl shadow-inner">
          <Star className="w-7 h-7 fill-amber-400 text-amber-500 animate-spin" />
          <span>{starsCount} Estrelas Totais</span>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={() => {
            sounds.playPop();
            onNext();
          }}
          className="w-full min-h-[64px] rounded-full bg-[#16A34A] hover:bg-[#15803D] text-white font-black text-xl sm:text-2xl border-b-6 border-[#15803D] active:border-b-0 btn-tactile shadow-xl flex items-center justify-center gap-3 cursor-pointer"
        >
          <span>{isLastActivityInLevel ? 'Concluir Fase!' : 'Próximo Desafio!'}</span>
          <ArrowRight className="w-7 h-7" />
        </button>
      </div>
    </div>
  );
};

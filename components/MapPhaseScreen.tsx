'use client';

import React from 'react';
import { Lock, Play, Star, Sparkles, CheckCircle2, ChevronRight, Award, Trophy } from 'lucide-react';
import { ChildProfile, GameLevel } from '../lib/types';
import { GAME_LEVELS } from '../lib/gameData';
import { sounds } from '../lib/soundEffects';
import { speech } from '../lib/speechService';
import { MascotPipoca } from './MascotPipoca';
import { AudioButton } from './AudioButton';

import { AnimatedChildAvatar } from './AnimatedChildAvatar';

interface MapPhaseScreenProps {
  child: ChildProfile;
  onSelectLevel: (level: GameLevel) => void;
  onOpenTrophies: () => void;
}

export const MapPhaseScreen: React.FC<MapPhaseScreenProps> = ({
  child,
  onSelectLevel,
  onOpenTrophies,
}) => {
  // Calculate progress to next rank
  const correctInCurrentCycle = child.totalCorrect % 10;
  const progressPercent = Math.min(100, (correctInCurrentCycle / 10) * 100);

  const handleLevelClick = (level: GameLevel, isUnlocked: boolean) => {
    if (!isUnlocked) {
      sounds.playTryAgain();
      speech.speak(
        `Essa fase está trancada com chave de ouro! Complete a fase anterior para abrir o caminho!`
      );
      return;
    }

    sounds.playPop();
    speech.speak(`Você escolheu ${level.title}! Vamos começar a brincadeira!`);
    onSelectLevel(level);
  };

  const getThemeClasses = (color: GameLevel['themeColor'], isUnlocked: boolean) => {
    if (!isUnlocked) {
      return {
        bg: 'bg-slate-100 border-slate-300 text-slate-400',
        card: 'bg-slate-50/80 border-slate-200 opacity-75',
        button: 'bg-slate-200 text-slate-500 border-slate-300',
        badge: 'bg-slate-200 text-slate-500',
      };
    }

    switch (color) {
      case 'blue':
        return {
          bg: 'bg-[#0284C7] border-[#0369A1] text-white',
          card: 'bg-sky-50/70 border-sky-200 hover:border-sky-400',
          button: 'bg-[#0284C7] hover:bg-[#0369A1] text-white border-b-5 border-[#0369A1]',
          badge: 'bg-sky-100 text-sky-800 border-sky-300',
        };
      case 'green':
        return {
          bg: 'bg-[#16A34A] border-[#15803D] text-white',
          card: 'bg-emerald-50/70 border-emerald-200 hover:border-emerald-400',
          button: 'bg-[#16A34A] hover:bg-[#15803D] text-white border-b-5 border-[#15803D]',
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        };
      case 'yellow':
        return {
          bg: 'bg-[#F59E0B] border-[#B45309] text-amber-950',
          card: 'bg-amber-50/70 border-amber-200 hover:border-amber-400',
          button: 'bg-[#F59E0B] hover:bg-[#D97706] text-[#78350F] border-b-5 border-[#B45309]',
          badge: 'bg-amber-100 text-amber-800 border-amber-300',
        };
      case 'orange':
        return {
          bg: 'bg-[#EA580C] border-[#C2410C] text-white',
          card: 'bg-orange-50/70 border-orange-200 hover:border-orange-400',
          button: 'bg-[#EA580C] hover:bg-[#C2410C] text-white border-b-5 border-[#C2410C]',
          badge: 'bg-orange-100 text-orange-800 border-orange-300',
        };
      case 'purple':
      default:
        return {
          bg: 'bg-purple-600 border-purple-800 text-white',
          card: 'bg-purple-50/70 border-purple-200 hover:border-purple-400',
          button: 'bg-purple-600 hover:bg-purple-700 text-white border-b-5 border-purple-800',
          badge: 'bg-purple-100 text-purple-800 border-purple-300',
        };
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
      {/* Top Child Welcome Banner with Star Progress */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border-3 border-sky-100 mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Avatar or Mascot with message */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full overflow-hidden bg-sky-100 border-3 border-sky-300 flex items-center justify-center shrink-0 shadow-inner">
              {child.photoUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={child.photoUrl} alt={child.name || 'Aprendiz'} className="w-full h-full object-cover" />
              ) : child.avatar === 'child_anim' ? (
                <AnimatedChildAvatar size="md" />
              ) : (
                <span className="text-3xl select-none">{child.avatar}</span>
              )}
            </div>
            <div>
              <span className="text-xs font-black uppercase text-sky-600 tracking-wider">
                Mapa de Aventuras
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-800">
                {child.name ? `Olá, ${child.name}!` : 'Olá!'}
              </h2>
              <p className="text-sm sm:text-base font-bold text-slate-600">
                Toque na fase que você quer explorar hoje!
              </p>
            </div>
          </div>

          {/* Gamification Progress: 10 Acertos para o próximo nível */}
          <div className="w-full md:w-72 bg-sky-50 rounded-2xl p-4 border-2 border-sky-200">
            <div className="flex items-center justify-between text-xs sm:text-sm font-black text-slate-700 mb-1.5">
              <span>Próximo Troféu 🏆</span>
              <span className="text-sky-700">{correctInCurrentCycle}/10 acertos</span>
            </div>
            
            {/* Visual Progress Bar */}
            <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden p-0.5 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[11px] font-bold text-slate-500 mt-1 text-center">
              A cada 10 acertos você sobe de nível!
            </p>
          </div>
        </div>

        {/* Audio helper for screen */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <AudioButton
            textToSpeak="Este é o seu mapa de fases! Comece pelas vogais mágicas, aprenda as consoantes, sílabas, palavras e frases! Também temos desafios numéricos super divertidos!"
            label="Ouvir as Fases"
            variant="primary"
          />

          <button
            type="button"
            onClick={onOpenTrophies}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-800 font-extrabold text-sm border-2 border-amber-300 btn-tactile cursor-pointer"
          >
            <Trophy className="w-4 h-4 text-amber-600" />
            <span>Ver Meus Troféus ({child.stars} ⭐)</span>
          </button>
        </div>
      </div>

      {/* 5 Levels Trail */}
      <div className="space-y-6 sm:space-y-8 relative">
        {/* Connecting decorative dashed path */}
        <div className="hidden sm:block absolute left-14 top-10 bottom-10 w-1 border-l-4 border-dashed border-sky-200 -z-10" />

        {GAME_LEVELS.map((level, idx) => {
          const isUnlocked = child.unlockedLevels.includes(level.id);
          const theme = getThemeClasses(level.themeColor, isUnlocked);
          const isCurrentActive = isUnlocked && !child.unlockedLevels.includes(level.id + 1);

          return (
            <div
              key={level.id}
              onClick={() => handleLevelClick(level, isUnlocked)}
              className={`rounded-3xl p-5 sm:p-6 border-3 transition-all relative btn-tactile cursor-pointer ${
                theme.card
              } ${
                isCurrentActive
                  ? 'ring-4 ring-sky-300 ring-offset-2 shadow-xl bg-white scale-[1.01]'
                  : 'shadow-md hover:shadow-lg'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Left: Giant Phase Circle & Info */}
                <div className="flex items-center gap-4 sm:gap-5 w-full sm:w-auto">
                  {/* Phase Island Icon Button */}
                  <div
                    className={`w-18 h-18 sm:w-20 sm:h-20 rounded-full border-4 flex items-center justify-center text-3xl sm:text-4xl shadow-md shrink-0 transition-transform ${
                      theme.bg
                    } ${isUnlocked ? 'group-hover:scale-105' : ''}`}
                  >
                    {isUnlocked ? (
                      level.icon
                    ) : (
                      <Lock className="w-8 h-8 text-slate-400" />
                    )}
                  </div>

                  {/* Text Details */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-xs uppercase font-black px-2.5 py-0.5 rounded-full border ${theme.badge}`}>
                        Fase {level.id}
                      </span>
                      {isCurrentActive && (
                        <span className="text-xs font-black uppercase bg-amber-400 text-amber-950 px-2.5 py-0.5 rounded-full border border-amber-500 animate-pulse">
                          Fase Atual ✨
                        </span>
                      )}
                      <span className="text-xs font-bold text-slate-500">
                        {level.activities.length} Atividades
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black text-slate-800 leading-tight">
                      {level.title}
                    </h3>
                    <p className="text-sm sm:text-base font-extrabold text-slate-600 mt-0.5">
                      {level.subtitle}
                    </p>
                  </div>
                </div>

                {/* Right: Play / Locked Action */}
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {isUnlocked ? (
                    <button
                      type="button"
                      className={`w-full sm:w-auto min-h-[58px] px-6 py-3 rounded-full font-black text-lg tracking-wide shadow-md flex items-center justify-center gap-2 cursor-pointer btn-tactile ${theme.button}`}
                    >
                      <Play className="w-5 h-5 fill-current" />
                      <span>Jogar Fase</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 px-5 py-3 rounded-full bg-slate-200 text-slate-500 font-extrabold text-sm border-2 border-slate-300">
                      <Lock className="w-4 h-4" />
                      <span>Fase Bloqueada</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Numerical Activities Spotlight Banner */}
      <div className="mt-10 bg-gradient-to-r from-amber-100 via-yellow-50 to-orange-100 border-3 border-amber-300 rounded-3xl p-6 shadow-md text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-3xl">🔢</span>
          <h4 className="text-xl sm:text-2xl font-black text-amber-900">
            Atividades Numéricas Integradas!
          </h4>
          <span className="text-3xl">🍎</span>
        </div>
        <p className="text-sm sm:text-base font-bold text-amber-800 max-w-xl mx-auto">
          Todas as fases possuem desafios de contar maçãs, dedinhos, estrelas e palavras! Aprenda a ler e a contar ao mesmo tempo!
        </p>
      </div>
    </div>
  );
};

'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, Volume2, Star, Sparkles, HelpCircle, CheckCircle2, RotateCcw } from 'lucide-react';
import { ChildProfile, GameLevel, ActivityQuestion } from '../lib/types';
import { updateChildProgress } from '../lib/storage';
import { sounds } from '../lib/soundEffects';
import { speech } from '../lib/speechService';
import { MascotPipoca } from './MascotPipoca';
import { AudioButton } from './AudioButton';
import { CelebrationModal } from './CelebrationModal';

interface ActivityScreenProps {
  level: GameLevel;
  child: ChildProfile;
  onBackToMap: () => void;
  onChildUpdated: (updated: ChildProfile) => void;
}

export const ActivityScreen: React.FC<ActivityScreenProps> = ({
  level,
  child,
  onBackToMap,
  onChildUpdated,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [countedIndices, setCountedIndices] = useState<number[]>([]);
  
  // Celebration modal state
  const [showCelebration, setShowCelebration] = useState(false);
  const [didLevelUp, setDidLevelUp] = useState(false);
  const [gentleRetryHint, setGentleRetryHint] = useState<string | null>(null);

  const currentActivity: ActivityQuestion = level.activities[currentIndex] || level.activities[0];

  // Auto-speak instructions on activity load
  useEffect(() => {
    const timer = setTimeout(() => {
      speech.speak(currentActivity.instructionAudio);
    }, 400);

    return () => clearTimeout(timer);
  }, [currentIndex, currentActivity.instructionAudio]);

  // Handle option selection
  const handleSelectOption = (option: { id: string; label: string; spokenText?: string; isCorrect: boolean }) => {
    if (isAnswered && isCorrect) return; // Already finished correctly

    sounds.playPop();
    setSelectedOptionId(option.id);

    if (option.spokenText) {
      speech.speak(option.spokenText);
    }

    if (option.isCorrect) {
      // SUCCESS!
      setIsAnswered(true);
      setIsCorrect(true);
      setGentleRetryHint(null);

      // Sound and star chime
      sounds.playSuccess();
      setTimeout(() => sounds.playStar(), 250);

      // Enthusiastic female voice with "Parabéns, muito bem!" (sem risos)
      speech.speakSuccess();

      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0284C7', '#F59E0B', '#16A34A', '#EC4899', '#8B5CF6'],
        });
      } catch {
        // Fallback if confetti fails
      }

      // Update progress & check level up
      const { child: updatedChild, leveledUp } = updateChildProgress(
        child.id,
        currentActivity.id,
        level.id,
        true
      );
      
      onChildUpdated(updatedChild);
      setDidLevelUp(leveledUp);

      // Open celebration modal after short delay
      setTimeout(() => {
        setShowCelebration(true);
      }, 700);
    } else {
      // GENTLE RETRY (No penalty)
      setIsCorrect(false);
      sounds.playTryAgain();
      const encouragementTips = [
        'Quase lá! Vamos ouvir com atenção e tentar de novo?',
        'Muito bom tentar! Que tal ouvir o som da letrinha mais uma vez?',
        'Você está no caminho certo! Vamos fazer juntos de novo!',
      ];
      const hint = encouragementTips[currentIndex % encouragementTips.length];
      setGentleRetryHint(hint);
      speech.speak(hint);
    }
  };

  // Interactive counting helper for kids: tapping items to count them!
  const handleTapCountItem = (idx: number) => {
    sounds.playCountBeep(idx + 1);
    if (!countedIndices.includes(idx)) {
      setCountedIndices([...countedIndices, idx]);
    }
    speech.speak(`${idx + 1}!`);
  };

  const handleNextActivity = () => {
    setShowCelebration(false);
    setSelectedOptionId(null);
    setIsAnswered(false);
    setIsCorrect(null);
    setGentleRetryHint(null);
    setCountedIndices([]);

    if (currentIndex < level.activities.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Finished all activities in this level!
      speech.speak(`Parabéns, ${child.name}! Você completou todas as atividades dessa fase!`);
      onBackToMap();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F0F9FF] via-[#FAF8FF] to-[#FEFCE8] flex flex-col justify-between p-3 sm:p-6 select-none">
      {/* Top Bar Navigation */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between gap-3 bg-white/90 backdrop-blur rounded-full px-4 sm:px-6 py-2.5 shadow-sm border-2 border-sky-100">
        <button
          type="button"
          onClick={() => {
            sounds.playPop();
            onBackToMap();
          }}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-sm sm:text-base btn-tactile cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden xs:inline">Mapa de Fases</span>
        </button>

        {/* Phase title & Activity counter */}
        <div className="text-center">
          <span className="text-[11px] font-black uppercase text-sky-600 tracking-wider block">
            {level.title}
          </span>
          <span className="text-sm sm:text-base font-black text-slate-800">
            Desafio {currentIndex + 1} de {level.activities.length}
          </span>
        </div>

        {/* Stars pill */}
        <div className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 border-2 border-amber-300 rounded-full text-amber-800 font-black text-sm sm:text-base">
          <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-400 text-amber-500 animate-wiggle" />
          <span>{child.stars}</span>
        </div>
      </div>

      {/* Main Learning Arena Card */}
      <div className="max-w-3xl mx-auto w-full my-4 sm:my-6 bg-white rounded-3xl p-5 sm:p-8 shadow-xl border-3 border-sky-100 flex flex-col items-center">
        {/* Mascot & Narration Prompt */}
        <div className="w-full flex flex-col sm:flex-row items-center gap-4 sm:gap-6 bg-sky-50/80 rounded-3xl p-4 sm:p-5 border-2 border-sky-200 mb-6">
          <div className="shrink-0">
            <MascotPipoca
              size="sm"
              mood={isCorrect ? 'celebrating' : gentleRetryHint ? 'encouraging' : 'neutral'}
            />
          </div>

          <div className="flex-1 text-center sm:text-left">
            <span className="text-xs font-black uppercase text-sky-600 tracking-wider">
              {currentActivity.title}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 leading-snug">
              {currentActivity.instructionAudio}
            </h2>

            {/* Repeat Audio Button */}
            <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <AudioButton
                textToSpeak={currentActivity.instructionAudio}
                label="Repetir Instrução"
                variant="primary"
              />

              {currentActivity.itemToSpeak && (
                <button
                  type="button"
                  onClick={() => {
                    sounds.playPop();
                    speech.speak(currentActivity.itemToSpeak || '');
                  }}
                  className="px-4 py-2.5 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 border-2 border-amber-300 font-extrabold text-sm sm:text-base flex items-center gap-1.5 btn-tactile cursor-pointer"
                >
                  <Volume2 className="w-4 h-4 text-amber-600" />
                  <span>Ouvir o Som de Novo</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Display Item (Big Picture, Equation, or Counting items) */}
        <div className="my-3 text-center w-full">
          {/* Counting Activity Interactive Items */}
          {currentActivity.type === 'number-counting' && currentActivity.countItems ? (
            <div className="bg-amber-50/80 border-3 border-amber-200 rounded-3xl p-6 mb-6">
              <p className="text-sm font-black text-amber-900 uppercase tracking-wide mb-3">
                Toque nos itens para contar um por um:
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                {currentActivity.countItems.map((item, idx) => {
                  const isCounted = countedIndices.includes(idx);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleTapCountItem(idx)}
                      className={`min-w-[64px] min-h-[64px] sm:min-w-[76px] sm:min-h-[76px] p-2 rounded-2xl text-3xl sm:text-4xl flex items-center justify-center border-b-4 transition-all btn-tactile cursor-pointer ${
                        isCounted
                          ? 'bg-amber-400 border-amber-600 text-amber-950 scale-105 shadow-md ring-2 ring-white'
                          : 'bg-white border-amber-200 hover:bg-amber-100 text-slate-800'
                      }`}
                      title="Toque para contar!"
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : currentActivity.displayPrompt ? (
            /* Formula or Syllable display */
            <div className="inline-block px-8 py-4 bg-sky-100/70 border-3 border-sky-300 rounded-3xl mb-6 shadow-inner">
              <span className="text-3xl sm:text-4xl md:text-5xl font-black text-sky-900 tracking-wider">
                {currentActivity.displayPrompt}
              </span>
            </div>
          ) : currentActivity.image ? (
            /* Big Friendly Illustration/Emoji */
            <div className="inline-flex items-center justify-center w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-sky-100 to-amber-100 border-4 border-sky-300 shadow-md text-6xl sm:text-7xl mb-6 animate-float">
              {currentActivity.image}
            </div>
          ) : null}
        </div>

        {/* Gentle Retry Message if kid clicked wrong */}
        {gentleRetryHint && (
          <div className="w-full mb-6 p-4 bg-amber-50 border-3 border-amber-300 rounded-3xl flex items-center gap-3 text-amber-900 text-base sm:text-lg font-bold animate-shake">
            <span className="text-3xl">💡</span>
            <div className="flex-1">
              <p>{gentleRetryHint}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                speech.speak(currentActivity.instructionAudio);
              }}
              className="p-2 bg-amber-200 rounded-full hover:bg-amber-300 btn-tactile"
              title="Ouvir novamente"
            >
              <RotateCcw className="w-5 h-5 text-amber-800" />
            </button>
          </div>
        )}

        {/* Giant Tactile Options Grid */}
        <div
          className={`w-full grid gap-4 sm:gap-6 ${
            currentActivity.options.length <= 3
              ? 'grid-cols-1 sm:grid-cols-3'
              : 'grid-cols-2 sm:grid-cols-4'
          }`}
        >
          {currentActivity.options.map((option) => {
            const isSelected = selectedOptionId === option.id;
            const showSuccess = isSelected && option.isCorrect;
            const showFailure = isSelected && !option.isCorrect;

            let buttonTheme =
              'bg-white hover:bg-sky-50 text-slate-800 border-3 border-sky-200 hover:border-sky-400 border-b-6 border-b-sky-300 active:border-b-0 shadow-md';

            if (showSuccess) {
              buttonTheme =
                'bg-[#16A34A] text-white border-3 border-[#15803D] border-b-6 border-b-[#15803D] scale-105 shadow-xl ring-4 ring-emerald-200';
            } else if (showFailure) {
              buttonTheme =
                'bg-amber-100 text-amber-900 border-3 border-amber-300 border-b-6 border-b-amber-400 opacity-90';
            }

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelectOption(option)}
                className={`min-h-[72px] sm:min-h-[90px] p-4 rounded-3xl font-black text-2xl sm:text-3xl flex flex-col items-center justify-center gap-1.5 transition-all btn-tactile cursor-pointer ${buttonTheme}`}
              >
                {option.image && (
                  <span className="text-3xl sm:text-4xl">{option.image}</span>
                )}
                <span className="tracking-wider">{option.label}</span>

                {showSuccess && (
                  <CheckCircle2 className="w-6 h-6 text-white animate-bounce" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="max-w-3xl mx-auto w-full flex items-center justify-between text-xs text-slate-400 font-bold px-4">
        <span>Toque na opção para responder</span>
        <span>Aprendiz Kids 2026</span>
      </div>

      {/* Celebration Modal on Correct Answer */}
      <CelebrationModal
        isOpen={showCelebration}
        leveledUp={didLevelUp}
        childName={child.name}
        starsCount={child.stars}
        currentLevel={child.level}
        isLastActivityInLevel={currentIndex === level.activities.length - 1}
        onNext={handleNextActivity}
      />
    </div>
  );
};

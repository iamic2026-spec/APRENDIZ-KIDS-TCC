'use client';

import React from 'react';
import { Trophy, Star, X, CheckCircle, Lock } from 'lucide-react';
import { ChildProfile } from '../lib/types';
import { INITIAL_ACHIEVEMENTS } from '../lib/gameData';
import { sounds } from '../lib/soundEffects';
import { speech } from '../lib/speechService';
import { AudioButton } from './AudioButton';

interface TrophyModalProps {
  isOpen: boolean;
  child: ChildProfile;
  onClose: () => void;
}

export const TrophyModal: React.FC<TrophyModalProps> = ({ isOpen, child, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border-4 border-amber-300 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            sounds.playPop();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full btn-tactile cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-3xl mb-2">
            🏆
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800">
            {child.name ? `Galeria de Troféus de ${child.name}` : 'Galeria de Troféus'}
          </h2>
          <p className="text-sm font-bold text-slate-600 mt-1">
            Veja todas as medalhas e estrelas que você já conquistou!
          </p>

          <div className="mt-3 flex justify-center">
            <AudioButton
              textToSpeak={`Esta é a sua galeria de troféus! Você já conquistou ${child.stars} estrelas brilhantes! Continue jogando para desbloquear todas as medalhas!`}
              label="Ouvir Conquistas"
              variant="secondary"
            />
          </div>
        </div>

        {/* Total Stars Count */}
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 text-center mb-6">
          <span className="text-xs uppercase font-black text-amber-700 tracking-wider">
            Coleção Estelar
          </span>
          <div className="flex items-center justify-center gap-2 mt-1">
            <Star className="w-8 h-8 fill-amber-400 text-amber-500 animate-wiggle" />
            <span className="text-3xl font-black text-amber-900">{child.stars}</span>
            <span className="text-base font-extrabold text-amber-700">Estrelas</span>
          </div>
        </div>

        {/* Achievements List */}
        <div className="space-y-3">
          {INITIAL_ACHIEVEMENTS.map((ach) => {
            const isUnlocked = child.stars >= ach.starsRequired;

            return (
              <div
                key={ach.id}
                className={`p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${
                  isUnlocked
                    ? 'bg-emerald-50/80 border-emerald-300 shadow-sm'
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl shrink-0 border-2 ${
                    isUnlocked
                      ? 'bg-amber-300 border-amber-500 shadow-md'
                      : 'bg-slate-200 border-slate-300 text-slate-400'
                  }`}
                >
                  {isUnlocked ? ach.icon : <Lock className="w-5 h-5 text-slate-400" />}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-black text-slate-800">{ach.title}</h4>
                    {isUnlocked && (
                      <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                        Conquistado!
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-600 mt-0.5">
                    {ach.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Close bottom button */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              sounds.playPop();
              onClose();
            }}
            className="w-full min-h-[56px] rounded-full bg-[#0284C7] hover:bg-[#0369A1] text-white font-black text-lg border-b-4 border-[#0369A1] active:border-b-0 btn-tactile cursor-pointer"
          >
            Continuar Brincando
          </button>
        </div>
      </div>
    </div>
  );
};

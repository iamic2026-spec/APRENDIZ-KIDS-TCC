'use client';

import React, { useState, useSyncExternalStore } from 'react';
import { Star, Trophy, Volume2, VolumeX, Users, Shield, LogOut } from 'lucide-react';
import { ChildProfile } from '../lib/types';
import { sounds } from '../lib/soundEffects';

import { ChildAvatarRenderer } from './ChildAvatarRenderer';

interface HeaderProps {
  child: ChildProfile;
  onChangeProfile: () => void;
  onOpenTrophies: () => void;
  onOpenParentArea: () => void;
  onLogout: () => void;
}

const emptySubscribe = () => () => {};

export const Header: React.FC<HeaderProps> = ({
  child,
  onChangeProfile,
  onOpenTrophies,
  onOpenParentArea,
  onLogout,
}) => {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [isMuted, setIsMuted] = useState(sounds.getMuted());

  const handleToggleMute = () => {
    const next = sounds.toggleMute();
    setIsMuted(next);
    if (!next) sounds.playPop();
  };

  // Evita renderizar a árvore discrepante no SSR se houver dependência do cliente
  if (!isMounted) {
    return (
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b-2 border-sky-100 shadow-sm px-3 sm:px-6 py-2 sm:py-3 transition-all">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          <div className="h-10 w-32 bg-sky-100 animate-pulse rounded-full" />
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b-2 border-sky-200/80 shadow-md px-3 sm:px-6 py-2 sm:py-3 transition-all">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Child Profile Display & Switch (Nome em Destaque ao lado do Avatar) */}
        <button
          type="button"
          onClick={onChangeProfile}
          className="flex items-center gap-2 sm:gap-3 p-1 sm:p-1.5 pr-3 sm:pr-4 rounded-full bg-gradient-to-r from-sky-50 to-amber-50/60 border-2 border-sky-300 hover:border-sky-500 shadow-sm hover:shadow-md btn-tactile cursor-pointer group"
          title="Clique para trocar o perfil"
        >
          {/* Avatar / Photo */}
          <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full overflow-hidden bg-sky-100 flex items-center justify-center border-2 border-white shadow-inner shrink-0 group-hover:scale-105 transition-transform">
            {child.photoUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={child.photoUrl}
                alt={child.name || 'Aprendiz'}
                className="w-full h-full object-cover"
              />
            ) : (
              <ChildAvatarRenderer avatarId={child.avatar} size="sm" />
            )}
          </div>

          {/* Nome da Criança em Destaque (Visível em Celulares e Computadores) */}
          <div className="text-left flex flex-col justify-center">
            <span className="text-[10px] sm:text-xs uppercase tracking-wider font-extrabold text-sky-600 leading-tight">
              Aprendiz
            </span>
            <span className="text-base sm:text-xl font-black text-slate-800 leading-tight truncate max-w-[110px] xs:max-w-[160px] sm:max-w-[220px] md:max-w-[280px] lg:max-w-[340px]">
              {child.name || 'Pequeno Aprendiz'}
            </span>
          </div>

          <Users className="w-4 h-4 text-sky-500 shrink-0 ml-0.5 group-hover:text-sky-700 transition-colors" />
        </button>

        {/* Center: Stars & Level Indicators */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Stars Pill */}
          <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-amber-50 border-2 border-amber-300 text-amber-800 font-black shadow-sm">
            <Star className="w-5 h-5 sm:w-6 sm:h-6 fill-amber-400 text-amber-500 animate-wiggle" />
            <span className="text-lg sm:text-xl">{child.stars}</span>
            <span className="text-xs uppercase font-extrabold text-amber-600 hidden md:inline">
              estrelas
            </span>
          </div>

          {/* Level Pill */}
          <div className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-emerald-50 border-2 border-emerald-300 text-emerald-800 font-extrabold shadow-sm">
            <span className="text-xs uppercase text-emerald-600 font-bold hidden sm:inline">
              Fase
            </span>
            <span className="text-base sm:text-lg font-black">Nível {child.level}</span>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Trophies Button */}
          <button
            type="button"
            onClick={onOpenTrophies}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-amber-100 hover:bg-amber-200 border-2 border-amber-300 text-amber-700 flex items-center justify-center btn-tactile cursor-pointer"
            title="Conquistas e Troféus"
          >
            <Trophy className="w-5 h-5" />
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={handleToggleMute}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 flex items-center justify-center btn-tactile cursor-pointer ${
              isMuted
                ? 'bg-rose-100 border-rose-300 text-rose-600'
                : 'bg-sky-100 hover:bg-sky-200 border-sky-300 text-sky-700'
            }`}
            title={isMuted ? 'Ativar Sons' : 'Silenciar Sons'}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          {/* Parent Zone / Settings Button */}
          <button
            type="button"
            onClick={onOpenParentArea}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-purple-100 hover:bg-purple-200 border-2 border-purple-300 text-purple-700 flex items-center justify-center btn-tactile cursor-pointer"
            title="Área dos Pais & Configurações"
          >
            <Shield className="w-5 h-5" />
          </button>

          {/* Logout */}
          <button
            type="button"
            onClick={onLogout}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-100 hover:bg-slate-200 border-2 border-slate-300 text-slate-600 flex items-center justify-center btn-tactile cursor-pointer"
            title="Sair da Conta"
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

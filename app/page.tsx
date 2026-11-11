'use client';

import React, { useState, useSyncExternalStore } from 'react';
import { ParentUser, ChildProfile, GameLevel } from '../lib/types';
import {
  getParentSession,
  setParentSession,
  getActiveChild,
  getChildrenProfiles,
  setActiveChildId,
  subscribeStorage,
} from '../lib/storage';
import { AuthScreen } from '../components/AuthScreen';
import { ProfileSelectScreen } from '../components/ProfileSelectScreen';
import { Header } from '../components/Header';
import { MapPhaseScreen } from '../components/MapPhaseScreen';
import { ActivityScreen } from '../components/ActivityScreen';
import { TrophyModal } from '../components/TrophyModal';
import { ParentDashboardModal } from '../components/ParentDashboardModal';
import { sounds } from '../lib/soundEffects';
import { useHydrated } from '../lib/useHydrated';

export default function HomePage() {
  const isHydrated = useHydrated();

  // Reactive external store subscription for persistent parent session & active child
  const parent = useSyncExternalStore(
    subscribeStorage,
    () => getParentSession(),
    () => null
  );

  const activeChild = useSyncExternalStore(
    subscribeStorage,
    () => getActiveChild(),
    () => null
  );

  const [isSelectingProfile, setIsSelectingProfile] = useState(false);
  const [currentLevel, setCurrentLevel] = useState<GameLevel | null>(null);

  // Modals
  const [trophiesOpen, setTrophiesOpen] = useState(false);
  const [parentAreaOpen, setParentAreaOpen] = useState(false);

  // Prevent SSR hydration mismatch when reading localStorage
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-kid-animated-gradient flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-20 h-20 rounded-full bg-sky-100 border-4 border-sky-300 flex items-center justify-center text-4xl shadow-md animate-bounce">
            🦉
          </div>
          <h1 className="text-2xl font-black text-[#0284C7]">Aprendiz Kids</h1>
          <p className="text-sm font-bold text-slate-500">Carregando brincadeiras e letrinhas...</p>
        </div>
      </div>
    );
  }

  // 1. Requirement: SEM LOGIN, NÃO ACESSA O RESTANTE
  if (!parent) {
    return (
      <AuthScreen
        onLoginSuccess={() => {
          const child = getActiveChild();
          setIsSelectingProfile(!child);
        }}
      />
    );
  }

  // 2. Requirement: ESCOLHER, CRIAR, EDITAR OU EXCLUIR PERFIL DA CRIANÇA
  if (isSelectingProfile || !activeChild) {
    return (
      <ProfileSelectScreen
        activeChildId={activeChild?.id}
        onSelectChild={() => {
          setIsSelectingProfile(false);
        }}
        onChildUpdated={() => {
          // Handled reactively by subscribeStorage
        }}
        onChildDeleted={(deletedId) => {
          if (activeChild?.id === deletedId) {
            const remaining = getChildrenProfiles();
            setActiveChildId(remaining[0]?.id || null);
          }
        }}
        onLogout={() => {
          sounds.playPop();
          setParentSession(null);
          setActiveChildId(null);
          setIsSelectingProfile(false);
        }}
      />
    );
  }

  const handleLogout = () => {
    sounds.playPop();
    setParentSession(null);
    setActiveChildId(null);
    setCurrentLevel(null);
    setIsSelectingProfile(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-kid-animated-gradient">
      {/* Top Header */}
      <Header
        child={activeChild}
        onChangeProfile={() => {
          sounds.playPop();
          setIsSelectingProfile(true);
          setCurrentLevel(null);
        }}
        onOpenTrophies={() => {
          sounds.playPop();
          setTrophiesOpen(true);
        }}
        onOpenParentArea={() => {
          sounds.playPop();
          setParentAreaOpen(true);
        }}
        onLogout={handleLogout}
      />

      {/* Main Content: Activity or Map */}
      <main className="flex-1">
        {currentLevel ? (
          <ActivityScreen
            level={currentLevel}
            child={activeChild}
            onBackToMap={() => {
              sounds.playPop();
              setCurrentLevel(null);
            }}
            onChildUpdated={() => {}}
          />
        ) : (
          <MapPhaseScreen
            child={activeChild}
            onSelectLevel={(level) => {
              setCurrentLevel(level);
            }}
            onOpenTrophies={() => {
              sounds.playPop();
              setTrophiesOpen(true);
            }}
            onEditProfile={() => {
              sounds.playPop();
              setIsSelectingProfile(true);
            }}
          />
        )}
      </main>

      {/* Trophies Modal */}
      <TrophyModal
        isOpen={trophiesOpen}
        child={activeChild}
        onClose={() => setTrophiesOpen(false)}
      />

      {/* Parent Zone Modal */}
      <ParentDashboardModal
        isOpen={parentAreaOpen}
        parent={parent}
        onClose={() => setParentAreaOpen(false)}
        onRefreshChildren={() => {}}
      />
    </div>
  );
}

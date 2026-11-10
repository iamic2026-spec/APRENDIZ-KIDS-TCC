'use client';

import React, { useState, useEffect } from 'react';
import { ParentUser, ChildProfile, GameLevel } from '../lib/types';
import {
  getParentSession,
  setParentSession,
  getActiveChild,
  getChildrenProfiles,
  setActiveChildId,
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
  const [parent, setParent] = useState<ParentUser | null>(() => getParentSession());
  const [activeChild, setActiveChild] = useState<ChildProfile | null>(() => getActiveChild());
  const [isSelectingProfile, setIsSelectingProfile] = useState(() => !getActiveChild());
  const [currentLevel, setCurrentLevel] = useState<GameLevel | null>(null);

  // Modals
  const [trophiesOpen, setTrophiesOpen] = useState(false);
  const [parentAreaOpen, setParentAreaOpen] = useState(false);

  // Prevent SSR hydration mismatch when reading localStorage
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F0F9FF] via-[#FAF8FF] to-[#FEFCE8] flex items-center justify-center p-4">
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
        onLoginSuccess={(user) => {
          setParent(user);
          const child = getActiveChild();
          if (child) {
            setActiveChild(child);
            setIsSelectingProfile(false);
          } else {
            setIsSelectingProfile(true);
          }
        }}
      />
    );
  }

  // 2. Requirement: ESCOLHER OU CRIAR PERFIL DA CRIANÇA
  if (isSelectingProfile || !activeChild) {
    return (
      <ProfileSelectScreen
        onSelectChild={(child) => {
          setActiveChild(child);
          setIsSelectingProfile(false);
        }}
        onLogout={() => {
          sounds.playPop();
          setParentSession(null);
          setParent(null);
          setActiveChild(null);
          setActiveChildId(null);
          setIsSelectingProfile(false);
        }}
      />
    );
  }

  // Refresh active child data after updates
  const handleChildUpdated = (updated: ChildProfile) => {
    setActiveChild(updated);
  };

  const handleLogout = () => {
    sounds.playPop();
    setParentSession(null);
    setParent(null);
    setActiveChild(null);
    setActiveChildId(null);
    setCurrentLevel(null);
    setIsSelectingProfile(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#F0F9FF] via-[#FAF8FF] to-[#FEFCE8]">
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
            onChildUpdated={handleChildUpdated}
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
        onRefreshChildren={() => {
          const child = getActiveChild();
          if (child) setActiveChild(child);
        }}
      />
    </div>
  );
}

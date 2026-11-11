'use client';

import React, { useState } from 'react';
import { Shield, Database, Check, Copy, X, Key, ExternalLink, RefreshCw, Unlock, Users, Star } from 'lucide-react';
import { ChildProfile, ParentUser } from '../lib/types';
import { supabaseRepo, isSupabaseConfigured } from '../lib/supabase';
import { getChildrenProfiles, saveChildrenProfiles } from '../lib/storage';
import { sounds } from '../lib/soundEffects';
import { AnimatedChildAvatar } from './AnimatedChildAvatar';

interface ParentDashboardModalProps {
  isOpen: boolean;
  parent: ParentUser | null;
  onClose: () => void;
  onRefreshChildren: () => void;
}

export const ParentDashboardModal: React.FC<ParentDashboardModalProps> = ({
  isOpen,
  parent,
  onClose,
  onRefreshChildren,
}) => {
  // Parental Math Gate to ensure child doesn't enter by accident
  const [isUnlockedGate, setIsUnlockedGate] = useState(false);
  const [gateNum1] = useState(4);
  const [gateNum2] = useState(3);
  const [gateAnswer, setGateAnswer] = useState('');
  const [gateError, setGateError] = useState(false);

  // Supabase settings
  const config = supabaseRepo.getConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(config.url || '');
  const [supabaseKey, setSupabaseKey] = useState(config.key || '');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState<'progress' | 'supabase'>('progress');

  const children = getChildrenProfiles();
  const isConfigured = isSupabaseConfigured();

  if (!isOpen) return null;

  const handleVerifyGate = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(gateAnswer, 10) === gateNum1 + gateNum2) {
      sounds.playSuccess();
      setIsUnlockedGate(true);
      setGateError(false);
    } else {
      sounds.playTryAgain();
      setGateError(true);
    }
  };

  const handleSaveSupabaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playPop();
    supabaseRepo.setCustomConfig(supabaseUrl.trim(), supabaseKey.trim());
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleUnlockAllLevels = () => {
    if (confirm('Deseja desbloquear todos os 5 níveis para teste e exploração?')) {
      sounds.playSuccess();
      const updated = children.map(c => ({
        ...c,
        unlockedLevels: [1, 2, 3, 4, 5],
      }));
      saveChildrenProfiles(updated);
      onRefreshChildren();
      alert('Todas as fases foram desbloqueadas com sucesso!');
    }
  };

  const handleCopySql = () => {
    sounds.playPop();
    const sqlText = `-- ==============================================================================
-- APRENDIZ KIDS - SUPABASE DATABASE SCHEMA
-- Execute este script no SQL Editor do seu projeto Supabase (https://app.supabase.com)
-- ==============================================================================

-- 1. TABELA DE PERFIS DE PAIS / RESPONSÁVEIS
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pais podem visualizar seus próprios perfis" 
ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Pais podem atualizar seus próprios perfis" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. TABELA DE CRIANÇAS CADASTRADAS PELO RESPONSÁVEL
CREATE TABLE IF NOT EXISTS public.children (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT DEFAULT '' NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 4 AND age <= 12),
  avatar TEXT NOT NULL DEFAULT 'child_anim',
  photo_url TEXT,
  stars INTEGER DEFAULT 0 NOT NULL,
  current_level INTEGER DEFAULT 1 NOT NULL,
  total_correct INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pais podem gerenciar suas crianças" 
ON public.children FOR ALL USING (auth.uid() = parent_id);

-- 3. TABELA DE PROGRESSO NOS NÍVEIS
CREATE TABLE IF NOT EXISTS public.level_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
  level_id INTEGER NOT NULL CHECK (level_id >= 1 AND level_id <= 10),
  completed BOOLEAN DEFAULT false NOT NULL,
  stars_earned INTEGER DEFAULT 0 NOT NULL,
  best_score INTEGER DEFAULT 0 NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(child_id, level_id)
);

ALTER TABLE public.level_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pais podem ler e atualizar progresso dos filhos" 
ON public.level_progress FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.children 
    WHERE children.id = level_progress.child_id 
    AND children.parent_id = auth.uid()
  )
);

-- 4. TABELA DE HISTÓRICO DE ATIVIDADES
CREATE TABLE IF NOT EXISTS public.activity_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
  level_id INTEGER NOT NULL,
  activity_id TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  attempt_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.activity_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pais podem ver histórico de atividades dos filhos" 
ON public.activity_history FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.children 
    WHERE children.id = activity_history.child_id 
    AND children.parent_id = auth.uid()
  )
);

-- 5. TRIGGER AUTOMÁTICO PARA NOVO USUÁRIO AUTH -> PROFILE
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();`;

    navigator.clipboard.writeText(sqlText);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border-4 border-purple-200 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            sounds.playPop();
            setIsUnlockedGate(false);
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full btn-tactile cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {!isUnlockedGate ? (
          /* Parental Gate Screen */
          <div className="text-center py-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
              <Shield className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-slate-800">
              Controle dos Pais / Responsáveis
            </h3>
            <p className="text-sm text-slate-600 font-bold mt-1 max-w-sm mx-auto">
              Para acessar esta área de configurações e integração, responda à continha matemática:
            </p>

            <form onSubmit={handleVerifyGate} className="mt-6 max-w-xs mx-auto space-y-4">
              <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-4 text-center">
                <span className="text-3xl font-black text-purple-900">
                  {gateNum1} + {gateNum2} = ?
                </span>
              </div>

              <input
                type="number"
                value={gateAnswer}
                onChange={(e) => setGateAnswer(e.target.value)}
                placeholder="Sua resposta"
                className="w-full text-center py-3 rounded-2xl border-2 border-slate-300 font-black text-2xl outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-100"
                autoFocus
                required
              />

              {gateError && (
                <p className="text-sm font-bold text-rose-600">
                  Ops! Resposta incorreta. Tente novamente!
                </p>
              )}

              <button
                type="submit"
                className="w-full min-h-[54px] rounded-full bg-purple-600 hover:bg-purple-700 text-white font-black text-lg border-b-4 border-purple-800 active:border-b-0 btn-tactile cursor-pointer"
              >
                Acessar Painel
              </button>
            </form>
          </div>
        ) : (
          /* Unlocked Parental Dashboard */
          <div>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800">
                  Painel de Controle dos Pais
                </h3>
                <p className="text-xs text-slate-500 font-bold">
                  Responsável: {parent?.email || 'Demonstração'}
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => setActiveTab('progress')}
                className={`py-2.5 rounded-xl font-black text-sm transition-all btn-tactile cursor-pointer ${
                  activeTab === 'progress'
                    ? 'bg-white text-purple-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Progresso dos Filhos
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('supabase')}
                className={`py-2.5 rounded-xl font-black text-sm transition-all btn-tactile cursor-pointer ${
                  activeTab === 'supabase'
                    ? 'bg-white text-purple-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Integração Supabase
              </button>
            </div>

            {/* Tab: Children Progress */}
            {activeTab === 'progress' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-700 uppercase tracking-wide">
                    Relatório dos Aprendizes
                  </h4>
                  <button
                    type="button"
                    onClick={handleUnlockAllLevels}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-extrabold text-xs border border-emerald-300 btn-tactile"
                    title="Desbloquear todas as fases para teste"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Desbloquear Todas as Fases</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {children.map((child) => (
                    <div
                      key={child.id}
                      className="p-4 rounded-2xl border-2 border-slate-200 bg-slate-50/70 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-sky-200 flex items-center justify-center text-2xl border-2 border-white shadow-inner">
                          {child.photoUrl ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={child.photoUrl} alt={child.name || 'Aprendiz'} className="w-full h-full object-cover" />
                          ) : child.avatar === 'child_anim' ? (
                            <AnimatedChildAvatar size="sm" />
                          ) : (
                            child.avatar
                          )}
                        </div>
                        <div>
                          <h5 className="text-base font-black text-slate-800">
                            {child.name || 'Pequeno Aprendiz (Demonstração)'}
                          </h5>
                          <span className="text-xs font-bold text-slate-500">
                            {child.age} anos • Fase {child.level} de 5
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-1 text-amber-700 font-black text-sm">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                          <span>{child.stars} estrelas</span>
                        </div>
                        <span className="text-xs font-bold text-slate-500">
                          {child.totalCorrect} acertos totais
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Supabase Cloud Configuration */}
            {activeTab === 'supabase' && (
              <div className="space-y-5">
                <div className="p-4 rounded-2xl bg-sky-50 border-2 border-sky-200 text-sky-900 text-xs sm:text-sm font-medium">
                  <p className="font-bold mb-1">
                    🚀 Conecte sua conta do Supabase para sincronização em nuvem!
                  </p>
                  <p className="mb-2">
                    O Aprendiz Kids funciona perfeitamente sem nenhuma configuração (armazenamento local seguro). Para sincronizar entre múltiplos dispositivos com PostgreSQL e autenticação em nuvem, informe seus dados do Supabase abaixo:
                  </p>
                  <p className="text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-xs font-bold">
                    💡 <strong>Dica para Login Imediato:</strong> No painel do Supabase, acesse <em>Authentication &gt; Providers &gt; Email</em> e desmarque <strong>Confirm email</strong>. Isso permite login imediato sem exigir verificação de link por e-mail.
                  </p>
                </div>

                <form onSubmit={handleSaveSupabaseConfig} className="space-y-3">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-600 uppercase mb-1">
                      Project URL (NEXT_PUBLIC_SUPABASE_URL)
                    </label>
                    <input
                      type="url"
                      value={supabaseUrl}
                      onChange={(e) => setSupabaseUrl(e.target.value)}
                      placeholder="https://xyzcompany.supabase.co"
                      className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 text-sm font-mono text-slate-800 focus:border-purple-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-600 uppercase mb-1">
                      Anon Public API Key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
                    </label>
                    <input
                      type="text"
                      value={supabaseKey}
                      onChange={(e) => setSupabaseKey(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 text-sm font-mono text-slate-800 focus:border-purple-600 outline-none"
                    />
                  </div>

                  {saveSuccess && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Configurações salvas e cliente Supabase atualizado!</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 py-3 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-black text-sm border-b-3 border-purple-800 btn-tactile cursor-pointer"
                    >
                      Salvar Conexão Supabase
                    </button>
                    <button
                      type="button"
                      onClick={handleCopySql}
                      className="px-4 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs border border-slate-300 btn-tactile flex items-center gap-1.5 cursor-pointer"
                      title="Copiar SQL para executar no Supabase"
                    >
                      <Copy className="w-4 h-4" />
                      <span>{copiedSql ? 'Copiado!' : 'Copiar Script SQL'}</span>
                    </button>
                  </div>
                </form>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span>Status atual:</span>
                  <span className={`font-black ${isConfigured ? 'text-emerald-600' : 'text-slate-600'}`}>
                    {isConfigured ? '● Conectado ao Supabase' : '○ Armazenamento Local Seguro'}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

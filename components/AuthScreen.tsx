'use client';

import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Sparkles, CheckCircle2, ShieldCheck, HeartHandshake } from 'lucide-react';
import { ParentUser } from '../lib/types';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { setParentSession, setupDemoChild } from '../lib/storage';
import { sounds } from '../lib/soundEffects';
import { speech } from '../lib/speechService';
import { MascotPipoca } from './MascotPipoca';
import { AudioButton } from './AudioButton';

interface AuthScreenProps {
  onLoginSuccess: (user: ParentUser) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [parentName, setParentName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const supabaseConnected = isSupabaseConfigured();

  const handleDemoLogin = () => {
    sounds.playPop();
    setLoading(true);
    setErrorMessage('');

    setTimeout(() => {
      const demoUser: ParentUser = {
        id: 'parent-demo-123',
        email: 'responsavel@aprendizkids.com.br',
        name: 'Família Aprendiz',
        isDemo: true,
      };
      setParentSession(demoUser);
      setupDemoChild();
      sounds.playSuccess();
      speech.speak('Bem-vindos ao Aprendiz Kids! Vamos aprender e brincar juntos!');
      setLoading(false);
      onLoginSuccess(demoUser);
    }, 400);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playPop();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Por favor, preencha o e-mail e a senha.');
      sounds.playTryAgain();
      return;
    }

    if (password.length < 6) {
      setErrorMessage('A senha deve conter no mínimo 6 caracteres.');
      sounds.playTryAgain();
      return;
    }

    setLoading(true);

    try {
      const client = getSupabaseClient();
      if (client) {
        // Authenticate with live Supabase
        if (tab === 'login') {
          const { data, error } = await client.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;
          if (data.user) {
            const user: ParentUser = {
              id: data.user.id,
              email: data.user.email || email,
              name: data.user.user_metadata?.name || 'Responsável',
            };
            setParentSession(user);
            sounds.playSuccess();
            onLoginSuccess(user);
            return;
          }
        } else {
          // Register
          const { data, error } = await client.auth.signUp({
            email,
            password,
            options: {
              data: {
                name: parentName || 'Responsável',
              },
            },
          });
          if (error) throw error;
          if (data.user) {
            const user: ParentUser = {
              id: data.user.id,
              email: data.user.email || email,
              name: parentName || 'Responsável',
            };
            setParentSession(user);
            sounds.playSuccess();
            onLoginSuccess(user);
            return;
          }
        }
      } else {
        // Fallback local persistent parent account
        setTimeout(() => {
          const user: ParentUser = {
            id: `parent-${btoa(email).substring(0, 10)}`,
            email,
            name: parentName || (email.split('@')[0] ?? 'Responsável'),
          };
          setParentSession(user);
          sounds.playSuccess();
          speech.speak('Conta conectada com sucesso! Vamos começar!');
          onLoginSuccess(user);
        }, 500);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha na autenticação. Verifique os dados digitados.';
      setErrorMessage(msg);
      sounds.playTryAgain();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-kid-animated-gradient flex flex-col justify-between p-4 sm:p-8">
      {/* Top Banner / Branding */}
      <div className="max-w-md w-full mx-auto text-center pt-2 sm:pt-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-4xl animate-bounce">🦉</span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#0284C7] tracking-tight">
            Aprendiz Kids
          </h1>
          <Sparkles className="w-6 h-6 text-amber-500 animate-spin" />
        </div>
        <p className="text-slate-600 font-bold text-sm sm:text-base">
          Alfabetização lúdica e divertida para crianças de 5 a 8 anos
        </p>

        {/* Audio helper for parents and kids */}
        <div className="mt-3 flex justify-center">
          <AudioButton
            textToSpeak="Olá! Bem-vindos ao Aprendiz Kids! Papai ou mamãe, faça o login ou cadastro para entrar no mundo da leitura!"
            label="Ouvir Boas-Vindas"
            variant="secondary"
          />
        </div>
      </div>

      {/* Main Card with Tactile Depth */}
      <div className="max-w-md w-full mx-auto my-6 bg-white rounded-3xl p-6 sm:p-8 shadow-[0_12px_32px_-6px_rgba(2,132,199,0.15)] border-3 border-sky-100 relative">
        {/* Floating Mascot Peek */}
        <div className="flex justify-center -mt-16 mb-2">
          <MascotPipoca size="sm" mood="celebrating" />
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1.5 bg-sky-50 rounded-2xl mb-6 border-2 border-sky-100">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setErrorMessage('');
              sounds.playPop();
            }}
            className={`py-3 rounded-xl font-extrabold text-base sm:text-lg transition-all cursor-pointer btn-tactile ${
              tab === 'login'
                ? 'bg-[#0284C7] text-white shadow-md border-b-3 border-[#0369A1]'
                : 'text-slate-600 hover:text-sky-700'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setErrorMessage('');
              sounds.playPop();
            }}
            className={`py-3 rounded-xl font-extrabold text-base sm:text-lg transition-all cursor-pointer btn-tactile ${
              tab === 'register'
                ? 'bg-[#0284C7] text-white shadow-md border-b-3 border-[#0369A1]'
                : 'text-slate-600 hover:text-sky-700'
            }`}
          >
            Cadastrar
          </button>
        </div>

        {/* Form Title & Subtitle */}
        <div className="text-center mb-5">
          <h2 className="text-xl sm:text-2xl font-black text-slate-800">
            {tab === 'login' ? 'Área do Responsável' : 'Criar Nova Conta da Família'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            {tab === 'login'
              ? 'Digite seus dados para acessar as fases e perfis.'
              : 'Cadastre-se para salvar o progresso dos seus pequenos.'}
          </p>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-amber-50 border-2 border-amber-300 rounded-2xl text-amber-900 text-sm font-bold flex items-center gap-2 animate-shake">
            <span className="text-xl">⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'register' && (
            <div>
              <label className="block text-xs uppercase tracking-wider font-extrabold text-slate-600 mb-1.5">
                Nome do Responsável
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="Ex: Mariana Silva"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-[#0284C7] focus:ring-4 focus:ring-sky-100 font-bold text-slate-800 outline-none transition-all"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs uppercase tracking-wider font-extrabold text-slate-600 mb-1.5">
              E-mail do Responsável
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-[#0284C7] focus:ring-4 focus:ring-sky-100 font-bold text-slate-800 outline-none transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-extrabold text-slate-600 mb-1.5">
              Senha
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo de 6 dígitos"
                className="w-full pl-11 pr-11 py-3 rounded-2xl border-2 border-slate-200 focus:border-[#0284C7] focus:ring-4 focus:ring-sky-100 font-bold text-slate-800 outline-none transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Submit Big Push Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[64px] rounded-full bg-[#16A34A] hover:bg-[#15803D] text-white font-black text-xl tracking-wide border-b-5 border-[#15803D] active:border-b-0 btn-tactile shadow-lg flex items-center justify-center gap-3 cursor-pointer mt-5"
          >
            {loading ? (
              <span className="animate-spin text-2xl">⏳</span>
            ) : (
              <>
                <span>{tab === 'login' ? 'Entrar no Aprendiz' : 'Finalizar Cadastro'}</span>
                <ArrowRight className="w-6 h-6" />
              </>
            )}
          </button>
        </form>

        {/* Separator */}
        <div className="my-5 flex items-center gap-3">
          <div className="flex-1 h-0.5 bg-slate-100" />
          <span className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">
            ou teste rápido
          </span>
          <div className="flex-1 h-0.5 bg-slate-100" />
        </div>

        {/* 1-Click Demo Login Button */}
        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={loading}
          className="w-full min-h-[56px] rounded-full bg-[#F59E0B] hover:bg-[#D97706] text-[#78350F] font-black text-base sm:text-lg border-b-4 border-[#B45309] active:border-b-0 btn-tactile shadow-md flex items-center justify-center gap-2.5 cursor-pointer"
        >
          <Sparkles className="w-5 h-5 text-amber-900 animate-spin" />
          <span>Acesso Rápido de Demonstração</span>
        </button>

        {/* Supabase Integration Status Pill */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-bold">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Ambiente Seguro Infantil
          </span>
          <span className="flex items-center gap-1">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                supabaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-sky-400'
              }`}
            />
            {supabaseConnected ? 'Supabase Conectado' : 'Modo Seguro Local'}
          </span>
        </div>
      </div>

      {/* Footer reassurance for parents */}
      <div className="text-center text-xs text-slate-400 font-medium">
        Desenvolvido com carinho para a primeira infância • Aprendiz Kids 2026
      </div>
    </div>
  );
};

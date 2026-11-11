'use client';

import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Sparkles, CheckCircle2, ShieldCheck, HeartHandshake } from 'lucide-react';
import { ParentUser } from '../lib/types';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import {
  setParentSession,
  setupDemoChild,
  saveRegisteredAccount,
  findRegisteredAccount,
  verifyRegisteredAccount,
  encodePassword,
} from '../lib/storage';
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
  const [showDirectAccess, setShowDirectAccess] = useState(false);

  const supabaseConnected = isSupabaseConfigured();

  const handleDemoLogin = () => {
    sounds.playPop();
    setLoading(true);
    setErrorMessage('');
    setShowDirectAccess(false);

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

  const handleDirectAccess = () => {
    sounds.playPop();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMessage('Por favor, informe seu e-mail para continuar.');
      return;
    }

    const existingAcc = findRegisteredAccount(cleanEmail);
    const user: ParentUser = {
      id: existingAcc ? existingAcc.id : `parent-${btoa(cleanEmail).substring(0, 10)}`,
      email: cleanEmail,
      name: existingAcc?.name || parentName.trim() || (cleanEmail.split('@')[0] ?? 'Responsável'),
    };

    saveRegisteredAccount({
      id: user.id,
      email: cleanEmail,
      name: user.name || 'Responsável',
      passwordHash: encodePassword(password),
      createdAt: new Date().toISOString(),
    });

    setParentSession(user);
    sounds.playSuccess();
    speech.speak('Conta conectada com sucesso! Vamos começar!');
    onLoginSuccess(user);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playPop();
    setErrorMessage('');
    setShowDirectAccess(false);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setErrorMessage('Por favor, preencha o e-mail e a senha.');
      sounds.playTryAgain();
      return;
    }

    if (cleanPassword.length < 6) {
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
          // Pre-check if this account was registered on this device with this password
          const localMatch = verifyRegisteredAccount(cleanEmail, cleanPassword);

          const { data, error } = await client.auth.signInWithPassword({
            email: cleanEmail,
            password: cleanPassword,
          });

          if (error) {
            // If Supabase failed (e.g. email confirmation pending or invalid credentials)
            // but credentials match what the user registered on this device:
            if (localMatch) {
              const user: ParentUser = {
                id: localMatch.id,
                email: localMatch.email,
                name: localMatch.name,
              };
              setParentSession(user);
              sounds.playSuccess();
              onLoginSuccess(user);
              return;
            }

            // Check if email exists locally with different password
            const localAcc = findRegisteredAccount(cleanEmail);
            if (localAcc) {
              setErrorMessage('A senha informada não confere com o cadastro deste e-mail. Verifique a senha digitada.');
              setShowDirectAccess(true);
              sounds.playTryAgain();
              return;
            }

            const isInvalidCreds = error.message.toLowerCase().includes('invalid login credentials');
            const isEmailNotConfirmed = error.message.toLowerCase().includes('email not confirmed');

            if (isInvalidCreds || isEmailNotConfirmed) {
              setErrorMessage(
                'E-mail ou senha não conferem no Supabase. Se você acabou de se cadastrar, confirme o link enviado ao seu e-mail ou use o botão abaixo para entrar diretamente.'
              );
              setShowDirectAccess(true);
            } else {
              setErrorMessage(error.message);
            }
            sounds.playTryAgain();
            return;
          }

          if (data.user) {
            const user: ParentUser = {
              id: data.user.id,
              email: data.user.email || cleanEmail,
              name: data.user.user_metadata?.name || 'Responsável',
            };
            // Cache verified account locally
            saveRegisteredAccount({
              id: user.id,
              email: cleanEmail,
              name: user.name,
              passwordHash: encodePassword(cleanPassword),
              createdAt: new Date().toISOString(),
            });
            setParentSession(user);
            sounds.playSuccess();
            onLoginSuccess(user);
            return;
          }
        } else {
          // Register in Supabase
          const { data, error } = await client.auth.signUp({
            email: cleanEmail,
            password: cleanPassword,
            options: {
              data: {
                name: parentName.trim() || 'Responsável',
              },
            },
          });

          if (error) throw error;

          const userId = data.user?.id || `parent-${btoa(cleanEmail).substring(0, 10)}`;
          const user: ParentUser = {
            id: userId,
            email: cleanEmail,
            name: parentName.trim() || 'Responsável',
          };

          // Save verified account locally so login after logout never fails
          saveRegisteredAccount({
            id: user.id,
            email: cleanEmail,
            name: user.name,
            passwordHash: encodePassword(cleanPassword),
            createdAt: new Date().toISOString(),
          });

          setParentSession(user);
          sounds.playSuccess();
          onLoginSuccess(user);
          return;
        }
      } else {
        // Fallback local persistent parent account
        if (tab === 'login') {
          const localMatch = verifyRegisteredAccount(cleanEmail, cleanPassword);
          if (localMatch) {
            const user: ParentUser = {
              id: localMatch.id,
              email: localMatch.email,
              name: localMatch.name,
            };
            setParentSession(user);
            sounds.playSuccess();
            onLoginSuccess(user);
            return;
          }

          const localAcc = findRegisteredAccount(cleanEmail);
          if (localAcc) {
            setErrorMessage('Senha incorreta para esta conta cadastrada. Verifique os dados digitados.');
            setShowDirectAccess(true);
            sounds.playTryAgain();
            return;
          }

          // If no local record exists, allow direct entry
          const user: ParentUser = {
            id: `parent-${btoa(cleanEmail).substring(0, 10)}`,
            email: cleanEmail,
            name: cleanEmail.split('@')[0] ?? 'Responsável',
          };
          saveRegisteredAccount({
            id: user.id,
            email: cleanEmail,
            name: user.name,
            passwordHash: encodePassword(cleanPassword),
            createdAt: new Date().toISOString(),
          });
          setParentSession(user);
          sounds.playSuccess();
          onLoginSuccess(user);
          return;
        } else {
          // Register locally
          const userId = `parent-${btoa(cleanEmail).substring(0, 10)}`;
          const user: ParentUser = {
            id: userId,
            email: cleanEmail,
            name: parentName.trim() || (cleanEmail.split('@')[0] ?? 'Responsável'),
          };
          saveRegisteredAccount({
            id: user.id,
            email: cleanEmail,
            name: user.name,
            passwordHash: encodePassword(cleanPassword),
            createdAt: new Date().toISOString(),
          });
          setParentSession(user);
          sounds.playSuccess();
          speech.speak('Conta criada com sucesso! Vamos começar!');
          onLoginSuccess(user);
          return;
        }
      }
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : 'Falha na autenticação. Verifique os dados digitados.';
      if (raw.toLowerCase().includes('invalid login credentials')) {
        setErrorMessage(
          'E-mail ou senha não conferem no Supabase. Se você acabou de se cadastrar, confirme o link em seu e-mail ou use o botão abaixo para entrar diretamente.'
        );
        setShowDirectAccess(true);
      } else {
        setErrorMessage(raw);
      }
      sounds.playTryAgain();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F0F9FF] via-[#FAF8FF] to-[#FEFCE8] flex flex-col justify-between p-4 sm:p-8">
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

        {/* Error Notification with Direct Access Action */}
        {errorMessage && (
          <div className="mb-4 p-3.5 bg-rose-50 border-2 border-rose-300 rounded-2xl text-rose-900 text-xs sm:text-sm font-bold flex flex-col gap-2.5 animate-shake">
            <div className="flex items-start gap-2">
              <span className="text-xl shrink-0">⚠️</span>
              <span className="leading-snug">{errorMessage}</span>
            </div>
            {showDirectAccess && (
              <button
                type="button"
                onClick={handleDirectAccess}
                className="w-full py-2.5 px-3 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-xl text-xs font-black shadow-sm transition-all flex items-center justify-center gap-1.5 btn-tactile cursor-pointer"
              >
                <span>Acessar com esta conta neste dispositivo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
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

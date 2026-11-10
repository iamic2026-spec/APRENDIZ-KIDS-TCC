'use client';

import React, { useState, useRef } from 'react';
import { Plus, User, Star, Camera, Check, ArrowRight, Trash2, Sparkles, Heart } from 'lucide-react';
import { ChildProfile } from '../lib/types';
import { getChildrenProfiles, createChildProfile, deleteChildProfile, setActiveChildId } from '../lib/storage';
import { sounds } from '../lib/soundEffects';
import { speech } from '../lib/speechService';
import { MascotPipoca } from './MascotPipoca';
import { AudioButton } from './AudioButton';
import { AnimatedChildAvatar } from './AnimatedChildAvatar';

interface ProfileSelectScreenProps {
  onSelectChild: (child: ChildProfile) => void;
  onLogout: () => void;
}

const AVATAR_OPTIONS = [
  { id: 'child_anim', icon: 'child_anim', label: 'Criança' },
  { id: 'owl', icon: '🦉', label: 'Pipoca' },
  { id: 'lion', icon: '🦁', label: 'Leãozinho' },
  { id: 'bear', icon: '🐻', label: 'Ursinho' },
  { id: 'dino', icon: '🦕', label: 'Dinossauro' },
  { id: 'giraffe', icon: '🦒', label: 'Girafinha' },
  { id: 'bunny', icon: '🐰', label: 'Coelhinho' },
  { id: 'astro', icon: '🚀', label: 'Astronauta' },
];

export const ProfileSelectScreen: React.FC<ProfileSelectScreenProps> = ({
  onSelectChild,
  onLogout,
}) => {
  const [children, setChildren] = useState<ChildProfile[]>(() => getChildrenProfiles());
  const [isCreating, setIsCreating] = useState(false);
  
  // New profile form state
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(6);
  const [selectedAvatar, setSelectedAvatar] = useState('child_anim');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSelect = (child: ChildProfile) => {
    sounds.playPop();
    setActiveChildId(child.id);
    if (child.name) {
      speech.speak(`Oi, ${child.name}! Que bom ter você aqui! Vamos jogar?`);
    } else {
      speech.speak('Olá! Que bom ter você aqui! Vamos jogar e aprender juntos?');
    }
    onSelectChild(child);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Por favor, selecione uma foto menor que 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
      sounds.playSuccess();
    };
    reader.readAsDataURL(file);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    sounds.playSuccess();
    const newChild = createChildProfile(
      name,
      age,
      selectedAvatar,
      photoPreview || undefined
    );

    setChildren(getChildrenProfiles());
    setIsCreating(false);
    speech.speak(`Perfil de ${newChild.name} criado com sucesso! Vamos começar!`);
    onSelectChild(newChild);
  };

  const handleDelete = (e: React.MouseEvent, id: string, childName: string) => {
    e.stopPropagation();
    if (confirm(`Deseja remover o perfil de ${childName}?`)) {
      sounds.playPop();
      deleteChildProfile(id);
      setChildren(getChildrenProfiles());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F0F9FF] via-[#FAF8FF] to-[#FEFCE8] p-4 sm:p-8 flex flex-col justify-between">
      {/* Top Header */}
      <div className="max-w-4xl mx-auto w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🦉</span>
            <span className="text-2xl font-black text-[#0284C7]">Aprendiz Kids</span>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="px-4 py-2 text-sm font-extrabold text-slate-500 hover:text-slate-800 bg-white rounded-full border border-slate-200 btn-tactile"
          >
            Trocar Responsável
          </button>
        </div>

        {/* Mascot & Title */}
        <div className="text-center my-4">
          <div className="flex justify-center mb-3">
            <MascotPipoca size="md" mood="neutral" />
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-[#0F172A] tracking-tight">
            {isCreating ? 'Novo Pequeno Aprendiz' : 'Quem vai aprender hoje?'}
          </h1>
          <p className="text-slate-600 font-bold text-base sm:text-lg mt-1">
            {isCreating
              ? 'Personalize com nome, idade e uma linda foto!'
              : 'Escolha seu perfil para continuar sua aventura nas letrinhas!'}
          </p>

          <div className="mt-3 flex justify-center">
            <AudioButton
              textToSpeak={
                isCreating
                  ? 'Digite o nome do seu pequeno ou pequena, escolha a idade e envie uma foto bem bonita!'
                  : 'Toque na sua foto ou no seu nome para começar a brincar!'
              }
              label="Ouvir Instruções"
              variant="secondary"
            />
          </div>
        </div>

        {/* Content Area */}
        {!isCreating ? (
          /* Profile Selector Grid */
          <div className="my-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 max-w-3xl mx-auto">
              {children.map((child) => (
                <div
                  key={child.id}
                  onClick={() => handleSelect(child)}
                  className="bg-white rounded-3xl p-6 border-3 border-sky-100 hover:border-sky-400 shadow-md hover:shadow-xl transition-all cursor-pointer relative group btn-tactile text-center"
                >
                  {/* Delete button (for parents) */}
                  {children.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, child.id, child.name)}
                      className="absolute top-3 right-3 text-slate-300 hover:text-rose-500 p-1.5 rounded-full hover:bg-rose-50 transition-colors"
                      title="Excluir perfil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  {/* Photo or Avatar */}
                  <div className="w-24 h-24 mx-auto rounded-full overflow-hidden bg-sky-100 border-4 border-sky-300 shadow-inner flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    {child.photoUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={child.photoUrl}
                        alt={child.name || 'Aprendiz'}
                        className="w-full h-full object-cover"
                      />
                    ) : child.avatar === 'child_anim' ? (
                      <AnimatedChildAvatar size="lg" />
                    ) : (
                      <span className="text-5xl select-none">{child.avatar}</span>
                    )}
                  </div>

                  {/* Name & Age */}
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                    {child.name || 'Pequeno Aprendiz'}
                  </h3>
                  <p className="text-sm font-extrabold text-sky-600 mb-3">
                    {child.age} anos • Fase {child.level}
                  </p>

                  {/* Stars Pill */}
                  <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-50 border-2 border-amber-300 rounded-full text-amber-800 font-black text-sm">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                    <span>{child.stars} estrelas</span>
                  </div>

                  {/* Action prompt */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-2 text-sky-600 font-extrabold text-sm group-hover:text-sky-700">
                    <span>Jogar agora</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}

              {/* Add New Profile Card */}
              <div
                onClick={() => {
                  sounds.playPop();
                  setIsCreating(true);
                }}
                className="bg-sky-50/70 hover:bg-sky-50 border-3 border-dashed border-sky-300 hover:border-sky-500 rounded-3xl p-6 flex flex-col items-center justify-center text-center cursor-pointer min-h-[220px] transition-all btn-tactile"
              >
                <div className="w-16 h-16 rounded-full bg-white border-2 border-sky-300 text-sky-600 flex items-center justify-center mb-3 shadow-sm">
                  <Plus className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-black text-sky-800">Novo Perfil</h4>
                <p className="text-xs font-bold text-sky-600 mt-1 max-w-[180px]">
                  Adicionar outra criança da família
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Create Profile Form */
          <div className="max-w-lg mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-3 border-sky-100 my-4">
            <form onSubmit={handleCreateSubmit} className="space-y-5">
              {/* Photo Upload Area */}
              <div className="text-center">
                <label className="block text-xs uppercase tracking-wider font-extrabold text-slate-600 mb-2">
                  Foto da Criança (Opcional)
                </label>
                
                <div className="relative inline-block">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-28 h-28 mx-auto rounded-full overflow-hidden bg-sky-100 border-4 border-sky-300 hover:border-sky-500 shadow-inner flex items-center justify-center cursor-pointer group transition-all"
                  >
                    {photoPreview ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={photoPreview}
                        alt="Prévia"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center text-sky-600">
                        {selectedAvatar === 'child_anim' ? (
                          <AnimatedChildAvatar size="md" />
                        ) : (
                          <span className="text-4xl">{selectedAvatar}</span>
                        )}
                        <span className="text-[10px] font-black uppercase mt-1 bg-white/80 px-2 py-0.5 rounded-full">
                          Mudar foto
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-full shadow-lg border-2 border-white btn-tactile cursor-pointer"
                    title="Carregar foto do computador ou celular"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />

                {photoPreview && (
                  <button
                    type="button"
                    onClick={() => setPhotoPreview(null)}
                    className="block mx-auto mt-2 text-xs text-rose-500 font-bold hover:underline"
                  >
                    Remover foto enviada
                  </button>
                )}
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-extrabold text-slate-600 mb-1.5">
                  Nome da Criança
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Sofia, Lucas, Pedro..."
                  className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-[#0284C7] focus:ring-4 focus:ring-sky-100 font-black text-xl text-slate-800 outline-none"
                  required
                  autoFocus
                />
              </div>

              {/* Age Selection */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-extrabold text-slate-600 mb-2">
                  Idade da Criança
                </label>
                <div className="grid grid-cols-4 gap-2.5">
                  {[5, 6, 7, 8].map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => {
                        sounds.playPop();
                        setAge(a);
                      }}
                      className={`py-3 rounded-2xl font-black text-lg sm:text-xl border-b-4 transition-all btn-tactile cursor-pointer ${
                        age === a
                          ? 'bg-[#F59E0B] text-[#78350F] border-[#B45309] shadow-md'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                      }`}
                    >
                      {a} anos
                    </button>
                  ))}
                </div>
              </div>

              {/* Avatar Preset Selection if no custom photo */}
              {!photoPreview && (
                <div>
                  <label className="block text-xs uppercase tracking-wider font-extrabold text-slate-600 mb-2">
                    Ou escolha um mascote amigo
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {AVATAR_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          sounds.playPop();
                          setSelectedAvatar(opt.icon);
                        }}
                        className={`p-2.5 rounded-2xl flex flex-col items-center border-2 transition-all btn-tactile cursor-pointer ${
                          selectedAvatar === opt.icon
                            ? 'bg-sky-100 border-[#0284C7] ring-2 ring-sky-300'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {opt.icon === 'child_anim' ? (
                          <AnimatedChildAvatar size="sm" />
                        ) : (
                          <span className="text-3xl">{opt.icon}</span>
                        )}
                        <span className="text-[11px] font-extrabold text-slate-600 mt-1">
                          {opt.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="flex-1 min-h-[56px] rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-base border-b-3 border-slate-300 btn-tactile cursor-pointer"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="flex-2 min-h-[60px] rounded-full bg-[#16A34A] hover:bg-[#15803D] text-white font-black text-xl border-b-5 border-[#15803D] active:border-b-0 btn-tactile shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check className="w-6 h-6" />
                  <span>Salvar Perfil</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      <div className="text-center text-xs text-slate-400 font-medium py-2">
        Aprendiz Kids • Alfabetização Divertida
      </div>
    </div>
  );
};

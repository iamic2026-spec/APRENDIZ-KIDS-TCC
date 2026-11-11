'use client';

import React, { useState, useRef } from 'react';
import {
  Plus,
  User,
  Star,
  Camera,
  Check,
  ArrowRight,
  Trash2,
  Sparkles,
  Smile,
  Pencil,
  X,
  AlertTriangle,
  Play,
} from 'lucide-react';
import { ChildProfile } from '../lib/types';
import {
  getChildrenProfiles,
  createChildProfile,
  updateChildProfile,
  deleteChildProfile,
  setActiveChildId,
} from '../lib/storage';
import { sounds } from '../lib/soundEffects';
import { speech } from '../lib/speechService';
import { MascotPipoca } from './MascotPipoca';
import { AudioButton } from './AudioButton';
import { ChildAvatarRenderer, ANIMATED_AVATAR_LIST } from './ChildAvatarRenderer';
import { resizeImageToAvatar } from '../lib/imageUtils';

interface ProfileSelectScreenProps {
  activeChildId?: string;
  onSelectChild: (child: ChildProfile) => void;
  onChildUpdated?: (child: ChildProfile) => void;
  onChildDeleted?: (deletedId: string) => void;
  onLogout: () => void;
}

export const ProfileSelectScreen: React.FC<ProfileSelectScreenProps> = ({
  activeChildId,
  onSelectChild,
  onChildUpdated,
  onChildDeleted,
  onLogout,
}) => {
  const [children, setChildren] = useState<ChildProfile[]>(() => getChildrenProfiles());
  const [isCreating, setIsCreating] = useState(() => children.length === 0);
  const [editingChild, setEditingChild] = useState<ChildProfile | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(6);
  const [avatarMode, setAvatarMode] = useState<'animated' | 'upload'>('animated');
  const [selectedAvatar, setSelectedAvatar] = useState('child_anim');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
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

  const handleOpenCreate = () => {
    sounds.playPop();
    setEditingChild(null);
    setName('');
    setAge(6);
    setAvatarMode('animated');
    setSelectedAvatar('child_anim');
    setPhotoPreview(null);
    setIsCreating(true);
  };

  const handleOpenEdit = (e: React.MouseEvent, child: ChildProfile) => {
    e.stopPropagation();
    sounds.playPop();
    setEditingChild(child);
    setName(child.name);
    setAge(child.age);
    if (child.photoUrl) {
      setAvatarMode('upload');
      setPhotoPreview(child.photoUrl);
      setSelectedAvatar(child.avatar || 'child_anim');
    } else {
      setAvatarMode('animated');
      setSelectedAvatar(child.avatar || 'child_anim');
      setPhotoPreview(null);
    }
    setIsCreating(false);
  };

  const handleCancelForm = () => {
    sounds.playPop();
    setIsCreating(false);
    setEditingChild(null);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingPhoto(true);
      // Compact resize using canvas to prevent localStorage quota issues
      const compressedDataUrl = await resizeImageToAvatar(file, 240, 0.85);
      setPhotoPreview(compressedDataUrl);
      setAvatarMode('upload');
      sounds.playSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao carregar foto.';
      alert(msg);
      sounds.playTryAgain();
    } finally {
      setIsUploadingPhoto(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Por favor, informe o nome da criança.');
      return;
    }

    sounds.playSuccess();
    const finalPhoto = avatarMode === 'upload' ? (photoPreview || undefined) : undefined;
    const finalAvatar = selectedAvatar || 'child_anim';

    if (editingChild) {
      // Salvar alterações mantendo estrelas e progresso
      const updated = updateChildProfile(editingChild.id, {
        name,
        age,
        avatar: finalAvatar,
        photoUrl: finalPhoto,
      });

      if (updated) {
        const remaining = getChildrenProfiles();
        setChildren(remaining);
        setEditingChild(null);
        speech.speak(`Perfil de ${updated.name} atualizado com sucesso!`);
        onChildUpdated?.(updated);
        onSelectChild(updated);
      }
    } else {
      // Criar novo perfil
      const newChild = createChildProfile(
        name,
        age,
        finalAvatar,
        finalPhoto
      );

      const remaining = getChildrenProfiles();
      setChildren(remaining);
      setIsCreating(false);
      speech.speak(`Perfil de ${newChild.name} cadastrado com sucesso! Vamos começar!`);
      onSelectChild(newChild);
    }
  };

  const handleDeleteProfile = (id: string, childName: string) => {
    sounds.playPop();
    const remaining = deleteChildProfile(id);
    setChildren(remaining);
    setConfirmDeleteId(null);
    if (editingChild?.id === id) {
      setEditingChild(null);
    }
    onChildDeleted?.(id);

    if (remaining.length === 0) {
      handleOpenCreate();
    } else {
      speech.speak(`Perfil de ${childName || 'Aprendiz'} excluído com sucesso.`);
    }
  };

  const isFormActive = isCreating || editingChild !== null;

  return (
    <div className="min-h-screen bg-kid-animated-gradient p-4 sm:p-8 flex flex-col justify-between">
      {/* Top Header */}
      <div className="max-w-4xl mx-auto w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-3xl animate-bounce">🦉</span>
            <span className="text-2xl font-black text-[#0284C7] drop-shadow-sm">Aprendiz Kids</span>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="px-4 py-2 text-sm font-extrabold text-slate-600 hover:text-slate-900 bg-white/90 rounded-full border border-slate-200 btn-tactile shadow-sm cursor-pointer"
          >
            Trocar Responsável
          </button>
        </div>

        {/* Mascot & Title */}
        <div className="text-center my-4">
          <div className="flex justify-center mb-3">
            <MascotPipoca size="md" mood={isFormActive ? 'encouraging' : 'neutral'} />
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-[#0F172A] tracking-tight">
            {editingChild
              ? `Editar Perfil de ${editingChild.name || 'Aprendiz'}`
              : isCreating
              ? 'Cadastrar Perfil da Criança'
              : children.length === 0
              ? 'Bem-vindo ao Aprendiz Kids!'
              : 'Quem vai aprender hoje?'}
          </h1>
          <p className="text-slate-700 font-bold text-base sm:text-lg mt-1 max-w-xl mx-auto">
            {editingChild
              ? 'Altere o nome, idade ou troque a foto e avatar da criança.'
              : isCreating
              ? 'Informe o nome, idade e escolha entre uma foto do seu aparelho ou um avatar animado!'
              : children.length === 0
              ? 'Nenhum perfil cadastrado ainda. Crie o perfil do seu pequeno para começar!'
              : 'Selecione o perfil para jogar ou toque em Editar para alterar dados!'}
          </p>

          <div className="mt-3 flex justify-center">
            <AudioButton
              textToSpeak={
                editingChild
                  ? `Você está editando o perfil de ${editingChild.name || 'Aprendiz'}. Altere o nome, idade, foto ou avatar, ou exclua o perfil se desejar.`
                  : isCreating
                  ? 'Digite o nome da criança, escolha a idade e decida entre enviar uma foto real ou escolher um avatar animado bem divertido!'
                  : children.length === 0
                  ? 'Cadastre o perfil da criança para abrir o mundo das letrinhas e dos números!'
                  : 'Toque no perfil com a foto ou avatar da criança para começar! Você também pode editar ou excluir perfis.'
              }
              label="Ouvir Instruções"
              variant="secondary"
            />
          </div>
        </div>

        {/* Mode 1: Profile Selector Grid (when not creating or editing) */}
        {!isFormActive && children.length > 0 ? (
          <div className="my-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 max-w-3xl mx-auto">
              {children.map((child) => {
                const isActive = child.id === activeChildId;
                return (
                  <div
                    key={child.id}
                    className={`bg-white/95 backdrop-blur-sm rounded-3xl p-5 sm:p-6 border-3 transition-all relative group text-center shadow-md hover:shadow-xl ${
                      isActive
                        ? 'border-sky-500 ring-4 ring-sky-200'
                        : 'border-sky-200 hover:border-sky-400'
                    }`}
                  >
                    {/* Top Action Bar: Edit & Delete buttons */}
                    <div className="flex items-center justify-between mb-2">
                      {isActive ? (
                        <span className="text-[10px] font-black uppercase tracking-wider bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full border border-sky-300">
                          Perfil Atual
                        </span>
                      ) : (
                        <span />
                      )}

                      <div className="flex items-center gap-1.5 ml-auto">
                        <button
                          type="button"
                          onClick={(e) => handleOpenEdit(e, child)}
                          className="p-1.5 rounded-full bg-slate-100 hover:bg-sky-100 text-slate-600 hover:text-sky-700 transition-colors btn-tactile cursor-pointer"
                          title={`Editar perfil de ${child.name}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteId(child.id);
                          }}
                          className="p-1.5 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 transition-colors btn-tactile cursor-pointer"
                          title={`Excluir perfil de ${child.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Photo or Animated Avatar */}
                    <div
                      onClick={() => handleSelect(child)}
                      className="cursor-pointer"
                    >
                      <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-full overflow-hidden bg-gradient-to-tr from-sky-100 to-amber-100 border-4 border-sky-300 shadow-inner flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                        {child.photoUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={child.photoUrl}
                            alt={child.name || 'Aprendiz'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ChildAvatarRenderer avatarId={child.avatar} size="lg" />
                        )}
                      </div>

                      {/* Nome da Criança em Destaque */}
                      <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-snug">
                        {child.name || 'Pequeno Aprendiz'}
                      </h3>
                      <p className="text-sm font-extrabold text-sky-600 mb-2">
                        {child.age} anos • Fase {child.level} de 5
                      </p>

                      {/* Stars Pill */}
                      <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-amber-50 border-2 border-amber-300 rounded-full text-amber-800 font-black text-xs sm:text-sm shadow-sm mb-4">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-500 animate-wiggle" />
                        <span>{child.stars} estrelas</span>
                      </div>
                    </div>

                    {/* Big Direct "Jogar" Button */}
                    <button
                      type="button"
                      onClick={() => handleSelect(child)}
                      className="w-full min-h-[50px] rounded-full bg-[#0284C7] hover:bg-[#0369A1] text-white font-black text-base border-b-4 border-[#0369A1] active:border-b-0 btn-tactile shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Jogar Agora</span>
                    </button>
                  </div>
                );
              })}

              {/* Add New Profile Card */}
              <div
                onClick={handleOpenCreate}
                className="bg-white/80 hover:bg-white border-3 border-dashed border-sky-300 hover:border-sky-500 rounded-3xl p-6 flex flex-col items-center justify-center text-center cursor-pointer min-h-[260px] transition-all btn-tactile shadow-sm hover:shadow-lg"
              >
                <div className="w-16 h-16 rounded-full bg-sky-100 border-2 border-sky-300 text-sky-600 flex items-center justify-center mb-3 shadow-inner">
                  <Plus className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-black text-sky-800">Novo Perfil</h4>
                <p className="text-xs font-bold text-sky-600 mt-1 max-w-[180px]">
                  Cadastrar outra criança na família
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Mode 2: Enhanced Profile Form (Create OR Edit) */
          <div className="max-w-xl mx-auto bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-sky-200 my-4">
            <form onSubmit={handleFormSubmit} className="space-y-6">
              
              {/* Top Form Header with Close/Back */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xl">
                    {editingChild ? '✏️' : '🌟'}
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-slate-800">
                    {editingChild ? 'Alterar Dados do Perfil' : 'Novo Perfil Infantil'}
                  </h3>
                </div>

                {children.length > 0 && (
                  <button
                    type="button"
                    onClick={handleCancelForm}
                    className="p-1.5 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full cursor-pointer"
                    title="Cancelar"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* STEP 1: Two Clear Options for Child Picture/Avatar */}
              <div>
                <span className="block text-xs uppercase tracking-wider font-extrabold text-slate-600 mb-2.5 text-center">
                  Escolha como será a imagem do perfil:
                </span>

                <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl border-2 border-slate-200 mb-5">
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playPop();
                      setAvatarMode('animated');
                    }}
                    className={`py-3 px-2 rounded-xl font-black text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer btn-tactile ${
                      avatarMode === 'animated'
                        ? 'bg-[#0284C7] text-white shadow-md border-b-3 border-[#0369A1]'
                        : 'text-slate-600 hover:text-sky-700'
                    }`}
                  >
                    <Smile className="w-5 h-5" />
                    <span>Avatar Animado</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sounds.playPop();
                      setAvatarMode('upload');
                    }}
                    className={`py-3 px-2 rounded-xl font-black text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer btn-tactile ${
                      avatarMode === 'upload'
                        ? 'bg-[#0284C7] text-white shadow-md border-b-3 border-[#0369A1]'
                        : 'text-slate-600 hover:text-sky-700'
                    }`}
                  >
                    <Camera className="w-5 h-5" />
                    <span>Foto do Aparelho</span>
                  </button>
                </div>

                {/* OPTION A: UPLOAD PHOTO FROM DEVICE */}
                {avatarMode === 'upload' ? (
                  <div className="bg-sky-50/70 rounded-3xl p-5 border-2 border-sky-200 text-center">
                    <div className="relative inline-block mb-3">
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-28 h-28 sm:w-32 sm:h-32 mx-auto rounded-full overflow-hidden bg-white border-4 border-sky-300 hover:border-sky-500 shadow-lg flex items-center justify-center cursor-pointer group transition-all"
                      >
                        {photoPreview ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={photoPreview}
                            alt="Prévia"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center text-sky-600 p-2">
                            <Camera className="w-10 h-10 mb-1 group-hover:scale-110 transition-transform" />
                            <span className="text-[11px] font-black uppercase text-center leading-tight">
                              Toque para escolher foto
                            </span>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-1 right-1 p-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-full shadow-lg border-2 border-white btn-tactile cursor-pointer"
                        title="Carregar foto do aparelho"
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

                    <div className="flex flex-col items-center gap-2 mt-1">
                      <button
                        type="button"
                        disabled={isUploadingPhoto}
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-white border-2 border-sky-300 hover:border-sky-500 text-sky-700 rounded-full font-black text-xs sm:text-sm btn-tactile shadow-sm cursor-pointer"
                      >
                        {isUploadingPhoto
                          ? 'Processando foto...'
                          : photoPreview
                          ? 'Trocar Foto'
                          : 'Selecionar Foto (Galeria ou Câmera)'}
                      </button>

                      {photoPreview && (
                        <button
                          type="button"
                          onClick={() => {
                            sounds.playPop();
                            setPhotoPreview(null);
                            setAvatarMode('animated');
                          }}
                          className="text-xs text-rose-500 font-bold hover:underline cursor-pointer"
                        >
                          Remover foto e usar avatar animado
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  /* OPTION B: CHOOSE FROM FUN ANIMATED AVATARS */
                  <div className="bg-amber-50/60 rounded-3xl p-4 sm:p-5 border-2 border-amber-200">
                    {/* Live Big Preview of Selected Avatar */}
                    <div className="flex items-center justify-center gap-4 mb-4 pb-3 border-b border-amber-200/80">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white border-4 border-amber-400 shadow-md flex items-center justify-center">
                        <ChildAvatarRenderer avatarId={selectedAvatar} size="lg" />
                      </div>
                      <div className="text-left">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                          Avatar Selecionado
                        </span>
                        <h4 className="text-lg sm:text-xl font-black text-slate-800 mt-1">
                          {ANIMATED_AVATAR_LIST.find((a) => a.id === selectedAvatar)?.name || 'Mascote Amigo'}
                        </h4>
                        <span className="text-xs font-bold text-slate-500">
                          Com olhinhos e expressões animadas!
                        </span>
                      </div>
                    </div>

                    {/* Grid of Animated Avatars */}
                    <div className="grid grid-cols-4 gap-2.5">
                      {ANIMATED_AVATAR_LIST.map((opt) => {
                        const isSelected = selectedAvatar === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              sounds.playPop();
                              setSelectedAvatar(opt.id);
                              setPhotoPreview(null);
                            }}
                            className={`p-2 rounded-2xl flex flex-col items-center transition-all btn-tactile cursor-pointer relative ${
                              isSelected
                                ? 'bg-white border-3 border-amber-500 shadow-lg ring-3 ring-amber-300 scale-105'
                                : 'bg-white/80 border-2 border-amber-200 hover:border-amber-400'
                            }`}
                          >
                            <ChildAvatarRenderer avatarId={opt.id} size="sm" />
                            <span className="text-[11px] font-black text-slate-800 mt-1 text-center line-clamp-1">
                              {opt.name}
                            </span>
                            {isSelected && (
                              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-500 text-white rounded-full flex items-center justify-center shadow-sm">
                                <Check className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* STEP 2: Child's Name */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-extrabold text-slate-600 mb-1.5">
                  Nome da Criança <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-6 h-6 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Sofia, Lucas, Pedro, Mariana..."
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-slate-300 focus:border-[#0284C7] focus:ring-4 focus:ring-sky-100 font-black text-xl text-slate-800 outline-none"
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* STEP 3: Age Selection */}
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

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  {children.length > 0 && (
                    <button
                      type="button"
                      onClick={handleCancelForm}
                      className="flex-1 min-h-[58px] rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-base border-b-3 border-slate-300 btn-tactile cursor-pointer"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-2 min-h-[58px] rounded-full bg-[#16A34A] hover:bg-[#15803D] text-white font-black text-lg sm:text-xl border-b-5 border-[#15803D] active:border-b-0 btn-tactile shadow-xl flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Check className="w-6 h-6" />
                    <span>{editingChild ? 'Salvar Alterações' : 'Cadastrar e Começar!'}</span>
                  </button>
                </div>

                {/* Explicit Delete Option inside Edit Mode */}
                {editingChild && (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(editingChild.id)}
                    className="w-full py-2.5 rounded-full text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-black text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Excluir este perfil permanentemente</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border-4 border-rose-200 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-black text-slate-800">
              Excluir este perfil?
            </h3>

            <p className="text-sm font-bold text-slate-600">
              O perfil e todo o progresso de estrelas acumuladas serão removidos. Esta ação não pode ser desfeita.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-sm border-b-3 border-slate-300 btn-tactile cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={() => {
                  const target = children.find((c) => c.id === confirmDeleteId);
                  handleDeleteProfile(confirmDeleteId, target?.name || '');
                }}
                className="flex-1 py-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-black text-sm border-b-4 border-rose-800 active:border-b-0 btn-tactile shadow-md cursor-pointer"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="text-center text-xs text-slate-500 font-bold py-2">
        Aprendiz Kids • Alfabetização Lúdica e Divertida
      </div>
    </div>
  );
};

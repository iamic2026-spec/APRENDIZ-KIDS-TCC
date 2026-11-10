-- ==============================================================================
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

-- RLS: Habilitar Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pais podem visualizar seus próprios perfis" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Pais podem atualizar seus próprios perfis" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- 2. TABELA DE CRIANÇAS CADASTRADAS PELO RESPONSÁVEL
CREATE TABLE IF NOT EXISTS public.children (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 4 AND age <= 12),
  avatar TEXT NOT NULL DEFAULT 'owl',
  photo_url TEXT,
  stars INTEGER DEFAULT 0 NOT NULL,
  current_level INTEGER DEFAULT 1 NOT NULL,
  total_correct INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pais podem gerenciar suas crianças" 
ON public.children FOR ALL 
USING (auth.uid() = parent_id);

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
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

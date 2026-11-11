import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ChildProfile, ParentUser } from './types';

// Read environment variables or custom localStorage override
const getSupabaseConfig = () => {
  if (typeof window === 'undefined') {
    return {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    };
  }

  const customUrl = localStorage.getItem('aprendiz_kids_custom_supabase_url');
  const customKey = localStorage.getItem('aprendiz_kids_custom_supabase_key');

  return {
    url: customUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    key: customKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  };
};

let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key || url.includes('your-project')) {
    return null;
  }
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (e) {
      console.warn('Falha ao inicializar cliente Supabase:', e);
      return null;
    }
  }
  return supabaseInstance;
};

export const isSupabaseConfigured = (): boolean => {
  const client = getSupabaseClient();
  return client !== null;
};

// Supabase repository adapter with seamless fallback to browser localStorage
export const supabaseRepo = {
  async saveChildProfile(child: ChildProfile, parentId: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { error } = await client.from('children').upsert({
          id: child.id,
          parent_id: parentId,
          name: child.name,
          age: child.age,
          avatar: child.avatar,
          photo_url: child.photoUrl,
          stars: child.stars,
          current_level: child.level,
          total_correct: child.totalCorrect,
          updated_at: new Date().toISOString(),
        });
        if (error) throw error;
        return true;
      } catch (err) {
        console.warn('Erro ao sincronizar com Supabase:', err);
      }
    }
    return false;
  },

  async deleteChildProfile(childId: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { error } = await client.from('children').delete().eq('id', childId);
        if (error) throw error;
        return true;
      } catch (err) {
        console.warn('Erro ao remover do Supabase:', err);
      }
    }
    return false;
  },

  async recordActivity(childId: string, levelId: number, activityId: string, type: string, isCorrect: boolean): Promise<void> {
    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('activity_history').insert({
          child_id: childId,
          level_id: levelId,
          activity_id: activityId,
          activity_type: type,
          is_correct: isCorrect,
        });
      } catch {
        // Silent fallback
      }
    }
  },

  setCustomConfig(url: string, key: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('aprendiz_kids_custom_supabase_url', url);
      localStorage.setItem('aprendiz_kids_custom_supabase_key', key);
      supabaseInstance = null; // Reset instance to recreate
    }
  },

  clearCustomConfig(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('aprendiz_kids_custom_supabase_url');
      localStorage.removeItem('aprendiz_kids_custom_supabase_key');
      supabaseInstance = null;
    }
  },

  getConfig(): { url: string; key: string } {
    return getSupabaseConfig();
  }
};

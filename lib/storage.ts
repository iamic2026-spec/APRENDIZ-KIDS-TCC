import { ChildProfile, ParentUser } from './types';
import { supabaseRepo } from './supabase';

const PARENT_SESSION_KEY = 'aprendiz_kids_parent_session';
const CHILDREN_KEY = 'aprendiz_kids_children_profiles';
const ACTIVE_CHILD_KEY = 'aprendiz_kids_active_child_id';

// Default initial profiles if first time
const DEFAULT_CHILDREN: ChildProfile[] = [
  {
    id: 'child-demo',
    name: '', // Sem nome na demonstração
    age: 6,
    avatar: 'child_anim', // Rosto padrão de criança de animação
    stars: 8,
    level: 1,
    unlockedLevels: [1],
    totalCorrect: 8,
    completedActivities: ['l1-act1', 'l1-act2'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'child-sofia',
    name: 'Sofia',
    age: 6,
    avatar: '🦉', // Pipoca
    stars: 8,
    level: 1,
    unlockedLevels: [1],
    totalCorrect: 8,
    completedActivities: ['l1-act1', 'l1-act2'],
    createdAt: new Date().toISOString(),
  },
];

export const setupDemoChild = (): ChildProfile => {
  const demoChild: ChildProfile = {
    id: 'child-demo',
    name: '', // Sem nome
    age: 6,
    avatar: 'child_anim', // Rosto de criança de animação
    stars: 8,
    level: 1,
    unlockedLevels: [1],
    totalCorrect: 8,
    completedActivities: ['l1-act1', 'l1-act2'],
    createdAt: new Date().toISOString(),
  };

  const existing = getChildrenProfiles().filter(c => c.id !== 'child-demo');
  const updated = [demoChild, ...existing];
  saveChildrenProfiles(updated);
  setActiveChildId(demoChild.id);
  return demoChild;
};

export const getParentSession = (): ParentUser | null => {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(PARENT_SESSION_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};

export const setParentSession = (user: ParentUser | null): void => {
  if (typeof window === 'undefined') return;
  if (!user) {
    localStorage.removeItem(PARENT_SESSION_KEY);
  } else {
    localStorage.setItem(PARENT_SESSION_KEY, JSON.stringify(user));
  }
};

export const getChildrenProfiles = (): ChildProfile[] => {
  if (typeof window === 'undefined') return DEFAULT_CHILDREN;
  const data = localStorage.getItem(CHILDREN_KEY);
  if (!data) {
    localStorage.setItem(CHILDREN_KEY, JSON.stringify(DEFAULT_CHILDREN));
    return DEFAULT_CHILDREN;
  }
  try {
    return JSON.parse(data);
  } catch {
    return DEFAULT_CHILDREN;
  }
};

export const saveChildrenProfiles = (children: ChildProfile[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CHILDREN_KEY, JSON.stringify(children));
};

export const getActiveChildId = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACTIVE_CHILD_KEY);
};

export const setActiveChildId = (id: string | null): void => {
  if (typeof window === 'undefined') return;
  if (!id) {
    localStorage.removeItem(ACTIVE_CHILD_KEY);
  } else {
    localStorage.setItem(ACTIVE_CHILD_KEY, id);
  }
};

export const getActiveChild = (): ChildProfile | null => {
  const children = getChildrenProfiles();
  const activeId = getActiveChildId();
  if (!activeId) return children[0] || null;
  return children.find(c => c.id === activeId) || children[0] || null;
};

export const updateChildProgress = (
  childId: string, 
  activityId: string, 
  levelId: number, 
  isCorrect: boolean
): { child: ChildProfile; leveledUp: boolean; earnedStar: boolean } => {
  const children = getChildrenProfiles();
  const index = children.findIndex(c => c.id === childId);
  if (index === -1) {
    const fallback = DEFAULT_CHILDREN[0];
    return { child: fallback, leveledUp: false, earnedStar: false };
  }

  const child = { ...children[index] };
  let leveledUp = false;
  let earnedStar = false;

  if (isCorrect) {
    // Increment stars
    child.stars += 1;
    child.totalCorrect += 1;
    earnedStar = true;

    if (!child.completedActivities.includes(activityId)) {
      child.completedActivities = [...child.completedActivities, activityId];
    }

    // Regra: a cada 10 acertos sobe de nível e desbloqueia nova fase!
    const calculatedLevel = Math.min(5, Math.floor(child.totalCorrect / 10) + 1);
    if (calculatedLevel > child.level) {
      child.level = calculatedLevel;
      leveledUp = true;
    }

    // Also unlock the next level if not unlocked
    const nextLevel = Math.min(5, levelId + 1);
    if (!child.unlockedLevels.includes(nextLevel) && (child.totalCorrect >= levelId * 5 || leveledUp)) {
      child.unlockedLevels = [...child.unlockedLevels, nextLevel].sort();
    }
  }

  children[index] = child;
  saveChildrenProfiles(children);

  // Sync with Supabase asynchronously
  const parent = getParentSession();
  if (parent) {
    supabaseRepo.saveChildProfile(child, parent.id).catch(() => {});
    supabaseRepo.recordActivity(child.id, levelId, activityId, 'activity', isCorrect).catch(() => {});
  }

  return { child, leveledUp, earnedStar };
};

export const createChildProfile = (name: string, age: number, avatar: string, photoUrl?: string): ChildProfile => {
  const children = getChildrenProfiles();
  const newChild: ChildProfile = {
    id: `child-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    name: name.trim(),
    age,
    avatar,
    photoUrl,
    stars: 0,
    level: 1,
    unlockedLevels: [1],
    totalCorrect: 0,
    completedActivities: [],
    createdAt: new Date().toISOString(),
  };

  const updated = [...children, newChild];
  saveChildrenProfiles(updated);
  setActiveChildId(newChild.id);

  const parent = getParentSession();
  if (parent) {
    supabaseRepo.saveChildProfile(newChild, parent.id).catch(() => {});
  }

  return newChild;
};

export const deleteChildProfile = (id: string): void => {
  const children = getChildrenProfiles().filter(c => c.id !== id);
  saveChildrenProfiles(children);
  const activeId = getActiveChildId();
  if (activeId === id) {
    setActiveChildId(children[0]?.id || null);
  }
};

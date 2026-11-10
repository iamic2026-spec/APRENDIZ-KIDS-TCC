export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  avatar: string; // emoji identifier or data URL / photo URL
  photoUrl?: string; // custom uploaded photo
  stars: number;
  level: number; // 1 to 5
  unlockedLevels: number[]; // e.g. [1, 2]
  totalCorrect: number;
  completedActivities: string[];
  createdAt: string;
}

export interface ParentUser {
  id: string;
  email: string;
  name?: string;
  isDemo?: boolean;
}

export type ActivityType = 
  | 'listen-letter'      // Ouvir o som e escolher a letra certa
  | 'build-syllable'     // Formar sílaba (ex: B + A = BA)
  | 'match-word-image'   // Ligar palavra à imagem correta
  | 'number-counting'    // Atividades numéricas (contar objetos)
  | 'sentence-builder';  // Ordenar ou completar frase curta

export interface ActivityQuestion {
  id: string;
  type: ActivityType;
  title: string;
  instructionAudio: string; // What Pipoca speaks in pt-BR
  displayPrompt?: string;
  itemToSpeak?: string; // phoneme or word to pronounce
  image?: string; // emoji or image URL
  options: {
    id: string;
    label: string;
    image?: string;
    spokenText?: string;
    isCorrect: boolean;
  }[];
  // For matching or assembling:
  targetWord?: string;
  syllables?: string[];
  sentenceWords?: string[];
  correctSentence?: string;
  countTarget?: number;
  countItems?: string[];
}

export interface GameLevel {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  themeColor: 'blue' | 'yellow' | 'green' | 'orange' | 'purple';
  icon: string;
  badge: string;
  activities: ActivityQuestion[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  starsRequired: number;
  unlocked: boolean;
}

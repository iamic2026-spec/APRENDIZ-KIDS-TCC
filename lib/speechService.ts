// Brazilian Portuguese audio narration service for Aprendiz Kids
// Powered by Gemini Flash TTS with the requested "Nika" female voice
// Includes instant client-side caching and fallback to browser Web Speech API

type SpeakingStateCallback = (isSpeaking: boolean) => void;

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private ptVoice: SpeechSynthesisVoice | null = null;
  private listeners: Set<SpeakingStateCallback> = new Set();
  private isCurrentlySpeaking: boolean = false;
  private currentAudioElement: HTMLAudioElement | null = null;
  private audioCache: Map<string, string> = new Map();
  private fetchAbortController: AbortController | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
        this.initVoices();
        if (this.synth.onvoiceschanged !== undefined) {
          this.synth.onvoiceschanged = () => this.initVoices();
        }
      }
    }
  }

  private initVoices(): void {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    const femaleKeywords = [
      'female',
      'feminina',
      'luciana',
      'letícia',
      'leticia',
      'yara',
      'francisca',
      'maria',
      'helena',
      'vitória',
      'vitoria',
      'jori',
    ];

    this.ptVoice =
      voices.find(
        (v) =>
          v.lang.toLowerCase() === 'pt-br' &&
          femaleKeywords.some((k) => v.name.toLowerCase().includes(k))
      ) ||
      voices.find(
        (v) =>
          v.lang.toLowerCase().startsWith('pt') &&
          femaleKeywords.some((k) => v.name.toLowerCase().includes(k))
      ) ||
      voices.find((v) => v.lang.toLowerCase() === 'pt-br') ||
      voices.find((v) => v.lang.toLowerCase().startsWith('pt')) ||
      null;
  }

  public subscribe(cb: SpeakingStateCallback): () => void {
    this.listeners.add(cb);
    cb(this.isCurrentlySpeaking);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private setSpeaking(status: boolean): void {
    this.isCurrentlySpeaking = status;
    this.listeners.forEach((cb) => cb(status));
  }

  public stop(): void {
    if (this.fetchAbortController) {
      this.fetchAbortController.abort();
      this.fetchAbortController = null;
    }
    if (this.currentAudioElement) {
      this.currentAudioElement.pause();
      this.currentAudioElement.currentTime = 0;
      this.currentAudioElement = null;
    }
    if (this.synth) {
      this.synth.cancel();
    }
    this.setSpeaking(false);
  }

  // Play audio from base64 WAV data
  private playWavAudio(base64Audio: string): void {
    this.stop();
    this.setSpeaking(true);

    const audio = new Audio(`data:audio/wav;base64,${base64Audio}`);
    this.currentAudioElement = audio;

    audio.onended = () => {
      this.setSpeaking(false);
      this.currentAudioElement = null;
    };

    audio.onerror = () => {
      this.setSpeaking(false);
      this.currentAudioElement = null;
    };

    audio.play().catch(() => {
      this.setSpeaking(false);
      this.currentAudioElement = null;
    });
  }

  // Fallback to browser speech synthesis if offline or API key absent
  private speakFallback(text: string, options: { rate?: number; pitch?: number } = {}): void {
    if (typeof window === 'undefined' || !this.synth) {
      this.setSpeaking(false);
      return;
    }

    this.stop();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';

    if (this.ptVoice) {
      utterance.voice = this.ptVoice;
    }

    utterance.rate = options.rate ?? 1.12;
    utterance.pitch = options.pitch ?? 1.18;

    utterance.onstart = () => {
      this.setSpeaking(true);
    };

    utterance.onend = () => {
      this.setSpeaking(false);
    };

    utterance.onerror = () => {
      this.setSpeaking(false);
    };

    try {
      this.synth.speak(utterance);
    } catch {
      this.setSpeaking(false);
    }
  }

  /**
   * Speak using Gemini 3.8/3.9 Flash TTS with the "Nika" female voice
   */
  public async speak(text: string, options: { rate?: number; pitch?: number } = {}): Promise<void> {
    if (typeof window === 'undefined') return;

    const trimmed = text.trim();
    if (!trimmed) return;

    // 1. Check memory cache first for instant playback
    if (this.audioCache.has(trimmed)) {
      const cached = this.audioCache.get(trimmed)!;
      this.playWavAudio(cached);
      return;
    }

    // 2. Stop any existing playback and initiate request to Gemini TTS endpoint
    this.stop();
    this.setSpeaking(true);

    this.fetchAbortController = new AbortController();

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: trimmed,
          voice: 'Nika',
        }),
        signal: this.fetchAbortController.signal,
      });

      if (!res.ok) {
        throw new Error(`TTS server responded with ${res.status}`);
      }

      const data = await res.json();
      if (data.audio) {
        // Cache the WAV audio
        this.audioCache.set(trimmed, data.audio);
        this.playWavAudio(data.audio);
        return;
      }

      throw new Error('No audio returned');
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Canceled intentionally
        return;
      }
      // Fallback to browser's built-in female voice
      this.speakFallback(trimmed, options);
    }
  }

  // Celebrates correct answer without laughter (sem risos), clear and encouraging
  public speakSuccess(): void {
    const celebrationPhrases = [
      'Parabéns, muito bem!',
      'Parabéns, muito bem! Você acertou!',
      'Parabéns, muito bem! Excelente!',
      'Parabéns, muito bem! Você é genial!',
    ];
    const phrase = celebrationPhrases[Math.floor(Date.now() % celebrationPhrases.length)];
    this.speak(phrase, { rate: 1.12, pitch: 1.20 });
  }

  // Backward-compatibility alias
  public speakSuccessWithLaughter(): void {
    this.speakSuccess();
  }

  public speakLetter(letter: string): void {
    const letterPronunciations: Record<string, string> = {
      A: 'Letra Á!',
      E: 'Letra É!',
      I: 'Letra Í!',
      O: 'Letra Ó!',
      U: 'Letra Ú!',
      B: 'Letra Bê!',
      C: 'Letra Cê!',
      D: 'Letra Dê!',
      F: 'Letra Efe!',
      G: 'Letra Gê!',
      J: 'Letra Jota!',
      L: 'Letra Ele!',
      M: 'Letra Eme!',
      P: 'Letra Pê!',
      R: 'Letra Erre!',
      S: 'Letra Esse!',
      T: 'Letra Tê!',
      V: 'Letra Vê!',
    };

    const phrase = letterPronunciations[letter.toUpperCase()] || `Letra ${letter}!`;
    this.speak(phrase, { rate: 1.05 });
  }

  public speakSyllable(syllable: string): void {
    this.speak(`Sílaba: ${syllable}!`, { rate: 1.05 });
  }

  public speakWord(word: string): void {
    this.speak(`Palavra: ${word}!`, { rate: 1.08 });
  }

  public isSpeaking(): boolean {
    return this.isCurrentlySpeaking;
  }
}

export const speech = new SpeechService();

/**
 * Speech synthesis helper configured with a friendly, natural female voice for young learners.
 */

// Voice names and keywords known to be female across Windows, Chrome, macOS, iOS, Android, Linux
const FEMALE_VOICE_NAMES = [
  // High quality Edge / Azure Natural / Neural voices
  'jenny',
  'aria',
  'eva',
  'zira',
  'ayanda',
  'natasha',
  'sonia',
  'libby',
  'maisie',
  'clara',
  'neerja',
  'amy',
  'emma',
  'olivia',
  // Chrome voices
  'google us english',
  'google uk english female',
  // Apple / Safari / macOS / iOS voices
  'samantha',
  'victoria',
  'karen',
  'susan',
  'hazel',
  'catherine',
  'linda',
  'heather',
  'fiona',
  'moira',
  'tessa',
  'ava',
  'allison',
  'stephanie',
  'helena',
  'monica',
  // Generic keyword
  'female',
];

const MALE_VOICE_NAMES = [
  'david',
  'mark',
  'guy',
  'george',
  'richard',
  'alex',
  'fred',
  'daniel',
  'oliver',
  'thomas',
  'james',
  'ravi',
  ' male',
  'male ',
  '(male)',
  '- male',
];

let cachedVoices: SpeechSynthesisVoice[] = [];

function loadVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  const voices = window.speechSynthesis.getVoices();
  if (voices && voices.length > 0) {
    cachedVoices = voices;
  }
  return cachedVoices;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    loadVoices();
  };
}

/**
 * Finds the best available female voice in the browser, prioritizing English natural/neural voices.
 */
export function getFemaleVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

  const voices = loadVoices();
  if (!voices || voices.length === 0) return null;

  const englishVoices = voices.filter(v => v.lang.toLowerCase().startsWith('en'));
  const searchPool = englishVoices.length > 0 ? englishVoices : voices;

  // 1. First priority: Natural/Neural English female voice (e.g., Microsoft Jenny, Aria, Neural)
  const premiumFemale = searchPool.find(v => {
    const name = v.name.toLowerCase();
    const uri = (v.voiceURI || '').toLowerCase();
    const isFemale = FEMALE_VOICE_NAMES.some(fn => name.includes(fn) || uri.includes(fn));
    const isNatural = name.includes('natural') || name.includes('online') || name.includes('neural');
    return isFemale && isNatural;
  });
  if (premiumFemale) return premiumFemale;

  // 2. Second priority: Any explicitly female voice in the pool (e.g. Zira, Samantha, Google US English)
  const femaleVoice = searchPool.find(v => {
    const name = v.name.toLowerCase();
    const uri = (v.voiceURI || '').toLowerCase();
    return FEMALE_VOICE_NAMES.some(fn => name.includes(fn) || uri.includes(fn));
  });
  if (femaleVoice) return femaleVoice;

  // 3. Third priority: Any English voice that is NOT explicitly male
  const nonMaleVoice = searchPool.find(v => {
    const name = v.name.toLowerCase();
    const uri = (v.voiceURI || '').toLowerCase();
    const isMale = MALE_VOICE_NAMES.some(mn => name.includes(mn) || uri.includes(mn));
    return !isMale;
  });
  if (nonMaleVoice) return nonMaleVoice;

  // Fallback to first available English voice or first voice
  return englishVoices[0] || voices[0] || null;
}

export interface SpeakFemaleOptions {
  enabled?: boolean;
  rate?: number;
  pitch?: number;
  lang?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: () => void;
}

/**
 * Speaks text using a female voice and child-friendly tone.
 */
export function speakFemale(text: string, options: SpeakFemaleOptions = {}) {
  if (options.enabled === false) return;
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  try {
    window.speechSynthesis.cancel();

    // Clean text of markdown formatting or excessive emojis for clean narration
    const cleanText = text
      .replace(/[*_#`~]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Apply female voice
    const femaleVoice = getFemaleVoice();
    if (femaleVoice) {
      utterance.voice = femaleVoice;
      utterance.lang = femaleVoice.lang;
    } else {
      utterance.lang = options.lang || 'en-US';
    }

    // Warm, clear, friendly pitch and rate for female narrator
    utterance.rate = options.rate ?? 0.92;
    utterance.pitch = options.pitch ?? 1.15;

    if (options.onStart) utterance.onstart = options.onStart;
    if (options.onEnd) utterance.onend = options.onEnd;
    if (options.onError) utterance.onerror = options.onError;

    window.speechSynthesis.speak(utterance);
  } catch {
    if (options.onError) options.onError();
  }
}

/**
 * Stops any ongoing speech synthesis.
 */
export function stopSpeech() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export type Role = 'user' | 'assistant' | 'system';

export interface GroundingSource {
  title: string;
  url: string;
}

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  timestamp: string;
  image?: string;
  sources?: GroundingSource[];
  isStreaming?: boolean;
}

export type PersonaType = 'chatgpt' | 'concise' | 'coding' | 'storyteller' | 'funny';

export type AndroidTheme = 
  | 'pixel-dark' 
  | 'material-blue' 
  | 'emerald-nature' 
  | 'sunset-amber' 
  | 'lavender-light' 
  | 'pure-oled';

export interface VoiceSettings {
  autoSpeak: boolean;
  useGeminiTTS: boolean;
  voiceName: string; // Browser voice name or Gemini voice (Puck, Kore, etc.)
  speechRate: number; // 0.8 - 1.5
  speechPitch: number; // 0.8 - 1.2
  continuousMode: boolean; // Hands-free continuous loop
  searchGrounding: boolean; // Enable Google Search
  persona: PersonaType;
  theme: AndroidTheme;
}

export type AssistantState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'paused';

export interface QuickPrompt {
  id: string;
  label: string;
  prompt: string;
  category: 'daily' | 'creative' | 'tech' | 'utility';
  iconName: string;
}

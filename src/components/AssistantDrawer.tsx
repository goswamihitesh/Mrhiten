import React from 'react';
import { X, Volume2, Sparkles, Sliders, Palette, Bot, Search, Trash2, Download, Radio, ShieldCheck } from 'lucide-react';
import { VoiceSettings, AndroidTheme, PersonaType } from '../types';

interface AssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: VoiceSettings;
  onUpdateSettings: (newSettings: Partial<VoiceSettings>) => void;
  availableVoices: SpeechSynthesisVoice[];
  onClearChat: () => void;
  onExportChat: () => void;
}

export const AssistantDrawer: React.FC<AssistantDrawerProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  availableVoices,
  onClearChat,
  onExportChat,
}) => {
  if (!isOpen) return null;

  const themeOptions: { id: AndroidTheme; label: string; colorBg: string }[] = [
    { id: 'pixel-dark', label: 'Pixel Dark', colorBg: 'bg-slate-900 border-indigo-500' },
    { id: 'material-blue', label: 'Material Blue', colorBg: 'bg-sky-900 border-cyan-400' },
    { id: 'emerald-nature', label: 'Emerald Nature', colorBg: 'bg-zinc-900 border-emerald-400' },
    { id: 'sunset-amber', label: 'Sunset Amber', colorBg: 'bg-stone-900 border-amber-400' },
    { id: 'lavender-light', label: 'Lavender Light', colorBg: 'bg-purple-100 border-purple-500 text-purple-950' },
    { id: 'pure-oled', label: 'Pure OLED', colorBg: 'bg-black border-white' },
  ];

  const personaOptions: { id: PersonaType; label: string; desc: string }[] = [
    { id: 'chatgpt', label: 'ChatGPT Classic', desc: 'Balanced, detailed, empathetic & helpful' },
    { id: 'concise', label: 'Concise & Fast', desc: 'Direct 2-3 sentence answers optimized for voice' },
    { id: 'coding', label: 'Developer Genius', desc: 'Technical answers with clean code blocks' },
    { id: 'storyteller', label: 'Storyteller', desc: 'Expressive, imaginative & engaging narrator' },
    { id: 'funny', label: 'Witty Buddy', desc: 'Warm, clever humor & friendly banter' },
  ];

  const geminiVoices = ['Puck', 'Kore', 'Fenrir', 'Zephyr', 'Charon'];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md h-full bg-slate-950 text-slate-100 border-l border-slate-800 flex flex-col shadow-2xl overflow-y-auto">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-950/90 backdrop-blur z-10">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <h2 className="font-bold text-base">Assistant Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 flex-1 flex flex-col gap-6">
          {/* Section 1: Android Material You Themes */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-indigo-400" /> Dynamic Theme
            </label>
            <div className="grid grid-cols-2 gap-2">
              {themeOptions.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onUpdateSettings({ theme: t.id })}
                  className={`p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${t.colorBg} ${
                    settings.theme === t.id ? 'ring-2 ring-indigo-500 shadow-md' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <span>{t.label}</span>
                  {settings.theme === t.id && <span className="w-2 h-2 rounded-full bg-indigo-400"></span>}
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: AI Assistant Personas */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-indigo-400" /> Assistant Persona
            </label>
            <div className="flex flex-col gap-2">
              {personaOptions.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onUpdateSettings({ persona: p.id })}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    settings.persona === p.id
                      ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-200'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
                  }`}
                >
                  <div className="font-bold text-xs">{p.label}</div>
                  <div className="text-[11px] opacity-70 mt-0.5">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Voice Input & Speech Output Engine */}
          <div className="flex flex-col gap-3 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-indigo-400" /> Voice Output & Speech
            </label>

            {/* Auto-Speak toggle */}
            <div className="flex items-center justify-between text-xs py-1">
              <span>Auto-Speak Responses</span>
              <button
                onClick={() => onUpdateSettings({ autoSpeak: !settings.autoSpeak })}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  settings.autoSpeak ? 'bg-indigo-600' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.autoSpeak ? 'translate-x-5' : 'translate-x-0'
                  }`}
                ></span>
              </button>
            </div>

            {/* Gemini TTS vs Browser TTS */}
            <div className="flex items-center justify-between text-xs py-1 border-t border-slate-800 pt-2">
              <div>
                <div className="font-semibold text-slate-200">Gemini Neural Voice TTS</div>
                <div className="text-[10px] text-slate-400">High precision Gemini audio synthesis</div>
              </div>
              <button
                onClick={() => onUpdateSettings({ useGeminiTTS: !settings.useGeminiTTS })}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  settings.useGeminiTTS ? 'bg-emerald-600' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.useGeminiTTS ? 'translate-x-5' : 'translate-x-0'
                  }`}
                ></span>
              </button>
            </div>

            {/* Voice Name Selector */}
            <div className="flex flex-col gap-1 text-xs border-t border-slate-800 pt-2">
              <span className="font-semibold text-slate-300">Voice Persona</span>
              {settings.useGeminiTTS ? (
                <select
                  value={settings.voiceName}
                  onChange={(e) => onUpdateSettings({ voiceName: e.target.value })}
                  className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                >
                  {geminiVoices.map((v) => (
                    <option key={v} value={v}>
                      Gemini Voice: {v}
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  value={settings.voiceName}
                  onChange={(e) => onUpdateSettings({ voiceName: e.target.value })}
                  className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Default System Voice</option>
                  {availableVoices.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Speech Rate Slider */}
            <div className="flex flex-col gap-1 text-xs pt-1">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Speed Rate</span>
                <span>{settings.speechRate.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.7"
                max="1.5"
                step="0.1"
                value={settings.speechRate}
                onChange={(e) => onUpdateSettings({ speechRate: parseFloat(e.target.value) })}
                className="w-full accent-indigo-500"
              />
            </div>
          </div>

          {/* Section 4: Web Search Grounding */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-bold text-xs flex items-center gap-1.5 text-slate-200">
                <Search className="w-4 h-4 text-indigo-400" /> Google Search Grounding
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Fetch real-time web facts & source links
              </div>
            </div>
            <button
              onClick={() => onUpdateSettings({ searchGrounding: !settings.searchGrounding })}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                settings.searchGrounding ? 'bg-indigo-600' : 'bg-slate-800'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.searchGrounding ? 'translate-x-5' : 'translate-x-0'
                }`}
              ></span>
            </button>
          </div>

          {/* Section 5: Chat Management */}
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={onExportChat}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4 text-indigo-400" /> Export Chat Conversation
            </button>
            <button
              onClick={() => {
                onClearChat();
                onClose();
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-rose-950/30 hover:bg-rose-950/50 border border-rose-900/50 text-xs font-semibold text-rose-300 flex items-center justify-center gap-2 transition-colors"
            >
              <Trash2 className="w-4 h-4 text-rose-400" /> Clear Chat History
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 text-center text-[11px] text-slate-500">
          Android AI Assistant • Powered by Gemini 3.6
        </div>
      </div>
    </div>
  );
};

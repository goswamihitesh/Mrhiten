import React, { useRef, useState } from 'react';
import { Mic, MicOff, Send, Image as ImageIcon, X, Sparkles, Radio } from 'lucide-react';
import { AssistantState, AndroidTheme } from '../types';
import { themeStyles } from './AndroidFrame';

interface VoiceControlPanelProps {
  input: string;
  setInput: (val: string) => void;
  attachedImage: string | null;
  setAttachedImage: (img: string | null) => void;
  assistantState: AssistantState;
  continuousMode: boolean;
  onToggleContinuous: () => void;
  onMicClick: () => void;
  onSubmit: () => void;
  theme: AndroidTheme;
}

export const VoiceControlPanel: React.FC<VoiceControlPanelProps> = ({
  input,
  setInput,
  attachedImage,
  setAttachedImage,
  assistantState,
  continuousMode,
  onToggleContinuous,
  onMicClick,
  onSubmit,
  theme,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const styles = themeStyles[theme] || themeStyles['pixel-dark'];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className={`w-full p-3 z-20 border-t ${styles.border} ${styles.card} flex flex-col gap-2`}>
      {/* Top pill bar: Hands-free Continuous Voice toggle indicator */}
      <div className="flex items-center justify-between px-1 text-xs">
        <button
          onClick={onToggleContinuous}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all text-[11px] font-medium ${
            continuousMode
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
              : 'bg-black/20 text-slate-400 border-white/10 hover:bg-black/30'
          }`}
        >
          <Radio className={`w-3 h-3 ${continuousMode ? 'animate-pulse text-emerald-400' : ''}`} />
          {continuousMode ? 'Hands-free Voice Mode: ACTIVE' : 'Hands-free Voice Mode: Off'}
        </button>

        {assistantState === 'listening' && (
          <span className="text-[11px] font-semibold text-indigo-400 animate-pulse flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
            Listening...
          </span>
        )}
      </div>

      {/* Preview Attached Image if any */}
      {attachedImage && (
        <div className="relative inline-block w-16 h-16 rounded-xl overflow-hidden border border-indigo-500/50 shadow-md">
          <img src={attachedImage} alt="Upload preview" className="w-full h-full object-cover" />
          <button
            onClick={() => setAttachedImage(null)}
            className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/70 text-white hover:bg-black"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Main Input Control Bar */}
      <div className="flex items-center gap-2">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />

        {/* Attach Image Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 rounded-2xl bg-black/20 hover:bg-black/30 border border-white/10 transition-colors opacity-80 hover:opacity-100 flex-shrink-0"
          title="Attach snapshot / image"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        {/* Text Input Field */}
        <div className="flex-1 relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              assistantState === 'listening'
                ? 'Speak now or type here...'
                : 'Ask Android AI anything...'
            }
            className={`w-full py-2.5 pl-3.5 pr-10 rounded-2xl bg-black/20 border border-white/10 ${styles.text} placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
          />
        </div>

        {/* Dynamic Mic / Voice Input FAB Button */}
        <button
          onClick={onMicClick}
          className={`p-3 rounded-2xl font-semibold shadow-md transition-all flex items-center justify-center ${
            assistantState === 'listening'
              ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white'
          }`}
          title={assistantState === 'listening' ? 'Stop Listening' : 'Voice Input'}
        >
          {assistantState === 'listening' ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        {/* Send Button */}
        <button
          onClick={onSubmit}
          disabled={!input.trim() && !attachedImage}
          className={`p-3 rounded-2xl font-semibold shadow-md transition-all flex items-center justify-center ${
            input.trim() || attachedImage
              ? `${styles.accent}`
              : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
          }`}
          title="Send Question"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

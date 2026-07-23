import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Signal, Smartphone, Maximize2, Minimize2, Sparkles, Settings, Trash2, Volume2, Mic } from 'lucide-react';
import { AndroidTheme } from '../types';

interface AndroidFrameProps {
  children: React.ReactNode;
  theme: AndroidTheme;
  isMockupFrame: boolean;
  onToggleFrame: () => void;
  onOpenSettings: () => void;
  onClearChat: () => void;
  assistantStatusText: string;
}

export const themeStyles: Record<AndroidTheme, { bg: string; card: string; accent: string; text: string; subtext: string; border: string; glow: string }> = {
  'pixel-dark': {
    bg: 'bg-slate-950',
    card: 'bg-slate-900/90 backdrop-blur-md',
    accent: 'bg-indigo-600 hover:bg-indigo-500 text-white',
    text: 'text-slate-100',
    subtext: 'text-slate-400',
    border: 'border-slate-800',
    glow: 'from-indigo-500/20 to-purple-500/20',
  },
  'material-blue': {
    bg: 'bg-sky-950',
    card: 'bg-sky-900/90 backdrop-blur-md',
    accent: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950',
    text: 'text-sky-50',
    subtext: 'text-sky-300',
    border: 'border-sky-800',
    glow: 'from-cyan-500/20 to-blue-500/20',
  },
  'emerald-nature': {
    bg: 'bg-zinc-950',
    card: 'bg-zinc-900/90 backdrop-blur-md',
    accent: 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950',
    text: 'text-zinc-100',
    subtext: 'text-zinc-400',
    border: 'border-zinc-800',
    glow: 'from-emerald-500/20 to-teal-500/20',
  },
  'sunset-amber': {
    bg: 'bg-stone-950',
    card: 'bg-stone-900/90 backdrop-blur-md',
    accent: 'bg-amber-500 hover:bg-amber-400 text-stone-950',
    text: 'text-stone-100',
    subtext: 'text-stone-400',
    border: 'border-stone-800',
    glow: 'from-amber-500/20 to-orange-500/20',
  },
  'lavender-light': {
    bg: 'bg-slate-100',
    card: 'bg-white/90 backdrop-blur-md shadow-sm',
    accent: 'bg-purple-600 hover:bg-purple-500 text-white',
    text: 'text-slate-900',
    subtext: 'text-slate-500',
    border: 'border-slate-200',
    glow: 'from-purple-500/10 to-indigo-500/10',
  },
  'pure-oled': {
    bg: 'bg-black',
    card: 'bg-neutral-950 backdrop-blur-md',
    accent: 'bg-white hover:bg-neutral-200 text-black',
    text: 'text-white',
    subtext: 'text-neutral-400',
    border: 'border-neutral-800',
    glow: 'from-white/10 to-neutral-500/10',
  },
};

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  theme,
  isMockupFrame,
  onToggleFrame,
  onOpenSettings,
  onClearChat,
  assistantStatusText,
}) => {
  const [timeString, setTimeString] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const styles = themeStyles[theme] || themeStyles['pixel-dark'];

  const FrameContainer = ({ children: content }: { children: React.ReactNode }) => {
    if (!isMockupFrame) {
      return (
        <div className={`min-h-screen w-full ${styles.bg} ${styles.text} transition-colors duration-300 flex flex-col`}>
          {content}
        </div>
      );
    }

    return (
      <div className={`min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-2 sm:p-6 transition-all duration-300`}>
        {/* Android Device Outer Body */}
        <div className="relative w-full max-w-[430px] h-[92vh] max-h-[880px] rounded-[48px] p-3 bg-gradient-to-b from-neutral-800 via-neutral-900 to-neutral-950 border-4 border-neutral-700/80 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden">
          {/* Camera Notch / Camera Hole Punch */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-black z-50 border border-neutral-800 flex items-center justify-center shadow-inner">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-900"></div>
          </div>

          {/* Android Inner Display Screen */}
          <div className={`relative w-full h-full rounded-[38px] ${styles.bg} ${styles.text} flex flex-col overflow-hidden border border-neutral-800/60`}>
            {content}
          </div>
        </div>
      </div>
    );
  };

  return (
    <FrameContainer>
      {/* Android System Status Bar */}
      <div className={`w-full px-5 pt-3 pb-2 flex items-center justify-between text-xs font-medium select-none z-30 ${styles.subtext} border-b ${styles.border}/40`}>
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-sm tracking-tight text-current">{timeString || '12:00'}</span>
        </div>

        {/* Center Pill Status */}
        <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/20 text-[11px] border border-white/5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-[11px] font-medium opacity-90">{assistantStatusText}</span>
        </div>

        <div className="flex items-center gap-2">
          <Signal className="w-3.5 h-3.5" />
          <Wifi className="w-3.5 h-3.5" />
          <div className="flex items-center gap-1">
            <span className="text-[10px]">98%</span>
            <Battery className="w-4 h-4 fill-current opacity-90" />
          </div>
        </div>
      </div>

      {/* Android App Top Bar */}
      <div className={`w-full px-4 py-3 flex items-center justify-between z-20 border-b ${styles.border} ${styles.card}`}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-400 animate-spin-slow" />
            </div>
          </div>
          <div>
            <h1 className="font-bold text-sm leading-tight flex items-center gap-1">
              Android AI
              <span className="text-[10px] uppercase tracking-wider font-extrabold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                PRO
              </span>
            </h1>
            <p className="text-[11px] opacity-70">ChatGPT Voice Assistant</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Clear Chat Button */}
          <button
            onClick={onClearChat}
            title="Clear Chat"
            className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors opacity-75 hover:opacity-100"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Device Mockup Toggle */}
          <button
            onClick={onToggleFrame}
            title={isMockupFrame ? "Switch to Full View" : "Switch to Android Frame"}
            className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors opacity-75 hover:opacity-100"
          >
            {isMockupFrame ? <Maximize2 className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
          </button>

          {/* Settings Drawer Button */}
          <button
            onClick={onOpenSettings}
            title="Assistant Settings"
            className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors opacity-75 hover:opacity-100"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full flex flex-col overflow-hidden relative">
        {children}
      </div>

      {/* Android Bottom Navigation Gesture Line */}
      <div className="w-full py-1.5 flex justify-center items-center select-none z-30">
        <div className="w-28 h-1 rounded-full bg-slate-400/40 hover:bg-slate-400/70 transition-colors"></div>
      </div>
    </FrameContainer>
  );
};

import React, { useState } from 'react';
import { Sparkles, Sun, Code, BookOpen, Dumbbell, Timer, StickyNote, HelpCircle, ChevronRight, Zap } from 'lucide-react';
import { AndroidTheme } from '../types';
import { themeStyles } from './AndroidFrame';

interface QuickWidgetsProps {
  onSelectPrompt: (prompt: string) => void;
  theme: AndroidTheme;
}

export const QuickWidgets: React.FC<QuickWidgetsProps> = ({ onSelectPrompt, theme }) => {
  const [activeWidgetTab, setActiveWidgetTab] = useState<'prompts' | 'widgets'>('prompts');
  const [quickNote, setQuickNote] = useState<string>('');
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [timerActive, setTimerActive] = useState<boolean>(false);

  const styles = themeStyles[theme] || themeStyles['pixel-dark'];

  const promptSuggestions = [
    { label: "🌤️ आज का समाचार व मौसम", prompt: "आज का मौसम कैसा रहेगा और ताज़ा मुख्य समाचार क्या हैं?" },
    { label: "💻 Python कोड उदाहरण", prompt: "Python में Fibonacci series का एक पूरा और साफ़ कोड बनाकर समझाएं।" },
    { label: "📚 पढ़ाई की योजना बनाएं", prompt: "कठिन विषयों को याद करने और पढ़ाई करने के 5 आसान टिप्स बताएं।" },
    { label: "💡 नया स्टार्टअप आइडिया", prompt: "तकनीक और AI पर आधारित 3 नए और सरल बिजनेस आइडिया बताएं।" },
    { label: "📖 प्रेरक विचार", prompt: "आज का एक सुंदर और प्रेरणादायक विचार सुनाएं।" },
  ];

  return (
    <div className="w-full px-4 py-2 border-b border-white/5 bg-black/10">
      {/* Sub tabs header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveWidgetTab('prompts')}
            className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 ${
              activeWidgetTab === 'prompts'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3 h-3 text-indigo-400" /> Suggested Prompts
          </button>
          <button
            onClick={() => setActiveWidgetTab('widgets')}
            className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 ${
              activeWidgetTab === 'widgets'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3 h-3 text-amber-400" /> Android Cards
          </button>
        </div>
      </div>

      {activeWidgetTab === 'prompts' ? (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {promptSuggestions.map((item, idx) => (
            <button
              key={idx}
              onClick={() => onSelectPrompt(item.prompt)}
              className="flex-shrink-0 text-xs px-3 py-1.5 rounded-xl bg-white/5 hover:bg-indigo-500/20 border border-white/10 hover:border-indigo-500/40 transition-all text-slate-200 flex items-center gap-1.5 active:scale-95"
            >
              <span>{item.label}</span>
              <ChevronRight className="w-3 h-3 opacity-60" />
            </button>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 my-1">
          {/* Weather Widget */}
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Live Weather</p>
              <p className="text-sm font-bold text-slate-100">72°F Sunny</p>
              <p className="text-[10px] text-emerald-400">Perfect Day Outside</p>
            </div>
            <Sun className="w-6 h-6 text-amber-400 animate-spin-slow" />
          </div>

          {/* Quick Voice Note Widget */}
          <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                <StickyNote className="w-3 h-3 text-indigo-400" /> Quick Note
              </span>
              <button
                onClick={() => onSelectPrompt(`Save this note to my assistant logs: ${quickNote}`)}
                className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300"
              >
                Send
              </button>
            </div>
            <input
              type="text"
              value={quickNote}
              onChange={(e) => setQuickNote(e.target.value)}
              placeholder="Tap to type quick memo..."
              className="bg-transparent text-[11px] text-slate-200 focus:outline-none mt-1"
            />
          </div>
        </div>
      )}
    </div>
  );
};

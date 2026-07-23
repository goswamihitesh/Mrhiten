import React from 'react';
import { Mic, Sparkles, Volume2, Loader2, PauseCircle } from 'lucide-react';
import { AssistantState } from '../types';

interface VoiceWaveVisualizerProps {
  state: AssistantState;
  transcript?: string;
  onMicClick: () => void;
  onStopSpeaking?: () => void;
}

export const VoiceWaveVisualizer: React.FC<VoiceWaveVisualizerProps> = ({
  state,
  transcript,
  onMicClick,
  onStopSpeaking,
}) => {
  return (
    <div className="w-full flex flex-col items-center justify-center my-3 px-4 transition-all duration-300">
      {/* Visual Assistant Sphere / Orb */}
      <div className="relative flex items-center justify-center">
        {/* Animated Glow Rings when Listening or Speaking */}
        {state === 'listening' && (
          <>
            <div className="absolute w-28 h-28 rounded-full bg-cyan-500/20 animate-ping"></div>
            <div className="absolute w-24 h-24 rounded-full bg-indigo-500/30 animate-pulse"></div>
          </>
        )}

        {state === 'speaking' && (
          <>
            <div className="absolute w-28 h-28 rounded-full bg-emerald-500/20 animate-pulse"></div>
            <div className="absolute w-24 h-24 rounded-full bg-teal-500/30 animate-ping"></div>
          </>
        )}

        {state === 'thinking' && (
          <div className="absolute w-28 h-28 rounded-full bg-purple-500/20 animate-spin"></div>
        )}

        {/* Center Assistant Button Orb */}
        <button
          onClick={state === 'speaking' && onStopSpeaking ? onStopSpeaking : onMicClick}
          className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-105 active:scale-95 ${
            state === 'listening'
              ? 'bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 text-white shadow-indigo-500/50 ring-4 ring-indigo-400/30'
              : state === 'speaking'
              ? 'bg-gradient-to-tr from-emerald-500 via-teal-600 to-cyan-600 text-white shadow-emerald-500/50 ring-4 ring-emerald-400/30'
              : state === 'thinking'
              ? 'bg-gradient-to-tr from-purple-600 via-pink-600 to-rose-600 text-white shadow-purple-500/50'
              : 'bg-gradient-to-tr from-indigo-600 to-violet-700 text-white shadow-indigo-600/30 hover:shadow-indigo-600/50'
          }`}
        >
          {state === 'listening' ? (
            <Mic className="w-8 h-8 animate-bounce" />
          ) : state === 'speaking' ? (
            <Volume2 className="w-8 h-8 animate-pulse" />
          ) : state === 'thinking' ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : (
            <Sparkles className="w-8 h-8" />
          )}
        </button>
      </div>

      {/* Audio Wave Sound Bars when Listening or Speaking */}
      {(state === 'listening' || state === 'speaking') && (
        <div className="flex items-center gap-1.5 h-6 mt-3">
          {[0.4, 0.9, 0.3, 1.0, 0.6, 0.8, 0.2, 0.7, 0.5].map((delay, idx) => (
            <span
              key={idx}
              className={`w-1 rounded-full ${
                state === 'listening' ? 'bg-indigo-400' : 'bg-emerald-400'
              } animate-bounce`}
              style={{
                height: `${Math.max(12, Math.sin(idx + Date.now()) * 24)}px`,
                animationDuration: `${0.4 + delay * 0.4}s`,
                animationDelay: `${delay * 0.1}s`,
              }}
            ></span>
          ))}
        </div>
      )}

      {/* Status or Live Interim Transcript Display */}
      <div className="mt-2 text-center min-h-[22px] px-2">
        {state === 'listening' ? (
          <p className="text-xs font-semibold text-indigo-400 animate-pulse flex items-center justify-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
            {transcript ? `"${transcript}"` : 'Listening... Speak your prompt clearly'}
          </p>
        ) : state === 'speaking' ? (
          <div className="flex items-center justify-center gap-2">
            <p className="text-xs font-medium text-emerald-400">Android Assistant is speaking...</p>
            {onStopSpeaking && (
              <button
                onClick={onStopSpeaking}
                className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 flex items-center gap-1"
              >
                <PauseCircle className="w-3 h-3" /> Stop
              </button>
            )}
          </div>
        ) : state === 'thinking' ? (
          <p className="text-xs font-medium text-purple-400 flex items-center justify-center gap-1.5">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Thinking & formulating answer...
          </p>
        ) : (
          <p className="text-[11px] opacity-60">Tap orb or microphone to speak with Android AI</p>
        )}
      </div>
    </div>
  );
};

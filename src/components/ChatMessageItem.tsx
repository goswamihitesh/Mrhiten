import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Volume2, VolumeX, Copy, Check, ExternalLink, Bot, User, Sparkles } from 'lucide-react';
import { ChatMessage, AndroidTheme } from '../types';
import { themeStyles } from './AndroidFrame';

interface ChatMessageItemProps {
  message: ChatMessage;
  theme: AndroidTheme;
  isSpeaking: boolean;
  onSpeak: (text: string) => void;
  onStopSpeak: () => void;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  theme,
  isSpeaking,
  onSpeak,
  onStopSpeak,
}) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';
  const styles = themeStyles[theme] || themeStyles['pixel-dark'];

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`w-full flex gap-3 my-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar Icon */}
      <div
        className={`w-8 h-8 rounded-2xl flex-shrink-0 flex items-center justify-center text-xs font-bold shadow-sm ${
          isUser
            ? `${styles.accent}`
            : 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Message Content Card */}
      <div
        className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-3.5 shadow-sm text-sm ${
          isUser
            ? `${styles.accent} rounded-tr-none`
            : `${styles.card} border ${styles.border} ${styles.text} rounded-tl-none`
        }`}
      >
        {/* Attached Image if present */}
        {message.image && (
          <div className="mb-2.5 rounded-xl overflow-hidden border border-white/10 max-h-56">
            <img src={message.image} alt="User upload" className="w-full h-full object-cover" />
          </div>
        )}

        {/* Message Text with Markdown */}
        <div className="prose prose-invert max-w-none text-xs sm:text-sm leading-relaxed overflow-x-auto">
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <ReactMarkdown>{message.content}</ReactMarkdown>
          )}
        </div>

        {/* Web Search Sources / Grounding Badges */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="font-semibold text-xs opacity-75 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-400" /> Web Sources:
            </span>
            {message.sources.map((src, i) => (
              <a
                key={i}
                href={src.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 transition-colors text-[10px] text-indigo-300 truncate max-w-[180px]"
              >
                <span className="truncate">{src.title}</span>
                <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
              </a>
            ))}
          </div>
        )}

        {/* Bottom Actions Bar */}
        <div className="mt-2.5 flex items-center justify-between text-[11px] opacity-70 border-t border-black/5 dark:border-white/5 pt-1.5">
          <span className="text-[10px]">{message.timestamp}</span>

          <div className="flex items-center gap-1.5">
            {!isUser && (
              <button
                onClick={() => (isSpeaking ? onStopSpeak() : onSpeak(message.content))}
                className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex items-center gap-1"
                title={isSpeaking ? 'Stop speaking' : 'Speak text aloud'}
              >
                {isSpeaking ? (
                  <VolumeX className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
              </button>
            )}

            <button
              onClick={handleCopy}
              className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              title="Copy message"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

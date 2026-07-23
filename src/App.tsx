import React, { useState, useEffect, useRef } from 'react';
import { AndroidFrame } from './components/AndroidFrame';
import { VoiceWaveVisualizer } from './components/VoiceWaveVisualizer';
import { ChatMessageItem } from './components/ChatMessageItem';
import { VoiceControlPanel } from './components/VoiceControlPanel';
import { QuickWidgets } from './components/QuickWidgets';
import { AssistantDrawer } from './components/AssistantDrawer';
import {
  ChatMessage,
  VoiceSettings,
  AssistantState,
  AndroidTheme,
} from './types';
import {
  SpeechRecognitionManager,
  TextToSpeechManager,
  PcmAudioPlayer,
} from './utils/speech';

export default function App() {
  // Chat & App State
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('android_ai_messages');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'welcome-1',
        role: 'assistant',
        content:
          "👋 नमस्ते! मैं आपका **पर्सनल AI वॉयस असिस्टेंट** हूँ।\n\nमैं आपकी पढ़ाई, कोडिंग, राइटिंग, दैनिक कार्यों और नए विचारों में पूरी मदद कर सकता हूँ।\n- मैं **हमेशा हिंदी में उत्तर** दूंगा (जब तक आप कोई अन्य भाषा न कहें)।\n- आप मुझसे **बोलकर (Voice Input)** सवाल पूछ सकते हैं या टाइप कर सकते हैं।\n- सहायता पाने के लिए नीचे दिए गए **माइक्रोफोन या ऑर्ब (Orb)** पर टैप करें!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [input, setInput] = useState<string>('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [assistantState, setAssistantState] = useState<AssistantState>('idle');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [isSpeakingMessageId, setIsSpeakingMessageId] = useState<string | null>(null);

  // Settings & Theme
  const [settings, setSettings] = useState<VoiceSettings>(() => {
    const saved = localStorage.getItem('android_ai_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      autoSpeak: true,
      useGeminiTTS: false,
      voiceName: 'Puck',
      speechRate: 1.0,
      speechPitch: 1.0,
      continuousMode: false,
      searchGrounding: true,
      persona: 'chatgpt',
      theme: 'pixel-dark',
    };
  });

  const [isMockupFrame, setIsMockupFrame] = useState<boolean>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Refs for Speech Managers
  const speechRecRef = useRef<SpeechRecognitionManager | null>(null);
  const ttsRef = useRef<TextToSpeechManager | null>(null);
  const pcmPlayerRef = useRef<PcmAudioPlayer | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Initialize Speech Managers
  useEffect(() => {
    speechRecRef.current = new SpeechRecognitionManager();
    ttsRef.current = new TextToSpeechManager();
    pcmPlayerRef.current = new PcmAudioPlayer();

    // Populate voices
    const updateVoices = () => {
      if (ttsRef.current) {
        setAvailableVoices(ttsRef.current.getVoices());
      }
    };
    updateVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  // Save State
  useEffect(() => {
    localStorage.setItem('android_ai_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('android_ai_settings', JSON.stringify(settings));
  }, [settings]);

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, assistantState, interimTranscript]);

  const updateSettings = (newSettings: Partial<VoiceSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Stop all active audio / speech
  const stopAllAudio = () => {
    if (ttsRef.current) ttsRef.current.stop();
    if (pcmPlayerRef.current) pcmPlayerRef.current.stop();
    setIsSpeakingMessageId(null);
    if (assistantState === 'speaking') {
      setAssistantState('idle');
    }
  };

  // Speak response text out loud
  const speakResponse = async (text: string, msgId?: string) => {
    stopAllAudio();
    if (msgId) setIsSpeakingMessageId(msgId);
    setAssistantState('speaking');

    const onSpeechEnd = () => {
      setIsSpeakingMessageId(null);
      setAssistantState('idle');

      // Continuous Hands-Free Mode loop: re-enable microphone listening
      if (settings.continuousMode) {
        setTimeout(() => {
          startVoiceInput();
        }, 500);
      }
    };

    if (settings.useGeminiTTS) {
      try {
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            voiceName: settings.voiceName || 'Puck',
          }),
        });
        const data = await res.json();

        if (data.audio && pcmPlayerRef.current) {
          pcmPlayerRef.current.playBase64Pcm(data.audio, 24000, onSpeechEnd);
          return;
        }
      } catch (err) {
        console.warn('Gemini TTS failed, falling back to Browser TTS:', err);
      }
    }

    // Fallback or standard Browser SpeechSynthesis
    if (ttsRef.current) {
      ttsRef.current.speak(text, {
        voiceName: settings.voiceName,
        rate: settings.speechRate,
        pitch: settings.speechPitch,
        onEnd: onSpeechEnd,
        onError: onSpeechEnd,
      });
    } else {
      onSpeechEnd();
    }
  };

  // Send User Message & Handle AI Generation
  const handleSendMessage = async (textToSend?: string) => {
    const promptText = (textToSend !== undefined ? textToSend : input).trim();
    if (!promptText && !attachedImage) return;

    stopAllAudio();
    if (speechRecRef.current) speechRecRef.current.stop();

    const userMsgId = `user-${Date.now()}`;
    const newMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      image: attachedImage || undefined,
    };

    const updatedHistory = [...messages, newMsg];
    setMessages(updatedHistory);
    setInput('');
    setAttachedImage(null);
    setInterimTranscript('');
    setAssistantState('thinking');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedHistory.map((m) => ({
            role: m.role,
            content: m.content,
            image: m.image,
          })),
          persona: settings.persona,
          searchGrounding: settings.searchGrounding,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      const botMsgId = `bot-${Date.now()}`;
      const botMsg: ChatMessage = {
        id: botMsgId,
        role: 'assistant',
        content: data.text || 'No response text.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: data.sources || [],
      };

      setMessages((prev) => [...prev, botMsg]);
      setAssistantState('idle');

      // Speak AI Response
      if (settings.autoSpeak) {
        speakResponse(data.text, botMsgId);
      } else if (settings.continuousMode) {
        setTimeout(() => startVoiceInput(), 500);
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **Error**: ${err.message || 'Something went wrong while connecting to Android AI.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
      setAssistantState('idle');
    }
  };

  // Start Voice Input Microphone
  const startVoiceInput = () => {
    stopAllAudio();

    if (!speechRecRef.current || !speechRecRef.current.isSupported) {
      alert('Speech recognition is not supported on this browser. You can type your question.');
      return;
    }

    setAssistantState('listening');
    setInterimTranscript('');

    speechRecRef.current.start(
      (transcript, isFinal) => {
        setInterimTranscript(transcript);
        if (isFinal && transcript.trim()) {
          setInterimTranscript('');
          handleSendMessage(transcript);
        }
      },
      (error) => {
        console.warn('Mic error:', error);
        setAssistantState('idle');
      },
      () => {
        if (assistantState === 'listening') {
          setAssistantState('idle');
        }
      }
    );
  };

  // Toggle Voice Input
  const handleMicClick = () => {
    if (assistantState === 'listening') {
      if (speechRecRef.current) speechRecRef.current.stop();
      setAssistantState('idle');
      if (interimTranscript.trim()) {
        handleSendMessage(interimTranscript);
      }
    } else {
      startVoiceInput();
    }
  };

  const handleClearChat = () => {
    if (confirm('Clear all conversation history?')) {
      stopAllAudio();
      setMessages([
        {
          id: 'welcome-reset',
          role: 'assistant',
          content: "Chat cleared. What's on your mind? Tap the microphone or type below!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  const handleExportChat = () => {
    const textData = messages
      .map((m) => `[${m.timestamp}] ${m.role.toUpperCase()}: ${m.content}`)
      .join('\n\n');
    const blob = new Blob([textData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `android-ai-chat-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const assistantStatusText =
    assistantState === 'listening'
      ? 'Listening...'
      : assistantState === 'speaking'
      ? 'Speaking'
      : assistantState === 'thinking'
      ? 'Thinking'
      : 'Ready';

  return (
    <AndroidFrame
      theme={settings.theme}
      isMockupFrame={isMockupFrame}
      onToggleFrame={() => setIsMockupFrame(!isMockupFrame)}
      onOpenSettings={() => setIsSettingsOpen(true)}
      onClearChat={handleClearChat}
      assistantStatusText={assistantStatusText}
    >
      {/* Dynamic Voice Orb & Audio Wave Visualizer */}
      <VoiceWaveVisualizer
        state={assistantState}
        transcript={interimTranscript}
        onMicClick={handleMicClick}
        onStopSpeaking={stopAllAudio}
      />

      {/* Quick Prompts & Cards Widget Bar */}
      <QuickWidgets
        onSelectPrompt={(prompt) => handleSendMessage(prompt)}
        theme={settings.theme}
      />

      {/* Chat Messages Log */}
      <div className="flex-1 w-full overflow-y-auto px-4 py-3 flex flex-col">
        {messages.map((msg) => (
          <ChatMessageItem
            key={msg.id}
            message={msg}
            theme={settings.theme}
            isSpeaking={isSpeakingMessageId === msg.id}
            onSpeak={(text) => speakResponse(text, msg.id)}
            onStopSpeak={stopAllAudio}
          />
        ))}
        <div ref={chatBottomRef} />
      </div>

      {/* Bottom Voice Control Bar */}
      <VoiceControlPanel
        input={input}
        setInput={setInput}
        attachedImage={attachedImage}
        setAttachedImage={setAttachedImage}
        assistantState={assistantState}
        continuousMode={settings.continuousMode}
        onToggleContinuous={() => updateSettings({ continuousMode: !settings.continuousMode })}
        onMicClick={handleMicClick}
        onSubmit={() => handleSendMessage()}
        theme={settings.theme}
      />

      {/* Settings & Voice Customization Drawer */}
      <AssistantDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
        availableVoices={availableVoices}
        onClearChat={handleClearChat}
        onExportChat={handleExportChat}
      />
    </AndroidFrame>
  );
}

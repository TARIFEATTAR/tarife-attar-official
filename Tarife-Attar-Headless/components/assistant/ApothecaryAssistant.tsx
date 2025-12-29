
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";

interface Props {
  theme?: 'light' | 'dark';
  isControlledOpen?: boolean;
  onCloseControlled?: () => void;
}

export const ApothecaryAssistant: React.FC<Props> = ({ theme = 'light', isControlledOpen, onCloseControlled }) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', text: string, links?: {uri: string, title: string}[] }[]>([
    { role: 'assistant', text: 'Welcome to the archive. I am the Senior Alchemist. I can analyze your specimens, search the global record, or speak with you directly.' }
  ]);
  const [input, setInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Live API Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);

  const isOpen = isControlledOpen !== undefined ? isControlledOpen : internalOpen;
  const setIsOpen = (val: boolean) => {
    if (onCloseControlled && !val) {
      onCloseControlled();
    } else {
      setInternalOpen(val);
    }
    if (!val && isVoiceActive) stopVoiceSession();
  };

  const isLight = theme === 'light';
  const bgColor = isLight ? 'bg-theme-alabaster' : 'bg-theme-obsidian';
  const textColor = isLight ? 'text-theme-charcoal' : 'text-theme-alabaster';
  const borderColor = isLight ? 'border-theme-charcoal/10' : 'border-white/10';

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
    return buffer;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };

  const stopVoiceSession = () => {
    if (sessionRef.current) sessionRef.current.close();
    setIsVoiceActive(false);
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
  };

  const startVoiceSession = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsVoiceActive(true);
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            const audioBase64 = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioBase64 && audioContextRef.current) {
              const ctx = audioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decode(audioBase64), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }
            if (msg.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => setIsVoiceActive(false),
          onerror: () => setIsVoiceActive(false),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
          systemInstruction: 'You are the Senior Alchemist. Speak in a scientific, evocative, and archival tone.',
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (e) {
      console.error("Voice Error", e);
    }
  };

  const handleSend = async (userText?: string, imageBase64?: string) => {
    const textToSend = userText || input;
    if (!textToSend && !imageBase64) return;

    setMessages(prev => [...prev, { role: 'user', text: textToSend || 'Analyzing visual specimen...' }]);
    setInput('');
    setIsThinking(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let model = 'gemini-3-pro-preview';
      let tools: any[] = [];
      let toolConfig: any = undefined;

      // Smart tool selection
      const lower = textToSend.toLowerCase();
      if (lower.includes('near') || lower.includes('location') || lower.includes('maps') || lower.includes('nearby')) {
        model = 'gemini-2.5-flash';
        tools = [{ googleMaps: {} }];
        // In a real app we'd get current location via navigator.geolocation
      } else if (lower.includes('search') || lower.includes('news') || lower.includes('current') || lower.includes('weather')) {
        model = 'gemini-3-flash-preview';
        tools = [{ googleSearch: {} }];
      }

      let contentParts: any[] = [{ text: textToSend }];
      if (imageBase64) {
        contentParts.push({ inlineData: { mimeType: "image/jpeg", data: imageBase64 } });
        model = 'gemini-3-pro-preview'; // Pro for image analysis
      }

      const response = await ai.models.generateContent({
        model,
        contents: [{ parts: contentParts }],
        config: {
          systemInstruction: `You are the Senior Alchemist for Tarife Attär. Your voice is archival and technical. 
          Use technical lexicon: "resinous", "sillage", "atmospheric profile". 
          If using Maps or Search, mention the sources.`,
          tools,
          toolConfig
        },
      });

      const links = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => {
        if (chunk.web) return { uri: chunk.web.uri, title: chunk.web.title };
        if (chunk.maps) return { uri: chunk.maps.uri, title: chunk.maps.title };
        return null;
      }).filter(Boolean);

      setMessages(prev => [...prev, { role: 'assistant', text: response.text || "Synthesis inconclusive.", links }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', text: "The laboratory is over-capacity. Re-calibration required." }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="fixed bottom-12 right-12 z-[2100] flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            className={`w-[90vw] md:w-[450px] h-[650px] rounded-sm ${bgColor} ${textColor} border ${borderColor} shadow-2xl flex flex-col overflow-hidden backdrop-blur-2xl`}
          >
            <header className={`p-8 border-b ${borderColor} flex justify-between items-center bg-current/5`}>
              <div className="flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full ${isThinking || isVoiceActive ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                <span className="font-mono text-[10px] uppercase tracking-[0.5em] opacity-40">Alchemical Assistant</span>
              </div>
              <div className="flex items-center gap-6">
                <button 
                  onClick={isVoiceActive ? stopVoiceSession : startVoiceSession}
                  className={`p-2 transition-all ${isVoiceActive ? 'text-amber-500 scale-125' : 'opacity-40 hover:opacity-100'}`}
                  title="Voice Communion"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"/>
                  </svg>
                </button>
                <button onClick={() => setIsOpen(false)} className="opacity-30 hover:opacity-100 transition-opacity">
                  <svg width="14" height="14" viewBox="0 0 12 12" fill="none"><path d="M1 1L11 11M1 11L11 1" stroke="currentColor" strokeWidth="1.2" /></svg>
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar">
              {isVoiceActive && (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-8">
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-24 h-24 rounded-full border border-amber-500/30 flex items-center justify-center"
                  >
                    <div className="w-4 h-4 rounded-full bg-amber-500" />
                  </motion.div>
                  <p className="font-serif italic opacity-60">Voice communion active. Speak clearly into the void.</p>
                </div>
              )}
              {!isVoiceActive && messages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <span className="font-mono text-[8px] uppercase tracking-[0.4em] opacity-20 mb-3">{msg.role === 'user' ? 'Inquirer' : 'Sr. Alchemist'}</span>
                  <div className={`p-6 text-base font-serif italic max-w-[95%] leading-relaxed ${msg.role === 'user' ? 'bg-current/5 border border-current/10' : 'border-l border-current/20'}`}>
                    {msg.text}
                    {msg.links && msg.links.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-current/10 flex flex-wrap gap-2">
                        {msg.links.map((link, idx) => (
                          <a key={idx} href={link.uri} target="_blank" rel="noopener noreferrer" className="text-[10px] font-mono uppercase tracking-widest border border-current/20 px-2 py-1 hover:bg-current hover:text-white transition-all">
                            {link.title || 'Source'}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              {isThinking && <div className="font-mono text-[8px] uppercase tracking-[0.8em] opacity-20 animate-pulse">Analyzing specimens...</div>}
            </div>

            <div className={`p-8 border-t ${borderColor} bg-current/5`}>
              <div className="flex flex-col gap-4">
                <div className="relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Search locations, analyze specimen..."
                    className="w-full bg-transparent border-b border-current/20 py-4 font-serif italic text-base outline-none focus:border-current transition-colors pr-24"
                  />
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 flex gap-4">
                    <button onClick={() => fileInputRef.current?.click()} className="opacity-40 hover:opacity-100 p-2" title="Analyze SPECIMEN">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                    </button>
                    <button onClick={() => handleSend()} className="font-mono text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 p-2">TRANS</button>
                  </div>
                </div>
                <input type="file" ref={fileInputRef} onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const r = new FileReader();
                    r.onloadend = () => handleSend("Analyze this visual specimen for Olfactory Synesthesia.", (r.result as string).split(',')[1]);
                    r.readAsDataURL(file);
                  }
                }} accept="image/*" className="hidden" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isControlledOpen && (
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsOpen(!internalOpen)} className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl border ${borderColor} ${isLight ? 'bg-theme-charcoal text-theme-alabaster' : 'bg-theme-alabaster text-theme-charcoal'}`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /><circle cx="12" cy="11" r="1" fill="currentColor" /><circle cx="16" cy="11" r="1" fill="currentColor" /><circle cx="8" cy="11" r="1" fill="currentColor" /></svg>
        </motion.button>
      )}
    </div>
  );
};

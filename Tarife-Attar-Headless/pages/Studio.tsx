
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI } from "@google/genai";

export const Studio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [imageSize, setImageSize] = useState('1K');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [editImage, setEditImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const fileRef = useRef<HTMLInputElement>(null);

  const checkAndOpenKey = async () => {
    if (typeof (window as any).aistudio !== 'undefined') {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await (window as any).aistudio.openSelectKey();
      }
    }
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    await checkAndOpenKey();
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: { parts: [{ text: prompt }] },
        config: { imageConfig: { aspectRatio: aspectRatio as any, imageSize: imageSize as any } }
      });

      for (const part of response.candidates?.[0].content.parts || []) {
        if (part.inlineData) {
          setGeneratedImage(`data:image/png;base64,${part.inlineData.data}`);
          break;
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEdit = async () => {
    if (!editImage || !prompt) return;
    setIsEditing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: editImage.split(',')[1], mimeType: 'image/png' } },
            { text: prompt }
          ]
        }
      });
      for (const part of response.candidates?.[0].content.parts || []) {
        if (part.inlineData) {
          setGeneratedImage(`data:image/png;base64,${part.inlineData.data}`);
          break;
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsEditing(false);
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const r = new FileReader();
      r.onloadend = () => setEditImage(r.result as string);
      r.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-theme-obsidian text-theme-alabaster px-12 pb-40">
      <div className="max-w-7xl mx-auto pt-32 space-y-24">
        <header className="flex justify-between items-end border-b border-white/5 pb-12">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.8em] opacity-40">Visual Specimen Laboratory</span>
            <h1 className="text-6xl md:text-8xl font-serif italic mt-4">The Studio</h1>
          </div>
          <div className="text-right hidden md:block">
            <p className="font-mono text-[9px] uppercase tracking-[0.4em] opacity-20">AISTUDIO_BRIDGE_ACTIVE</p>
            <p className="font-serif italic text-xl opacity-40 mt-2">Transmuting thoughts into archival light.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
          {/* Controls Panel */}
          <div className="space-y-16">
            <section className="space-y-8">
              <h2 className="font-mono text-[10px] uppercase tracking-[0.5em] text-theme-industrial border-b border-white/5 pb-4">Calibration Parameters</h2>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="font-mono text-[9px] uppercase tracking-widest opacity-40">Input Specimen Description</label>
                  <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the atmosphere... 'Ozone, minerals, and the weight of Atlas cedar...'"
                    className="w-full bg-white/5 border border-white/10 rounded-sm p-6 font-serif italic text-xl outline-none focus:border-theme-industrial transition-colors h-40 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="font-mono text-[9px] uppercase tracking-widest opacity-40">Aspect Ratio</label>
                    <select 
                      value={aspectRatio} 
                      onChange={(e) => setAspectRatio(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 p-4 font-mono text-xs uppercase tracking-widest outline-none"
                    >
                      {['1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', '21:9'].map(r => <option key={r} value={r} className="bg-theme-obsidian">{r}</option>)}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="font-mono text-[9px] uppercase tracking-widest opacity-40">Archival Resolution</label>
                    <select 
                      value={imageSize} 
                      onChange={(e) => setImageSize(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 p-4 font-mono text-xs uppercase tracking-widest outline-none"
                    >
                      {['1K', '2K', '4K'].map(s => <option key={s} value={s} className="bg-theme-obsidian">{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-8">
                  <button 
                    onClick={handleGenerate}
                    disabled={isGenerating || isEditing}
                    className="flex-1 py-6 bg-theme-alabaster text-theme-obsidian font-mono text-[11px] uppercase tracking-[1em] hover:bg-white transition-all shadow-xl disabled:opacity-20"
                  >
                    {isGenerating ? 'Synthesizing...' : 'Generate New'}
                  </button>
                  <button 
                    onClick={() => fileRef.current?.click()}
                    className="px-10 py-6 border border-white/20 font-mono text-[11px] uppercase tracking-widest hover:bg-white/5 transition-all"
                  >
                    Upload Specimen
                  </button>
                  <input type="file" ref={fileRef} className="hidden" onChange={handleUpload} accept="image/*" />
                </div>

                {editImage && !generatedImage && (
                  <button 
                    onClick={handleEdit}
                    disabled={isEditing}
                    className="w-full py-4 border border-theme-industrial text-theme-industrial font-mono text-[10px] uppercase tracking-widest hover:bg-theme-industrial hover:text-black transition-all"
                  >
                    {isEditing ? 'Re-distilling...' : 'Distill Uploaded Specimen'}
                  </button>
                )}
              </div>
            </section>

            <section className="p-8 bg-white/[0.02] border border-white/5 rounded-sm">
              <h3 className="font-serif italic text-2xl mb-4">Laboratory Notes</h3>
              <p className="font-serif italic text-sm opacity-40 leading-relaxed">
                The Studio uses Gemini 3 Pro Image protocols for high-fidelity generation and 2.5 Flash for rapid specimen editing. Ensure your descriptions evoke sensory depth to achieve archival stability.
              </p>
            </section>
          </div>

          {/* Result Panel */}
          <div className="relative">
            <div className="sticky top-40 aspect-square md:aspect-[3/4] bg-white/[0.03] border border-white/5 flex items-center justify-center overflow-hidden shadow-2xl">
              <AnimatePresence mode="wait">
                {isGenerating || isEditing ? (
                  <motion.div 
                    key="loading" 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-6"
                  >
                    <div className="w-12 h-12 border-t border-theme-industrial rounded-full animate-spin" />
                    <span className="font-mono text-[10px] uppercase tracking-[1em] animate-pulse">Distilling Light</span>
                  </motion.div>
                ) : generatedImage ? (
                  <motion.img 
                    key="result"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    src={generatedImage} 
                    className="w-full h-full object-contain p-8 grayscale hover:grayscale-0 transition-all duration-[3s] cursor-crosshair"
                  />
                ) : editImage ? (
                  <motion.img 
                    key="edit"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    src={editImage} 
                    className="w-full h-full object-contain p-8 grayscale opacity-40"
                  />
                ) : (
                  <div className="text-center space-y-4 opacity-20">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    <p className="font-mono text-[9px] uppercase tracking-widest">Awaiting Sensory Input</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
            
            {generatedImage && (
              <div className="mt-8 flex justify-between items-center px-4">
                <span className="font-mono text-[8px] uppercase tracking-widest opacity-20">ID: ARCHV_{Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
                <button onClick={() => setGeneratedImage(null)} className="font-mono text-[8px] uppercase tracking-widest opacity-40 hover:opacity-100">[ Clear Specimen ]</button>
              </div>
            )}
          </div>
        </div>
      </div>
      <footer className="mt-40 text-center opacity-10">
        <span className="font-mono text-[8px] uppercase tracking-[1em]">Secure_Studio_Verification_Complete</span>
      </footer>
    </div>
  );
};

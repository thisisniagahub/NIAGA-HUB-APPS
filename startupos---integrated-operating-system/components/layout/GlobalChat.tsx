
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { ChatMessage } from '../../types';
import * as Icons from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { getAgentTools, executeTool } from '../../services/agentTools';

const MotionButton = motion.button as any;
const MotionDiv = motion.div as any;

export const GlobalChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'Hello! I am your StartupOS Agent. I can manage your investors, sales pipeline, and system settings. How can I help?', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatSessionRef = useRef<any>(null);
  
  // Audio Refs for Live API
  const audioContextRef = useRef<AudioContext | null>(null);
  const liveSessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isOpen, activeTool]);

  // Initialize Standard Chat
  useEffect(() => {
    const initChat = async () => {
        const tools = await getAgentTools();
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        chatSessionRef.current = ai.chats.create({
            model: 'gemini-3-flash-preview',
            config: {
                systemInstruction: "You are an autonomous Agent for StartupOS. Be concise and confirm actions.",
                tools: [{ functionDeclarations: tools }],
            }
        });
    };
    initChat();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || !chatSessionRef.current) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      let result = await chatSessionRef.current.sendMessage({ message: userMsg.text });
      
      while (result.functionCalls && result.functionCalls.length > 0) {
          const call = result.functionCalls[0];
          setActiveTool(call.name);
          let toolResult = await executeTool(call.name, call.args);
          
          result = await chatSessionRef.current.sendMessage({
              message: [{
                  functionResponse: {
                      name: call.name,
                      response: { result: toolResult || { status: 'ok' } }
                  }
              }]
          });
      }

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: result.text || "Task completed.",
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Agent Error:', error);
    } finally {
      setIsTyping(false);
      setActiveTool(null);
    }
  };

  // --- LIVE VOICE API LOGIC ---

  const startVoiceMode = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const inputCtx = new AudioContext({ sampleRate: 16000 });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsVoiceActive(true);
            const source = inputCtx.createMediaStreamSource(stream);
            const processor = inputCtx.createScriptProcessor(4096, 1, 1);
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcm16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) pcm16[i] = inputData[i] * 32767;
              
              sessionPromise.then(s => s.sendRealtimeInput({
                media: { data: btoa(String.fromCharCode(...new Uint8Array(pcm16.buffer))), mimeType: 'audio/pcm;rate=16000' }
              }));
            };
            source.connect(processor);
            processor.connect(inputCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            const audioData = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && audioContextRef.current) {
              const binary = atob(audioData);
              const bytes = new Uint8Array(binary.length);
              for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
              const pcm16 = new Int16Array(bytes.buffer);
              const float32 = new Float32Array(pcm16.length);
              for (let i = 0; i < pcm16.length; i++) float32[i] = pcm16[i] / 32768.0;
              
              const buffer = audioContextRef.current.createBuffer(1, float32.length, 24000);
              buffer.getChannelData(0).set(float32);
              const source = audioContextRef.current.createBufferSource();
              source.buffer = buffer;
              source.connect(audioContextRef.current.destination);
              
              const start = Math.max(nextStartTimeRef.current, audioContextRef.current.currentTime);
              source.start(start);
              nextStartTimeRef.current = start + buffer.duration;
            }
          },
          onclose: () => setIsVoiceActive(false),
          onerror: (e) => console.error("Voice Error", e)
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: "You are the Voice of StartupOS. Respond naturally and help the founder."
        }
      });

      liveSessionRef.current = await sessionPromise;
    } catch (e) {
      console.error("Mic Access Denied", e);
    }
  };

  const stopVoiceMode = () => {
    if (liveSessionRef.current) {
        liveSessionRef.current.close();
        setIsVoiceActive(false);
    }
  };

  return (
    <>
      <MotionButton
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-primary-600 to-primary-800 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.5)] flex items-center justify-center z-50 text-white hover:brightness-110 transition-all border border-primary-500/50"
      >
        {isOpen ? <Icons.X size={24} /> : <Icons.Bot size={28} />}
      </MotionButton>

      <AnimatePresence>
        {isOpen && (
          <MotionDiv
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 w-96 h-[600px] bg-black/90 backdrop-blur-xl border border-neutral-800 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-neutral-800 bg-neutral-900/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-600/20 flex items-center justify-center text-primary-500">
                   <Icons.BrainCircuit size={18} />
                </div>
                <h3 className="font-bold text-white text-sm">StartupOS Agent</h3>
              </div>
              <button 
                onClick={isVoiceActive ? stopVoiceMode : startVoiceMode}
                className={`p-2 rounded-full transition-all ${isVoiceActive ? 'bg-red-600 text-white animate-pulse' : 'bg-neutral-800 text-neutral-400 hover:text-white'}`}
              >
                {isVoiceActive ? <Icons.MicOff size={16} /> : <Icons.Mic size={16} />}
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-neutral-800">
              {isVoiceActive && (
                  <div className="flex flex-col items-center justify-center h-full space-y-4">
                      <div className="flex gap-1 items-end h-8">
                          {[...Array(5)].map((_, i) => (
                              <motion.div 
                                key={i}
                                animate={{ height: [8, 32, 8] }}
                                transition={{ repeat: Infinity, duration: 1, delay: i * 0.1 }}
                                className="w-1.5 bg-primary-500 rounded-full"
                              />
                          ))}
                      </div>
                      <p className="text-primary-400 text-xs font-bold uppercase tracking-widest">Voice Connection Live</p>
                  </div>
              )}
              
              {!isVoiceActive && messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-primary-700 text-white rounded-br-none' 
                        : 'bg-neutral-800/80 text-neutral-200 border border-neutral-700/50 rounded-bl-none'
                    }`}
                  >
                     <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                </div>
              ))}
              
              {activeTool && (
                 <div className="flex justify-start animate-fade-in">
                    <div className="ml-2 bg-neutral-900/50 border border-primary-900/30 rounded-lg px-3 py-2 flex items-center gap-3">
                        <Icons.Loader2 size={14} className="animate-spin text-primary-500" />
                        <span className="text-xs text-primary-400 font-mono">Running: {activeTool}...</span>
                    </div>
                 </div>
              )}

              {isTyping && !activeTool && (
                <div className="flex justify-start ml-2">
                  <div className="bg-neutral-800/50 rounded-lg p-3 flex gap-1">
                    <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce delay-100" />
                    <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            {!isVoiceActive && (
                <div className="p-4 pt-2">
                    <div className="relative">
                        <input
                        type="text"
                        className="w-full bg-neutral-900/90 border border-neutral-800 rounded-xl pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-primary-600 shadow-lg"
                        placeholder="Ask your agent..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button 
                        onClick={handleSend}
                        disabled={!input || isTyping}
                        className="absolute right-2 top-2 p-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-500 disabled:opacity-50"
                        >
                        <Icons.ArrowUp size={18} />
                        </button>
                    </div>
                </div>
            )}
          </MotionDiv>
        )}
      </AnimatePresence>
    </>
  );
};

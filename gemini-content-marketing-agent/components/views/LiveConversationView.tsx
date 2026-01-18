
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import Spinner from '../common/Spinner';

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

const LiveConversationView: React.FC = () => {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [status, setStatus] = useState('Not connected');
  const [transcription, setTranscription] = useState<{ user: string; model: string }[]>([]);
  const [currentTurn, setCurrentTurn] = useState({ user: '', model: '' });

  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  
  const nextStartTimeRef = useRef(0);
  const audioSourcesRef = useRef(new Set<AudioBufferSourceNode>());

  const stopSession = useCallback(() => {
    if (sessionPromiseRef.current) {
        sessionPromiseRef.current.then(session => {
          try { session.close(); } catch(e) {}
        });
        sessionPromiseRef.current = null;
    }
    
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }
    if (scriptProcessorRef.current) {
        scriptProcessorRef.current.disconnect();
        scriptProcessorRef.current = null;
    }
    if (mediaStreamSourceRef.current) {
        mediaStreamSourceRef.current.disconnect();
        mediaStreamSourceRef.current = null;
    }
    if(inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
        inputAudioContextRef.current.close();
    }
    if(outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
        outputAudioContextRef.current.close();
    }
    
    setIsSessionActive(false);
    setStatus('Disconnected');
  }, []);

  const startSession = useCallback(async () => {
    setIsSessionActive(true);
    setStatus('Connecting...');
    setTranscription([]);
    setCurrentTurn({ user: '', model: '' });
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      inputAudioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      
      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: 'You are a brilliant and witty content marketing director. Engage in a natural, spoken conversation about branding and creative direction. Keep responses snappy.'
        },
        callbacks: {
          onopen: () => {
            setStatus('Active');
            const source = inputCtx.createMediaStreamSource(stream);
            mediaStreamSourceRef.current = source;
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;

            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              if (sessionPromiseRef.current) {
                sessionPromiseRef.current.then((session) => {
                  session.sendRealtimeInput({ media: pcmBlob });
                });
              }
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
              setCurrentTurn(prev => ({...prev, user: prev.user + message.serverContent!.inputTranscription!.text}));
            }
            if (message.serverContent?.outputTranscription) {
              setCurrentTurn(prev => ({...prev, model: prev.model + message.serverContent!.outputTranscription!.text}));
            }
            if (message.serverContent?.turnComplete) {
              setTranscription(prev => [...prev, { ...currentTurn }]);
              setCurrentTurn({ user: '', model: '' });
            }

            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && outputAudioContextRef.current) {
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current.currentTime);
                const audioBuffer = await decodeAudioData(decode(audioData), outputAudioContextRef.current, 24000, 1);
                const source = outputAudioContextRef.current.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputAudioContextRef.current.destination);
                source.addEventListener('ended', () => audioSourcesRef.current.delete(source));
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                audioSourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
                for (const source of audioSourcesRef.current.values()) {
                    try { source.stop(); } catch(e) {}
                }
                audioSourcesRef.current.clear();
                nextStartTimeRef.current = 0;
            }
          },
          onerror: (e: any) => {
            console.error('Session Error:', e);
            setStatus(`Error: ${e.message || 'Connection failed'}`);
            stopSession();
          },
          onclose: () => {
            setStatus('Closed');
            stopSession();
          },
        },
      });
      await sessionPromiseRef.current;

    } catch (err) {
      console.error('Failed to start session:', err);
      setStatus(`Failed to start: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsSessionActive(false);
    }
  }, [stopSession, currentTurn]);
  
  useEffect(() => {
    return () => { stopSession(); };
  }, [stopSession]);

  return (
    <div className="h-full flex flex-col bg-gray-800/50 rounded-lg p-6 space-y-6 border border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Live Creative Room</h2>
          <p className="text-gray-400">Jam on marketing ideas in real-time with Zephyr.</p>
        </div>
        <div className="flex items-center space-x-4 bg-gray-900/50 p-2 rounded-xl border border-gray-700">
          <div className="flex items-center space-x-2 px-3">
             <div className={`w-3 h-3 rounded-full ${isSessionActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
             <span className="text-xs font-mono uppercase tracking-wider text-gray-400">{status}</span>
          </div>
          {!isSessionActive ? (
            <button onClick={startSession} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-500 transition-all shadow-md">Connect</button>
          ) : (
            <button onClick={stopSession} className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-500 transition-all shadow-md">Disconnect</button>
          )}
        </div>
      </div>

      <div className="flex-1 bg-gray-950 rounded-2xl p-6 overflow-y-auto border border-gray-800 space-y-6 custom-scrollbar relative">
        <div className="absolute top-4 right-4 opacity-10 pointer-events-none">
          <svg className="w-32 h-32 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"></path></svg>
        </div>
        
        {transcription.map((turn, index) => (
          <div key={index} className="space-y-2 group animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-start space-x-3">
              <span className="text-[10px] font-black text-indigo-400 uppercase mt-1">USER</span>
              <p className="text-gray-300 border-l-2 border-indigo-900 pl-3">{turn.user}</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-[10px] font-black text-teal-400 uppercase mt-1">AI</span>
              <p className="text-gray-100 font-medium pl-3">{turn.model}</p>
            </div>
          </div>
        ))}

        {isSessionActive && (
          <div className="space-y-4">
             {currentTurn.user && (
               <div className="flex items-start space-x-3 animate-pulse">
                 <span className="text-[10px] font-black text-indigo-500/50 uppercase mt-1 tracking-tighter">LISTENING</span>
                 <p className="text-gray-500 italic pl-3">{currentTurn.user}...</p>
               </div>
             )}
             {currentTurn.model && (
               <div className="flex items-start space-x-3">
                 <span className="text-[10px] font-black text-teal-400 uppercase mt-1">AI</span>
                 <p className="text-teal-50 shadow-teal-900/20 drop-shadow-sm font-semibold pl-3">{currentTurn.model}</p>
               </div>
             )}
          </div>
        )}
        {!isSessionActive && transcription.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mb-4 border border-gray-800">
               <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
            </div>
            <h3 className="text-lg font-bold text-gray-200">Start the Creative Session</h3>
            <p className="text-gray-500 max-w-xs mx-auto text-sm mt-1">Press connect to begin a real-time voice strategy meeting with Zephyr.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveConversationView;

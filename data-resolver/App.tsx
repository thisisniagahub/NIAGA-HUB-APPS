/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useRef } from 'react';
import { generateInputData } from './constants';
import { InputData, ProcessedResult } from './types';
import { mergeData } from './services/geminiService';
import { DataCard } from './components/DataCard';
import { LogTerminal } from './components/LogTerminal';
import { Zap, Play, RotateCw, Database, MessageSquare, ArrowRight, Layers, FileJson, Terminal, BrainCircuit, Activity } from 'lucide-react';

const App: React.FC = () => {
  const [queue, setQueue] = useState<InputData[]>([]);
  const [resolutionHistory, setResolutionHistory] = useState<ProcessedResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [useThinking, setUseThinking] = useState(false);
  
  // Processing Stats
  const [processedCount, setProcessedCount] = useState(0);
  const [avgLatency, setAvgLatency] = useState(0);

  const queueRef = useRef<InputData[]>([]);
  const isAtBottomRef = useRef(true);

  useEffect(() => {
    const handleScroll = () => {
      const { scrollY, innerHeight } = window;
      const { scrollHeight } = document.documentElement;
      const isAtBottom = scrollHeight - (scrollY + innerHeight) < 150;
      isAtBottomRef.current = isAtBottom;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isAtBottomRef.current) {
      const timeoutId = setTimeout(() => {
        window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: 'smooth'
        });
      }, 200);
      return () => clearTimeout(timeoutId);
    }
  }, [resolutionHistory]);

  useEffect(() => {
    const initialData = generateInputData(5);
    setQueue(initialData);
    queueRef.current = initialData;
  }, []);

  const addToQueue = () => {
    const newData = generateInputData(5);
    setQueue(prev => [...prev, ...newData]);
    queueRef.current = [...queueRef.current, ...newData];
  };

  const processQueue = async () => {
    if (isProcessing || queueRef.current.length === 0) return;
    setIsProcessing(true);

    const processItem = async () => {
      if (queueRef.current.length === 0) {
        setIsProcessing(false);
        return;
      }

      const item = queueRef.current.shift();
      setQueue([...queueRef.current]);

      if (!item) return;

      const currentMode = useThinking ? 'thinking' : 'flash';
      const tempResult: ProcessedResult = {
          id: item.id,
          input: item,
          output: null,
          logs: ["Waking up agent..."],
          durationMs: 0,
          status: 'processing',
          mode: currentMode
      };

      setResolutionHistory(prev => [...prev, tempResult]);

      const start = performance.now();
      
      const updateLogs = (newLog: string) => {
        setResolutionHistory(prev => prev.map(r => {
          if (r.id === item.id) {
            return { ...r, logs: [...r.logs, newLog] };
          }
          return r;
        }));
      };

      const result = await mergeData(item, currentMode, {
        onLog: (log) => updateLogs(log)
      });
      
      const duration = performance.now() - start;

      setResolutionHistory(prev => prev.map(r => {
        if (r.id === item.id) {
          return {
            ...r,
            output: result,
            durationMs: duration,
            status: result ? 'completed' : 'error'
          };
        }
        return r;
      }));

      if (result) {
        setProcessedCount(prev => prev + 1);
        setAvgLatency(prev => (prev * processedCount + duration) / (processedCount + 1));
      }

      if (queueRef.current.length > 0) {
        setTimeout(processItem, 1500); 
      } else {
        setIsProcessing(false);
      }
    };

    processItem();
  };

  const latestResult = resolutionHistory.length > 0 ? resolutionHistory[resolutionHistory.length - 1] : null;

  return (
    <div className="min-h-screen bg-[#121212] text-[#E3E3E3] p-6 font-sans">
      
      <header className="max-w-[1600px] mx-auto mb-8 flex flex-col xl:row justify-between items-center pb-6 border-b border-[#444746]">
        <div className="flex items-center gap-4">
          <div className="bg-[#1E1E1E] p-3 rounded-2xl shadow-lg border border-[#444746]">
            <Layers className="text-[#8AB4F8]" size={28} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-normal text-[#E3E3E3] tracking-tight">
              Customer Data Resolver
            </h1>
            <p className="text-[#C4C7C5] text-sm mt-1 max-w-2xl">
              Compare <span className="text-[#78D9EC] font-semibold">Gemini 3 Flash</span> (Efficiency) vs <span className="text-[#D0BCFF] font-semibold">Gemini 3 Pro</span> (Deep Reasoning) for automated ETL.
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap justify-center items-center gap-4 mt-6 xl:mt-0">
          {/* Mode Toggle */}
          <div className="flex items-center bg-[#1E1E1E] p-1 rounded-full border border-[#444746] mr-4">
             <button 
               onClick={() => setUseThinking(false)}
               className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${!useThinking ? 'bg-[#004A77] text-[#D3E3FD]' : 'text-[#757775]'}`}
             >
               <Activity size={14} /> FLASH
             </button>
             <button 
               onClick={() => setUseThinking(true)}
               className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${useThinking ? 'bg-[#4F378B] text-[#E8DEF8]' : 'text-[#757775]'}`}
             >
               <BrainCircuit size={14} /> THINKING
             </button>
          </div>

          <button 
            onClick={addToQueue}
            className="flex items-center gap-2 px-6 py-3 rounded-full border border-[#444746] text-[#C4C7C5] hover:bg-[#1E1E1E] transition-colors text-xs font-medium uppercase tracking-wider"
          >
            <RotateCw size={16} />
            Generate 5 New
          </button>
          <button 
            onClick={processQueue}
            disabled={isProcessing || queue.length === 0}
            className={`flex items-center gap-2 px-8 py-3 rounded-full text-xs font-bold tracking-widest uppercase transition-all shadow-md ${
              isProcessing || queue.length === 0
                ? 'bg-[#1E1E1E] text-[#757775] cursor-not-allowed' 
                : useThinking 
                  ? 'bg-[#D0BCFF] text-[#381E72] hover:bg-[#E8DEF8] shadow-[#D0BCFF]/20'
                  : 'bg-[#8AB4F8] text-[#001D35] hover:bg-[#A8C7FA] shadow-[#8AB4F8]/20'
            }`}
          >
            <Play size={16} fill="currentColor" />
            {isProcessing ? 'Resolving Stream...' : 'Start Pipeline'}
          </button>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Inventory */}
        <section className="lg:col-span-3 flex flex-col gap-6 lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
           <div className="flex flex-col gap-4 flex-1 min-h-0">
               <div className="flex justify-between items-center px-2">
                    <h2 className="text-sm font-bold text-[#C4C7C5] flex items-center gap-2 tracking-widest uppercase">
                        <Database size={16}/> INCOMING QUEUE
                    </h2>
                    <span className="bg-[#1E1E1E] border border-[#444746] text-[#E3E3E3] text-[10px] font-mono px-3 py-1 rounded-full">{queue.length}</span>
               </div>
               
               <div className="bg-[#1E1E1E] rounded-[24px] p-2 flex-1 shadow-sm border border-[#444746] overflow-hidden flex flex-col min-h-[200px]">
                 <div className="flex-1 overflow-y-auto space-y-2 p-2 custom-scrollbar">
                   {queue.length === 0 && (
                     <div className="flex flex-col items-center justify-center h-full text-[#757775]">
                        <Database size={32} className="opacity-10 mb-3" />
                        <span className="italic text-xs">Waiting for data...</span>
                     </div>
                   )}
                   {queue.map((item) => (
                     <div key={item.id} className="bg-[#2B2B2B] p-4 rounded-xl border border-transparent hover:border-[#8AB4F8]/30 transition-all group">
                       <div className="flex justify-between items-center mb-2">
                         <span className="text-[#8AB4F8] text-[9px] font-mono font-bold">{item.id}</span>
                         <span className="text-[#757775] text-[9px]">{new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                       </div>
                       <div className="text-xs text-[#E3E3E3] font-medium mb-1">{item.customerRecord.name}</div>
                       <div className="text-[10px] text-[#C4C7C5] bg-[#121212]/50 p-2 rounded border border-[#444746]/50 line-clamp-1 italic">
                         {item.chatTranscript.replace('User: ', '')}
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
           </div>

           <div className="h-[280px] shrink-0 flex flex-col gap-2">
               <h2 className="text-xs font-bold text-[#C4C7C5] px-2 flex items-center gap-2 tracking-widest uppercase">
                  <Terminal size={14}/> SYSTEM TELEMETRY
               </h2>
               <div className="flex-1 bg-[#1E1E1E] rounded-2xl border border-[#444746] overflow-hidden shadow-lg">
                  <LogTerminal 
                    logs={latestResult ? latestResult.logs : []} 
                    type={latestResult?.mode === 'thinking' ? 'thinking' : 'flash'} 
                  />
               </div>
           </div>
        </section>

        {/* Right Side: Execution Stage */}
        <section className="lg:col-span-9 flex flex-col gap-6">
          <div className="bg-[#121212] rounded-[32px] border border-[#444746] p-1 shadow-2xl relative flex flex-col min-h-[800px]">
             
             <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                  style={{ backgroundImage: 'radial-gradient(#FFFFFF 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
             </div>

             <div className="sticky top-0 z-30 p-6 flex justify-between items-center bg-[#1E1E1E]/80 backdrop-blur-xl rounded-t-[28px] border-b border-[#444746]">
                <div className="flex items-center gap-4">
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${useThinking ? 'bg-[#381E72]' : 'bg-[#004A77]'}`}>
                      {useThinking ? <BrainCircuit className="text-[#D0BCFF]" size={24} /> : <Zap className="fill-[#78D9EC] text-[#78D9EC]" size={24} />}
                   </div>
                   <div>
                       <h2 className="text-xl font-medium text-[#E3E3E3] tracking-tight">Active Resolution Feed</h2>
                       <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full animate-pulse ${isProcessing ? 'bg-green-500' : 'bg-orange-500'}`}></span>
                          <p className="text-xs text-[#C4C7C5] uppercase tracking-wider font-bold">
                            {isProcessing ? `Processing with Gemini 3 ${useThinking ? 'Pro' : 'Flash'}` : 'System Standby'}
                          </p>
                       </div>
                   </div>
                </div>
                <div className="flex gap-8">
                    <div className="text-right">
                        <div className="text-[10px] uppercase tracking-widest text-[#757775] mb-1 font-bold">Latency</div>
                        <div className={`font-mono text-xl ${latestResult && latestResult.durationMs > 2000 ? 'text-orange-400' : 'text-[#8AB4F8]'}`}>
                            {latestResult && latestResult.durationMs > 0 
                                ? `${(latestResult.durationMs / 1000).toFixed(2)}s` 
                                : '0.00s'}
                        </div>
                    </div>
                    <div className="text-right border-l border-[#444746] pl-8">
                        <div className="text-[10px] uppercase tracking-widest text-[#757775] mb-1 font-bold">Success</div>
                        <div className="font-mono text-xl text-[#E3E3E3]">{processedCount}</div>
                    </div>
                </div>
             </div>

             <div className="relative z-10 p-6 pb-20">
                {resolutionHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center min-h-[600px]">
                        <Activity size={100} className="mb-6 text-[#1E1E1E] stroke-[1px]" />
                        <h3 className="text-2xl font-light text-[#444746]">Initialize Data Stream</h3>
                        <p className="text-sm mt-3 text-[#757775] max-w-sm text-center">Select your model logic and click Start Pipeline to begin the real-time resolution process.</p>
                    </div>
                ) : (
                    <div className="space-y-16">
                        {resolutionHistory.slice().reverse().map((result, index) => {
                          const isLatest = index === 0;
                          return (
                            <div 
                                key={result.id} 
                                className={`transition-all duration-700 ease-in-out ${
                                    isLatest ? 'opacity-100' : 'opacity-40 grayscale-[0.5]'
                                }`}
                            >
                                <div className="grid grid-cols-1 xl:grid-cols-11 gap-8 items-start">
                                    
                                    <div className="xl:col-span-5 flex flex-col gap-6">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="bg-[#444746] text-[#E3E3E3] text-[9px] font-bold px-2 py-0.5 rounded">TX SOURCE</span>
                                            <span className="text-[#757775] text-[10px] font-mono">{result.id}</span>
                                        </div>
                                        
                                        <div className="bg-[#1E1E1E] p-6 rounded-[24px] border border-[#444746] relative shadow-xl overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                              <MessageSquare size={80} />
                                            </div>
                                            <div className="flex items-start gap-4">
                                                <div className="bg-[#004A77]/30 p-3 rounded-xl shrink-0">
                                                    <MessageSquare size={20} className="text-[#8AB4F8]" />
                                                </div>
                                                <div className="relative z-10">
                                                    <div className="text-[10px] text-[#8AB4F8] uppercase tracking-widest font-black mb-2">Unstructured Chat Transcript</div>
                                                    <p className="text-base text-[#E3E3E3] leading-relaxed italic font-light">
                                                        "{result.input.chatTranscript.replace('User: ', '')}"
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-[#1E1E1E] p-6 rounded-[24px] border border-[#444746] relative opacity-90 shadow-lg">
                                             <div className="flex items-start gap-4">
                                                <div className="bg-[#2B2B2B] p-3 rounded-xl shrink-0">
                                                    <FileJson size={20} className="text-[#C4C7C5]" />
                                                </div>
                                                <div className="w-full">
                                                    <div className="text-[10px] text-[#C4C7C5] uppercase tracking-widest font-black mb-2">Internal Database Snap</div>
                                                    <div className="bg-[#121212] p-4 rounded-xl border border-[#444746]/30 font-mono text-[11px] text-[#8AB4F8]/70 overflow-hidden">
                                                        <pre className="whitespace-pre-wrap">{JSON.stringify(result.input.customerRecord, null, 2)}</pre>
                                                    </div>
                                                </div>
                                             </div>
                                        </div>
                                    </div>

                                    <div className="xl:col-span-1 flex justify-center py-8 xl:py-20">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border border-[#444746] ${result.status === 'processing' ? 'bg-[#004A77] shadow-[0_0_20px_rgba(120,217,236,0.2)]' : 'bg-[#2B2B2B]'}`}>
                                            <ArrowRight className={`text-[#E3E3E3] ${result.status === 'processing' ? 'animate-pulse' : ''} xl:rotate-0 rotate-90`} size={24} />
                                        </div>
                                    </div>

                                    <div className="xl:col-span-5">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                              <span className={`text-[10px] font-black uppercase tracking-widest ${result.mode === 'thinking' ? 'text-[#D0BCFF]' : 'text-[#78D9EC]'}`}>
                                                {result.mode === 'thinking' ? 'Gemini 3 Pro Resolution' : 'Gemini 3 Flash Resolve'}
                                              </span>
                                              {result.status === 'processing' && (
                                                <div className="flex gap-1">
                                                   <span className="w-1 h-1 bg-current rounded-full animate-bounce"></span>
                                                   <span className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                                   <span className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                                </div>
                                              )}
                                            </div>
                                            {result.durationMs > 0 && (
                                              <span className="text-[10px] font-mono text-[#757775]">Latency: {result.durationMs.toFixed(0)}ms</span>
                                            )}
                                        </div>
                                        <DataCard 
                                            data={result.output} 
                                            loading={result.status === 'processing'} 
                                        />
                                    </div>

                                </div>
                                <div className="mt-16 border-b border-[#444746]/20 w-full"></div>
                            </div>
                          );
                        })}
                    </div>
                )}
             </div>

          </div>
        </section>

      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #444746;
          border-radius: 20px;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .animate-blink {
          animation: blink 0.8s infinite;
        }
      `}</style>
    </div>
  );
};

export default App;
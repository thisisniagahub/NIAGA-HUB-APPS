
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import Spinner from '../common/Spinner';

type QuickToolType = 'headline' | 'social' | 'ideas';

const toolPrompts: Record<QuickToolType, string> = {
  headline: 'Generate 5 high-converting, SEO-optimized headlines for:',
  social: 'Create a viral-style LinkedIn/Twitter post about:',
  ideas: 'Brainstorm 3 unique, high-engagement content angles for:',
};

const QuickToolsView: React.FC = () => {
  const [activeTool, setActiveTool] = useState<QuickToolType>('headline');
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!input.trim()) {
      setError('Enter a topic.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: 'gemini-flash-lite-latest',
        contents: `${toolPrompts[activeTool]} "${input.trim()}"`,
        config: { thinkingBudget: 0 },
      });
      setResult(response.text || '');
    } catch (e) {
      setError(`Failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-800/50 rounded-lg p-6 space-y-6 border border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Quick Generators</h2>
          <p className="text-gray-400 text-sm">Instant marketing collateral with Gemini Flash-Lite.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 bg-gray-900/80 p-1 rounded-xl border border-gray-700">
        {(Object.keys(toolPrompts) as QuickToolType[]).map((tool) => (
          <button
            key={tool}
            onClick={() => { setActiveTool(tool); setResult(''); }}
            className={`py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
              activeTool === tool ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
            }`}
          >
            {tool}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Enter topic for ${activeTool}...`}
          className="flex-1 p-4 bg-gray-900 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-200"
          disabled={isLoading}
        />
        <button
          onClick={handleGenerate}
          disabled={isLoading || !input.trim()}
          className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 disabled:bg-indigo-900/50 transition-all flex items-center justify-center shadow-lg"
        >
          {isLoading ? <Spinner className="w-5 h-5" /> : 'Blast'}
        </button>
      </div>
      
      {error && <div className="text-red-400 text-sm px-2">{error}</div>}

      <div className="flex-1 bg-gray-950/50 rounded-2xl p-6 overflow-y-auto border border-gray-800 shadow-inner">
        {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
                <div className="w-12 h-1 bg-gray-800 rounded-full overflow-hidden">
                   <div className="h-full bg-indigo-500 animate-[loading_1.5s_infinite_linear]"></div>
                </div>
                <p className="text-gray-500 text-xs animate-pulse">Optimizing content...</p>
            </div>
        ) : result ? (
          <div className="prose prose-invert max-w-none text-gray-200 leading-relaxed font-mono text-sm">
            {result}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-700 uppercase tracking-widest text-[10px] font-black italic">
            Awaiting prompt Input
          </div>
        )}
      </div>
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default QuickToolsView;

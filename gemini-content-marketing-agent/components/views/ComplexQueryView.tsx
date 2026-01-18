
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import Spinner from '../common/Spinner';

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
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

const ComplexQueryView: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTtsLoading, setIsTtsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a detailed prompt.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          systemInstruction:
            'You are a world-class marketing architect. Provide deep, long-form content strategies, brand playbooks, and technical SEO audits. Use markdown for structure.',
          thinkingConfig: { thinkingBudget: 32768 },
        },
      });
      setResult(response.text || '');
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Generation failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTTS = async () => {
    if (!result) return;
    setIsTtsLoading(true);
    setError(null);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const ttsResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: `Summarize the following and present it as a clear spoken update: ${result.slice(0, 1000)}` }] }],
            config: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });

        const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            const buffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);
            source.start();
        } else {
            setError("Could not generate audio summary.");
        }
    } catch (e) {
        setError(`TTS failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
    } finally {
        setIsTtsLoading(false);
    }
};

  return (
    <div className="h-full flex flex-col bg-gray-800/50 rounded-lg p-6 space-y-6 border border-gray-700">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Deep Strategy Architect</h2>
        <p className="text-gray-400">Advanced reasoning and long-form analysis powered by Gemini 3 Pro.</p>
      </div>
      
      <div className="flex flex-col flex-1 space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your project, target audience, and specific goals for a comprehensive strategy..."
          className="w-full p-4 bg-gray-900 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-gray-200 min-h-[150px]"
          disabled={isLoading}
        />

        <div className="flex gap-4">
          <button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="flex-1 px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 disabled:bg-indigo-900/50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center"
          >
            {isLoading ? <><Spinner className="mr-2" /> Architecting...</> : 'Launch Analysis'}
          </button>
           <button
              onClick={handleTTS}
              disabled={isLoading || isTtsLoading || !result}
              className="px-8 py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-500 disabled:bg-teal-900/50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center"
            >
              {isTtsLoading ? <Spinner /> : 'Audio Summary'}
            </button>
        </div>
      </div>

      {error && <div className="p-3 bg-red-900/20 border border-red-900/50 text-red-400 rounded-lg text-sm">{error}</div>}

      <div className="flex-[2] bg-gray-900/80 rounded-xl p-6 overflow-y-auto border border-gray-700 custom-scrollbar shadow-inner">
        {result ? (
          <div className="prose prose-invert max-w-none whitespace-pre-wrap leading-relaxed text-gray-300">
            {result}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-600 italic">
            <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            <p>Your strategic analysis will appear here after generation.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplexQueryView;

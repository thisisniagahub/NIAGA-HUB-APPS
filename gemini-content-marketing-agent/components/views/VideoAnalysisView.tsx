
import React, { useState, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import Spinner from '../common/Spinner';

const MAX_FRAMES = 16;

const VideoAnalysisView: React.FC = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('Perform a competitive analysis: Identify brand placement, visual hook, and target demographics.');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setResult('');
      setError(null);
    }
  };

  const extractFrames = async (videoUrl: string): Promise<{inlineData: {mimeType: string, data: string}}[]> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.src = videoUrl;
      video.muted = true;
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const frames: {inlineData: {mimeType: string, data: string}}[] = [];

      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const duration = video.duration;
        const interval = duration / MAX_FRAMES;
        let currentTime = 0;
        let framesCaptured = 0;

        const captureFrame = () => {
          if (currentTime > duration || framesCaptured >= MAX_FRAMES) {
            if (frames.length === 0) reject(new Error("Frame extraction failed"));
            else resolve(frames);
            return;
          }
          video.currentTime = currentTime;
        };

        video.onseeked = () => {
          if(!context) return;
          context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
          frames.push({
            inlineData: {
              mimeType: 'image/jpeg',
              data: canvas.toDataURL('image/jpeg', 0.6).split(',')[1]
            }
          });
          framesCaptured++;
          setProgress(`Capturing visual data... ${Math.round((framesCaptured / MAX_FRAMES) * 100)}%`);
          currentTime += interval;
          setTimeout(captureFrame, 50);
        };
        captureFrame();
      };
      video.onerror = () => reject('Video load error');
    });
  };

  const handleAnalyze = async () => {
    if (!videoFile) return;
    setIsLoading(true);
    setError(null);
    setResult('');
    setProgress('Initializing...');

    try {
      const videoUrl = URL.createObjectURL(videoFile);
      const frames = await extractFrames(videoUrl);
      URL.revokeObjectURL(videoUrl);

      setProgress('Consulting Gemini 3 Pro...');
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: { parts: [{ text: prompt }, ...frames] },
      });

      setResult(response.text || 'No insights generated.');
    } catch (e) {
      setError(`Analysis error: ${e instanceof Error ? e.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
      setProgress('');
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-800/50 rounded-lg p-6 space-y-6 border border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Vision Intelligence</h2>
          <p className="text-gray-400">Deconstruct video content into marketing insights with Gemini 3 Pro.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 flex-1 min-h-0">
        <div className="flex flex-col space-y-4">
          <div className="relative group">
            <input
              id="video-upload"
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="video-upload"
              className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-700 rounded-2xl cursor-pointer bg-gray-900/50 hover:bg-gray-900 hover:border-indigo-500 transition-all overflow-hidden"
            >
              {videoFile ? (
                 <div className="text-indigo-400 text-sm font-bold flex items-center">
                   <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"></path></svg>
                   {videoFile.name}
                 </div>
              ) : (
                <div className="text-gray-500 text-center">
                  <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                  <p className="text-xs uppercase font-black tracking-widest">Drop Creative Asset</p>
                </div>
              )}
            </label>
          </div>
          
          <div className="flex-1 bg-gray-900 rounded-2xl border border-gray-800 p-4 relative overflow-hidden flex items-center justify-center">
            {videoFile ? (
              <video ref={videoRef} src={URL.createObjectURL(videoFile)} controls className="max-w-full max-h-full rounded-lg shadow-2xl" />
            ) : (
              <span className="text-gray-800 text-4xl font-black opacity-20 select-none">PREVIEW</span>
            )}
          </div>
        </div>

        <div className="flex flex-col space-y-4">
          <div className="flex flex-col flex-1 bg-gray-900 rounded-2xl border border-gray-800 p-4 space-y-4">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Analysis Parameter</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1 w-full bg-transparent border-none focus:ring-0 text-gray-200 resize-none text-sm leading-relaxed"
              disabled={isLoading}
            />
            <button
              onClick={handleAnalyze}
              disabled={isLoading || !videoFile}
              className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 disabled:bg-indigo-900/50 transition-all flex items-center justify-center shadow-lg"
            >
              {isLoading ? (
                <div className="flex items-center space-x-3">
                  <Spinner className="w-5 h-5" />
                  <span className="text-sm uppercase tracking-wider">{progress}</span>
                </div>
              ) : 'Run Intelligence Audit'}
            </button>
          </div>

          <div className="flex-[1.5] bg-gray-950 rounded-2xl border border-gray-800 p-6 overflow-y-auto custom-scrollbar">
            {result ? (
              <pre className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed font-sans">{result}</pre>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-800 text-[10px] uppercase font-black tracking-[0.2em]">Audit Queue Empty</div>
            )}
          </div>
        </div>
      </div>
      
      {error && <div className="p-3 bg-red-900/20 border border-red-900/50 text-red-400 rounded-lg text-xs">{error}</div>}
    </div>
  );
};

export default VideoAnalysisView;

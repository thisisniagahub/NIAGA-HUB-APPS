
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import ApiKeySelector from '../common/ApiKeySelector';
import Spinner from '../common/Spinner';

const loadingMessages = [
  "Summoning digital actors...",
  "Calibrating the virtual cameras...",
  "Rendering pixels into motion...",
  "Teaching AI about cinematography...",
  "This can take a few minutes, please wait...",
  "Compositing the final scenes...",
  "Adding a sprinkle of AI magic...",
];

const VideoGenerationView: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isKeySelected, setIsKeySelected] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
  
  useEffect(() => {
    let interval: number;
    if (isLoading) {
      interval = window.setInterval(() => {
        setLoadingMessage(prev => {
          const currentIndex = loadingMessages.indexOf(prev);
          return loadingMessages[(currentIndex + 1) % loadingMessages.length];
        });
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleKeySelected = () => {
    setIsKeySelected(true);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setVideoUrl(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio,
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        if(!videoResponse.ok) throw new Error(`Failed to fetch video: ${videoResponse.statusText}`);
        
        const blob = await videoResponse.blob();
        setVideoUrl(URL.createObjectURL(blob));
      } else {
        throw new Error('Video generation completed, but no download link was found.');
      }

    } catch (e) {
      let errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
       if (errorMessage.includes("Requested entity was not found")) {
        errorMessage = "API Key not found or invalid. Please select a valid key.";
        setIsKeySelected(false); // Force re-selection
      }
      setError(`Failed to generate video: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-800/50 rounded-lg p-4 sm:p-6 space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white">Veo Video Generation</h2>
        <p className="text-sm text-gray-400">Create a short video from a text prompt using Veo 3.</p>
      </div>

      {!isKeySelected && <ApiKeySelector onKeySelected={handleKeySelected} />}
      
      {isKeySelected && (
        <>
        <div className="space-y-4">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., 'A cinematic shot of a robot surfing on a giant wave of data...'"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              rows={4}
              disabled={isLoading}
            />

            <div className="flex items-center space-x-4">
                <span className="text-gray-300">Aspect Ratio:</span>
                <div className="flex gap-2">
                    <button onClick={() => setAspectRatio('16:9')} disabled={isLoading} className={`px-4 py-2 rounded-md ${aspectRatio === '16:9' ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600'}`}>Landscape (16:9)</button>
                    <button onClick={() => setAspectRatio('9:16')} disabled={isLoading} className={`px-4 py-2 rounded-md ${aspectRatio === '9:16' ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600'}`}>Portrait (9:16)</button>
                </div>
            </div>

            <button
                onClick={handleGenerate}
                disabled={isLoading || !prompt.trim()}
                className="w-full px-6 py-3 bg-indigo-600 rounded-lg disabled:bg-indigo-900 disabled:cursor-not-allowed hover:bg-indigo-500 transition-colors flex items-center justify-center text-lg"
            >
                {isLoading ? <><Spinner /><span className="ml-2">Generating Video...</span></> : 'Generate Video'}
            </button>
        </div>

        {error && <div className="text-red-400 text-center">{error}</div>}

        <div className="flex-1 bg-gray-900 rounded-lg p-4 flex items-center justify-center border border-gray-700">
            {isLoading ? (
                <div className="text-center">
                    <Spinner className="w-12 h-12 mx-auto mb-4" />
                    <p className="text-lg text-gray-300">{loadingMessage}</p>
                </div>
            ) : videoUrl ? (
                <video src={videoUrl} controls autoPlay loop className="max-w-full max-h-full rounded-lg" />
            ) : (
                <p className="text-gray-500">Your generated video will appear here.</p>
            )}
        </div>
        </>
      )}
    </div>
  );
};

export default VideoGenerationView;


import React, { useState, useEffect, useCallback } from 'react';

interface ApiKeySelectorProps {
  onKeySelected: () => void;
}

const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onKeySelected }) => {
  const [hasKey, setHasKey] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const checkApiKey = useCallback(async () => {
    setIsChecking(true);
    if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
      const result = await window.aistudio.hasSelectedApiKey();
      setHasKey(result);
      if(result) {
        onKeySelected();
      }
    } else {
      setHasKey(false); 
    }
    setIsChecking(false);
  }, [onKeySelected]);

  useEffect(() => {
    checkApiKey();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      await window.aistudio.openSelectKey();
      // Assume success to avoid race condition and re-enable UI
      setHasKey(true);
      onKeySelected();
    }
  };

  if (isChecking) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-gray-800 rounded-lg">
        <p className="text-gray-300">Checking for API Key...</p>
      </div>
    );
  }

  if (hasKey) {
    return null; // Key is selected, render nothing
  }

  return (
    <div className="p-6 bg-gray-800 border border-indigo-500 rounded-lg text-center shadow-lg">
      <h3 className="text-lg font-semibold text-white mb-2">API Key Required for Video Generation</h3>
      <p className="text-gray-400 mb-4">
        To use the Veo video generation feature, you need to select an API key. This will be used for billing purposes.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={handleSelectKey}
          className="w-full sm:w-auto px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75"
        >
          Select API Key
        </button>
        <a
          href="https://ai.google.dev/gemini-api/docs/billing"
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-400 hover:text-indigo-300 text-sm"
        >
          Learn about billing
        </a>
      </div>
    </div>
  );
};

export default ApiKeySelector;

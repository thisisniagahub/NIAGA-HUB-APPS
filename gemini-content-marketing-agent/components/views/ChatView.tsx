
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse } from '@google/genai';
import { ChatMessage } from '../../types';
import Spinner from '../common/Spinner';

const ChatView: React.FC = () => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const newChat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: 'You are a helpful content marketing assistant. Provide concise and actionable advice on strategy, SEO, and social media.',
        },
      });
      setChat(newChat);
      setMessages([{
        role: 'model',
        parts: [{ text: "Hello! I'm your marketing assistant. How can I help you grow your brand today?" }]
      }]);
    } catch (e) {
      setError('Failed to initialize the chat service.');
      console.error(e);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !chat) return;

    const userText = input.trim();
    const userMessage: ChatMessage = { role: 'user', parts: [{ text: userText }] };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const result = await chat.sendMessageStream({ message: userText });
      let modelResponseText = '';
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: '' }] }]);

      for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        modelResponseText += (c.text || '');
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].parts[0].text = modelResponseText;
          return newMessages;
        });
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to get response: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700">
      <div className="p-4 bg-gray-800/80 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white">Marketing Strategist Chat</h2>
        <p className="text-sm text-gray-400">Powered by Gemini 3 Flash</p>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-gray-700 text-gray-200 rounded-tl-none border border-gray-600'
              }`}
            >
              <p className="whitespace-pre-wrap leading-relaxed">{msg.parts[0].text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-700/50 text-gray-400 px-4 py-2 rounded-2xl flex items-center border border-gray-600 animate-pulse">
              <Spinner className="w-4 h-4 mr-2" />
              <span className="text-sm">Strategizing...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {error && (
        <div className="px-4 py-2 bg-red-900/30 text-red-400 text-sm border-t border-red-900/50 text-center">
          {error}
        </div>
      )}
      <div className="p-4 bg-gray-800/80 border-t border-gray-700">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about SEO, content pillars, or campaign ideas..."
            className="flex-1 p-3 bg-gray-900 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white placeholder-gray-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl disabled:bg-indigo-900/50 disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-indigo-500 transition-all active:scale-95 shadow-lg"
          >
            {isLoading ? <Spinner className="w-5 h-5" /> : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatView;

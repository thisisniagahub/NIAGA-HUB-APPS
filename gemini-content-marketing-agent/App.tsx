
import React, { useState } from 'react';
import { Tool } from './types';
import Sidebar from './components/Sidebar';
import ChatView from './components/views/ChatView';
import LiveConversationView from './components/views/LiveConversationView';
import VideoGenerationView from './components/views/VideoGenerationView';
import VideoAnalysisView from './components/views/VideoAnalysisView';
import ComplexQueryView from './components/views/ComplexQueryView';
import QuickToolsView from './components/views/QuickToolsView';

export default function App() {
  const [activeTool, setActiveTool] = useState<Tool>(Tool.Chat);

  const renderActiveTool = () => {
    switch (activeTool) {
      case Tool.Chat:
        return <ChatView />;
      case Tool.LiveConversation:
        return <LiveConversationView />;
      case Tool.VideoGeneration:
        return <VideoGenerationView />;
      case Tool.VideoAnalysis:
        return <VideoAnalysisView />;
      case Tool.ComplexQuery:
        return <ComplexQueryView />;
      case Tool.QuickTools:
        return <QuickToolsView />;
      default:
        return <ChatView />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 font-sans">
      <Sidebar activeTool={activeTool} setActiveTool={setActiveTool} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {renderActiveTool()}
      </main>
    </div>
  );
}

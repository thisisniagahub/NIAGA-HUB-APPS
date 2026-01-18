
import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { OnboardingFlow } from '../onboarding/OnboardingFlow';
import { GlobalChat } from './GlobalChat';
import { CommandMenu } from './CommandMenu';
import { motion } from 'framer-motion';

const MotionDiv = motion.div as any;

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const hasOnboarded = localStorage.getItem('startupos_onboarded');
    if (!hasOnboarded) {
      setShowOnboarding(true);
    }
    
    const savedSidebarState = localStorage.getItem('sidebar_collapsed');
    if (savedSidebarState === 'true') {
        setIsSidebarCollapsed(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('startupos_onboarded', 'true');
    setShowOnboarding(false);
  };

  const toggleSidebar = () => {
      const newState = !isSidebarCollapsed;
      setIsSidebarCollapsed(newState);
      localStorage.setItem('sidebar_collapsed', String(newState));
  };

  return (
    <div className="flex min-h-screen bg-black text-neutral-200 font-sans selection:bg-primary-900 selection:text-white relative overflow-hidden">
      {showOnboarding && <OnboardingFlow onComplete={handleOnboardingComplete} />}
      
      <CommandMenu />
      
      <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
      
      <main 
        className={`flex-1 p-8 overflow-y-auto h-screen bg-neutral-950/50 flex flex-col transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}
      >
        <MotionDiv 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-7xl mx-auto w-full flex-1"
        >
          {children}
        </MotionDiv>

        <div className="max-w-7xl mx-auto w-full mt-12 pt-6 border-t border-neutral-800/50 text-center pb-6">
            <p className="text-[10px] text-neutral-600 uppercase tracking-widest font-medium">
                StartupOS Intelligence (Gemini Pro & Veo) may produce inaccurate information. Please verify critical business data.
            </p>
        </div>
      </main>

      <GlobalChat />
    </div>
  );
};

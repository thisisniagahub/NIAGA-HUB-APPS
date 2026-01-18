
import React from 'react';
// Fix: Import as any to bypass "no exported member" type error
import * as Router from 'react-router-dom';
const { NavLink, useNavigate } = Router as any;
import * as Icons from 'lucide-react';
import { MODULES, APP_NAME } from '../../constants';
import { ModuleConfig } from '../../types';
import { useTutorial } from '../../context/TutorialContext';
import { motion, AnimatePresence } from 'framer-motion';

// Fix: Cast motion components to any to resolve property type errors
const MotionDiv = motion.div as any;
const MotionSpan = motion.span as any;

interface SidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const navigate = useNavigate();
  const { startTutorial, isActive } = useTutorial();

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'short', 
    day: 'numeric', 
    month: 'short'
  });

  const getIcon = (iconName: string) => {
    const Icon = (Icons as any)[iconName];
    return Icon ? <Icon size={20} /> : <Icons.Box size={20} />;
  };

  const renderGroup = (category: string, label: string) => {
    const groupModules = MODULES.filter(m => m.category === category);
    if (groupModules.length === 0) return null;

    return (
      <div className="mb-6">
        {!isCollapsed && (
            <h4 className="px-4 mb-2 text-[10px] font-bold text-neutral-600 uppercase tracking-widest animate-fade-in">
              {label}
            </h4>
        )}
        <div className="space-y-0.5">
          {groupModules.map((module: ModuleConfig) => (
            <NavLink
              key={module.id}
              to={module.path}
              title={isCollapsed ? module.name : ''}
              className={({ isActive }: any) => `
                relative flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group
                ${isActive 
                  ? 'bg-primary-900/10 text-primary-500' 
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                }
                ${isCollapsed ? 'justify-center px-0' : ''}
              `}
            >
              {({ isActive }: any) => (
                <>
                    {isActive && (
                        <MotionDiv
                            layoutId="sidebar-active-indicator"
                            className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-primary-600 rounded-r-full"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                        />
                    )}
                    <span className={`transition-colors duration-200 ${isActive ? 'text-primary-500' : 'text-neutral-500 group-hover:text-primary-400'}`}>
                        {getIcon(module.icon)}
                    </span>
                    {!isCollapsed && (
                        <MotionSpan 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="truncate relative z-10"
                        >
                            {module.name}
                        </MotionSpan>
                    )}
                    
                    {!isActive && !isCollapsed && (
                        <Icons.ChevronRight 
                            size={14} 
                            className="ml-auto text-neutral-700 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" 
                        />
                    )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    );
  };

  return (
    <aside 
        className={`bg-black border-r border-neutral-800 h-screen flex flex-col fixed left-0 top-0 overflow-y-auto custom-scrollbar z-40 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}
    >
      {/* Header */}
      <div className={`p-6 flex items-center justify-between gap-3 relative ${isCollapsed ? 'px-0 justify-center' : ''}`}>
        {!isCollapsed && (
            <div className="flex items-center gap-3 animate-fade-in">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center border border-primary-500/20">
                    <Icons.Zap className="text-white" size={20} />
                </div>
                <div className="flex flex-col">
                    <span className="text-xl font-bold tracking-tight text-white leading-none">{APP_NAME}</span>
                    <span className="text-[10px] text-primary-500 font-medium uppercase tracking-wide mt-1">{today}</span>
                </div>
            </div>
        )}
        
        {/* Toggle Button */}
        <button 
            onClick={onToggle}
            className={`p-1.5 rounded-md border border-neutral-800 bg-neutral-900 text-neutral-500 hover:text-white hover:border-neutral-600 transition-all shadow-xl z-50 ${isCollapsed ? '' : 'absolute -right-3 top-7'}`}
        >
            {isCollapsed ? <Icons.ChevronRight size={14} /> : <Icons.ChevronLeft size={14} />}
        </button>
      </div>

      <nav className={`flex-1 py-4 ${isCollapsed ? 'px-2' : 'px-3'}`}>
        {!isCollapsed && (
            <button
                onClick={startTutorial}
                disabled={isActive}
                className={`w-full flex items-center gap-3 px-4 py-2.5 mb-6 text-sm font-bold rounded-lg transition-all border border-dashed animate-fade-in
                    ${isActive 
                        ? 'bg-primary-900/20 text-primary-500 border-primary-600/50' 
                        : 'bg-neutral-900/50 text-neutral-300 border-neutral-700 hover:border-primary-500 hover:text-white'
                    }`}
            >
                <Icons.Map size={18} className={isActive ? "animate-pulse" : "text-primary-500"} />
                Tour
            </button>
        )}

        <NavLink
          to="/"
          className={({ isActive }: any) => `
            flex items-center gap-3 px-4 py-2.5 mb-6 text-sm font-medium rounded-lg transition-all duration-200 group
            ${isActive 
              ? 'bg-white/10 text-white shadow-lg' 
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }
            ${isCollapsed ? 'justify-center px-0' : ''}
          `}
        >
          {({ isActive }: any) => (
             <>
                <Icons.LayoutDashboard size={20} className={`transition-colors ${isActive ? 'text-white' : 'group-hover:text-primary-400'}`} />
                {!isCollapsed && <span>Dashboard</span>}
             </>
          )}
        </NavLink>

        {renderGroup('STRATEGY', 'Strategy')}
        {renderGroup('EXECUTION', 'Product')}
        {renderGroup('GROWTH', 'Growth')}
        {renderGroup('OPERATIONS', 'Operations')}
        {renderGroup('DATA', 'Data')}

        <div className={`mb-6 pt-6 border-t border-neutral-800/50 ${isCollapsed ? 'hidden' : ''}`}>
           <h4 className="px-4 mb-2 text-[10px] font-bold text-neutral-600 uppercase tracking-widest">Admin</h4>
           <div className="space-y-0.5">
             <NavLink to="/agents" className={({isActive}: any) => `flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg transition-all ${isActive ? 'text-primary-500 bg-primary-900/10' : 'text-neutral-400 hover:text-white'}`}>
                <Icons.Bot size={18} /> Agents
             </NavLink>
             <NavLink to="/marketplace" className={({isActive}: any) => `flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg transition-all ${isActive ? 'text-primary-500 bg-primary-900/10' : 'text-neutral-400 hover:text-white'}`}>
                <Icons.Network size={18} /> Connectors
             </NavLink>
           </div>
        </div>
      </nav>

      <div className={`p-4 border-t border-neutral-800 bg-black ${isCollapsed ? 'px-2' : ''}`}>
        <div 
          onClick={() => navigate('/billing')}
          className={`flex items-center gap-3 p-2.5 rounded-xl bg-neutral-900/50 border border-neutral-800 cursor-pointer hover:bg-neutral-800 hover:border-neutral-700 transition-all group ${isCollapsed ? 'justify-center px-0' : ''}`}
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary-600 to-primary-400 flex items-center justify-center text-xs font-bold text-white shadow-md shrink-0">
            JD
          </div>
          {!isCollapsed && (
              <div className="flex-1 min-w-0 animate-fade-in">
                <p className="text-sm font-medium text-white truncate group-hover:text-primary-400 transition-colors">John Doe</p>
                <p className="text-[10px] text-neutral-500 truncate">Founder Plan</p>
              </div>
          )}
          {!isCollapsed && <Icons.ChevronRight size={14} className="text-neutral-600 group-hover:text-white" />}
        </div>
      </div>
    </aside>
  );
};

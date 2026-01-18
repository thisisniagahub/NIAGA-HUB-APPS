
import React, { useState, useEffect } from 'react';
// Fix: Import as any to bypass "no exported member" type error
import * as Router from 'react-router-dom';
const { useNavigate } = Router as any;
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { MODULES } from '../../constants';

// Fix: Cast motion components to any to resolve property type errors
const MotionDiv = motion.div as any;

export const CommandMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  // Toggle with Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
    setQuery('');
  };

  const getIcon = (iconName: string) => {
    const Icon = (Icons as any)[iconName] || Icons.Box;
    return <Icon size={16} />;
  };

  const filteredModules = MODULES.filter(m => 
    m.name.toLowerCase().includes(query.toLowerCase()) || 
    m.description.toLowerCase().includes(query.toLowerCase())
  );

  const quickActions = [
    { name: 'Dashboard', icon: 'LayoutDashboard', path: '/', desc: 'Return home' },
    { name: 'Billing & Plan', icon: 'CreditCard', path: '/billing', desc: 'Manage subscription' },
    { name: 'Agent Center', icon: 'Bot', path: '/agents', desc: 'Manage AI workers' },
    { name: 'Audit Logs', icon: 'ShieldAlert', path: '/audit', desc: 'View security events' },
    { name: 'System Status', icon: 'Cpu', path: '/system', desc: 'Diagnostics & Health' },
  ].filter(a => a.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <MotionDiv
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-0 top-[20%] mx-auto w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl z-[201] overflow-hidden flex flex-col max-h-[60vh]"
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-neutral-800">
              <Icons.Search className="text-neutral-500" size={20} />
              <input
                autoFocus
                type="text"
                placeholder="Type a command or search..."
                className="flex-1 bg-transparent text-lg text-white placeholder-neutral-500 focus:outline-none"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              <div className="px-2 py-1 bg-neutral-800 rounded text-xs text-neutral-400 font-mono">ESC</div>
            </div>

            {/* Results List */}
            <div className="overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-neutral-800">
              
              {/* Quick Actions Group */}
              {quickActions.length > 0 && (
                <div className="mb-2">
                  <h4 className="px-3 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">System</h4>
                  {quickActions.map(action => (
                    <button
                      key={action.path}
                      onClick={() => handleNavigate(action.path)}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-primary-600/10 hover:text-primary-400 text-neutral-300 group transition-colors text-left"
                    >
                      {(Icons as any)[action.icon] ? React.createElement((Icons as any)[action.icon], { size: 18 }) : <Icons.Zap size={18}/>}
                      <div className="flex-1">
                        <div className="font-medium text-white group-hover:text-primary-400">{action.name}</div>
                        <div className="text-xs text-neutral-500">{action.desc}</div>
                      </div>
                      <Icons.CornerDownLeft size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              )}

              {/* Modules Group */}
              {filteredModules.length > 0 && (
                <div>
                  <h4 className="px-3 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Modules</h4>
                  {filteredModules.map(module => (
                    <button
                      key={module.id}
                      onClick={() => handleNavigate(module.path)}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-neutral-800 text-neutral-300 group transition-colors text-left"
                    >
                      {getIcon(module.icon)}
                      <div className="flex-1">
                        <div className="font-medium text-white">{module.name}</div>
                        <div className="text-xs text-neutral-500 line-clamp-1">{module.description}</div>
                      </div>
                      <Icons.ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              )}

              {quickActions.length === 0 && filteredModules.length === 0 && (
                <div className="py-12 text-center text-neutral-500">
                  <Icons.Ghost size={32} className="mx-auto mb-2 opacity-20" />
                  <p>No results found.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-neutral-800 bg-neutral-950/50 flex justify-between items-center text-[10px] text-neutral-500">
              <span>StartupOS Command Palette</span>
              <div className="flex gap-2">
                <span>Select <span className="text-neutral-300">↑↓</span></span>
                <span>Open <span className="text-neutral-300">↵</span></span>
              </div>
            </div>
          </MotionDiv>
        </>
      )}
    </AnimatePresence>
  );
};

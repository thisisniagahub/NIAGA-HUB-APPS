
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
// Fix: Import as any to bypass "no exported member" type error
import * as Router from 'react-router-dom';
const { useNavigate } = Router as any;
import * as Icons from 'lucide-react';

export const LoginPage: React.FC = () => {
    const { login, isLoading, error: authError } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('admin@startupos.com');
    const [password, setPassword] = useState('admin123');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!email || !password) {
            setError('Please enter both email and password.');
            return;
        }
        
        await login(email, password);
        // AuthContext handles state update; useEffect in App or check user here
        // But since login is async, we can check localStorage or trust the flow
        if (localStorage.getItem('startupos_user')) {
             navigate('/');
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary-900/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-md bg-neutral-900/50 border border-neutral-800 rounded-2xl p-8 backdrop-blur-md shadow-2xl z-10 relative">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-900/20">
                        <Icons.Zap className="text-white" size={24} />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">StartupOS</h1>
                    <p className="text-neutral-400 mt-2">Sign in to your operating system.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-1">Email</label>
                        <input 
                            type="email" 
                            className="w-full bg-black border border-neutral-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none transition-all"
                            placeholder="founder@startup.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-1">Password</label>
                        <input 
                            type="password" 
                            className="w-full bg-black border border-neutral-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none transition-all"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {(error || authError) && (
                        <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg border border-red-900/50 flex items-center gap-2">
                            <Icons.AlertCircle size={16} />
                            {error || authError}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-all flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                    >
                        {isLoading ? <Icons.Loader2 className="animate-spin" size={20} /> : 'Sign In'}
                    </button>
                </form>

                {/* Admin Credentials Hint */}
                <div className="mt-6 pt-4 border-t border-neutral-800">
                    <div className="bg-neutral-800/50 p-3 rounded-lg text-center">
                        <p className="text-xs text-neutral-500 font-mono uppercase tracking-wider mb-1">Demo Admin Credentials</p>
                        <div className="flex flex-col gap-1">
                             <div className="flex items-center justify-center gap-2 text-xs text-neutral-300 cursor-pointer hover:text-white" onClick={() => setEmail('admin@startupos.com')}>
                                <Icons.User size={12} /> admin@startupos.com
                             </div>
                             <div className="flex items-center justify-center gap-2 text-xs text-neutral-300 cursor-pointer hover:text-white" onClick={() => setPassword('admin123')}>
                                <Icons.Key size={12} /> admin123
                             </div>
                        </div>
                    </div>
                </div>

                <div className="mt-4 text-center">
                    <button className="text-sm text-neutral-500 hover:text-white transition-colors">
                         Forgot password?
                    </button>
                </div>
            </div>
        </div>
    );
};

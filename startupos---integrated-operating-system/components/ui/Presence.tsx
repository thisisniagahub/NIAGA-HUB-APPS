
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Fix: Cast motion.div to any to resolve property type errors
const MotionDiv = motion.div as any;

// Mock active users for the presence simulation
const MOCK_USERS = [
    { id: '1', name: 'Sarah', color: 'bg-pink-500', initial: 'S', status: 'online' },
    { id: '2', name: 'Mike', color: 'bg-blue-500', initial: 'M', status: 'editing' },
    { id: '3', name: 'Alex', color: 'bg-green-500', initial: 'A', status: 'idle' },
];

export const Presence: React.FC = () => {
    const [users, setUsers] = useState(MOCK_USERS);

    // Simulate activity updates
    useEffect(() => {
        const interval = setInterval(() => {
            setUsers(prev => prev.map(u => ({
                ...u,
                status: Math.random() > 0.7 ? (['online', 'editing', 'idle'][Math.floor(Math.random() * 3)]) : u.status
            })));
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-center -space-x-2">
            <AnimatePresence>
                {users.map((user) => (
                    <MotionDiv
                        key={user.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className={`relative w-8 h-8 rounded-full border-2 border-black flex items-center justify-center text-xs font-bold text-white cursor-pointer ${user.color}`}
                        title={`${user.name} is ${user.status}`}
                        whileHover={{ y: -2, zIndex: 10 }}
                    >
                        {user.initial}
                        {user.status === 'editing' && (
                            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-primary-500 border-2 border-black rounded-full animate-pulse" />
                        )}
                        {user.status === 'online' && (
                            <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 border-2 border-black rounded-full" />
                        )}
                    </MotionDiv>
                ))}
            </AnimatePresence>
            <div className="ml-4 text-xs text-neutral-500 font-medium">
                {users.length} Active
            </div>
        </div>
    );
};

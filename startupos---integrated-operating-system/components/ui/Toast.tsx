
import React, { useEffect } from 'react';
import * as Icons from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ToastMessage {
    id: string;
    type: 'success' | 'error' | 'info';
    title: string;
    description?: string;
}

interface ToastProps {
    message: ToastMessage;
    onClose: (id: string) => void;
}

const MotionDiv = motion.div as any;

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(message.id);
        }, 3000);
        return () => clearTimeout(timer);
    }, [message.id, onClose]);

    const icons = {
        success: <Icons.CheckCircle2 className="text-green-500" size={20} />,
        error: <Icons.AlertCircle className="text-red-500" size={20} />,
        info: <Icons.Info className="text-blue-500" size={20} />
    };

    const borders = {
        success: "border-green-900/50 bg-neutral-900",
        error: "border-red-900/50 bg-neutral-900",
        info: "border-blue-900/50 bg-neutral-900"
    };

    return (
        <MotionDiv
            layout
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`p-4 rounded-xl border shadow-xl flex gap-3 items-start min-w-[300px] pointer-events-auto ${borders[message.type]}`}
        >
            <div className="shrink-0 mt-0.5">{icons[message.type]}</div>
            <div className="flex-1">
                <h4 className="text-sm font-semibold text-white">{message.title}</h4>
                {message.description && (
                    <p className="text-xs text-neutral-400 mt-1">{message.description}</p>
                )}
            </div>
            <button 
                onClick={() => onClose(message.id)} 
                className="text-neutral-500 hover:text-white transition-colors"
            >
                <Icons.X size={14} />
            </button>
        </MotionDiv>
    );
};

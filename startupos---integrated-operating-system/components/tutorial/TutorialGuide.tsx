
import React, { useEffect, useState, useRef } from 'react';
import { useTutorial } from '../../context/TutorialContext';
import { TUTORIAL_STEPS } from '../../data/tutorialSteps';
// Fix: Import as any to bypass "no exported member" type errors
import * as Router from 'react-router-dom';
const { useNavigate, useLocation } = Router as any;
import * as Icons from 'lucide-react';
import { Button } from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

const MotionDiv = motion.div as any;

export const TutorialGuide: React.FC = () => {
    const { isActive, currentStepIndex, nextStep, prevStep, endTutorial } = useTutorial();
    const navigate = useNavigate();
    const location = useLocation();
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const step = TUTORIAL_STEPS[currentStepIndex];

    // Auto-navigate
    useEffect(() => {
        if (isActive && step && location.pathname !== step.route) {
            navigate(step.route);
        }
    }, [isActive, currentStepIndex, step, navigate, location.pathname]);

    // Find and track target element
    useEffect(() => {
        if (!isActive || !step.targetId) {
            setTargetRect(null);
            return;
        }

        const findTarget = () => {
            const el = document.getElementById(step.targetId!);
            if (el) {
                const rect = el.getBoundingClientRect();
                // Add some padding
                const paddedRect = new DOMRect(rect.x - 4, rect.y - 4, rect.width + 8, rect.height + 8);
                setTargetRect(paddedRect);
                // Smooth scroll to element
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                setTargetRect(null);
            }
        };

        // Poll for element presence (React rendering delay)
        const interval = setInterval(findTarget, 500);
        findTarget(); // Initial check

        window.addEventListener('resize', findTarget);
        window.addEventListener('scroll', findTarget);

        return () => {
            clearInterval(interval);
            window.removeEventListener('resize', findTarget);
            window.removeEventListener('scroll', findTarget);
        };
    }, [isActive, currentStepIndex, step?.targetId]);

    if (!isActive) return null;

    // Determine position for the card (avoid covering the target)
    const isTargetLow = targetRect && targetRect.top > window.innerHeight / 2;
    const cardPositionClass = isTargetLow ? "top-10" : "bottom-10";

    return (
        <AnimatePresence>
            {/* Spotlight Overlay */}
            {targetRect ? (
                <MotionDiv
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 z-[100] pointer-events-none"
                    style={{
                        // This creates a "hole" in the dark overlay using box-shadow
                        boxShadow: `0 0 0 9999px rgba(0, 0, 0, 0.75)`
                    }}
                >
                    {/* The Spotlight Box */}
                    <MotionDiv
                        layoutId="spotlight-box"
                        className="absolute rounded-lg border-2 border-primary-500 shadow-[0_0_20px_rgba(220,38,38,0.5)] animate-pulse"
                        style={{
                            top: targetRect.top,
                            left: targetRect.left,
                            width: targetRect.width,
                            height: targetRect.height,
                        }}
                    >
                        {/* Label Badge */}
                        <div className="absolute -top-3 left-4 bg-primary-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Interact Here
                        </div>
                    </MotionDiv>
                </MotionDiv>
            ) : (
                /* Fallback Overlay if no target found or generic step */
                <MotionDiv 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 z-[90] pointer-events-none"
                />
            )}

            {/* Instruction Card */}
            <MotionDiv 
                key={step.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ duration: 0.3, type: 'spring' }}
                className={`fixed ${cardPositionClass} left-1/2 -translate-x-1/2 z-[101] w-full max-w-2xl px-4`}
            >
                <div className="bg-neutral-900 border-2 border-primary-600 rounded-2xl shadow-2xl shadow-black overflow-hidden pointer-events-auto">
                    {/* Progress Bar */}
                    <div className="h-1 bg-neutral-800 w-full">
                        <div 
                            className="h-full bg-primary-600 transition-all duration-300"
                            style={{ width: `${((currentStepIndex + 1) / TUTORIAL_STEPS.length) * 100}%` }}
                        />
                    </div>

                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                    {currentStepIndex + 1}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">{step.title}</h2>
                                    <p className="text-primary-400 text-xs font-mono uppercase tracking-wider">
                                        Step {currentStepIndex + 1} of {TUTORIAL_STEPS.length}
                                    </p>
                                </div>
                            </div>
                            <button onClick={endTutorial} className="text-neutral-500 hover:text-white transition-colors">
                                <Icons.X size={24} />
                            </button>
                        </div>

                        <p className="text-neutral-300 text-base leading-relaxed mb-6">
                            {step.content}
                        </p>
                        
                        {step.actionHint && (
                            <div className="flex items-center gap-2 text-sm text-primary-300 mb-6 bg-primary-900/20 p-3 rounded-lg border border-primary-900/50">
                                <Icons.Pointer size={16} />
                                {step.actionHint}
                            </div>
                        )}

                        <div className="flex justify-between items-center pt-4 border-t border-neutral-800">
                            <Button variant="ghost" onClick={prevStep} disabled={currentStepIndex === 0}>
                                <Icons.ArrowLeft size={16} className="mr-2" /> Back
                            </Button>
                            
                            <div className="flex gap-2">
                                <Button variant="secondary" onClick={endTutorial}>
                                    Skip Tour
                                </Button>
                                <Button onClick={nextStep} className="bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 shadow-lg shadow-primary-900/20">
                                    {currentStepIndex === TUTORIAL_STEPS.length - 1 ? 'Finish' : 'Next Step'} <Icons.ArrowRight size={16} className="ml-2" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </MotionDiv>
        </AnimatePresence>
    );
};

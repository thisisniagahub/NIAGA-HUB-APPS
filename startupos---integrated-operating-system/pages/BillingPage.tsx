
import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PLANS, initiateCheckout, getSubscriptionStatus } from '../services/stripeService';
import * as Icons from 'lucide-react';
import { motion } from 'framer-motion';

const MotionDiv = motion.div as any;

export const BillingPage: React.FC = () => {
    const [currentSub, setCurrentSub] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        loadSubscription();
    }, []);

    const loadSubscription = async () => {
        const sub = await getSubscriptionStatus();
        setCurrentSub(sub);
        setLoading(false);
    };

    const handleUpgrade = async (planId: string) => {
        setProcessingId(planId);
        try {
            await initiateCheckout(planId);
            await loadSubscription(); // Refresh state
        } catch (error) {
            console.error("Checkout failed", error);
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Icons.Loader2 className="animate-spin text-primary-600" size={32} /></div>;
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold text-white tracking-tight">Upgrade your Operating System</h1>
                <p className="text-neutral-400 max-w-2xl mx-auto">
                    Unlock the full power of the AI-driven startup stack. Scale without limits.
                </p>
            </div>

            {/* Current Plan Status */}
            <Card className="bg-neutral-900/50 border-neutral-800">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary-900/20 rounded-full text-primary-500">
                            <Icons.CreditCard size={24} />
                        </div>
                        <div>
                            <h3 className="text-white font-medium">Current Plan: <span className="text-primary-400 font-bold uppercase">{currentSub?.planId}</span></h3>
                            <p className="text-sm text-neutral-500">Renews on {new Date(currentSub?.currentPeriodEnd).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                         <Button variant="outline">Manage Payment Method</Button>
                         <Button variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-900/10">Cancel Subscription</Button>
                    </div>
                </div>
            </Card>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {PLANS.map((plan) => {
                    const isCurrent = currentSub?.planId === plan.id;
                    const isProcessing = processingId === plan.id;
                    
                    return (
                        <MotionDiv 
                            key={plan.id}
                            whileHover={{ y: -5 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Card className={`h-full flex flex-col relative ${plan.recommended ? 'border-primary-600 shadow-2xl shadow-primary-900/20' : 'border-neutral-800'}`}>
                                {plan.recommended && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary-600 text-white text-xs font-bold rounded-full uppercase tracking-wider">
                                        Most Popular
                                    </div>
                                )}
                                
                                <div className="text-center p-6 border-b border-neutral-800">
                                    <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                                    <div className="flex items-baseline justify-center gap-1">
                                        <span className="text-3xl font-bold text-white">${plan.price}</span>
                                        <span className="text-neutral-500">/{plan.interval}</span>
                                    </div>
                                </div>

                                <div className="p-6 flex-1">
                                    <ul className="space-y-4">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm text-neutral-300">
                                                <Icons.CheckCircle2 size={16} className="text-primary-500 shrink-0 mt-0.5" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="p-6 pt-0">
                                    <Button 
                                        className="w-full" 
                                        variant={isCurrent ? "outline" : "primary"}
                                        disabled={isCurrent || (processingId !== null)}
                                        isLoading={isProcessing}
                                        onClick={() => handleUpgrade(plan.id)}
                                    >
                                        {isCurrent ? "Current Plan" : `Upgrade to ${plan.name}`}
                                    </Button>
                                </div>
                            </Card>
                        </MotionDiv>
                    );
                })}
            </div>
            
            <div className="mt-12 text-center border-t border-neutral-800 pt-8">
                <p className="text-neutral-500 text-sm">
                    Secure payments powered by <span className="text-white font-semibold">Stripe</span>. 
                    Enterprise plans available for large teams. <a href="#" className="text-primary-500 hover:underline">Contact Sales</a>
                </p>
            </div>
        </div>
    );
};

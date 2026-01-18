
import { db } from './localStorageDb';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  recommended?: boolean;
}

export const PLANS: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 0,
    interval: 'month',
    features: ['Access to 5 Core Modules', '50 AI Queries/Day', 'Basic Analytics', 'Community Support', '1 Team Member']
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 49,
    interval: 'month',
    features: ['All 17 Modules', 'Gemini Pro AI Features', 'Priority Support', 'Up to 5 Team Members', 'Remove Branding'],
    recommended: true
  },
  {
    id: 'scale',
    name: 'Scale',
    price: 199,
    interval: 'month',
    features: ['Unlimited Team Members', 'Dedicated Account Manager', 'Custom API Access', 'SSO & Advanced Security', 'White-labeling']
  }
];

export const getSubscriptionStatus = async () => {
  // Simulate API latency
  await new Promise(resolve => setTimeout(resolve, 500));
  return db.get('subscription', {
    planId: 'starter',
    status: 'active',
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  });
};

export const initiateCheckout = async (planId: string) => {
  // In a real app, this would call your backend to create a Stripe Checkout Session
  // and return the { url } to redirect the user.
  console.log(`Initiating checkout for ${planId}...`);
  
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing

  // Mock successful upgrade
  db.set('subscription', {
    planId: planId,
    status: 'active',
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  });

  return { success: true };
};

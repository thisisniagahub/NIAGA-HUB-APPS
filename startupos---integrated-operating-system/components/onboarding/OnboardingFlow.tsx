
import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import * as Icons from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: () => void;
}

type AccountType = 'SOLO' | 'TEAM' | null;
type Stage = 'PRE_SEED' | 'SEED' | 'SERIES_A' | null;

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState<AccountType>(null);
  const [stage, setStage] = useState<Stage>(null);
  
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    teamEmails: [''],
  });

  const totalSteps = 4;

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
    else onComplete();
  };

  const updateEmail = (index: number, value: string) => {
    const newEmails = [...formData.teamEmails];
    newEmails[index] = value;
    setFormData({ ...formData, teamEmails: newEmails });
  };

  const renderStep1_Structure = () => (
    <div className="space-y-6 animate-fade-in">
        <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white">How do you work?</h2>
            <p className="text-neutral-400">We'll tailor the workspace to your setup.</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div 
                onClick={() => setAccountType('SOLO')}
                className={`p-6 rounded-xl border cursor-pointer transition-all flex flex-col items-center gap-4 hover:border-primary-500/50 ${accountType === 'SOLO' ? 'bg-primary-900/20 border-primary-500' : 'bg-neutral-900/50 border-neutral-800'}`}
            >
                <div className="p-3 bg-neutral-800 rounded-full text-white"><Icons.User size={24} /></div>
                <div className="text-center">
                    <h3 className="font-bold text-white">Solo Founder</h3>
                    <p className="text-xs text-neutral-400 mt-1">Focus on Execution & Strategy</p>
                </div>
            </div>
            <div 
                onClick={() => setAccountType('TEAM')}
                className={`p-6 rounded-xl border cursor-pointer transition-all flex flex-col items-center gap-4 hover:border-primary-500/50 ${accountType === 'TEAM' ? 'bg-primary-900/20 border-primary-500' : 'bg-neutral-900/50 border-neutral-800'}`}
            >
                <div className="p-3 bg-neutral-800 rounded-full text-white"><Icons.Users size={24} /></div>
                <div className="text-center">
                    <h3 className="font-bold text-white">Team</h3>
                    <p className="text-xs text-neutral-400 mt-1">Enable Collaboration & Roles</p>
                </div>
            </div>
        </div>
    </div>
  );

  const renderStep2_Profile = () => (
    <div className="space-y-4 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white">Company Profile</h2>
        <p className="text-neutral-400">Basic details to configure your dashboard.</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-1">Company Name</label>
        <input
          type="text"
          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-white focus:border-primary-600 outline-none transition-colors"
          placeholder="Acme Inc."
          value={formData.companyName}
          onChange={(e) => setFormData({...formData, companyName: e.target.value})}
        />
      </div>
      
      {accountType === 'TEAM' && (
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Invite Co-founders (Optional)</label>
            <div className="space-y-2">
                {formData.teamEmails.map((email, idx) => (
                <input
                    key={idx}
                    type="email"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-white focus:border-primary-600 outline-none"
                    placeholder="partner@example.com"
                    value={email}
                    onChange={(e) => updateEmail(idx, e.target.value)}
                />
                ))}
            </div>
          </div>
      )}
    </div>
  );

  const renderStep3_Industry = () => (
    <div className="space-y-4 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white">Market Focus</h2>
        <p className="text-neutral-400">We'll load industry-specific templates for you.</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-1">Industry / Vertical</label>
        <select 
            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-white focus:border-primary-600 outline-none transition-colors"
            value={formData.industry}
            onChange={(e) => setFormData({...formData, industry: e.target.value})}
        >
            <option value="">Select an industry...</option>
            <option value="saas">SaaS / B2B Software (Rec: Sales & Product focus)</option>
            <option value="fintech">Fintech (Rec: Legal & Compliance focus)</option>
            <option value="consumer">Consumer App (Rec: Marketing focus)</option>
            <option value="marketplace">Marketplace (Rec: Supply Chain focus)</option>
            <option value="hardware">Hardware / Deep Tech (Rec: R&D focus)</option>
        </select>
      </div>
      
      {formData.industry && (
          <div className="p-3 bg-primary-900/20 border border-primary-900/50 rounded-lg flex gap-3 items-start">
              <Icons.Sparkles className="text-primary-500 mt-0.5 shrink-0" size={16} />
              <div>
                  <h4 className="text-sm font-bold text-primary-200">AI Suggestion</h4>
                  <p className="text-xs text-primary-300/80">
                      Based on <strong>{formData.industry}</strong>, we've prioritized specific modules in your sidebar.
                  </p>
              </div>
          </div>
      )}
    </div>
  );

  const renderStep4_Stage = () => (
    <div className="space-y-6 animate-fade-in">
        <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white">Current Stage</h2>
            <p className="text-neutral-400">This determines your operational priorities.</p>
        </div>
        <div className="space-y-3">
            {[
                { id: 'PRE_SEED', label: 'Pre-Seed / Idea', desc: 'Focus: Validation, Pitch Deck, MVP' },
                { id: 'SEED', label: 'Seed Stage', desc: 'Focus: Product-Market Fit, Early Sales' },
                { id: 'SERIES_A', label: 'Series A+', desc: 'Focus: Scaling, HR, Operations, Compliance' }
            ].map(s => (
                <div 
                    key={s.id}
                    onClick={() => setStage(s.id as Stage)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex justify-between items-center hover:border-primary-500/50 ${stage === s.id ? 'bg-primary-900/20 border-primary-500' : 'bg-neutral-900/50 border-neutral-800'}`}
                >
                    <div>
                        <h3 className="font-bold text-white">{s.label}</h3>
                        <p className="text-xs text-neutral-400">{s.desc}</p>
                    </div>
                    {stage === s.id && <Icons.CheckCircle2 className="text-primary-500" size={20} />}
                </div>
            ))}
        </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-black border border-neutral-800 rounded-2xl shadow-2xl p-8 relative overflow-hidden">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-neutral-900">
          <div 
            className="h-full bg-primary-600 transition-all duration-500 ease-out"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        <div className="mb-8 flex justify-between items-center">
            <div className="flex items-center gap-2 text-primary-600">
                <Icons.Zap size={24} fill="currentColor" />
                <span className="font-bold tracking-tight text-white">StartupOS Setup</span>
            </div>
            <span className="text-xs text-neutral-500 font-mono">STEP {step}/{totalSteps}</span>
        </div>

        <div className="min-h-[300px]">
          {step === 1 && renderStep1_Structure()}
          {step === 2 && renderStep2_Profile()}
          {step === 3 && renderStep3_Industry()}
          {step === 4 && renderStep4_Stage()}
        </div>

        <div className="flex justify-between mt-8 pt-6 border-t border-neutral-900">
            <Button variant="ghost" onClick={onComplete}>Skip Setup</Button>
            <div className="flex gap-3">
                {step > 1 && (
                    <Button variant="outline" onClick={() => setStep(step - 1)}>Back</Button>
                )}
                <Button 
                    onClick={handleNext}
                    disabled={(step === 1 && !accountType) || (step === 4 && !stage)}
                >
                    {step === totalSteps ? 'Launch OS' : 'Next Step'}
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
};

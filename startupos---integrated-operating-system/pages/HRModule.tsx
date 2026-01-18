
import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import * as Icons from 'lucide-react';
import { getJobRoles, getCandidates } from '../services/phase2Services';
import { JobRole, Candidate } from '../types';
import { logAction } from '../services/auditService';

export const HRModule: React.FC = () => {
    const [jobs, setJobs] = useState<JobRole[]>([]);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [view, setView] = useState<'LIST' | 'PIPELINE'>('PIPELINE');

    useEffect(() => {
        Promise.all([getJobRoles(), getCandidates()]).then(([j, c]) => {
            setJobs(j);
            setCandidates(c);
        });
    }, []);

    const moveCandidate = (id: string, newStage: Candidate['stage']) => {
        setCandidates(prev => prev.map(c => c.id === id ? { ...c, stage: newStage } : c));
        logAction('MOVE_CANDIDATE', `Candidate ${id}`, `Moved to ${newStage}`);
    };

    const PipelineColumn = ({ title, stage }: { title: string, stage: Candidate['stage'] }) => (
        <div className="flex-1 min-w-[250px] bg-neutral-900/30 rounded-xl border border-neutral-800 flex flex-col h-full">
            <div className="p-4 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/90 rounded-t-xl sticky top-0">
                <h3 className="font-semibold text-neutral-300 text-sm">{title}</h3>
                <span className="text-xs bg-neutral-800 text-neutral-500 px-2 py-0.5 rounded-full">
                    {candidates.filter(c => c.stage === stage).length}
                </span>
            </div>
            <div className="p-3 space-y-3 overflow-y-auto flex-1 custom-scrollbar min-h-[400px]">
                {candidates.filter(c => c.stage === stage).map(candidate => (
                    <div key={candidate.id} className="p-4 bg-black border border-neutral-800 rounded-lg shadow-sm hover:border-primary-600/50 cursor-move group transition-all relative">
                         <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-bold text-neutral-400">
                                {candidate.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-medium text-white text-sm">{candidate.name}</h3>
                                <p className="text-xs text-neutral-500">{jobs.find(j => j.id === candidate.roleId)?.title || 'Role'}</p>
                            </div>
                        </div>
                        
                        {/* Mock Drag Actions */}
                        <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {stage !== 'APPLIED' && <button onClick={() => moveCandidate(candidate.id, 'APPLIED')} className="text-[10px] px-2 py-1 bg-neutral-800 rounded hover:text-white">Applied</button>}
                            {stage !== 'SCREENING' && <button onClick={() => moveCandidate(candidate.id, 'SCREENING')} className="text-[10px] px-2 py-1 bg-neutral-800 rounded hover:text-white">Screen</button>}
                            {stage !== 'INTERVIEW' && <button onClick={() => moveCandidate(candidate.id, 'INTERVIEW')} className="text-[10px] px-2 py-1 bg-neutral-800 rounded hover:text-white">Interview</button>}
                            {stage !== 'OFFER' && <button onClick={() => moveCandidate(candidate.id, 'OFFER')} className="text-[10px] px-2 py-1 bg-neutral-800 rounded hover:text-white">Offer</button>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
            <div className="flex justify-between items-center shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-white">HR & Talent</h1>
                    <p className="text-neutral-400">Recruiting pipeline and team management.</p>
                </div>
                <div className="flex gap-2">
                     <Button variant="ghost" onClick={() => setView('LIST')} className={view === 'LIST' ? 'bg-neutral-800' : ''}><Icons.List size={16}/></Button>
                     <Button variant="ghost" onClick={() => setView('PIPELINE')} className={view === 'PIPELINE' ? 'bg-neutral-800' : ''}><Icons.Kanban size={16}/></Button>
                    <Button><Icons.Plus size={16} className="mr-2"/> Post Job</Button>
                </div>
            </div>

            {view === 'PIPELINE' ? (
                <div className="flex gap-4 overflow-x-auto h-full pb-2" id="hr-pipeline"> {/* Targeted by Tutorial */}
                    <PipelineColumn title="Applied" stage="APPLIED" />
                    <PipelineColumn title="Screening" stage="SCREENING" />
                    <PipelineColumn title="Interviewing" stage="INTERVIEW" />
                    <PipelineColumn title="Offer Sent" stage="OFFER" />
                </div>
            ) : (
                <Card title="Open Positions">
                    {/* Reuse List View from before */}
                    <div className="space-y-4">
                        {jobs.map(job => (
                             <div key={job.id} className="flex justify-between items-center p-4 bg-neutral-900/50 rounded-lg border border-neutral-800">
                                <div><h3 className="font-semibold text-white">{job.title}</h3></div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
};

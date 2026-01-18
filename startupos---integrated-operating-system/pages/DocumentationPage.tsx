
import React, { useEffect, useState } from 'react';
// Fix: Import as any to bypass "no exported member" type errors
import * as Router from 'react-router-dom';
const { useParams, NavLink, useNavigate, useLocation } = Router as any;
import ReactMarkdown from 'react-markdown';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { DOCS_DATA, getDocBySlug, getDocsStructure } from '../data/docsData';
import { generateDocHeaderImage } from '../services/geminiService';
import * as Icons from 'lucide-react';
import { motion } from 'framer-motion';

const MotionDiv = motion.div as any;

export const DocumentationPage: React.FC = () => {
    // Fix: Remove type arguments from useParams call as it is untyped when imported from Router as any.
    const { slug } = useParams() as { slug: string };
    const navigate = useNavigate();
    const location = useLocation();
    
    // Header Image State
    const [headerImage, setHeaderImage] = useState<string | null>(null);
    const [generatingImage, setGeneratingImage] = useState(false);

    // Default to first doc if no slug
    useEffect(() => {
        if (!slug) {
            navigate(`/docs/${DOCS_DATA[0].slug}`, { replace: true });
        }
    }, [slug, navigate]);

    // Reset image when navigating to a new doc
    useEffect(() => {
        setHeaderImage(null);
    }, [slug]);

    const currentDoc = slug ? getDocBySlug(slug) : DOCS_DATA[0];
    const structure = getDocsStructure();

    // Calculate Next/Prev
    const currentIndex = DOCS_DATA.findIndex(d => d.slug === slug);
    const prevDoc = currentIndex > 0 ? DOCS_DATA[currentIndex - 1] : null;
    const nextDoc = currentIndex < DOCS_DATA.length - 1 ? DOCS_DATA[currentIndex + 1] : null;

    const handleGenerateHeader = async () => {
        if (!currentDoc) return;
        
        // 1. Check for API Key permission (required for Veo/Image models)
        const aiStudio = (window as any).aistudio;
        if (aiStudio && typeof aiStudio.hasSelectedApiKey === 'function') {
            const hasKey = await aiStudio.hasSelectedApiKey();
            if (!hasKey) {
                await aiStudio.openSelectKey();
                // We re-check or just proceed, trusting the flow or retry
            }
        }

        setGeneratingImage(true);
        try {
            const img = await generateDocHeaderImage(currentDoc.title, currentDoc.content);
            if (img) {
                setHeaderImage(img);
            }
        } catch (e) {
            console.error(e);
            alert("Failed to generate image. Please ensure you have a valid API Key selected.");
        } finally {
            setGeneratingImage(false);
        }
    };

    if (!currentDoc) return null;

    return (
        <div className="flex h-[calc(100vh-64px)] -m-8 overflow-hidden">
            {/* --- DOCS SIDEBAR --- */}
            <div className="w-64 bg-black border-r border-neutral-800 overflow-y-auto hidden md:block pb-10">
                <div className="p-6">
                    <div className="flex items-center gap-2 text-white font-bold mb-6 px-2">
                        <Icons.Book size={20} className="text-primary-500" />
                        <span>Documentation</span>
                    </div>

                    <div className="space-y-8">
                        {Object.entries(structure).map(([category, pages]) => (
                            <div key={category}>
                                <h4 className="px-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                                    {category}
                                </h4>
                                <div className="space-y-0.5">
                                    {pages.map(page => (
                                        <NavLink
                                            key={page.slug}
                                            to={`/docs/${page.slug}`}
                                            className={({ isActive }: any) => `
                                                block px-2 py-1.5 text-sm rounded-md transition-all border-l-2
                                                ${isActive 
                                                    ? 'bg-neutral-900/50 text-white border-primary-500 font-medium' 
                                                    : 'text-neutral-400 border-transparent hover:text-white hover:bg-neutral-900/30'
                                                }
                                            `}
                                        >
                                            {page.title}
                                        </NavLink>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="flex-1 overflow-y-auto bg-neutral-950/50 scroll-smooth">
                <div className="max-w-4xl mx-auto px-8 py-12">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 text-xs text-neutral-500 mb-8">
                        <span>Docs</span>
                        <Icons.ChevronRight size={12} />
                        <span>{currentDoc.category}</span>
                        <Icons.ChevronRight size={12} />
                        <span className="text-primary-500">{currentDoc.title}</span>
                    </div>

                    <MotionDiv
                        key={currentDoc.slug}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Header Image Section */}
                        {headerImage ? (
                            <div className="w-full aspect-video rounded-xl overflow-hidden mb-8 border border-neutral-800 relative group">
                                <img src={headerImage} alt="Doc Header" className="w-full h-full object-cover" />
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button size="sm" variant="secondary" onClick={() => setHeaderImage(null)}>
                                        <Icons.Trash2 size={14} />
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="mb-4 flex justify-end">
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={handleGenerateHeader} 
                                    isLoading={generatingImage}
                                    className="border-dashed border-neutral-700 text-neutral-400 hover:text-white"
                                >
                                    <Icons.Sparkles size={14} className="mr-2 text-purple-500" />
                                    Generate Header Art
                                </Button>
                            </div>
                        )}

                        <h1 className="text-4xl font-bold text-white mb-2">{currentDoc.title}</h1>
                        <p className="text-lg text-neutral-400 mb-8 pb-8 border-b border-neutral-800">
                            The definitive guide to the {currentDoc.title} module in StartupOS.
                        </p>

                        <div className="prose prose-invert prose-neutral max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-a:text-primary-400 prose-pre:bg-black prose-pre:border prose-pre:border-neutral-800">
                            <ReactMarkdown 
                                components={{
                                    code({node, className, children, ...props}: any) {
                                        const match = /language-(\w+)/.exec(className || '')
                                        return match ? (
                                            <div className="relative group">
                                                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="p-1 bg-neutral-800 rounded text-neutral-400 hover:text-white">
                                                        <Icons.Copy size={14} />
                                                    </button>
                                                </div>
                                                <code className={className} {...props}>
                                                    {children}
                                                </code>
                                            </div>
                                        ) : (
                                            <code className="bg-neutral-800 px-1.5 py-0.5 rounded text-sm text-primary-200" {...props}>
                                                {children}
                                            </code>
                                        )
                                    },
                                    blockquote: ({node, ...props}: any) => (
                                        <blockquote className="bg-neutral-900/50 border-l-4 border-primary-500 p-4 rounded-r-lg italic text-neutral-300 not-italic" {...props} />
                                    ),
                                    table: ({node, ...props}: any) => (
                                        <div className="overflow-x-auto my-6 border border-neutral-800 rounded-lg">
                                            <table className="min-w-full text-left text-sm" {...props} />
                                        </div>
                                    ),
                                    th: ({node, ...props}: any) => (
                                        <th className="bg-neutral-900 px-4 py-3 font-semibold text-white border-b border-neutral-800" {...props} />
                                    ),
                                    td: ({node, ...props}: any) => (
                                        <td className="px-4 py-3 border-b border-neutral-800 text-neutral-300" {...props} />
                                    )
                                }}
                            >
                                {currentDoc.content}
                            </ReactMarkdown>
                        </div>

                        {/* Navigation Footer */}
                        <div className="mt-16 pt-8 border-t border-neutral-800 flex justify-between gap-6">
                            {prevDoc ? (
                                <button 
                                    onClick={() => navigate(`/docs/${prevDoc.slug}`)}
                                    className="flex-1 p-4 rounded-xl border border-neutral-800 hover:border-neutral-600 bg-neutral-900/30 text-left group transition-all"
                                >
                                    <div className="text-xs text-neutral-500 mb-1 flex items-center gap-1 group-hover:text-primary-400">
                                        <Icons.ArrowLeft size={12} /> Previous
                                    </div>
                                    <div className="font-semibold text-white">{prevDoc.title}</div>
                                </button>
                            ) : <div className="flex-1" />}

                            {nextDoc ? (
                                <button 
                                    onClick={() => navigate(`/docs/${nextDoc.slug}`)}
                                    className="flex-1 p-4 rounded-xl border border-neutral-800 hover:border-neutral-600 bg-neutral-900/30 text-right group transition-all"
                                >
                                    <div className="text-xs text-neutral-500 mb-1 flex items-center justify-end gap-1 group-hover:text-primary-400">
                                        Next <Icons.ArrowRight size={12} />
                                    </div>
                                    <div className="font-semibold text-white">{nextDoc.title}</div>
                                </button>
                            ) : <div className="flex-1" />}
                        </div>
                    </MotionDiv>
                </div>
            </div>

            {/* --- RIGHT TOC --- */}
            <div className="w-64 hidden xl:block border-l border-neutral-800 p-6 overflow-y-auto">
                <div className="sticky top-6">
                    <h5 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">On this page</h5>
                    <div className="text-sm space-y-3 text-neutral-500">
                        {/* 
                            In a real full implementation, we would parse headers from markdown.
                            For this scaffold, we simulate dynamic TOC anchors.
                        */}
                        <a href="#" className="block hover:text-primary-400 transition-colors">Overview</a>
                        <a href="#" className="block hover:text-primary-400 transition-colors">Key Features</a>
                        <a href="#" className="block hover:text-primary-400 transition-colors">Configuration</a>
                        <a href="#" className="block hover:text-primary-400 transition-colors">Troubleshooting</a>
                    </div>

                    <div className="mt-8 pt-8 border-t border-neutral-800">
                         <h5 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Resources</h5>
                         <a href="#" className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white mb-2">
                             <Icons.Github size={14} /> Report an issue
                         </a>
                         <a href="#" className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white">
                             <Icons.MessageSquare size={14} /> Join Discord
                         </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

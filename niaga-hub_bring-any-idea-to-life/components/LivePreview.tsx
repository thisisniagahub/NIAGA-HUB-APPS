
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useState, useRef } from 'react';
import { 
    ArrowDownTrayIcon, 
    PlusIcon, 
    ViewColumnsIcon, 
    DocumentIcon, 
    CodeBracketIcon, 
    XMarkIcon,
    SunIcon,
    MoonIcon,
    CommandLineIcon,
    ClipboardDocumentIcon,
    CheckIcon
} from '@heroicons/react/24/outline';
import { Creation } from './CreationHistory';

interface LivePreviewProps {
  creation: Creation | null;
  isLoading: boolean;
  isFocused: boolean;
  onReset: () => void;
}

// Add type definition for the global pdfjsLib
declare global {
  interface Window {
    pdfjsLib: any;
  }
}

const LoadingStep = ({ text, active, completed }: { text: string, active: boolean, completed: boolean }) => (
    <div className={`flex items-center space-x-3 transition-all duration-500 ${active || completed ? 'opacity-100 translate-x-0' : 'opacity-30 translate-x-4'}`}>
        <div className={`w-4 h-4 flex items-center justify-center ${completed ? 'text-green-400' : active ? 'text-blue-400' : 'text-zinc-700'}`}>
            {completed ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            ) : active ? (
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
            ) : (
                <div className="w-1.5 h-1.5 bg-zinc-700 rounded-full"></div>
            )}
        </div>
        <span className={`font-mono text-[10px] sm:text-xs tracking-wide uppercase ${active ? 'text-zinc-200' : completed ? 'text-zinc-400 line-through' : 'text-zinc-600'}`}>{text}</span>
    </div>
);

const PdfRenderer = ({ dataUrl }: { dataUrl: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const renderPdf = async () => {
      if (!window.pdfjsLib) {
        setError("PDF library not initialized");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const loadingTask = window.pdfjsLib.getDocument(dataUrl);
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');
        const viewport = page.getViewport({ scale: 2.0 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };
        await page.render(renderContext).promise;
        setLoading(false);
      } catch (err) {
        console.error("Error rendering PDF:", err);
        setError("Could not render PDF preview.");
        setLoading(false);
      }
    };
    renderPdf();
  }, [dataUrl]);

  if (error) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-zinc-500 p-6 text-center">
            <DocumentIcon className="w-12 h-12 mb-3 opacity-50 text-red-400" />
            <p className="text-xs mb-2 text-red-400/80">{error}</p>
        </div>
    );
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        {loading && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
        )}
        <canvas 
            ref={canvasRef} 
            className={`max-w-[90%] max-h-[90%] object-contain shadow-2xl border border-zinc-800/50 rounded transition-opacity duration-500 ${loading ? 'opacity-0' : 'opacity-100'}`}
        />
    </div>
  );
};

export const LivePreview: React.FC<LivePreviewProps> = ({ creation, isLoading, isFocused, onReset }) => {
    const [loadingStep, setLoadingStep] = useState(0);
    const [showSplitView, setShowSplitView] = useState(false);
    const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
    const [isPreviewDark, setIsPreviewDark] = useState(false);
    const [copied, setCopied] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        if (isLoading) {
            setLoadingStep(0);
            const interval = setInterval(() => {
                setLoadingStep(prev => (prev < 3 ? prev + 1 : prev));
            }, 2000); 
            return () => clearInterval(interval);
        } else {
            setLoadingStep(0);
        }
    }, [isLoading]);

    useEffect(() => {
        if (creation?.originalImage) {
            setShowSplitView(window.innerWidth > 768);
        } else {
            setShowSplitView(false);
        }
        if (!isLoading) {
          setViewMode('preview');
        }
    }, [creation, isLoading]);

    useEffect(() => {
        const applyTheme = () => {
            const iframe = iframeRef.current;
            if (!iframe) return;
            const doc = iframe.contentDocument || iframe.contentWindow?.document;
            if (doc && doc.documentElement) {
                if (isPreviewDark) {
                    doc.documentElement.classList.add('dark');
                    doc.body.classList.add('dark');
                } else {
                    doc.documentElement.classList.remove('dark');
                    doc.body.classList.remove('dark');
                }
            }
        };

        if (iframeRef.current && viewMode === 'preview') {
            applyTheme();
            const timer = setTimeout(applyTheme, 100);
            return () => clearTimeout(timer);
        }
    }, [isPreviewDark, creation, isLoading, viewMode]);

    const handleCopy = async () => {
        if (!creation?.html) return;
        try {
            await navigator.clipboard.writeText(creation.html);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy code:", err);
        }
    };

    const handleExport = () => {
        if (!creation) return;
        const dataStr = JSON.stringify(creation, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${creation.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_artifact.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const hasOriginalImage = !!creation?.originalImage;
    const isSplit = showSplitView && hasOriginalImage;

  return (
    <div
      className={`
        fixed z-50 flex flex-col
        rounded-none md:rounded-xl overflow-hidden border-none md:border border-zinc-800 bg-[#0E0E10] shadow-2xl
        transition-all duration-700 cubic-bezier(0.19, 1, 0.22, 1)
        ${isFocused
          ? 'inset-0 md:inset-4 opacity-100 scale-100 translate-y-0 pointer-events-auto'
          : 'inset-0 md:inset-4 opacity-0 scale-[0.98] translate-y-12 pointer-events-none'
        }
      `}
    >
      {/* Dynamic Responsive Header */}
      <div className="bg-[#121214] px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between border-b border-zinc-800 shrink-0 relative z-50">
        {/* Left: Close/Traffic Lights */}
        <div className="flex items-center space-x-2 sm:space-x-3 w-10 sm:w-32">
           <div className="flex space-x-1.5 sm:space-x-2 group/controls">
                <button 
                  onClick={onReset}
                  className="w-3 h-3 rounded-full bg-zinc-700 group-hover/controls:bg-red-500 hover:!bg-red-600 transition-colors flex items-center justify-center focus:outline-none"
                >
                  <XMarkIcon className="w-2 h-2 text-black opacity-0 group-hover/controls:opacity-100" />
                </button>
                <div className="hidden sm:block w-3 h-3 rounded-full bg-zinc-700 group-hover/controls:bg-yellow-500 transition-colors"></div>
                <div className="hidden sm:block w-3 h-3 rounded-full bg-zinc-700 group-hover/controls:bg-green-500 transition-colors"></div>
           </div>
        </div>
        
        {/* Center: Title (Hidden on tiny screens) */}
        <div className="hidden xs:flex items-center space-x-2 text-zinc-500 max-w-[40%]">
            {viewMode === 'preview' ? <CodeBracketIcon className="w-3 h-3 shrink-0" /> : <CommandLineIcon className="w-3 h-3 shrink-0" />}
            <span className="text-[10px] font-mono uppercase tracking-wider truncate">
                {isLoading ? 'Processing...' : creation ? creation.name : 'Preview'}
            </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center justify-end space-x-1 sm:space-x-2 shrink-0">
            {!isLoading && creation && (
                <>
                    <button 
                        onClick={() => setViewMode(viewMode === 'preview' ? 'code' : 'preview')}
                        title={viewMode === 'preview' ? "View Source" : "App Preview"}
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'code' ? 'bg-blue-500/10 text-blue-400' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'}`}
                    >
                        {viewMode === 'preview' ? <CommandLineIcon className="w-4 h-4" /> : <CodeBracketIcon className="w-4 h-4" />}
                    </button>

                    <button 
                        onClick={handleCopy}
                        title="Copy Code"
                        className={`p-1.5 rounded-md transition-all ${copied ? 'text-green-400 bg-green-400/10' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'}`}
                    >
                        {copied ? <CheckIcon className="w-4 h-4" /> : <ClipboardDocumentIcon className="w-4 h-4" />}
                    </button>

                    <button 
                        onClick={() => setIsPreviewDark(!isPreviewDark)}
                        title="Toggle Theme"
                        className={`p-1.5 rounded-md transition-all ${isPreviewDark ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'}`}
                    >
                        {isPreviewDark ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
                    </button>

                    {hasOriginalImage && (
                         <button 
                            onClick={() => setShowSplitView(!showSplitView)}
                            title="Split View"
                            className={`p-1.5 rounded-md transition-all ${showSplitView ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'}`}
                        >
                            <ViewColumnsIcon className="w-4 h-4" />
                        </button>
                    )}

                    <button 
                        onClick={onReset}
                        className="flex items-center space-x-1 text-[10px] sm:text-xs font-bold bg-white text-black hover:bg-zinc-200 px-2 sm:px-3 py-1.5 rounded-md transition-colors ml-1 sm:ml-2"
                    >
                        <PlusIcon className="w-3 h-3" />
                        <span className="hidden sm:inline">New</span>
                    </button>
                </>
            )}
        </div>
      </div>

      {/* Responsive Content Area */}
      <div className="relative w-full flex-1 bg-[#09090b] flex overflow-hidden">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 sm:p-8 w-full z-20 bg-[#09090b]">
             <div className="w-full max-w-sm sm:max-w-md space-y-6 sm:space-y-8 animate-in fade-in zoom-in-95 duration-500">
                <div className="flex flex-col items-center text-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 mb-4 sm:mb-6 text-blue-500 animate-spin-slow">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-zinc-100 font-mono text-base sm:text-lg tracking-tight">Synthesizing Artifact</h3>
                    <p className="text-zinc-500 text-[10px] sm:text-sm mt-1 sm:mt-2">Generating interactive structures...</p>
                </div>

                <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 animate-[loading_3s_ease-in-out_infinite] w-1/3"></div>
                </div>

                 <div className="border border-zinc-800 bg-black/50 rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3 font-mono text-[10px] sm:text-sm">
                     <LoadingStep text="Analyzing architecture" active={loadingStep === 0} completed={loadingStep > 0} />
                     <LoadingStep text="Mapping interaction hooks" active={loadingStep === 1} completed={loadingStep > 1} />
                     <LoadingStep text="Refining visual styles" active={loadingStep === 2} completed={loadingStep > 2} />
                     <LoadingStep text="Finalizing environment" active={loadingStep === 3} completed={loadingStep > 3} />
                 </div>
             </div>
          </div>
        ) : creation?.html ? (
          <div className="relative w-full h-full flex flex-col md:flex-row overflow-hidden">
            {/* Split View Left: Original Context */}
            <div 
                className={`
                    relative bg-[#0c0c0e] border-zinc-800
                    transition-all duration-700 cubic-bezier(0.19, 1, 0.22, 1)
                    overflow-hidden shrink-0 flex flex-col
                    ${isSplit 
                        ? 'w-full h-[35%] md:w-1/2 md:h-full opacity-100 border-b md:border-b-0 md:border-r' 
                        : 'w-full h-0 md:w-0 md:h-full opacity-0 border-b-0 md:border-r-0 pointer-events-none'
                    }
                `}
            >
                <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-b from-black/40 to-transparent h-12"></div>
                <div className="absolute z-10 bg-black/80 backdrop-blur text-zinc-400 text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border border-zinc-800 w-max h-min top-3 left-3">
                    Reference
                </div>
                <div className="w-full h-full p-4 sm:p-6 flex items-center justify-center">
                    {creation.originalImage && (
                        creation.originalImage.startsWith('data:application/pdf') ? (
                            <PdfRenderer dataUrl={creation.originalImage} />
                        ) : (
                            <img 
                                src={creation.originalImage} 
                                alt="Input" 
                                className="max-w-full max-h-full object-contain shadow-2xl border border-zinc-800/50 rounded transition-transform duration-700"
                                style={{ transform: isSplit ? 'scale(1)' : 'scale(0.9)' }}
                            />
                        )
                    )}
                </div>
            </div>

            {/* App Content Panel */}
            <div 
                className={`flex-1 h-full relative transition-all duration-700 cubic-bezier(0.19, 1, 0.22, 1) min-w-0 ${isPreviewDark ? 'bg-zinc-950' : 'bg-white'}`}
            >
                {/* Code Editor Layer */}
                <div className={`absolute inset-0 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${viewMode === 'code' ? 'opacity-100 z-10 translate-y-0' : 'opacity-0 -z-10 translate-y-8'}`}>
                    <div className="w-full h-full bg-[#0d1117] text-[#c9d1d9] font-mono text-[10px] sm:text-xs overflow-auto p-3 sm:p-4 selection:bg-blue-500/30">
                        <pre className="whitespace-pre-wrap break-all leading-relaxed">
                            {creation.html}
                        </pre>
                    </div>
                </div>

                {/* Preview Frame Layer */}
                <div className={`absolute inset-0 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${viewMode === 'preview' ? 'opacity-100 z-0 scale-100' : 'opacity-0 -z-10 scale-98'}`}>
                    <iframe
                        ref={iframeRef}
                        title="Preview"
                        srcDoc={creation.html}
                        className="w-full h-full border-none"
                        sandbox="allow-scripts allow-forms allow-popups allow-modals allow-same-origin"
                    />
                </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

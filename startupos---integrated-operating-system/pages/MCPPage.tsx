

import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import * as Icons from 'lucide-react';
import { getMCPServers, addMCPServer, deleteMCPServer, refreshServerStatus } from '../services/mcpService';
import { MCPServer } from '../types';

interface MCPPageProps {
    embedded?: boolean;
}

export const MCPPage: React.FC<MCPPageProps> = ({ embedded = false }) => {
    const [servers, setServers] = useState<MCPServer[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [refreshingId, setRefreshingId] = useState<string | null>(null);

    // Modal State
    const [addMode, setAddMode] = useState<'MANUAL' | 'OPENAPI'>('MANUAL');
    const [customApiUrl, setCustomApiUrl] = useState('');

    // Form State
    const [newServer, setNewServer] = useState({
        name: '',
        description: '',
        transport: 'SSE' as 'SSE' | 'STDIO' | 'WEBSOCKET' | 'BROWSER',
        uri: '',
        capabilities: { resources: true, prompts: false, tools: true }
    });

    useEffect(() => {
        loadServers();
    }, []);

    const loadServers = async () => {
        const data = await getMCPServers();
        setServers(data);
        setLoading(false);
    };

    const handleRefresh = async (id: string) => {
        setRefreshingId(id);
        await refreshServerStatus(id);
        await loadServers();
        setRefreshingId(null);
    };

    const handleDelete = async (id: string) => {
        if(confirm('Disconnect this server? Agents will lose access to its tools immediately.')) {
            await deleteMCPServer(id);
            await loadServers();
        }
    };

    const openModal = (mode: 'MANUAL' | 'OPENAPI') => {
        setAddMode(mode);
        setNewServer({ name: '', description: '', transport: 'SSE', uri: '', capabilities: { resources: true, prompts: false, tools: true }});
        setIsAddModalOpen(true);
    };

    const connectBrowser = async () => {
        setLoading(true);
        // Simulate browser bridge connection
        await addMCPServer({
            name: 'My Browser',
            description: 'Local browser context (Clipboard, LocalStorage, Current DOM).',
            transport: 'BROWSER',
            uri: 'chrome-extension://local-bridge',
            capabilities: { resources: true, prompts: false, tools: true }
        });
        await loadServers();
        setLoading(false);
    };

    const handleAddServer = async () => {
        if (addMode === 'OPENAPI') {
            if (!customApiUrl) return;
            setLoading(true);
            // Simulate parsing OpenAPI spec and creating an adapter
            await addMCPServer({
                name: 'Custom REST Adapter',
                description: `Auto-generated adapter for API: ${customApiUrl}`,
                transport: 'SSE',
                uri: 'http://localhost:8080/mcp/adapter/' + btoa(customApiUrl).slice(0, 8),
                capabilities: { resources: true, prompts: false, tools: true }
            });
        } else {
            if(!newServer.name || !newServer.uri) return;
            setLoading(true);
            await addMCPServer(newServer);
        }
        
        await loadServers();
        closeModal();
    };

    const closeModal = () => {
        setIsAddModalOpen(false);
        setAddMode('MANUAL');
        setCustomApiUrl('');
        setNewServer({ name: '', description: '', transport: 'SSE', uri: '', capabilities: { resources: true, prompts: false, tools: true }});
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            {!embedded && (
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Icons.Network className="text-primary-500" />
                            Model Context Protocol
                        </h1>
                        <p className="text-neutral-400 mt-1">
                            Connect external data sources and tools to your StartupOS Agents via MCP.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => window.open('https://modelcontextprotocol.io', '_blank')}>
                            <Icons.BookOpen size={16} className="mr-2"/> Docs
                        </Button>
                        <Button onClick={() => openModal('MANUAL')}>
                            <Icons.Plus size={16} className="mr-2"/> Connect Server
                        </Button>
                    </div>
                </div>
            )}
            
            {embedded && (
                <div className="space-y-6">
                    {/* Custom Connector Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <button 
                            onClick={() => openModal('MANUAL')}
                            className="bg-neutral-900/50 border border-neutral-800 p-4 rounded-xl text-left hover:border-primary-500/50 hover:bg-neutral-800 transition-all group"
                         >
                             <div className="w-10 h-10 bg-blue-900/20 rounded-lg flex items-center justify-center mb-3 text-blue-400 group-hover:text-blue-300 group-hover:scale-110 transition-all">
                                 <Icons.Server size={20} />
                             </div>
                             <h3 className="text-white font-bold mb-1">Custom MCP</h3>
                             <p className="text-xs text-neutral-400">Connect a manually hosted MCP server.</p>
                         </button>

                         <button 
                            onClick={() => openModal('OPENAPI')}
                            className="bg-neutral-900/50 border border-neutral-800 p-4 rounded-xl text-left hover:border-primary-500/50 hover:bg-neutral-800 transition-all group"
                         >
                             <div className="w-10 h-10 bg-purple-900/20 rounded-lg flex items-center justify-center mb-3 text-purple-400 group-hover:text-purple-300 group-hover:scale-110 transition-all">
                                 <Icons.Code size={20} />
                             </div>
                             <h3 className="text-white font-bold mb-1">Custom API</h3>
                             <p className="text-xs text-neutral-400">Import OpenAPI spec to generate tools.</p>
                         </button>

                         <button 
                            onClick={connectBrowser}
                            className="bg-neutral-900/50 border border-neutral-800 p-4 rounded-xl text-left hover:border-primary-500/50 hover:bg-neutral-800 transition-all group"
                         >
                             <div className="w-10 h-10 bg-green-900/20 rounded-lg flex items-center justify-center mb-3 text-green-400 group-hover:text-green-300 group-hover:scale-110 transition-all">
                                 <Icons.Chrome size={20} />
                             </div>
                             <h3 className="text-white font-bold mb-1">My Browser</h3>
                             <p className="text-xs text-neutral-400">Bridge local browser context to agents.</p>
                         </button>
                    </div>

                    <div className="flex justify-between items-center bg-neutral-900/30 p-4 rounded-xl border border-neutral-800">
                        <div>
                            <h3 className="text-lg font-semibold text-white">Active Connections</h3>
                            <p className="text-sm text-neutral-500">Manage low-level MCP server bindings.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Server Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {servers.map(server => (
                    <Card key={server.id} className="flex flex-col group hover:border-neutral-700 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-neutral-800 rounded-lg text-white">
                                    <Icons.Database size={20} className={server.status === 'ERROR' ? 'text-red-400' : 'text-primary-400'}/>
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-sm">{server.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`w-1.5 h-1.5 rounded-full ${server.status === 'CONNECTED' ? 'bg-green-500' : server.status === 'ERROR' ? 'bg-red-500' : 'bg-neutral-500'}`}></span>
                                        <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">{server.status}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => handleRefresh(server.id)}
                                    className={`p-1.5 hover:bg-neutral-800 rounded-lg text-neutral-500 hover:text-white transition-colors ${refreshingId === server.id ? 'animate-spin' : ''}`}
                                >
                                    <Icons.RefreshCw size={14} />
                                </button>
                                <button 
                                    onClick={() => handleDelete(server.id)}
                                    className="p-1.5 hover:bg-red-900/20 rounded-lg text-neutral-500 hover:text-red-400 transition-colors"
                                >
                                    <Icons.Trash2 size={14} />
                                </button>
                            </div>
                        </div>

                        <p className="text-xs text-neutral-400 mb-4 h-8 line-clamp-2 leading-relaxed">
                            {server.description}
                        </p>

                        <div className="bg-black rounded border border-neutral-800 p-2 mb-4 font-mono text-[10px] text-neutral-500 flex items-center gap-2">
                             <Icons.Terminal size={12} className="text-neutral-600 shrink-0" />
                             <span className="truncate">{server.uri}</span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 mb-4 border-t border-b border-neutral-800 py-2">
                            <div className="text-center border-r border-neutral-800">
                                <div className="text-sm font-bold text-white">{server.toolsCount}</div>
                                <div className="text-[9px] text-neutral-500 uppercase">Tools</div>
                            </div>
                            <div className="text-center border-r border-neutral-800">
                                <div className="text-sm font-bold text-white">{server.transport}</div>
                                <div className="text-[9px] text-neutral-500 uppercase">Type</div>
                            </div>
                            <div className="text-center">
                                <div className={`text-sm font-bold ${server.latencyMs < 50 ? 'text-green-500' : server.latencyMs < 100 ? 'text-yellow-500' : 'text-red-500'}`}>{server.latencyMs}ms</div>
                                <div className="text-[9px] text-neutral-500 uppercase">Ping</div>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-auto">
                            {server.capabilities.tools && <span className="px-1.5 py-0.5 bg-neutral-800 rounded text-[9px] text-neutral-400 border border-neutral-700">Tools</span>}
                            {server.capabilities.resources && <span className="px-1.5 py-0.5 bg-neutral-800 rounded text-[9px] text-neutral-400 border border-neutral-700">Resources</span>}
                            {server.capabilities.prompts && <span className="px-1.5 py-0.5 bg-neutral-800 rounded text-[9px] text-neutral-400 border border-neutral-700">Prompts</span>}
                        </div>
                    </Card>
                ))}
            </div>

            {/* Add Server Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-lg relative animate-slide-in p-0 overflow-hidden border-2 border-neutral-800">
                        <div className="p-6 pb-0">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                        <Icons.Plug size={20} className="text-primary-500"/> Connect MCP Server
                                    </h2>
                                    <p className="text-neutral-400 text-sm mt-1">Configure a new endpoint for the AI gateway.</p>
                                </div>
                                <button onClick={closeModal} className="text-neutral-500 hover:text-white"><Icons.X size={20} /></button>
                            </div>
                            
                            {/* Tabs */}
                            <div className="flex border-b border-neutral-800 mb-6">
                                <button 
                                    onClick={() => setAddMode('MANUAL')}
                                    className={`flex-1 pb-3 text-sm font-medium transition-colors ${addMode === 'MANUAL' ? 'text-white border-b-2 border-primary-500' : 'text-neutral-500 hover:text-neutral-300'}`}
                                >
                                    Custom MCP
                                </button>
                                <button 
                                    onClick={() => setAddMode('OPENAPI')}
                                    className={`flex-1 pb-3 text-sm font-medium transition-colors ${addMode === 'OPENAPI' ? 'text-white border-b-2 border-primary-500' : 'text-neutral-500 hover:text-neutral-300'}`}
                                >
                                    Custom API
                                </button>
                            </div>
                        </div>

                        <div className="p-6 pt-0 space-y-4">
                            {addMode === 'MANUAL' ? (
                                <>
                                    <div className="bg-blue-900/20 border border-blue-900/50 p-3 rounded-lg flex items-start gap-3 mb-4">
                                        <Icons.Info className="text-blue-400 shrink-0 mt-0.5" size={16} />
                                        <p className="text-xs text-blue-200">
                                            Manually configure a Model Context Protocol server. Supported transports: SSE, Stdio, Websocket.
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-300 mb-1">Server Name</label>
                                        <input 
                                            className="w-full bg-black border border-neutral-800 rounded-lg p-2.5 text-white focus:border-primary-600 outline-none"
                                            placeholder="e.g. Production DB Read-Only"
                                            value={newServer.name}
                                            onChange={(e) => setNewServer({...newServer, name: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-300 mb-1">Transport Type</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['SSE', 'STDIO', 'WEBSOCKET'].map(type => (
                                                <button
                                                    key={type}
                                                    onClick={() => setNewServer({...newServer, transport: type as any})}
                                                    className={`py-2 rounded-lg text-xs font-bold border ${newServer.transport === type ? 'bg-primary-900/30 border-primary-600 text-primary-400' : 'bg-neutral-900 border-neutral-800 text-neutral-500 hover:border-neutral-600'}`}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-300 mb-1">Endpoint URI / Command</label>
                                        <input 
                                            className="w-full bg-black border border-neutral-800 rounded-lg p-2.5 text-white focus:border-primary-600 outline-none font-mono text-sm"
                                            placeholder={newServer.transport === 'STDIO' ? "npx -y @server/package" : "https://api.example.com/sse"}
                                            value={newServer.uri}
                                            onChange={(e) => setNewServer({...newServer, uri: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-300 mb-1">Description</label>
                                        <textarea 
                                            className="w-full bg-black border border-neutral-800 rounded-lg p-2.5 text-white focus:border-primary-600 outline-none resize-none h-20"
                                            placeholder="What tools does this server provide?"
                                            value={newServer.description}
                                            onChange={(e) => setNewServer({...newServer, description: e.target.value})}
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-4 animate-fade-in">
                                    <div className="bg-purple-900/20 border border-purple-900/50 p-4 rounded-lg flex items-start gap-3">
                                        <Icons.Code className="text-purple-400 shrink-0 mt-0.5" size={18} />
                                        <div className="text-sm">
                                            <p className="text-purple-200 font-medium mb-1">Convert REST to MCP</p>
                                            <p className="text-purple-300/80 leading-relaxed">
                                                Provide an OpenAPI (Swagger) spec URL. We will automatically generate an MCP Adapter that wraps your API endpoints as callable AI tools.
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-neutral-300 mb-1">OpenAPI Spec URL</label>
                                        <div className="flex gap-2">
                                            <div className="bg-neutral-800 border border-neutral-700 rounded-l-lg px-3 flex items-center text-neutral-400">
                                                <Icons.Link size={16} />
                                            </div>
                                            <input 
                                                className="flex-1 bg-black border border-neutral-800 rounded-r-lg p-2.5 text-white focus:border-primary-600 outline-none font-mono text-sm"
                                                placeholder="https://api.example.com/openapi.json"
                                                value={customApiUrl}
                                                onChange={(e) => setCustomApiUrl(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="text-xs text-neutral-500 mt-2">
                                        <p className="mb-1">Supported Formats:</p>
                                        <div className="flex gap-2">
                                            <span className="bg-neutral-800 px-2 py-1 rounded">JSON</span>
                                            <span className="bg-neutral-800 px-2 py-1 rounded">YAML</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4 border-t border-neutral-800 mt-4">
                                <Button className="flex-1" onClick={handleAddServer} isLoading={loading}>
                                    {addMode === 'OPENAPI' ? 'Generate Adapter' : 'Connect Server'}
                                </Button>
                                <Button variant="ghost" onClick={closeModal}>Cancel</Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};
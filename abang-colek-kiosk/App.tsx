
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
    GoogleGenAI, 
    LiveServerMessage, 
    Modality, 
    Blob as GenAIBlob, 
    Type,
    FunctionDeclaration,
} from '@google/genai';
import { MENU, OrderItem, FlyingIngredient } from './types';
import { OrderBoxSVG, PickupWindowSVG, MenuBoardSVG } from './constants';

const App: React.FC = () => {
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [flyingIngredients, setFlyingIngredients] = useState<FlyingIngredient[]>([]);
    const [scene, setScene] = useState<'order' | 'pickup'>('order');
    const [isConnected, setIsConnected] = useState(false);
    const [displayText, setDisplayText] = useState("TOTAL: $0.00");
    const [modelVolume, setModelVolume] = useState(0);
    const [orderImage, setOrderImage] = useState<string | null>(null);
    const [isSecretMenuOpen, setIsSecretMenuOpen] = useState(false);
    const [isCarArrived, setIsCarArrived] = useState(false);
    const [functionLogs, setFunctionLogs] = useState<{id: string, text: string}[]>([]);

    const orderListRef = useRef<HTMLUListElement>(null);
    const orderItemsRef = useRef<OrderItem[]>([]);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const inputCtxRef = useRef<AudioContext | null>(null);
    const micStreamRef = useRef<MediaStream | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const outputNodeRef = useRef<GainNode | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const rafRef = useRef<number | null>(null);
    const isMicOnRef = useRef<boolean>(true);

    const total = orderItems.reduce((sum, item) => sum + item.price, 0);

    useEffect(() => {
        orderItemsRef.current = orderItems;
    }, [orderItems]);

    useEffect(() => {
        if (orderListRef.current) {
            orderListRef.current.scrollTop = orderListRef.current.scrollHeight;
        }
    }, [orderItems]);

    useEffect(() => {
        const protectedPhrases = ["PULL AROUND", "ORDER SOMETHING", "PROCESSING", "AUTHORIZED"];
        if (!protectedPhrases.some(phrase => displayText.includes(phrase))) {
            setDisplayText(`TOTAL: $${total.toFixed(2)}`);
        }
    }, [total, displayText]);

    useEffect(() => {
        if (scene === 'pickup') {
            const timer = setTimeout(() => {
                setIsCarArrived(true);
            }, 3000);
            return () => clearTimeout(timer);
        } else {
            setIsCarArrived(false);
        }
    }, [scene]);

    const logFunctionCall = (name: string, args: any) => {
        let displayArgs = "";
        if (name === 'addToOrder' && args.itemName) {
            displayArgs = args.itemName;
        } else if (name === 'removeFromOrder' && args.itemName) {
            displayArgs = args.itemName;
        } else if (name === 'visualizeIngredient' && args.ingredient) {
            displayArgs = args.ingredient;
        } else {
            displayArgs = "";
        }

        const logText = displayArgs ? `${name}(${displayArgs})` : `${name}()`;
        const id = crypto.randomUUID();
        setFunctionLogs(prev => [...prev, { id, text: logText }]);
        setTimeout(() => {
            setFunctionLogs(prev => prev.filter(log => log.id !== id));
        }, 4000);
    };

    const ensureAudioContext = () => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
                sampleRate: 24000
            });
            analyserRef.current = audioCtxRef.current.createAnalyser();
            analyserRef.current.fftSize = 256;
            analyserRef.current.smoothingTimeConstant = 0.1;
            outputNodeRef.current = audioCtxRef.current.createGain();
            outputNodeRef.current.connect(analyserRef.current);
            analyserRef.current.connect(audioCtxRef.current.destination);
        } else if (audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
        }
        return audioCtxRef.current;
    };

    useEffect(() => {
        const updateVisualizer = () => {
            if (analyserRef.current && isConnected) {
                const data = new Uint8Array(analyserRef.current.frequencyBinCount);
                analyserRef.current.getByteFrequencyData(data);
                const sum = data.reduce((a, b) => a + b, 0);
                const avg = sum / data.length;
                const target = Math.min(1, avg / 25); 
                setModelVolume(prev => prev + (target - prev) * 0.3);
            } else {
                setModelVolume(prev => prev > 0.01 ? prev * 0.9 : 0);
            }
            rafRef.current = requestAnimationFrame(updateVisualizer);
        };
        rafRef.current = requestAnimationFrame(updateVisualizer);
        return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    }, [isConnected]);

    const playBeep = useCallback((freq = 440, type: OscillatorType = 'square', duration = 0.1) => {
        const ctx = ensureAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(gain).connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
    }, []);

    const createBlob = (data: Float32Array): GenAIBlob => {
        const l = data.length;
        const int16 = new Int16Array(l);
        for (let i = 0; i < l; i++) {
            const sample = Math.max(-1, Math.min(1, data[i]));
            int16[i] = sample < 0 ? sample * 32768 : sample * 32767;
        }
        let binary = '';
        const bytes = new Uint8Array(int16.buffer);
        for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
        return { data: btoa(binary), mimeType: 'audio/pcm;rate=16000' };
    };

    const decode = (base64: string) => {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        return bytes;
    };

    const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> => {
        const int16 = new Int16Array(data.buffer);
        const frameCount = int16.length / numChannels;
        const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
        for (let ch = 0; ch < numChannels; ch++) {
            const chData = buffer.getChannelData(ch);
            for (let i = 0; i < frameCount; i++) chData[i] = int16[i * numChannels + ch] / 32768.0;
        }
        return buffer;
    };

    const sanitizeSvg = (raw: string) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(raw, 'image/svg+xml');
        const svg = doc.querySelector('svg');
        if (!svg) return null;
        const blocked = doc.querySelectorAll('script, foreignObject');
        blocked.forEach(node => node.remove());
        const walk = doc.createTreeWalker(svg, NodeFilter.SHOW_ELEMENT);
        let current = walk.currentNode as Element | null;
        while (current) {
            Array.from(current.attributes).forEach(attr => {
                if (attr.name.startsWith('on')) current.removeAttribute(attr.name);
                if (attr.name === 'href' || attr.name === 'xlink:href') {
                    if (/^\s*javascript:/i.test(attr.value)) current.removeAttribute(attr.name);
                }
            });
            current = walk.nextNode() as Element | null;
        }
        return new XMLSerializer().serializeToString(svg);
    };

    const generateIngredientSVG = async (ingredient: string) => {
        try {
            const apiKey = import.meta.env.VITE_API_KEY as string | undefined;
            if (!apiKey) return null;
            const ai = new GoogleGenAI({ apiKey });
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Generate a raw SVG (viewBox="0 0 100 100") icon for a food ingredient: ${ingredient}. Bold, bright, cartoon style (like the Abang Colex logo). No background. Include a small green leaf if appropriate.`,
            });
            const raw = response.text.replace(/```xml|```svg|```/g, '').trim();
            return sanitizeSvg(raw);
        } catch (e) { return null; }
    };

    const generateOrderPreview = async (items: string) => {
        try {
            const apiKey = import.meta.env.VITE_API_KEY as string | undefined;
            if (!apiKey) return null;
            const ai = new GoogleGenAI({ apiKey });
            const menuNote = items ? `Order items: ${items}.` : 'Assorted colex mix.';
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: `A stylized tray of Malaysian colex (mixed fruit/tofu with dark sauce) from 'Abang Colex House'. ${menuNote} Vibrant colors, green leaf garnish, 90s retro lighting, high resolution.`,
            });
            for (const part of response.candidates?.[0]?.content?.parts || []) {
                if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
            }
        } catch (e) { return null; }
        return null;
    };

    const addFlyingIngredient = (svg: string) => {
        const id = crypto.randomUUID();
        const top = Math.floor(Math.random() * 60) + 10 + '%';
        setFlyingIngredients(prev => [...prev, { id, svg, top }]);
    };

    const disconnectLiveSession = useCallback(() => {
        setIsConnected(false);
        setIsSecretMenuOpen(false);
        isMicOnRef.current = false;
        if (processorRef.current) processorRef.current.disconnect();
        if (inputSourceRef.current) inputSourceRef.current.disconnect();
        if (micStreamRef.current) {
            micStreamRef.current.getTracks().forEach(track => track.stop());
            micStreamRef.current = null;
        }
        if (inputCtxRef.current) {
            inputCtxRef.current.close();
            inputCtxRef.current = null;
        }
        if (sessionPromiseRef.current) sessionPromiseRef.current.then(s => s.close());
        sourcesRef.current.forEach(s => s.stop());
        sourcesRef.current.clear();
        sessionPromiseRef.current = null;
        nextStartTimeRef.current = 0;
    }, []);

    const connectLiveSession = async () => {
        const apiKey = import.meta.env.VITE_API_KEY as string | undefined;
        if (!apiKey || sessionPromiseRef.current) return;

        const ctx = ensureAudioContext();
        await ctx.resume();
        isMicOnRef.current = true;
        setOrderImage(null);
        setIsSecretMenuOpen(false);

        const ai = new GoogleGenAI({ apiKey });
        const sessionPromise = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-12-2025',
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
                tools: [{ 
                    functionDeclarations: [
                        { name: "addToOrder", parameters: { type: Type.OBJECT, properties: { itemName: { type: Type.STRING, enum: MENU.map(m => m.name) } }, required: ["itemName"] } },
                        { name: "removeFromOrder", parameters: { type: Type.OBJECT, properties: { itemName: { type: Type.STRING, enum: MENU.map(m => m.name) } }, required: ["itemName"] } },
                        { name: "revealSecretMenu", parameters: { type: Type.OBJECT, properties: {} } },
                        { name: "visualizeIngredient", parameters: { type: Type.OBJECT, properties: { ingredient: { type: Type.STRING } }, required: ["ingredient"] } },
                        { name: "generateOrderPreview", parameters: { type: Type.OBJECT, properties: {} } },
                        { name: "finishOrder", parameters: { type: Type.OBJECT, properties: {} } }
                    ] 
                }],
                systemInstruction: `You are 'Nina', the friendly sales assistant at 'Abang Colex Kiosk' by Liurleleh House. You speak in a cheerful Manglish style. You are proud of the brand. Start by saying: 'Hi! Welcome to Abang Colex Kiosk, house of liurleleh! Nak order apa hari ni?'`
            },
            callbacks: {
                onopen: async () => {
                    setIsConnected(true);
                    try {
                        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                        const inCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                        const src = inCtx.createMediaStreamSource(stream);
                        const proc = inCtx.createScriptProcessor(4096, 1, 1);
                        proc.onaudioprocess = (e) => {
                            if (!isMicOnRef.current) return;
                            const blob = createBlob(e.inputBuffer.getChannelData(0));
                            sessionPromiseRef.current?.then(s => s.sendRealtimeInput({ media: blob }));
                        };
                        src.connect(proc).connect(inCtx.destination);
                        micStreamRef.current = stream;
                        inputCtxRef.current = inCtx;
                        inputSourceRef.current = src;
                        processorRef.current = proc;
                    } catch (e) { setIsConnected(false); }
                },
                onmessage: async (msg: LiveServerMessage) => {
                    if (msg.toolCall) {
                        const resps = [];
                        for (const fc of msg.toolCall.functionCalls) {
                            logFunctionCall(fc.name, fc.args);
                            let result = "OK";
                            if (fc.name === 'addToOrder') {
                                const item = MENU.find(m => m.name.toUpperCase() === (fc.args as any).itemName.trim().toUpperCase());
                                if (item) { setOrderItems(p => [...p, { ...item, id: crypto.randomUUID() }]); playBeep(600); result = "Added."; }
                            } else if (fc.name === 'removeFromOrder') {
                                const target = (fc.args as any).itemName?.trim().toUpperCase();
                                setOrderItems(prev => {
                                    const idx = prev.map(p => p.name.toUpperCase()).lastIndexOf(target);
                                    if (idx === -1) {
                                        result = "Not found.";
                                        return prev;
                                    }
                                    const next = prev.slice();
                                    next.splice(idx, 1);
                                    playBeep(300);
                                    result = "Removed.";
                                    return next;
                                });
                            } else if (fc.name === 'revealSecretMenu') {
                                setIsSecretMenuOpen(true); playBeep(200); result = "Revealed.";
                            } else if (fc.name === 'visualizeIngredient') {
                                generateIngredientSVG((fc.args as any).ingredient).then(s => s && addFlyingIngredient(s));
                            } else if (fc.name === 'generateOrderPreview') {
                                const desc = orderItemsRef.current.map(i => i.name).join(', ');
                                generateOrderPreview(desc).then(u => u && setOrderImage(u));
                            } else if (fc.name === 'finishOrder') {
                                if (orderItemsRef.current.length) {
                                    setDisplayText("PROCESSING...");
                                    setTimeout(() => {
                                        setDisplayText("AUTHORIZED");
                                        setTimeout(() => {
                                            setDisplayText("AMBIL KAT SANA >>");
                                            isMicOnRef.current = false;
                                            setTimeout(() => setScene('pickup'), 1000);
                                            setTimeout(disconnectLiveSession, 10000);
                                        }, 1500);
                                    }, 1500);
                                } else { result = "Empty order."; }
                            }
                            resps.push({ id: fc.id, name: fc.name, response: { result } });
                        }
                        sessionPromiseRef.current?.then(s => s.sendToolResponse({ functionResponses: resps }));
                    }
                    const b64 = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                    if (b64 && audioCtxRef.current) {
                        const ctx = audioCtxRef.current;
                        if (nextStartTimeRef.current < ctx.currentTime) nextStartTimeRef.current = ctx.currentTime;
                        const buf = await decodeAudioData(decode(b64), ctx, 24000, 1);
                        const src = ctx.createBufferSource();
                        src.buffer = buf; src.connect(outputNodeRef.current!);
                        src.onended = () => sourcesRef.current.delete(src);
                        src.start(nextStartTimeRef.current);
                        nextStartTimeRef.current += buf.duration;
                        sourcesRef.current.add(src);
                    }
                }
            }
        });
        sessionPromiseRef.current = sessionPromise;
        const s = await sessionPromise;
        s.sendClientContent({ turns: "START_CONVERSATION", turnComplete: true });
    };

    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div id="viewport" className={`${scene === 'pickup' ? 'drive-away' : ''} ${isSecretMenuOpen ? 'glitch-mode' : ''} ${isCarArrived && orderImage ? 'window-open' : ''}`}>
                <div className="debug-log-container">
                    {functionLogs.map(log => (
                        <div key={log.id} className="debug-chip">{'>'} {log.text}</div>
                    ))}
                </div>

                <div id="scene-track">
                    <div className="scene" id="scene-order">
                        <div id="menu-board-container"><MenuBoardSVG isSecretMenuOpen={isSecretMenuOpen} /></div>
                        {flyingIngredients.map(item => (
                            <div key={item.id} className="flying-ingredient" style={{ top: item.top }} onAnimationEnd={() => setFlyingIngredients(p => p.filter(f => f.id !== item.id))} dangerouslySetInnerHTML={{ __html: item.svg }} />
                        ))}
                        <div id="order-box-container">
                            <OrderBoxSVG modelVolume={modelVolume} />
                            <div id="crt-screen">
                                <div className="screen-header" style={{ color: '#e41e26', borderBottom: '2px solid #000' }}>ABANG COLEX KIOSK</div>
                                <ul id="order-list" ref={orderListRef}>
                                    {orderItems.map((item) => (
                                        <React.Fragment key={item.id}>
                                            <li><span>{item.name}</span><span>${item.price.toFixed(2)}</span></li>
                                        </React.Fragment>
                                    ))}
                                </ul>
                                <div id="total-display">{displayText}</div>
                            </div>
                            <div id="controls-area">
                                <div id="speak-btn" className={isConnected ? 'listening' : ''} onClick={() => isConnected ? disconnectLiveSession() : connectLiveSession()}>
                                    <div className="btn-grill"></div>
                                    <div className="btn-label">{isConnected ? "TEKAN SINI" : "START ORDER"}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="scene" id="scene-pickup">
                        <div id="pickup-window-container"><PickupWindowSVG orderImage={orderImage} /></div>
                    </div>
                </div>
            </div>
            <div style={{ padding: '8px', color: '#666', fontSize: '12px', textAlign: 'center', backgroundColor: '#000', borderTop: '1px solid #222' }}>
                ABANG COLEX by liurleleh house - Powered by Gemini Live
            </div>
        </div>
    );
};

export default App;

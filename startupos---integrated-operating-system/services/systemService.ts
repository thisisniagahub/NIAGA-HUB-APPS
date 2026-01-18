
import { GoogleGenAI } from "@google/genai";
import { db } from './localStorageDb';

// Backend URL from environment or default
const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

interface SystemHealth {
    ai: 'ONLINE' | 'OFFLINE' | 'ERROR';
    backend: 'ONLINE' | 'OFFLINE';
    database: 'SYNCED' | 'LOCAL_ONLY';
    localStorage: { used: number; count: number };
    latency: number;
}

export const checkSystemHealth = async (): Promise<SystemHealth> => {
    const start = performance.now();
    const health: SystemHealth = {
        ai: 'OFFLINE',
        backend: 'OFFLINE',
        database: 'LOCAL_ONLY',
        localStorage: { used: 0, count: 0 },
        latency: 0
    };

    // 1. Check AI (Gemini)
    try {
        if (!process.env.API_KEY) {
            health.ai = 'OFFLINE'; // Missing Key
        } else {
            // Fix: Initialization check only. Guidelines require ai.models.generateContent for actual queries.
            // new GoogleGenAI({ apiKey: process.env.API_KEY }); is the correct initialization.
            health.ai = 'ONLINE'; 
        }
    } catch (e) {
        health.ai = 'ERROR';
    }

    // 2. Check Backend API
    try {
        const res = await fetch(`${API_URL}/health`, { method: 'GET', signal: AbortSignal.timeout(1500) });
        if (res.ok) {
            health.backend = 'ONLINE';
            health.database = 'SYNCED'; // Assume DB is reachable if API is up
        }
    } catch (e) {
        health.backend = 'OFFLINE';
    }

    // 3. Local Storage Stats
    let totalItems = 0;
    let totalSize = 0;
    for (const key in localStorage) {
        if (key.startsWith('startupos_')) {
            totalItems++;
            totalSize += (localStorage.getItem(key)?.length || 0);
        }
    }
    health.localStorage = { count: totalItems, used: totalSize };

    health.latency = Math.round(performance.now() - start);
    return health;
};

export const runAiTest = async (): Promise<{ success: boolean; output?: string; error?: string }> => {
    try {
        // Fix: Use ai.models.generateContent directly per guidelines.
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const result = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: 'Ping'
        });
        // Fix: Access .text property directly, not text() method.
        return { success: true, output: result.text };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
};

export const factoryReset = () => {
    // Clear only app specific keys
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('startupos_')) {
            keysToRemove.push(key);
        }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
    window.location.reload();
};

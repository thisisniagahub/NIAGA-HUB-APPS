
import { GoogleGenAI, Type } from "@google/genai";
import { GeminiModel, FounderArchetype, SynapseGeneration, PitchAnalysis, Slide } from '../types';
import { getSubscriptionStatus } from './stripeService';

// --- Resilience / Circuit Breaker Config ---
const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Wrapper to handle 429s and 503s gracefully
async function callWithRetry<T>(fn: () => Promise<T>, attempt = 1): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (attempt > MAX_RETRIES) throw error;
    
    // Check for specific transient errors (Rate Limit, Service Unavailable)
    const isTransient = error.message?.includes('429') || error.message?.includes('503') || error.message?.includes('overloaded');
    
    if (isTransient) {
      const backoff = INITIAL_BACKOFF_MS * Math.pow(2, attempt - 1); // 1s, 2s, 4s...
      console.warn(`[Gemini Circuit Breaker] Attempt ${attempt} failed. Retrying in ${backoff}ms...`);
      await delay(backoff);
      return callWithRetry(fn, attempt + 1);
    }
    
    throw error;
  }
}

// Helper to always get a fresh instance with the latest key
const getAI = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// --- Rate Limiting Logic ---
const checkUsageLimit = async () => {
    const today = new Date().toISOString().split('T')[0];
    const lastDate = localStorage.getItem('startupos_usage_date');
    let count = parseInt(localStorage.getItem('startupos_usage_count') || '0');

    if (lastDate !== today) {
        count = 0;
        localStorage.setItem('startupos_usage_date', today);
    }

    const sub = await getSubscriptionStatus();
    // Use plan details from stripeService (Starter has 50 limit)
    const limit = sub.planId === 'starter' ? 50 : Infinity;

    if (count >= limit) {
        throw new Error(`Daily AI limit reached (${limit}). Upgrade to Growth for unlimited generation.`);
    }

    localStorage.setItem('startupos_usage_count', (count + 1).toString());
};

// --- Ideation & Research ---

export const generateIdeaValidation = async (idea: string): Promise<string> => {
  await checkUsageLimit();
  const ai = getAI();
  try {
    const result = await callWithRetry(async () => {
        return await ai.models.generateContent({
            model: GeminiModel.PRO,
            contents: `You are a startup validator. Analyze this startup idea rigorously: "${idea}". 
            Provide a structure response with: 
            1. Core Value Proposition
            2. Potential Pitfalls
            3. Target Audience
            4. Go-To-Market Strategy Suggestion.
            Format in Markdown.`,
            config: {
                thinkingConfig: { thinkingBudget: 1024 }
            }
        });
    });
    return result.text || "No analysis generated.";
  } catch (error: any) {
    if (error.message.includes("Daily AI limit")) return error.message;
    console.error("Gemini Error:", error);
    return "Failed to validate idea. Service may be overloaded or down.";
  }
};

export const generateFounderArchetype = async (input: string): Promise<FounderArchetype | null> => {
  await checkUsageLimit();
  const ai = getAI();
  try {
    const result = await callWithRetry(async () => {
        return await ai.models.generateContent({
            model: GeminiModel.FLASH, // Flash is faster for JSON tasks
            contents: `Analyze this abstract idea or vision: "${input}". 
            Determine the "Founder Archetype" (a creative persona like 'The Digital Weaver' or 'The System Architect').
            Provide a description of this persona, a visual art prompt to represent it, recommended business models, and core values.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "Creative title of the founder archetype" },
                    description: { type: Type.STRING, description: "Inspiring description of what this founder builds" },
                    visualPrompt: { type: Type.STRING, description: "A highly detailed, artistic, cinematic image prompt to visualize this concept. Abstract, 8k, unreal engine style." },
                    suggestedBusinessModels: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    description: "List of 3 concrete business models (e.g. SaaS, Marketplace)" 
                    },
                    coreValues: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "List of 3 core values"
                    }
                }
                }
            }
        });
    });
    
    if (result.text) {
        return JSON.parse(result.text) as FounderArchetype;
    }
    return null;
  } catch (error) {
    console.error("Archetype Gen Error:", error);
    return null;
  }
};

// --- Synapse: Cross-Module Automation ---
export const generateStartupEcosystem = async (idea: string, archetype: string): Promise<SynapseGeneration | null> => {
  await checkUsageLimit();
  const ai = getAI();
  try {
    const result = await callWithRetry(async () => {
        return await ai.models.generateContent({
            model: GeminiModel.FLASH,
            contents: `Based on the startup idea: "${idea}" and the founder archetype: "${archetype}", generate a starter ecosystem for their operating system.
            1. Create 3 initial Product Features for the roadmap.
            2. Create 2 Marketing Campaign ideas.
            3. Create 3 fictional Investor profiles that would be a perfect match.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                type: Type.OBJECT,
                properties: {
                    productFeatures: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                priority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] }
                            }
                        }
                    },
                    marketingHooks: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                channel: { type: Type.STRING, enum: ['Social', 'Email', 'Ads', 'Content'] }
                            }
                        }
                    },
                    investorMatches: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                firm: { type: Type.STRING },
                                notes: { type: Type.STRING }
                            }
                        }
                    }
                }
                }
            }
        });
    });

    if (result.text) {
        return JSON.parse(result.text) as SynapseGeneration;
    }
    return null;
  } catch (error) {
    console.error("Synapse Error:", error);
    return null;
  }
};

export const performMarketResearch = async (query: string): Promise<{ text: string; links: any[] }> => {
  await checkUsageLimit();
  const ai = getAI();
  try {
    const result = await callWithRetry(async () => {
        return await ai.models.generateContent({
            model: GeminiModel.FLASH,
            contents: `Conduct market research on: ${query}. Focus on competitors, market size, and trends.`,
            config: {
                tools: [{ googleSearch: {} }]
            }
        });
    });
    
    return {
      text: result.text || "No research data found.",
      links: result.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (error: any) {
    if (error.message.includes("Daily AI limit")) return { text: error.message, links: [] };
    console.error("Gemini Research Error:", error);
    return { text: "Error performing research.", links: [] };
  }
};

// --- Marketing ---

export const generateMarketingCopy = async (topic: string, format: 'Social' | 'Blog' | 'Ad'): Promise<string> => {
  await checkUsageLimit();
  const ai = getAI();
  try {
    const result = await callWithRetry(async () => {
        return await ai.models.generateContent({
            model: GeminiModel.FLASH,
            contents: `Write ${format} copy about "${topic}". Tone: Professional, engaging, and high-conversion.`,
        });
    });
    return result.text || "No copy generated.";
  } catch (error: any) {
    if (error.message.includes("Daily AI limit")) return error.message;
    return "Error generating copy.";
  }
};

export const generateMarketingImage = async (prompt: string): Promise<string | null> => {
  await checkUsageLimit();
  const ai = getAI();
  try {
    const result = await callWithRetry(async () => {
        return await ai.models.generateContent({
            model: GeminiModel.IMAGE_GEN,
            contents: {
                parts: [{ text: prompt }]
            },
            config: {
                imageConfig: {
                aspectRatio: "16:9",
                imageSize: "1K" // High quality
                }
            }
        });
    });

    for (const part of result.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Gen Error:", error);
    throw error;
  }
};

export const generateMarketingVideo = async (prompt: string): Promise<string | null> => {
  await checkUsageLimit();
  const ai = getAI();
  try {
    // 1. Start Operation
    let operation = await ai.models.generateVideos({
      model: GeminiModel.VEO,
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    // 2. Poll for completion
    // Circuit breaker not strictly applied to polling loop, but error handling exists
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({operation: operation});
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (downloadLink) {
        // Fetch the actual bytes using the API key
        const videoRes = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await videoRes.blob();
        return URL.createObjectURL(blob);
    }
    return null;

  } catch (error) {
    console.error("Video Gen Error:", error);
    throw error;
  }
};

// --- Sales ---

export const generateSalesEmail = async (leadContext: string, objection?: string): Promise<string> => {
    await checkUsageLimit();
    const ai = getAI();
    try {
        const prompt = objection 
            ? `Draft a response to a sales lead who said: "${objection}". Context: ${leadContext}. Handle the objection politely but persuasively.`
            : `Draft a cold outreach email to a potential client. Context: ${leadContext}. Keep it short, personalized, and value-driven.`;

        const result = await callWithRetry(async () => {
            return await ai.models.generateContent({
                model: GeminiModel.FLASH,
                contents: prompt
            });
        });
        return result.text || "Could not draft email.";
    } catch (error: any) {
        if (error.message.includes("Daily AI limit")) return error.message;
        return "Error drafting email.";
    }
};

// --- Investor Pitch ---

export const generateInvestorPitch = async (input: { 
    companyName: string; 
    problem?: string; 
    solution?: string; 
    traction?: string; 
    ask?: string;
    // Enhanced Context
    strategy?: any;
    finance?: any;
    market?: any;
}): Promise<Slide[]> => {
  await checkUsageLimit();
  const ai = getAI();
  try {
    const contextPrompt = `
    Context Data:
    - Strategic Goals: ${JSON.stringify(input.strategy?.goals || [])}
    - SWOT Analysis: ${JSON.stringify(input.strategy?.swot || [])}
    - Financial Runway: ${JSON.stringify(input.finance || {})}
    - Market Research: ${JSON.stringify(input.market || {})}
    `;

    const result = await callWithRetry(async () => {
        return await ai.models.generateContent({
            model: GeminiModel.PRO,
            contents: `You are a top-tier VC pitch deck consultant. Create a 7-slide pitch deck structure for this startup:
            
            Company: ${input.companyName}
            Problem: ${input.problem}
            Solution: ${input.solution}
            Traction: ${input.traction}
            Funding Ask: ${input.ask}

            ${contextPrompt}

            Using the provided Context Data where applicable to make the deck more data-driven and realistic.
            
            Generate strictly valid JSON.
            The response should be an array of objects with fields: 
            - type (TITLE, PROBLEM, SOLUTION, MARKET, TRACTION, TEAM, ASK)
            - title (string)
            - content (array of strings, bullet points)
            - speakerNotes (string, script for the presenter)
            - visualPrompt (string, description for an AI image generator to create a background or diagram for this slide)`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            type: { type: Type.STRING, enum: ['TITLE', 'PROBLEM', 'SOLUTION', 'MARKET', 'TRACTION', 'TEAM', 'ASK'] },
                            title: { type: Type.STRING },
                            content: { type: Type.ARRAY, items: { type: Type.STRING } },
                            speakerNotes: { type: Type.STRING },
                            visualPrompt: { type: Type.STRING }
                        }
                    }
                }
            }
        });
    });
    
    if (result.text) {
        return JSON.parse(result.text) as Slide[];
    }
    return [];
  } catch (error: any) {
    console.error("Gemini Pitch Error:", error);
    return [];
  }
};

export const analyzePitchDeckImage = async (base64Image: string): Promise<PitchAnalysis | null> => {
  await checkUsageLimit();
  const ai = getAI();
  try {
    const result = await callWithRetry(async () => {
        return await ai.models.generateContent({
            model: GeminiModel.PRO,
            contents: {
                parts: [
                { inlineData: { mimeType: 'image/png', data: base64Image } },
                { text: "You are a ruthless VC analyst. Grade this pitch deck slide. Give it a score out of 100. Provide a brutal but helpful critique and 3 specific bullet points on how to improve it." }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        score: { type: Type.NUMBER },
                        critique: { type: Type.STRING },
                        improvements: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                }
            }
        });
    });
    if (result.text) {
        return JSON.parse(result.text) as PitchAnalysis;
    }
    return null;
  } catch (error) {
    console.error("Slide Analysis Error:", error);
    return null;
  }
};

// --- Analytics ---

export const generateBusinessReport = async (contextData: string): Promise<string> => {
    await checkUsageLimit();
    const ai = getAI();
    try {
        const result = await callWithRetry(async () => {
            return await ai.models.generateContent({
                model: GeminiModel.PRO,
                contents: `You are a Chief Financial Officer and Data Analyst. Analyze the following raw business data and provide an Executive Summary.
                
                Data Context:
                ${contextData}
                
                Report Structure:
                1. Executive Summary (2-3 sentences)
                2. Key Insights (Bulleted list of trends)
                3. Risk Assessment (Potential cash flow or pipeline issues)
                4. Strategic Recommendations
                
                Format as Markdown.`,
                config: {
                    thinkingConfig: { thinkingBudget: 2048 }
                }
            });
        });
        return result.text || "Report generation failed.";
    } catch (error: any) {
        if (error.message.includes("Daily AI limit")) return error.message;
        return "Error generating report.";
    }
};

// --- Documentation ---

export const generateDocHeaderImage = async (title: string, content: string): Promise<string | null> => {
    await checkUsageLimit();
    const ai = getAI();
    try {
        const prompt = `Create a high-quality, abstract, futuristic header image for a technical documentation page titled "${title}".
        
        Context of the document:
        ${content.substring(0, 300)}...

        Visual Style:
        - Dark mode compatible, deep colors (dark grays, deep blues, hints of crimson red to match the brand).
        - Cinematic lighting, 8k resolution, Unreal Engine 5 style.
        - Abstract representation of the technical concept (e.g. glowing nodes for API, blueprints for Architecture).
        - No text overlays.
        `;

        const result = await callWithRetry(async () => {
            return await ai.models.generateContent({
                model: GeminiModel.IMAGE_GEN,
                contents: {
                    parts: [{ text: prompt }]
                },
                config: {
                    imageConfig: {
                        aspectRatio: "16:9",
                        imageSize: "1K"
                    }
                }
            });
        });

        for (const part of result.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
        return null;
    } catch (error) {
        console.error("Doc Header Gen Error:", error);
        return null;
    }
};

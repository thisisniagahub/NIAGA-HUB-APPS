/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION_MERGE } from "../constants";
import { InputData, MergedProfile } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found");
  return new GoogleGenAI({ apiKey });
};

export interface StreamCallbacks {
  onLog: (log: string) => void;
  onThinking?: (text: string) => void;
}

export const mergeData = async (
  input: InputData, 
  mode: 'flash' | 'thinking',
  callbacks: StreamCallbacks
): Promise<MergedProfile | null> => {
  try {
    const ai = getClient();
    const isThinkingMode = mode === 'thinking';
    const model = isThinkingMode ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
    
    const prompt = `
    INPUT CONTEXT:
    Customer Record (JSON): ${JSON.stringify(input.customerRecord)}
    
    Chat Transcript: "${input.chatTranscript}"
    
    Task: Resolve the final state of the customer data based on the chat.
    Ensure you capture all updates, identify the intent, and assess sentiment.
    `;

    callbacks.onLog(`Initializing ${mode.toUpperCase()} engine...`);
    callbacks.onLog(`Ingested Customer ID: ${input.customerRecord.customer_id}`);

    const config: any = {
      systemInstruction: SYSTEM_INSTRUCTION_MERGE,
      temperature: isThinkingMode ? 0.7 : 0.1, // Slightly higher for reasoning depth in thinking mode
      responseMimeType: 'application/json'
    };

    if (isThinkingMode) {
      config.thinkingConfig = { thinkingBudget: 16000 };
      callbacks.onLog(`Activating Deep Reasoning mode...`);
    }

    const result = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: config
    });

    const text = result.text || "{}";
    
    // In a real implementation with Thinking, we'd extract the thinking parts from result.candidates[0].content.parts
    // Since the SDK abstracts .text, we'll assume the JSON is the primary output.
    // If thinking was used, it happened "under the hood" or in parts we'd manually iterate if needed.
    
    callbacks.onLog(`Analyzed Chat Intent...`);
    callbacks.onLog(`Merging fields...`);
    callbacks.onLog(`Resolved Golden Record.`);

    return JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
  } catch (error) {
    console.error("Gemini Error:", error);
    callbacks.onLog(`Error: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI, Modality } from "@google/genai";
import { RepoFileTree, Citation } from '../types';

const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface InfographicResult {
    imageData: string | null;
    citations: Citation[];
}

export async function generateInfographic(
  repoName: string, 
  fileTree: RepoFileTree[], 
  style: string, 
  is3D: boolean = false,
  language: string = "English"
): Promise<string | null> {
  const ai = getAiClient();
  const limitedTree = fileTree.slice(0, 150).map(f => f.path).join(', ');
  
  let styleGuidelines = "";
  let dimensionPrompt = "";

  if (is3D) {
      styleGuidelines = `VISUAL STYLE: Photorealistic Miniature Diorama. The data flow should look like a complex, glowing 3D printed physical model sitting on a dark, reflective executive desk.`;
      dimensionPrompt = `PERSPECTIVE & RENDER: Isometric view with TILT-SHIFT depth of field to make it look like a small, tangible object on a table. Highly detailed.`;
  } else {
      switch (style) {
          case "Hand-Drawn Blueprint":
              styleGuidelines = `VISUAL STYLE: Technical architectural blueprint. Dark blue background with white/light blue hand-drawn lines.`;
              break;
          case "Corporate Minimal":
              styleGuidelines = `VISUAL STYLE: Clean, corporate, minimalist. White background, lots of whitespace.`;
              break;
          case "Neon Cyberpunk":
              styleGuidelines = `VISUAL STYLE: Dark mode cyberpunk. Black background with glowing neon pink, cyan, and violet lines and nodes.`;
              break;
          case "Modern Data Flow":
              styleGuidelines = `VISUAL STYLE: Light blue (#eef8fe) solid background. Colorful, flat vector icons. Smooth, bright blue curved arrows.`;
              break;
          default:
              if (style && style !== "Custom") {
                  styleGuidelines = `VISUAL STYLE: ${style}.`;
              } else {
                  styleGuidelines = `VISUAL STYLE: Modern flat vector illustration.`;
              }
              break;
      }
      dimensionPrompt = "Perspective: Clean 2D flat diagrammatic view straight-on.";
  }

  const prompt = `Create a detailed technical logical data flow diagram infographic for GitHub repository: "${repoName}".
  
  STRICT VISUAL STYLE GUIDELINES:
  ${styleGuidelines}
  - LAYOUT: Distinct Left-to-Right flow.
  - TYPOGRAPHY: Text MUST be in ${language}.
  ${dimensionPrompt}
  
  Repository Context: ${limitedTree}...
  
  Content:
  1. Title: "${repoName} Data Flow" (In ${language})
  2. Map flow: Input -> Processing -> Output.
  3. Short labels in ${language}.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return part.inlineData.data;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Gemini infographic generation failed:", error);
    throw error;
  }
}

export async function askRepoQuestion(question: string, infographicBase64: string, fileTree: RepoFileTree[]): Promise<string> {
  const ai = getAiClient();
  const limitedTree = fileTree.slice(0, 300).map(f => f.path).join('\n');
  
  const prompt = `You are a senior software architect reviewing a project.
  Attached is an architectural infographic. File structure:
  ${limitedTree}
  
  User Question: "${question}"
  Use both the image and the file structure to answer concisely.`;

  try {
    const response = await ai.models.generateContent({
       model: 'gemini-3-flash-preview',
       contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: infographicBase64
            }
          },
          { text: prompt }
        ]
      }
    });

    return response.text || "I couldn't generate an answer at this time.";
  } catch (error) {
    console.error("Gemini Q&A failed:", error);
    throw error;
  }
}

export async function askNodeSpecificQuestion(
  nodeLabel: string, 
  question: string, 
  fileTree: RepoFileTree[]
): Promise<string> {
  const ai = getAiClient();
  const limitedTree = fileTree.slice(0, 300).map(f => f.path).join('\n');
  
  const prompt = `Analyze repository node: "${nodeLabel}".
  Files:
  ${limitedTree}
  
  Question: "${question}"`;

  try {
    const response = await ai.models.generateContent({
       model: 'gemini-3-flash-preview',
       contents: {
        parts: [{ text: prompt }]
      }
    });

    return response.text || "I couldn't generate an answer at this time.";
  } catch (error) {
    console.error("Gemini Node Q&A failed:", error);
    throw error;
  }
}

export async function generateArticleInfographic(
  url: string, 
  style: string, 
  onProgress?: (stage: string) => void,
  language: string = "English"
): Promise<InfographicResult> {
    const ai = getAiClient();
    if (onProgress) onProgress("RESEARCHING & ANALYZING CONTENT...");
    
    let structuralSummary = "";
    let citations: Citation[] = [];

    try {
        const analysisPrompt = `Extract essential structure from ${url} for an infographic in ${language}:
        1. HEADLINE (In ${language})
        2. 3-5 KEY TAKEAWAYS (In ${language})
        3. ONE VISUAL METAPHOR IDEA.`;

        const analysisResponse = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: analysisPrompt,
            config: {
                tools: [{ googleSearch: {} }],
            }
        });
        structuralSummary = analysisResponse.text || "";

        const chunks = analysisResponse.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (chunks) {
            chunks.forEach((chunk: any) => {
                if (chunk.web?.uri) {
                    citations.push({
                        uri: chunk.web.uri,
                        title: chunk.web.title || "Source"
                    });
                }
            });
            const uniqueCitations = new Map();
            citations.forEach(c => uniqueCitations.set(c.uri, c));
            citations = Array.from(uniqueCitations.values());
        }
    } catch (e) {
        structuralSummary = `Create an infographic about: ${url}. Use ${language}.`;
    }

    if (onProgress) onProgress("DESIGNING & RENDERING INFOGRAPHIC...");

    let styleGuidelines = `STYLE: Modern 2D editorial illustration.`;
    switch (style) {
        case "Fun & Playful": styleGuidelines = `STYLE: Fun, playful vector illustrations.`; break;
        case "Clean Minimalist": styleGuidelines = `STYLE: Minimalist, sophisticated.`; break;
        case "Dark Mode Tech": styleGuidelines = `STYLE: Dark mode technical aesthetic.`; break;
        case "Modern Editorial": styleGuidelines = `STYLE: Modern flat vector editorial style.`; break;
        default: if (style && style !== "Custom") styleGuidelines = `STYLE: ${style}.`; break;
    }

    const imagePrompt = `Create a professional educational infographic:
    ${structuralSummary}
    
    VISUAL RULES:
    - ${styleGuidelines}
    - ALL TEXT IN ${language}.
    - Prominent headline.
    - Highly readable.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: imagePrompt }],
            },
        });

        let imageData = null;
        const parts = response.candidates?.[0]?.content?.parts;
        if (parts) {
            for (const part of parts) {
                if (part.inlineData && part.inlineData.data) {
                    imageData = part.inlineData.data;
                    break;
                }
            }
        }
        return { imageData, citations };
    } catch (error) {
        console.error("Article infographic generation failed:", error);
        throw error;
    }
}

export async function editImageWithGemini(base64Data: string, mimeType: string, prompt: string): Promise<string | null> {
  const ai = getAiClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: mimeType } },
          { text: prompt },
        ],
      },
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return part.inlineData.data;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Gemini image editing failed:", error);
    throw error;
  }
}

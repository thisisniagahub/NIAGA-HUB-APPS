import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateIdeaValidation } from '../../services/geminiService';

// Mock the GoogleGenAI SDK
const mockGenerateContent = vi.fn();

vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: vi.fn().mockImplementation(() => ({
      models: {
        generateContent: mockGenerateContent
      }
    })),
    Type: {
      OBJECT: 'OBJECT',
      STRING: 'STRING',
      ARRAY: 'ARRAY'
    },
    GeminiModel: {
      PRO: 'gemini-3-pro-preview'
    }
  };
});

describe('GeminiService Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generateIdeaValidation returns text on success', async () => {
    // Setup mock response
    mockGenerateContent.mockResolvedValue({
      text: '## Validation Report\nGood idea.'
    });

    const result = await generateIdeaValidation('Uber for cats');
    
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    expect(result).toContain('Validation Report');
  });

  it('generateIdeaValidation handles errors gracefully', async () => {
    mockGenerateContent.mockRejectedValue(new Error('API Failure'));

    const result = await generateIdeaValidation('Bad idea');
    
    expect(result).toBe('Failed to validate idea. Please try again.');
  });
});
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateThreadlyAnalysis } from '../../services/geminiService';

// Mock the Google GenAI
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContent: vi.fn().mockResolvedValue({
        text: JSON.stringify({
          analysis: {
            sentiment: 'Positive',
            dynamics: 'Professional and friendly',
            urgency: 'medium',
            urgencyReasoning: 'Response needed within 24-48 hours',
            keyPoints: ['Point 1', 'Point 2', 'Point 3']
          },
          responses: [
            {
              strategyType: 'recommended',
              replyText: 'Test response 1',
              predictedOutcome: 'Positive outcome',
              riskLevel: 'low',
              riskExplanation: 'Low risk',
              reasoning: 'Best approach',
              followUp: 'Follow up in 24h'
            },
            {
              strategyType: 'bold',
              replyText: 'Test response 2',
              predictedOutcome: 'Bold outcome',
              riskLevel: 'medium',
              riskExplanation: 'Some risk',
              reasoning: 'Assertive approach',
              followUp: 'Wait for response'
            },
            {
              strategyType: 'safe',
              replyText: 'Test response 3',
              predictedOutcome: 'Safe outcome',
              riskLevel: 'low',
              riskExplanation: 'Very safe',
              reasoning: 'Conservative approach',
              followUp: 'Monitor situation'
            }
          ],
          simulator: {
            theirResponse: 'Mock response',
            yourFollowUp: 'Mock follow up',
            finalReaction: 'Mock reaction'
          }
        })
      })
    }
  }))
}));

describe('Gemini Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should throw error when API key is missing', async () => {
    await expect(
      generateThreadlyAnalysis('Test message', 'Professional', 50, '', '')
    ).rejects.toThrow('API Key is missing');
  });

  it('should throw error when history is too short', async () => {
    await expect(
      generateThreadlyAnalysis('Hi', 'Professional', 50, '', 'test-api-key-12345')
    ).rejects.toThrow('too short');
  });

  it('should throw error when history is too long', async () => {
    const longText = 'a'.repeat(6000);
    await expect(
      generateThreadlyAnalysis(longText, 'Professional', 50, '', 'test-api-key-12345')
    ).rejects.toThrow('too long');
  });

  it('should successfully generate analysis with valid inputs', async () => {
    const validHistory = 'This is a valid conversation history that is long enough to be processed.';
    const result = await generateThreadlyAnalysis(
      validHistory,
      'Professional',
      50,
      'Work context',
      'test-api-key-12345678901234567890'
    );

    expect(result).toHaveProperty('analysis');
    expect(result).toHaveProperty('responses');
    expect(result).toHaveProperty('simulator');
    expect(result.responses).toHaveLength(3);
  });

  it('should handle different scenarios correctly', async () => {
    const validHistory = 'Valid conversation history for testing different scenarios.';
    
    const scenarios = ['Professional', 'Personal', 'Romantic', 'Family', 'Conflict', 'Sales'] as const;
    
    for (const scenario of scenarios) {
      const result = await generateThreadlyAnalysis(
        validHistory,
        scenario,
        50,
        '',
        'test-api-key-12345678901234567890'
      );
      
      expect(result).toBeDefined();
      expect(result.responses).toHaveLength(3);
    }
  });

  it('should handle different tone values', async () => {
    const validHistory = 'Valid conversation history for testing tone variations.';
    const tones = [0, 25, 50, 75, 100];
    
    for (const tone of tones) {
      const result = await generateThreadlyAnalysis(
        validHistory,
        'Professional',
        tone,
        '',
        'test-api-key-12345678901234567890'
      );
      
      expect(result).toBeDefined();
    }
  });
});

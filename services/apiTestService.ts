// API Test Service - Validates API keys and endpoints for all providers
import { AIProvider } from './multiProviderService';

interface TestResult {
  provider: AIProvider;
  status: 'success' | 'failed' | 'error';
  message: string;
  responseTime?: number;
}

const TEST_PROMPT = 'Say "Threadly API test successful" in exactly those words.';

export const testGeminiAPI = async (apiKey: string): Promise<TestResult> => {
  const startTime = Date.now();
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: TEST_PROMPT }] }],
          generationConfig: { maxOutputTokens: 50 },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const message = error.error?.message || response.statusText;
      return {
        provider: 'gemini',
        status: 'failed',
        message: `Gemini API Error: ${message}`,
      };
    }

    const data = await response.json();
    return {
      provider: 'gemini',
      status: 'success',
      message: 'Gemini API is working correctly',
      responseTime: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      provider: 'gemini',
      status: 'error',
      message: `Connection error: ${error.message}`,
    };
  }
};

export const testHuggingFaceAPI = async (apiKey: string): Promise<TestResult> => {
  const startTime = Date.now();
  try {
    const response = await fetch('https://router.huggingface.co/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'Qwen/Qwen2.5-7B-Instruct:featherless-ai',
        messages: [{ role: 'user', content: TEST_PROMPT }],
        max_tokens: 50,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const message = error.message || error.error?.message || response.statusText;
      return {
        provider: 'huggingface',
        status: 'failed',
        message: `HuggingFace API Error: ${message}`,
      };
    }

    const data = await response.json();
    return {
      provider: 'huggingface',
      status: 'success',
      message: 'HuggingFace API is working correctly',
      responseTime: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      provider: 'huggingface',
      status: 'error',
      message: `Connection error: ${error.message}`,
    };
  }
};

export const testAllAPIs = async (): Promise<TestResult[]> => {
  const results: TestResult[] = [];
  const providers: AIProvider[] = ['gemini', 'huggingface'];

  for (const provider of providers) {
    const apiKey = localStorage.getItem(`threadly_api_key_${provider}`);
    if (!apiKey) {
      results.push({
        provider,
        status: 'error',
        message: `${provider.toUpperCase()} API key not configured`,
      });
      continue;
    }

    switch (provider) {
      case 'gemini':
        results.push(await testGeminiAPI(apiKey));
        break;
      case 'huggingface':
        results.push(await testHuggingFaceAPI(apiKey));
        break;
    }
  }

  return results;
};

export const testProviderAPI = async (provider: AIProvider, apiKey: string): Promise<TestResult> => {
  switch (provider) {
    case 'gemini':
      return testGeminiAPI(apiKey);
    case 'huggingface':
      return testHuggingFaceAPI(apiKey);
    default:
      return {
        provider,
        status: 'error',
        message: `Unknown provider: ${provider}`,
      };
  }
};

// Multi-provider AI service with unified interface
import { ThreadlyResponse, ScenarioType } from "../types";

// ============================================
// PROVIDER TYPES & CONFIGURATION
// ============================================

export type AIProvider = 'gemini' | 'openai' | 'claude' | 'openrouter';

export interface ProviderConfig {
  provider: AIProvider;
  apiKey: string;
  model?: string;
}

export interface ProviderEndpoint {
  name: AIProvider;
  baseUrl: string;
  models: string[];
  defaultModel: string;
}

const PROVIDER_CONFIG: Record<AIProvider, ProviderEndpoint> = {
  gemini: {
    name: 'gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
    models: ['gemini-2.0-flash-exp', 'gemini-1.5-pro', 'gemini-1.5-flash'],
    defaultModel: 'gemini-2.0-flash-exp'
  },
  openai: {
    name: 'openai',
    baseUrl: 'https://api.openai.com/v1',
    models: ['gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
    defaultModel: 'gpt-4-turbo'
  },
  claude: {
    name: 'claude',
    baseUrl: 'https://api.anthropic.com/v1',
    models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
    defaultModel: 'claude-3-sonnet'
  },
  openrouter: {
    name: 'openrouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    models: ['openai/gpt-4-turbo', 'openai/gpt-4', 'anthropic/claude-3-sonnet', 'meta-llama/llama-2-70b-chat', 'mistralai/mistral-7b-instruct'],
    defaultModel: 'openai/gpt-4-turbo'
  }
};

// ============================================
// CACHE SYSTEM
// ============================================

const SYSTEM_INSTRUCTION = `You are Threadly, an expert communication strategist and conversation coach. Your goal is to analyze messaging contexts and generate strategic response options. You do not just generate text; you provide coaching, risk assessment, and predicted outcomes.`;

const API_TIMEOUT = 30000; // 30 seconds
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes cache TTL

interface CacheEntry {
  data: ThreadlyResponse;
  timestamp: number;
}

const responseCache = new Map<string, CacheEntry>();

// ============================================
// MOCK DATA FOR DEVELOPMENT
// ============================================

const USE_MOCK_DATA = false; // Set to true if all APIs exhausted

const generateMockResponse = (scenario: ScenarioType, tone: number, history: string): ThreadlyResponse => {
  const toneLabel = tone < 33 ? "Casual" : tone < 66 ? "Neutral" : "Formal";
  
  return {
    analysis: {
      sentiment: "Concerned",
      dynamics: `${scenario} conversation with ${toneLabel} tone preference`,
      urgency: "medium",
      urgencyReasoning: "Response needed within 24 hours to maintain good communication",
      keyPoints: [
        `The conversation shows clear ${scenario.toLowerCase()} context`,
        `Tone preference of ${tone}/100 suggests ${toneLabel.toLowerCase()} approach`,
        "Multiple response strategies available depending on goals"
      ]
    },
    responses: [
      {
        strategyType: "recommended",
        replyText: `I understand your perspective. Let me share my thoughts carefully given this ${scenario.toLowerCase()} situation...`,
        predictedOutcome: "This balanced approach should open dialogue while respecting the other person's viewpoint.",
        riskLevel: "low",
        riskExplanation: "Acknowledging their concern first builds rapport and reduces defensiveness.",
        reasoning: "This strategy validates their feelings while introducing your perspective, which typically leads to productive conversation.",
        followUp: "Wait for their response and continue building on the common ground identified."
      },
      {
        strategyType: "bold",
        replyText: `I appreciate the honesty here. Here's what I genuinely think we should do together...`,
        predictedOutcome: "Direct communication may energize the conversation or provoke stronger reaction depending on relationship.",
        riskLevel: "medium",
        riskExplanation: "Bold directness can be refreshing but might escalate tension if they're not ready for it.",
        reasoning: "Sometimes being direct about intentions clears the air faster and shows you're willing to take a stand.",
        followUp: "Be prepared to clarify or soften your stance if they react defensively."
      },
      {
        strategyType: "safe",
        replyText: `Thanks for bringing this up. I need some time to think about it properly before responding...`,
        predictedOutcome: "Buying time shows respect for the situation but might create temporary uncertainty.",
        riskLevel: "low",
        riskExplanation: "Taking time to respond is rarely seen negatively, though some might see it as avoidance.",
        reasoning: "Thoughtful responses beat rushed ones. This buys you time to craft the perfect message.",
        followUp: "Follow up within 24 hours with your considered response to show you took their concern seriously."
      }
    ],
    simulator: {
      theirResponse: "That makes sense. I appreciate you thinking it through rather than just reacting...",
      yourFollowUp: "Exactly. I think if we both come from this place of trying to understand each other, we can figure this out.",
      finalReaction: "They'd likely feel reassured and more open to working through the issue together."
    }
  };
};

// ============================================
// CACHE UTILITIES
// ============================================

const generateCacheKey = (
  history: string,
  scenario: ScenarioType,
  tone: number,
  userContext: string
): string => {
  const key = `${history.substring(0, 100)}-${scenario}-${tone}-${userContext}`;
  return btoa(key);
};

const validateResponse = (data: any): data is ThreadlyResponse => {
  return (
    data &&
    typeof data === 'object' &&
    data.analysis &&
    Array.isArray(data.responses) &&
    data.responses.length === 3 &&
    data.simulator
  );
};

// ============================================
// PROVIDER-SPECIFIC API CALLS
// ============================================

const callGeminiAPI = async (
  prompt: string,
  apiKey: string,
  model: string
): Promise<string> => {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7,
          maxOutputTokens: 2000,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    const message = error.error?.message || response.statusText;
    throw new Error(`Gemini API Error: ${message}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
};

const callOpenAIAPI = async (
  prompt: string,
  apiKey: string,
  model: string
): Promise<string> => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_INSTRUCTION },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    const message = error.error?.message || response.statusText;
    throw new Error(`OpenAI API Error: ${message}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

const callClaudeAPI = async (
  prompt: string,
  apiKey: string,
  model: string
): Promise<string> => {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 2000,
      system: SYSTEM_INSTRUCTION,
      messages: [
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    const message = error.error?.message || response.statusText;
    throw new Error(`Claude API Error: ${message}`);
  }

  const data = await response.json();
  return data.content[0].text;
};

const callOpenRouterAPI = async (
  prompt: string,
  apiKey: string,
  model: string
): Promise<string> => {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://threadly.app',
      'X-Title': 'Threadly - AI Conversation Strategist',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_INSTRUCTION },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
    const message = error.error?.message || error.message || response.statusText;
    throw new Error(`OpenRouter API Error: ${message}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

// ============================================
// UNIFIED API HANDLER
// ============================================

const callProviderAPI = async (
  prompt: string,
  config: ProviderConfig
): Promise<string> => {
  const { provider, apiKey } = config;
  const providerEndpoint = PROVIDER_CONFIG[provider];
  const model = config.model || providerEndpoint.defaultModel;

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout. Please try again.')), API_TIMEOUT);
  });

  try {
    let result: Promise<string>;

    switch (provider) {
      case 'gemini':
        result = callGeminiAPI(prompt, apiKey, model);
        break;
      case 'openai':
        result = callOpenAIAPI(prompt, apiKey, model);
        break;
      case 'claude':
        result = callClaudeAPI(prompt, apiKey, model);
        break;
      case 'openrouter':
        result = callOpenRouterAPI(prompt, apiKey, model);
        break;
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }

    return await Promise.race([result, timeoutPromise]);
  } catch (error: any) {
    throw new Error(`${provider.toUpperCase()} API Error: ${error.message}`);
  }
};

// ============================================
// MAIN ANALYSIS FUNCTION
// ============================================

export const generateThreadlyAnalysis = async (
  history: string,
  scenario: ScenarioType,
  tone: number,
  userContext: string,
  apiKey?: string,
  provider: AIProvider = 'gemini'
): Promise<ThreadlyResponse> => {
  // Use provided API key or fallback to localStorage
  const finalApiKey = apiKey || localStorage.getItem(`threadly_api_key_${provider}`);

  if (!finalApiKey || finalApiKey === 'PLACEHOLDER_API_KEY') {
    throw new Error(`API Key is missing for ${provider}. Please configure your ${provider} API key in Settings.`);
  }

  // Input validation
  if (!history || history.trim().length < 10) {
    throw new Error("Conversation history is too short. Please provide more context.");
  }

  if (history.trim().length > 5000) {
    throw new Error("Conversation history is too long. Please keep it under 5000 characters.");
  }

  // Check cache first
  const cacheKey = generateCacheKey(history, scenario, tone, userContext);
  const cachedEntry = responseCache.get(cacheKey);
  
  if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_TTL) {
    console.log(`✅ Returning cached response (5-min cache hit) from ${provider}`);
    return cachedEntry.data;
  }

  // Use mock data if enabled
  if (USE_MOCK_DATA) {
    console.log(`🧪 Using mock data (development mode)`);
    const mockResponse = generateMockResponse(scenario, tone, history);
    responseCache.set(cacheKey, { data: mockResponse, timestamp: Date.now() });
    return mockResponse;
  }

  // Build prompt
  const toneDescriptor = tone < 33 ? "Casual" : tone < 66 ? "Neutral/Balanced" : "Formal/Professional";

  const prompt = `
**CONVERSATION CONTEXT:**
Scenario: ${scenario}
Tone Preference: ${tone} (0=very casual, 100=very formal) - Interpretation: ${toneDescriptor}
Additional Context: ${userContext || "None provided"}

**CONVERSATION HISTORY:**
${history}

**YOUR TASK:**
1. Analyze the conversation (sentiment, dynamics, urgency).
2. Generate exactly 3 response options with different strategies:
   - Response 1: "recommended" (best balanced approach)
   - Response 2: "bold" OR "safe" (depends on context)
   - Response 3: Alternative strategic approach ("caution" or another "safe"/"bold")

**OUTPUT FORMAT:**
Return ONLY a JSON object with this exact structure:

{
  "analysis": {
    "sentiment": "string (1-2 words)",
    "dynamics": "string (brief description)",
    "urgency": "high|medium|low",
    "urgencyReasoning": "string (1 sentence)",
    "keyPoints": ["point1", "point2", "point3"]
  },
  "responses": [
    {
      "strategyType": "recommended|bold|safe|caution",
      "replyText": "The actual message text to send",
      "predictedOutcome": "2-3 sentences about likely reaction",
      "riskLevel": "low|medium|high",
      "riskExplanation": "1-2 sentences explaining risks",
      "reasoning": "2-3 sentences why this approach works",
      "followUp": "What to do after their response"
    }
    // ... exactly 3 responses total
  ],
  "simulator": {
    "theirResponse": "A realistic reply they might send if the user uses the Recommended response",
    "yourFollowUp": "A good follow-up message for the user",
    "finalReaction": "How they would likely react to the follow-up"
  }
}
`;

  try {
    const textResponse = await callProviderAPI(prompt, { provider, apiKey: finalApiKey });
    
    let parsedData: ThreadlyResponse;
    try {
      parsedData = JSON.parse(textResponse) as ThreadlyResponse;
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      throw new Error("Invalid response format from AI. Please try again.");
    }

    if (!validateResponse(parsedData)) {
      console.error('Invalid response structure:', parsedData);
      throw new Error("Incomplete response from AI. Please try again.");
    }

    // Cache successful response
    responseCache.set(cacheKey, { data: parsedData, timestamp: Date.now() });
    return parsedData;
  } catch (error: any) {
    console.error("Analysis Error:", error);
    
    if (error.message?.includes('timeout')) {
      throw new Error('Request timed out. Check your connection and try again.');
    }
    
    if (error.message?.includes('API key') || error.message?.includes('authentication')) {
      throw new Error(`Invalid ${provider} API key. Please check your Settings.`);
    }
    
    if (error.message?.includes('quota') || error.message?.includes('429') || error.message?.includes('rate limit')) {
      throw new Error(`${provider.toUpperCase()} quota exceeded. Try another provider or wait a few minutes.`);
    }

    throw new Error(error.message || 'Analysis failed. Please try again.');
  }
};

// ============================================
// CACHE MANAGEMENT UTILITIES
// ============================================

export const clearAnalysisCache = (): void => {
  responseCache.clear();
  console.log('✅ Analysis cache cleared');
};

export const getCacheSize = (): number => {
  return responseCache.size;
};

export const getAvailableProviders = (): AIProvider[] => {
  return Object.keys(PROVIDER_CONFIG) as AIProvider[];
};

export const getProviderModels = (provider: AIProvider): string[] => {
  return PROVIDER_CONFIG[provider]?.models || [];
};

export const getProviderConfig = (provider: AIProvider): ProviderEndpoint => {
  return PROVIDER_CONFIG[provider];
};

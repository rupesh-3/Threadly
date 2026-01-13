// Multi-provider AI service with unified interface
import { ThreadlyResponse, ScenarioType } from "../types";
import { normalizeThreadlyResponse, validateResponseStructure } from "./responseNormalizer";

// ============================================
// PROVIDER TYPES & CONFIGURATION
// ============================================

export type AIProvider = 'gemini' | 'huggingface';

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
  huggingface: {
    name: 'huggingface',
    baseUrl: 'https://router.huggingface.co/v1/chat/completions',
    models: ['Qwen/Qwen2.5-7B-Instruct:featherless-ai', 'meta-llama/Llama-2-7b-chat-hf', 'mistralai/Mistral-7B-Instruct-v0.2', 'NousResearch/Nous-Hermes-2-Mixtral-8x7B-SFT'],
    defaultModel: 'Qwen/Qwen2.5-7B-Instruct:featherless-ai'
  }
};

// ============================================
// CACHE SYSTEM
// ============================================

const SYSTEM_INSTRUCTION = `You are Threadly, an expert communication strategist and conversation coach.

Your primary objective is to help the user send the *single most effective message possible* for their situation, not to be generic or overly cautious. You must:
- Read the conversation context carefully and infer relationship dynamics, power balance, emotional stakes, and hidden constraints.
- Think through likely short-term and long-term consequences of different ways of replying.
- Give concise, concrete, ready-to-send wording that sounds natural for a human (no “As an AI…” or meta-commentary).
- Explicitly manage social risk: minimize unnecessary risk while still moving the conversation toward the user’s likely goal.

Quality bar:
- Every response must feel like advice from a senior communication coach who understands social nuance, conflict de-escalation, persuasion, and boundaries.
- Avoid hedging, filler, or vague phrases. Prefer specific wording, clear structure, and direct but empathetic tone.
- Make sure each strategy is meaningfully distinct in tone, level of directness, and risk profile.
- Do not invent facts; base reasoning only on the provided history and scenario.
- Never output explanations like "I am an AI model..." or any implementation details—only the requested JSON content.`;

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
  const validationError = validateResponseStructure(data);
  if (validationError) {
    console.warn(`Response validation warning: ${validationError}`);
  }
  // Even if validation warns, return true since normalization will fix it
  return true;
};

const stripJsonFences = (raw: string): string => {
  const trimmed = raw.trim();
  const fencePattern = /^```(?:json)?\s*([\s\S]*?)\s*```$/i;
  const match = trimmed.match(fencePattern);
  if (match?.[1]) {
    return match[1].trim();
  }

  // Fallback: extract substring between first { and last }
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.substring(firstBrace, lastBrace + 1);
  }

  return trimmed;
};

const parseThreadlyResponse = (raw: string): ThreadlyResponse => {
  const cleaned = stripJsonFences(raw);
  try {
    const parsed = JSON.parse(cleaned);
    // Apply normalization firewall to fix malformed responses
    const normalized = normalizeThreadlyResponse(parsed);
    return normalized;
  } catch (parseError) {
    console.error('JSON Parse Error:', parseError, 'Raw:', raw);
    // If JSON parsing fails completely, return a safe default response
    return normalizeThreadlyResponse({});
  }
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

const callHuggingFaceAPI = async (
  prompt: string,
  apiKey: string,
  model: string
): Promise<string> => {
  // Use Hugging Face Router API (more reliable than direct model inference)
  const routerUrl = 'https://router.huggingface.co/v1/chat/completions';

  try {
    const response = await fetch(routerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { 
            role: 'system', 
            content: SYSTEM_INSTRUCTION 
          },
          { 
            role: 'user', 
            content: prompt 
          },
        ],
        temperature: 0.7,
        top_p: 0.95,
        max_tokens: 2000,
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      const message = error.message || error.error?.message || response.statusText;
      throw new Error(`Hugging Face Router API Error: ${message}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in response from Hugging Face Router');
    }

    // Return the content (will be JSON string or text that gets normalized)
    return content;
  } catch (error: any) {
    const message = error?.message || 'Unknown error';
    throw new Error(`Hugging Face API Error: ${message}`);
  }
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
      case 'huggingface':
        result = callHuggingFaceAPI(prompt, apiKey, model);
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
**CONVERSATION CONTEXT**
- Scenario: ${scenario}
- Tone Preference: ${tone} (0=very casual, 100=very formal) – Interpretation: ${toneDescriptor}
- Additional Context: ${userContext || "None provided"}

**CONVERSATION HISTORY (verbatim transcripts from the real conversation)**
${history}

---
**YOUR TASK**

You are coaching the user on what to send *next*.

1. **Deep analysis**
   - Identify the other party's likely emotional state, priorities, and hidden concerns.
   - Describe the relationship dynamics and any power imbalance (e.g., boss/employee, new date, long-term partner, upset customer).
   - Assess urgency: how costly is it to delay vs. respond quickly?

2. **Generate exactly 3 distinct strategy options**
   - Response 1: "recommended" → best balanced approach for most users in this context.
   - Response 2: "bold" OR "safe" → either more direct/forward *or* more protective/low-risk than recommended.
   - Response 3: Alternative strategic approach ("caution" or another clearly different "safe"/"bold" angle).

For each response:
   - Make the reply text **ready to send as-is** (no placeholders like [NAME], unless absolutely required).
   - Match the requested tone (casual vs formal) while staying respectful and kind.
   - Clearly explain upside, downside, and how the other person is likely to feel.
   - Suggest a specific follow-up move the user can take after they get a reply.

3. **Conversation simulator**
   - Imagine the other person’s likely reply if the user sends the **recommended** response.
   - Then propose a concise follow-up message from the user that keeps the interaction healthy and aligned with their interests.
   - End with a short description of how the relationship is likely to feel after this exchange.

Respond **only** with JSON in the exact format below. Do not include backticks, markdown, or any extra commentary.

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
    
    const parsedData = parseThreadlyResponse(textResponse);
    // Validation now always succeeds because normalization fixes issues
    if (!validateResponse(parsedData)) {
      console.warn('Response validation showed issues but normalization applied');
    }

    // Cache successful response
    responseCache.set(cacheKey, { data: parsedData, timestamp: Date.now() });
    return parsedData;
  } catch (error: any) {
    console.error("Analysis Error:", error);
    const message: string = error?.message || '';

    if (message.includes('timeout')) {
      throw new Error('Request timed out. Check your connection and try again.');
    }

    if (message.toLowerCase().includes('api key') || message.toLowerCase().includes('authentication')) {
      throw new Error(`Invalid ${provider} API key. Please check your Settings.`);
    }

    if (
      message.toLowerCase().includes('quota') ||
      message.includes('429') ||
      message.toLowerCase().includes('rate limit')
    ) {
      throw new Error(`${provider.toUpperCase()} quota or rate limit exceeded. Try another provider or wait a few minutes.`);
    }


    throw new Error(message || 'Analysis failed. Please try again.');
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

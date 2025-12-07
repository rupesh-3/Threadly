import { GoogleGenerativeAI } from "@google/generative-ai";
import { ThreadlyResponse, ScenarioType } from "../types";

const SYSTEM_INSTRUCTION = `You are Threadly, an expert communication strategist and conversation coach. Your goal is to analyze messaging contexts and generate strategic response options. You do not just generate text; you provide coaching, risk assessment, and predicted outcomes.`;

const API_TIMEOUT = 30000; // 30 seconds
const MODEL_NAME = 'gemini-2.0-flash-exp';
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes cache TTL

// DEVELOPMENT MODE: Set to true to use mock data instead of API calls
const USE_MOCK_DATA = false; // Change to true if API quota exhausted

// Mock response generator for testing
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

// Response cache to prevent duplicate API calls
interface CacheEntry {
  data: ThreadlyResponse;
  timestamp: number;
}

const responseCache = new Map<string, CacheEntry>();
let aiInstance: GoogleGenerativeAI | null = null;
let currentApiKey: string | null = null;

// Get or create AI instance (singleton pattern)
const getAIInstance = (apiKey: string): GoogleGenerativeAI => {
  // Create new instance if API key changed
  if (currentApiKey !== apiKey) {
    aiInstance = new GoogleGenerativeAI(apiKey);
    currentApiKey = apiKey;
    // Clear cache when API key changes
    responseCache.clear();
  }
  return aiInstance!;
};

// Generate cache key from parameters
const generateCacheKey = (
  history: string,
  scenario: ScenarioType,
  tone: number,
  userContext: string
): string => {
  // Use hash of parameters for cache key
  const key = `${history.substring(0, 100)}-${scenario}-${tone}-${userContext}`;
  return btoa(key); // Base64 encode for safety
};

// Validate API response structure
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

export const generateThreadlyAnalysis = async (
  history: string,
  scenario: ScenarioType,
  tone: number,
  userContext: string,
  apiKey?: string
): Promise<ThreadlyResponse> => {

  // Use provided API key or fallback to localStorage
  const finalApiKey = apiKey || localStorage.getItem('threadly_api_key');

  if (!finalApiKey || finalApiKey === 'PLACEHOLDER_API_KEY') {
    throw new Error("API Key is missing. Please configure your Gemini API key in Settings.");
  }

  // Input validation
  if (!history || history.trim().length < 10) {
    throw new Error("Conversation history is too short. Please provide more context.");
  }

  if (history.trim().length > 5000) {
    throw new Error("Conversation history is too long. Please keep it under 5000 characters.");
  }

  // Check cache first - PREVENT DUPLICATE API CALLS
  const cacheKey = generateCacheKey(history, scenario, tone, userContext);
  const cachedEntry = responseCache.get(cacheKey);
  
  if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_TTL) {
    console.log('✅ Returning cached response (5-min cache hit)');
    return cachedEntry.data;
  }

  // USE MOCK DATA FOR TESTING (when API quota exhausted)
  if (USE_MOCK_DATA) {
    console.log('🧪 Using mock data (development mode)');
    const mockResponse = generateMockResponse(scenario, tone, history);
    
    // Still cache mock responses
    responseCache.set(cacheKey, {
      data: mockResponse,
      timestamp: Date.now()
    });
    
    return mockResponse;
  }

  // Get or create AI instance (prevents recreating on every call)
  const ai = getAIInstance(finalApiKey);

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
    // Create timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout. Please try again.')), API_TIMEOUT);
    });

    // Race between API call and timeout
    const model = ai.getGenerativeModel({ 
      model: MODEL_NAME,
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: {
        responseMimeType: 'application/json',
      }
    });
    
    const response = await Promise.race([
      model.generateContent(prompt),
      timeoutPromise
    ]);

    const text = response.response.text();
    if (!text) {
      throw new Error("Empty response from AI. Please try again.");
    }

    let parsedData: ThreadlyResponse;
    try {
      parsedData = JSON.parse(text) as ThreadlyResponse;
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      throw new Error("Invalid response format from AI. Please try again.");
    }

    // Validate response structure
    if (!validateResponse(parsedData)) {
      console.error('Invalid response structure:', parsedData);
      throw new Error("Incomplete response from AI. Please try again.");
    }

    // Cache the successful response BEFORE returning
    responseCache.set(cacheKey, {
      data: parsedData,
      timestamp: Date.now()
    });

    return parsedData;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    // Categorize errors for better user feedback
    if (error.message?.includes('timeout')) {
      throw new Error('Request timed out. Check your connection and try again.');
    }
    
    if (error.message?.includes('API key')) {
      throw new Error('Invalid API key. Please check your Settings.');
    }
    
    if (error.message?.includes('quota') || error.message?.includes('rate limit') || error.message?.includes('403')) {
      throw new Error('API quota exceeded. This is a Google API limitation. Wait a few minutes or check your Google Cloud quota settings.');
    }
    
    if (error.message?.includes('network') || error.code === 'ENOTFOUND') {
      throw new Error('Network error. Check your internet connection.');
    }
    
    // Generic fallback
    throw new Error(error.message || 'Analysis failed. Please try again.');
  }
};

// Export utility functions for cache management
export const clearAnalysisCache = (): void => {
  responseCache.clear();
  aiInstance = null;
  currentApiKey = null;
  console.log('✅ Analysis cache cleared');
};

export const getCacheSize = (): number => {
  return responseCache.size;
};

export const resetAIInstance = (): void => {
  aiInstance = null;
  currentApiKey = null;
  console.log('✅ AI instance reset');
};
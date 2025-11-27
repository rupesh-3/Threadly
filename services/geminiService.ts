import { GoogleGenAI } from "@google/genai";
import { ThreadlyResponse, ScenarioType } from "../types";

const SYSTEM_INSTRUCTION = `You are Threadly, an expert communication strategist and conversation coach. Your goal is to analyze messaging contexts and generate strategic response options. You do not just generate text; you provide coaching, risk assessment, and predicted outcomes.`;

const API_TIMEOUT = 30000; // 30 seconds
const MODEL_NAME = 'gemini-2.0-flash-exp';

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

  // Use provided API key, fallback to environment variable, then localStorage
  const finalApiKey = apiKey || import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('threadly_api_key');

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

  const ai = new GoogleGenAI({ apiKey: finalApiKey });

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
    const response = await Promise.race([
      ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
        }
      }),
      timeoutPromise
    ]);

    const text = response.text;
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
    
    if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
      throw new Error('API quota exceeded. Please try again later.');
    }
    
    if (error.message?.includes('network') || error.code === 'ENOTFOUND') {
      throw new Error('Network error. Check your internet connection.');
    }
    
    // Generic fallback
    throw new Error(error.message || 'Analysis failed. Please try again.');
  }
};
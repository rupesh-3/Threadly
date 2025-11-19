import { GoogleGenAI } from "@google/genai";
import { ThreadlyResponse, ScenarioType } from "../types";

const SYSTEM_INSTRUCTION = `You are Threadly, an expert communication strategist and conversation coach. Your goal is to analyze messaging contexts and generate strategic response options. You do not just generate text; you provide coaching, risk assessment, and predicted outcomes.`;

export const generateThreadlyAnalysis = async (
  history: string,
  scenario: ScenarioType,
  tone: number,
  userContext: string
): Promise<ThreadlyResponse> => {

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
    throw new Error("API Key is missing or invalid. Please check your .env.local file.");
  }

  const ai = new GoogleGenAI({ apiKey });

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
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as ThreadlyResponse;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
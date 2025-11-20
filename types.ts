export type ScenarioType = 'Professional' | 'Personal' | 'Romantic' | 'Family' | 'Conflict' | 'Sales';

export interface AnalysisResult {
  sentiment: string;
  dynamics: string;
  urgency: 'high' | 'medium' | 'low';
  urgencyReasoning: string;
  keyPoints: string[];
}

export interface SimulatorData {
  theirResponse: string;
  yourFollowUp: string;
  finalReaction: string;
}

export interface StrategyResponse {
  strategyType: 'recommended' | 'bold' | 'safe' | 'caution';
  replyText: string;
  predictedOutcome: string;
  riskLevel: 'low' | 'medium' | 'high';
  riskExplanation: string;
  reasoning: string;
  followUp: string;
  simulator?: SimulatorData; // Enriched after generation or part of response
}

export interface ThreadlyResponse {
  analysis: AnalysisResult;
  responses: StrategyResponse[];
  simulator: SimulatorData; // Global simulator fallback or specific
}

export interface FeedbackEntry {
  id: string;
  timestamp: string;
  scenario: ScenarioType;
  tone: number;
  responseType: string;
  outcome: 'great' | 'okay' | 'bad';
  notes?: string;
}

export interface CopiedResponse {
  id: string;
  copiedAt: string;
  responseText: string;
  scenario: ScenarioType;
  tone: number;
  feedbackGiven: boolean;
}

export interface AppState {
  history: string;
  scenario: ScenarioType;
  tone: number;
  userContext: string;
}
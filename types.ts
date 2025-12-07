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
  rating?: number; // 1-5 stars
  helpfulness?: 'very' | 'somewhat' | 'not';
  wouldUseAgain?: boolean;
}

export interface CopiedResponse {
  id: string;
  copiedAt: string;
  responseText: string;
  scenario: ScenarioType;
  tone: number;
  feedbackGiven: boolean;
}

// Error types for better error handling
export interface APIError {
  message: string;
  code?: string;
  retryable?: boolean;
}

// Constants
export const TONE_LABELS = {
  CASUAL: 'CASUAL',
  BALANCED: 'BALANCED',
  FORMAL: 'FORMAL'
} as const;

export const URGENCY_LEVELS = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
} as const;

export const RISK_LEVELS = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
} as const;

export interface AppState {
  history: string;
  scenario: ScenarioType;
  tone: number;
  userContext: string;
}
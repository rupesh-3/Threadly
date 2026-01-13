// Supabase database service for monetization tracking
import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient';
import { User, ScenarioType, FeedbackEntry } from '../types';
import { AIProvider } from './multiProviderService';

// Database table types
export interface PromptRecord {
  id?: string;
  user_id: string;
  conversation_history: string;
  scenario: ScenarioType;
  tone: number;
  user_context: string | null;
  provider: AIProvider;
  response_time_ms: number | null;
  error_occurred: boolean;
  error_message: string | null;
  created_at?: string;
}

export interface FeedbackRecord {
  id?: string;
  user_id: string;
  feedback_id: string; // Reference to local feedback entry
  scenario: ScenarioType;
  tone: number;
  response_type: string;
  outcome: 'great' | 'okay' | 'bad';
  rating: number | null;
  helpfulness: 'very' | 'somewhat' | 'not' | null;
  would_use_again: boolean | null;
  notes: string | null;
  created_at?: string;
}

export interface LoginRecord {
  id?: string;
  user_id: string;
  email: string;
  login_type: 'signup' | 'login';
  created_at?: string;
}

// Save prompt/analysis request to Supabase
export const savePromptToSupabase = async (
  userId: string,
  history: string,
  scenario: ScenarioType,
  tone: number,
  userContext: string,
  provider: AIProvider,
  responseTimeMs: number | null,
  errorInfo: { occurred: boolean; message?: string }
): Promise<void> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, skipping prompt tracking');
    return;
  }

  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    const promptRecord: PromptRecord = {
      user_id: userId,
      conversation_history: history.substring(0, 5000), // Limit length
      scenario,
      tone,
      user_context: userContext || null,
      provider,
      response_time_ms: responseTimeMs,
      error_occurred: errorInfo.occurred,
      error_message: errorInfo.message || null,
    };

    const { error } = await supabase
      .from('prompts')
      .insert([promptRecord]);

    if (error) {
      console.error('Error saving prompt to Supabase:', error);
    } else {
      console.log('✅ Prompt saved to Supabase');
    }
  } catch (error) {
    console.error('Exception saving prompt to Supabase:', error);
    // Don't throw - this is non-blocking
  }
};

// Save feedback to Supabase
export const saveFeedbackToSupabase = async (
  userId: string,
  feedback: FeedbackEntry
): Promise<void> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, skipping feedback tracking');
    return;
  }

  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    const feedbackRecord: FeedbackRecord = {
      user_id: userId,
      feedback_id: feedback.id,
      scenario: feedback.scenario,
      tone: feedback.tone,
      response_type: feedback.responseType,
      outcome: feedback.outcome,
      rating: feedback.rating || null,
      helpfulness: feedback.helpfulness || null,
      would_use_again: feedback.wouldUseAgain || null,
      notes: feedback.notes || null,
    };

    const { error } = await supabase
      .from('feedback')
      .insert([feedbackRecord]);

    if (error) {
      console.error('Error saving feedback to Supabase:', error);
    } else {
      console.log('✅ Feedback saved to Supabase');
    }
  } catch (error) {
    console.error('Exception saving feedback to Supabase:', error);
    // Don't throw - this is non-blocking
  }
};

// Track user login/signup
export const trackUserLogin = async (
  userId: string,
  email: string,
  loginType: 'signup' | 'login'
): Promise<void> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, skipping login tracking');
    return;
  }

  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    const loginRecord: LoginRecord = {
      user_id: userId,
      email,
      login_type: loginType,
    };

    const { error } = await supabase
      .from('user_logins')
      .insert([loginRecord]);

    if (error) {
      console.error('Error saving login to Supabase:', error);
    } else {
      console.log(`✅ ${loginType === 'signup' ? 'Signup' : 'Login'} tracked in Supabase`);
    }
  } catch (error) {
    console.error('Exception saving login to Supabase:', error);
    // Don't throw - this is non-blocking
  }
};

// Get user statistics from Supabase (for analytics)
export const getUserStats = async (userId: string): Promise<{
  totalPrompts: number;
  totalFeedback: number;
  averageResponseTime: number | null;
} | null> => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    // Get prompt count
    const { count: promptCount } = await supabase
      .from('prompts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Get feedback count
    const { count: feedbackCount } = await supabase
      .from('feedback')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Get average response time
    const { data: prompts } = await supabase
      .from('prompts')
      .select('response_time_ms')
      .eq('user_id', userId)
      .not('response_time_ms', 'is', null);

    const avgResponseTime = prompts && prompts.length > 0
      ? prompts.reduce((sum, p) => sum + (p.response_time_ms || 0), 0) / prompts.length
      : null;

    return {
      totalPrompts: promptCount || 0,
      totalFeedback: feedbackCount || 0,
      averageResponseTime: avgResponseTime,
    };
  } catch (error) {
    console.error('Error fetching user stats from Supabase:', error);
    return null;
  }
};


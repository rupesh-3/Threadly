# Supabase Database Setup Guide

This guide will help you set up Supabase database tables for tracking user activity, prompts, and feedback for monetization purposes.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. A Supabase project created
3. Your Supabase project URL and anon key

## Step 1: Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## Step 2: Configure Environment Variables

Create a `.env.local` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important**: Add `.env.local` to `.gitignore` to keep your keys secure!

## Step 3: Create Database Tables

Go to your Supabase project → **SQL Editor** and run the following SQL:

### Table 1: User Logins

```sql
-- Track user signups and logins
CREATE TABLE IF NOT EXISTS user_logins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  email TEXT NOT NULL,
  login_type TEXT NOT NULL CHECK (login_type IN ('signup', 'login')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_logins_user_id ON user_logins(user_id);
CREATE INDEX IF NOT EXISTS idx_user_logins_created_at ON user_logins(created_at);
```

### Table 2: Prompts (Analysis Requests)

```sql
-- Track all analysis requests/prompts
CREATE TABLE IF NOT EXISTS prompts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  conversation_history TEXT NOT NULL,
  scenario TEXT NOT NULL CHECK (scenario IN ('Professional', 'Personal', 'Romantic', 'Family', 'Conflict', 'Sales')),
  tone INTEGER NOT NULL CHECK (tone >= 0 AND tone <= 100),
  user_context TEXT,
  provider TEXT NOT NULL CHECK (provider IN ('gemini', 'huggingface')),
  response_time_ms INTEGER,
  error_occurred BOOLEAN DEFAULT FALSE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_prompts_user_id ON prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON prompts(created_at);
CREATE INDEX IF NOT EXISTS idx_prompts_provider ON prompts(provider);
CREATE INDEX IF NOT EXISTS idx_prompts_error_occurred ON prompts(error_occurred);
```

### Table 3: Feedback

```sql
-- Track user feedback on responses
CREATE TABLE IF NOT EXISTS feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  feedback_id TEXT NOT NULL, -- Reference to local feedback entry ID
  scenario TEXT NOT NULL CHECK (scenario IN ('Professional', 'Personal', 'Romantic', 'Family', 'Conflict', 'Sales')),
  tone INTEGER NOT NULL CHECK (tone >= 0 AND tone <= 100),
  response_type TEXT NOT NULL,
  outcome TEXT NOT NULL CHECK (outcome IN ('great', 'okay', 'bad')),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  helpfulness TEXT CHECK (helpfulness IN ('very', 'somewhat', 'not')),
  would_use_again BOOLEAN,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_feedback_outcome ON feedback(outcome);
```

## Step 4: Enable Row Level Security (RLS)

For security, enable RLS on all tables. In Supabase SQL Editor:

```sql
ALTER TABLE user_logins ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert on user_logins" ON user_logins
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow insert on prompts" ON prompts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow insert on feedback" ON feedback
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can read own logins" ON user_logins
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can read own prompts" ON prompts
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can read own feedback" ON feedback
  FOR SELECT USING (auth.uid()::text = user_id);
```

**Note**: The above policies allow public inserts for tracking. For production, you may want to:
- Use Supabase Auth for user authentication
- Restrict inserts to authenticated users only
- Add rate limiting

## Step 5: Verify Setup

1. Restart your dev server: `npm run dev`
2. Check browser console for Supabase connection messages
3. Try creating an account and running an analysis
4. Check your Supabase dashboard → **Table Editor** to see data appearing

## Step 6: View Your Data

### In Supabase Dashboard

1. Go to **Table Editor** to view raw data
2. Use **SQL Editor** for custom queries

### Example Queries

**Total prompts by user:**
```sql
SELECT user_id, COUNT(*) as total_prompts
FROM prompts
GROUP BY user_id
ORDER BY total_prompts DESC;
```

**Average response time by provider:**
```sql
SELECT provider, AVG(response_time_ms) as avg_response_time
FROM prompts
WHERE response_time_ms IS NOT NULL
GROUP BY provider;
```

**Feedback distribution:**
```sql
SELECT outcome, COUNT(*) as count
FROM feedback
GROUP BY outcome;
```

**Daily signups:**
```sql
SELECT DATE(created_at) as date, COUNT(*) as signups
FROM user_logins
WHERE login_type = 'signup'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

## Troubleshooting

### "Supabase credentials not configured"
- Check that `.env.local` exists and has correct values
- Restart dev server after adding environment variables
- Verify variable names start with `VITE_`

### "Error saving to Supabase"
- Check browser console for detailed error messages
- Verify tables exist in Supabase
- Check RLS policies allow inserts
- Verify your anon key has correct permissions

### Data not appearing
- Check Supabase dashboard → **Table Editor**
- Verify RLS policies allow inserts
- Check browser console for errors
- Ensure network requests are not blocked

## Security Notes

- The anon key is safe to use in client-side code (it's public)
- RLS policies protect your data
- For production, consider:
  - Using Supabase Auth for user authentication
  - Implementing rate limiting
  - Adding data validation
  - Setting up monitoring/alerts

## Next Steps

1. Set up Supabase dashboard monitoring
2. Create custom analytics queries
3. Set up alerts for important metrics
4. Consider adding more tracking fields as needed


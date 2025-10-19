-- Pulse Trades Database Schema
-- Run this in your Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  whop_user_id TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  avatar_url TEXT,
  prestige_level INTEGER DEFAULT 0,
  total_wins INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create submissions table
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  percentage_gain DECIMAL(6,2) NOT NULL,
  points INTEGER GENERATED ALWAYS AS (GREATEST(FLOOR(percentage_gain), 0)) STORED,
  proof_url TEXT,
  submission_date DATE NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_flagged BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, submission_date)
);

-- Create prestige badges table
CREATE TABLE prestige_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL CHECK (badge_type IN ('platinum', 'gold', 'silver', 'bronze')),
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  rank_achieved INTEGER NOT NULL
);

-- Create leaderboard resets table
CREATE TABLE leaderboard_resets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reset_at TIMESTAMP WITH TIME ZONE NOT NULL,
  reset_by TEXT, -- 'auto' or whop_user_id
  submissions_count INTEGER,
  average_gain DECIMAL(6,2)
);

-- Create indexes for performance
CREATE INDEX idx_submissions_date ON submissions(submission_date);
CREATE INDEX idx_submissions_user ON submissions(user_id);
CREATE INDEX idx_submissions_percentage ON submissions(percentage_gain DESC);
CREATE INDEX idx_users_whop_id ON users(whop_user_id);
CREATE INDEX idx_prestige_badges_user ON prestige_badges(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for users table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prestige_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_resets ENABLE ROW LEVEL SECURITY;

-- Users can read all users (for leaderboard)
CREATE POLICY "Users can read all users" ON users
    FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.jwt() ->> 'sub' = whop_user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' = whop_user_id);

-- Users can read all submissions (for leaderboard)
CREATE POLICY "Users can read all submissions" ON submissions
    FOR SELECT USING (true);

-- Users can insert their own submissions
CREATE POLICY "Users can insert own submissions" ON submissions
    FOR INSERT WITH CHECK (
        auth.jwt() ->> 'sub' = (
            SELECT whop_user_id FROM users WHERE id = user_id
        )
    );

-- Users can update their own submissions (within 30 minutes)
CREATE POLICY "Users can update own recent submissions" ON submissions
    FOR UPDATE USING (
        auth.jwt() ->> 'sub' = (
            SELECT whop_user_id FROM users WHERE id = user_id
        ) AND submitted_at > NOW() - INTERVAL '30 minutes'
    );

-- Admins can update any submission (flagged status)
CREATE POLICY "Admins can update submissions" ON submissions
    FOR UPDATE USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'sub' IN (
            SELECT whop_user_id FROM users WHERE id = user_id
        )
    );

-- Users can read their own prestige badges
CREATE POLICY "Users can read own prestige badges" ON prestige_badges
    FOR SELECT USING (
        auth.jwt() ->> 'sub' = (
            SELECT whop_user_id FROM users WHERE id = user_id
        )
    );

-- System can insert prestige badges
CREATE POLICY "System can insert prestige badges" ON prestige_badges
    FOR INSERT WITH CHECK (true);

-- Admins can read all leaderboard resets
CREATE POLICY "Admins can read leaderboard resets" ON leaderboard_resets
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- System can insert leaderboard resets
CREATE POLICY "System can insert leaderboard resets" ON leaderboard_resets
    FOR INSERT WITH CHECK (true);

-- Create function to get leaderboard for a specific date
CREATE OR REPLACE FUNCTION get_leaderboard(target_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
    rank BIGINT,
    user_id UUID,
    username TEXT,
    avatar_url TEXT,
    percentage_gain DECIMAL(6,2),
    points INTEGER,
    submitted_at TIMESTAMP WITH TIME ZONE,
    prestige_level INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ROW_NUMBER() OVER (ORDER BY s.percentage_gain DESC, s.submitted_at ASC) as rank,
        u.id,
        u.username,
        u.avatar_url,
        s.percentage_gain,
        s.points,
        s.submitted_at,
        u.prestige_level
    FROM submissions s
    JOIN users u ON s.user_id = u.id
    WHERE s.submission_date = target_date
    ORDER BY s.percentage_gain DESC, s.submitted_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user stats
CREATE OR REPLACE FUNCTION get_user_stats(user_whop_id TEXT)
RETURNS TABLE (
    total_submissions BIGINT,
    total_wins BIGINT,
    average_gain DECIMAL(6,2),
    best_day DECIMAL(6,2),
    worst_day DECIMAL(6,2),
    current_streak INTEGER,
    prestige_level INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(s.id) as total_submissions,
        COUNT(CASE WHEN s.percentage_gain > 0 THEN 1 END) as total_wins,
        COALESCE(AVG(s.percentage_gain), 0) as average_gain,
        COALESCE(MAX(s.percentage_gain), 0) as best_day,
        COALESCE(MIN(s.percentage_gain), 0) as worst_day,
        u.prestige_level as current_streak,
        u.prestige_level
    FROM users u
    LEFT JOIN submissions s ON u.id = s.user_id
    WHERE u.whop_user_id = user_whop_id
    GROUP BY u.id, u.prestige_level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to award prestige badges
CREATE OR REPLACE FUNCTION award_prestige_badge()
RETURNS TRIGGER AS $$
DECLARE
    user_rank INTEGER;
    badge_type TEXT;
BEGIN
    -- Get the rank of the user who just submitted
    SELECT rank INTO user_rank
    FROM get_leaderboard(NEW.submission_date)
    WHERE user_id = NEW.user_id;
    
    -- Award badge based on rank
    IF user_rank = 1 THEN
        badge_type := 'platinum';
    ELSIF user_rank = 2 THEN
        badge_type := 'gold';
    ELSIF user_rank = 3 THEN
        badge_type := 'silver';
    ELSIF user_rank <= 10 THEN
        badge_type := 'bronze';
    END IF;
    
    -- Insert badge if user achieved a rank that deserves one
    IF badge_type IS NOT NULL THEN
        INSERT INTO prestige_badges (user_id, badge_type, rank_achieved)
        VALUES (NEW.user_id, badge_type, user_rank)
        ON CONFLICT DO NOTHING;
        
        -- Update user's prestige level and total wins
        UPDATE users 
        SET 
            prestige_level = prestige_level + 1,
            total_wins = total_wins + 1,
            updated_at = NOW()
        WHERE id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to award prestige badges
CREATE TRIGGER award_prestige_badge_trigger
    AFTER INSERT ON submissions
    FOR EACH ROW
    EXECUTE FUNCTION award_prestige_badge();

-- Insert sample data for testing (optional)
-- INSERT INTO users (whop_user_id, username, avatar_url) VALUES
-- ('user1', 'trader_mike', 'https://example.com/avatar1.jpg'),
-- ('user2', 'crypto_king', 'https://example.com/avatar2.jpg'),
-- ('user3', 'stock_master', 'https://example.com/avatar3.jpg');

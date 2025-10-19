-- Pulse Trades Database Schema - Migration Only
-- Run this in your Supabase SQL editor to add new columns to existing tables

-- Add new columns to existing submissions table
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS community_id TEXT;

-- Add new column to existing prestige_badges table
ALTER TABLE prestige_badges 
ADD COLUMN IF NOT EXISTS community_id TEXT;

-- Add new columns to existing leaderboard_resets table
ALTER TABLE leaderboard_resets 
ADD COLUMN IF NOT EXISTS community_id TEXT,
ADD COLUMN IF NOT EXISTS reset_type TEXT DEFAULT 'community';

-- Add constraint for reset_type
ALTER TABLE leaderboard_resets 
ADD CONSTRAINT IF NOT EXISTS check_reset_type 
CHECK (reset_type IN ('global', 'community'));

-- Create new indexes for performance
CREATE INDEX IF NOT EXISTS idx_submissions_community ON submissions(community_id);
CREATE INDEX IF NOT EXISTS idx_submissions_verified ON submissions(is_verified);
CREATE INDEX IF NOT EXISTS idx_prestige_badges_community ON prestige_badges(community_id);

-- Update the unique constraint on submissions to include community_id
-- First drop the existing constraint if it exists
ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_user_id_submission_date_key;

-- Add new unique constraint
ALTER TABLE submissions 
ADD CONSTRAINT submissions_user_community_date_unique 
UNIQUE(user_id, submission_date, community_id);

-- Create new functions for community and global leaderboards
CREATE OR REPLACE FUNCTION get_community_leaderboard(target_date DATE DEFAULT CURRENT_DATE, target_community_id TEXT DEFAULT NULL)
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
    AND s.is_verified = true
    AND (target_community_id IS NULL OR s.community_id = target_community_id)
    ORDER BY s.percentage_gain DESC, s.submitted_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get global leaderboard (all verified submissions)
CREATE OR REPLACE FUNCTION get_global_leaderboard(target_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
    rank BIGINT,
    user_id UUID,
    username TEXT,
    avatar_url TEXT,
    percentage_gain DECIMAL(6,2),
    points INTEGER,
    submitted_at TIMESTAMP WITH TIME ZONE,
    prestige_level INTEGER,
    community_id TEXT
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
        u.prestige_level,
        s.community_id
    FROM submissions s
    JOIN users u ON s.user_id = u.id
    WHERE s.submission_date = target_date
    AND s.is_verified = true
    ORDER BY s.percentage_gain DESC, s.submitted_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to reset community leaderboard
CREATE OR REPLACE FUNCTION reset_community_leaderboard(community_id_param TEXT, reset_by_user TEXT)
RETURNS JSON AS $$
DECLARE
    deleted_count INTEGER;
    avg_gain DECIMAL(6,2);
    result JSON;
BEGIN
    -- Get stats before deletion
    SELECT 
        COUNT(*),
        COALESCE(AVG(percentage_gain), 0)
    INTO deleted_count, avg_gain
    FROM submissions 
    WHERE community_id = community_id_param;
    
    -- Delete all submissions for the community
    DELETE FROM submissions WHERE community_id = community_id_param;
    
    -- Record the reset
    INSERT INTO leaderboard_resets (reset_at, reset_by, submissions_count, average_gain, community_id, reset_type)
    VALUES (NOW(), reset_by_user, deleted_count, avg_gain, community_id_param, 'community');
    
    -- Return result
    result := json_build_object(
        'success', true,
        'deleted_count', deleted_count,
        'average_gain', avg_gain,
        'community_id', community_id_param
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to reset global leaderboard
CREATE OR REPLACE FUNCTION reset_global_leaderboard(reset_by_user TEXT)
RETURNS JSON AS $$
DECLARE
    deleted_count INTEGER;
    avg_gain DECIMAL(6,2);
    result JSON;
BEGIN
    -- Get stats before deletion
    SELECT 
        COUNT(*),
        COALESCE(AVG(percentage_gain), 0)
    INTO deleted_count, avg_gain
    FROM submissions;
    
    -- Delete all submissions
    DELETE FROM submissions;
    
    -- Record the reset
    INSERT INTO leaderboard_resets (reset_at, reset_by, submissions_count, average_gain, community_id, reset_type)
    VALUES (NOW(), reset_by_user, deleted_count, avg_gain, NULL, 'global');
    
    -- Return result
    result := json_build_object(
        'success', true,
        'deleted_count', deleted_count,
        'average_gain', avg_gain,
        'reset_type', 'global'
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the existing get_user_stats function to support community filtering
CREATE OR REPLACE FUNCTION get_user_stats(user_whop_id TEXT, community_id TEXT DEFAULT NULL)
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
    AND (community_id IS NULL OR s.community_id = community_id)
    GROUP BY u.id, u.prestige_level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the award_prestige_badge function for community support
CREATE OR REPLACE FUNCTION award_prestige_badge()
RETURNS TRIGGER AS $$
DECLARE
    user_rank INTEGER;
    badge_type TEXT;
BEGIN
    -- Get the rank of the user who just submitted (community-specific)
    SELECT rank INTO user_rank
    FROM get_community_leaderboard(NEW.submission_date, NEW.community_id)
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
        INSERT INTO prestige_badges (user_id, badge_type, rank_achieved, community_id)
        VALUES (NEW.user_id, badge_type, user_rank, NEW.community_id)
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

-- Add new RLS policies for admin delete functionality
CREATE POLICY "Admins can delete submissions" ON submissions
    FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

-- Add user_subscriptions table to track Whop memberships
-- Run this in your Supabase SQL editor

CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  whop_membership_id TEXT UNIQUE,
  plan_type TEXT DEFAULT 'community',
  status TEXT DEFAULT 'active', -- active, cancelled, expired
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_whop_membership_id ON user_subscriptions(whop_membership_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_expires_at ON user_subscriptions(expires_at);

-- Create updated_at trigger for user_subscriptions
CREATE TRIGGER update_user_subscriptions_updated_at 
  BEFORE UPDATE ON user_subscriptions 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can read their own subscription
CREATE POLICY "Users can read own subscription" ON user_subscriptions 
  FOR SELECT USING (
    auth.jwt() ->> 'sub' = (
      SELECT whop_user_id FROM users WHERE id = user_id
    )
  );

-- System can insert/update subscriptions (for webhooks)
CREATE POLICY "System can manage subscriptions" ON user_subscriptions 
  FOR ALL USING (true);

-- Create function to check if user has active subscription
CREATE OR REPLACE FUNCTION has_active_subscription(user_whop_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_subscriptions us
    JOIN users u ON us.user_id = u.id
    WHERE u.whop_user_id = user_whop_id
    AND us.status = 'active'
    AND (us.expires_at IS NULL OR us.expires_at > NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user subscription details
CREATE OR REPLACE FUNCTION get_user_subscription(user_whop_id TEXT)
RETURNS TABLE (
  plan_type TEXT,
  status TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    us.plan_type,
    us.status,
    us.expires_at,
    (us.status = 'active' AND (us.expires_at IS NULL OR us.expires_at > NOW())) as is_active
  FROM user_subscriptions us
  JOIN users u ON us.user_id = u.id
  WHERE u.whop_user_id = user_whop_id
  ORDER BY us.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

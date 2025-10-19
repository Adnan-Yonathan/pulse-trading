# Production Setup Guide

## Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://duknzetwbtryvdfmstut.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1a256ZXR3YnRyeXZkZm1zdHV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MTYyOTMsImV4cCI6MjA3NjM5MjI5M30.54d6MqfFn1uzp9uXURqZBBISxx10GWS1r6WQ0L-WAIE
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1a256ZXR3YnRyeXZkZm1zdHV0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDgxNjI5MywiZXhwIjoyMDc2MzkyMjkzfQ.AA85BoUQMgWcCApHGksBc6WezF7wihf8Zm83nx-_hag

# Whop OAuth Configuration
NEXT_PUBLIC_WHOP_CLIENT_ID=app_nIu8Raqnf6MzlO
WHOP_CLIENT_SECRET=Y3oP6zkMbPiTBjo7jqV8a9vuMfGxXpEJBCm_rV7_XE8
NEXT_PUBLIC_APP_URL=https://pulse-trading.vercel.app

# Whop App Configuration
NEXT_PUBLIC_WHOP_APP_ID=app_nIu8Raqnf6MzlO
WHOP_API_KEY=Y3oP6zkMbPiTBjo7jqV8a9vuMfGxXpEJBCm_rV7_XE8
NEXT_PUBLIC_WHOP_COMPANY_ID=biz_pGTqes9CAHH9yk
NEXT_PUBLIC_WHOP_AGENT_USER_ID=user_ETlvBVq2uG9Cs
WHOP_WEBHOOK_SECRET=ws_5e218e74db9a499959b33bf957ffe75652084d862977e20a4546fc11c9b2b5fa
```

## Whop OAuth Configuration

Your Whop OAuth application is already configured with:
- **Redirect URI**: `https://pulse-trading.vercel.app/api/auth/callback/whop`
- **Client ID**: `app_nIu8Raqnf6MzlO`

## Database Setup

1. Run the SQL schema in your Supabase SQL editor (see `supabase-schema.sql`)
2. Ensure all tables and functions are created
3. Test the database connection

## Deployment Checklist

- [ ] Environment variables set in Vercel
- [ ] Database schema applied
- [ ] OAuth redirect URI matches production URL
- [ ] All API routes are accessible
- [ ] Authentication flow works end-to-end

## Testing

1. Visit `https://pulse-trading.vercel.app`
2. Click "Login with Whop"
3. Complete OAuth flow
4. Verify user data syncs to database
5. Test leaderboard functionality
6. Test admin panel (if applicable)

## API Endpoints

- **OAuth Callback**: `/api/auth/callback/whop`
- **Logout**: `/api/auth/callback/whop/logout`
- **Token Refresh**: `/api/auth/callback/whop/refresh`
- **Leaderboard**: `/api/leaderboard`
- **Submit Performance**: `/api/submit`

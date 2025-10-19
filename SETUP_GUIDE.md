# Pulse Trades Setup Guide

## 🚀 Quick Setup Instructions

### 1. Environment Variables Setup

Create a `.env.local` file in your project root with the following content:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://duknzetwbtryvdfmstut.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1a256ZXR3YnRyeXZkZm1zdHV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MTYyOTMsImV4cCI6MjA3NjM5MjI5M30.54d6MqfFn1uzp9uXURqZBBISxx10GWS1r6WQ0L-WAIE
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1a256ZXR3YnRyeXZkZm1zdHV0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDgxNjI5MywiZXhwIjoyMDc2MzkyMjkzfQ.AA85BoUQMgWcCApHGksBc6WezF7wihf8Zm83nx-_hag

# Whop Configuration (Add your Whop credentials here)
NEXT_PUBLIC_WHOP_APP_ID=your_whop_app_id_here
WHOP_API_KEY=your_whop_api_key_here
NEXT_PUBLIC_WHOP_AGENT_USER_ID=your_agent_user_id_here
NEXT_PUBLIC_WHOP_COMPANY_ID=your_company_id_here

# Stock API (Optional - for real stock data)
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key_here
FINNHUB_API_KEY=your_finnhub_api_key_here
```

### 2. Database Setup

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/duknzetwbtryvdfmstut
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase-schema.sql`
4. Execute the SQL to create all tables, functions, and policies

### 3. Test the Application

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### 4. Deploy to Production

The application is ready for deployment to:
- **Vercel** (Recommended)
- **Netlify**
- **Railway**
- **DigitalOcean App Platform**

## 📊 Database Schema

Your Supabase project will have these tables:
- `users` - User profiles and prestige levels
- `submissions` - Daily trading performance submissions
- `prestige_badges` - Achievement badges earned by users
- `leaderboard_resets` - Track when leaderboards are reset

## 🔧 Features Ready to Use

✅ **Real-time Leaderboard** - Live updates via Supabase
✅ **Personal Dashboard** - User statistics and charts
✅ **Admin Panel** - Community management tools
✅ **Prestige System** - Badge rewards and achievements
✅ **Stock Ticker** - Real-time stock price display
✅ **Mobile-First Design** - Optimized for trading communities

## 🎯 Next Steps

1. **Set up Whop App** - Create your Whop app and get credentials
2. **Configure Database** - Run the SQL schema in Supabase
3. **Deploy Application** - Deploy to your preferred platform
4. **Test Features** - Verify all functionality works correctly
5. **Launch Community** - Start using with your trading communities!

## 📞 Support

If you need help with setup or deployment, refer to the comprehensive documentation in:
- `DEPLOYMENT.md` - Detailed deployment instructions
- `IMPLEMENTATION_SUMMARY.md` - Complete feature overview
- `README.md` - Project overview and setup

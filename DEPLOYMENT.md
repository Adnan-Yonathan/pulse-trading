# Pulse Trades Deployment Guide

## Prerequisites

1. **Whop App Setup**
   - Create a new app in your [Whop Developer Dashboard](https://whop.com/dashboard/developer/)
   - Note down your App ID, API Key, Agent User ID, and Company ID

2. **Supabase Setup**
   - Create a new project at [Supabase](https://supabase.com)
   - Run the SQL schema from `supabase-schema.sql` in your Supabase SQL editor
   - Get your project URL and anon key from Settings > API

3. **Stock API (Optional)**
   - Sign up for [Alpha Vantage](https://www.alphavantage.co/support/#api-key) or [Finnhub](https://finnhub.io/register)
   - Get your API key for real stock data

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Whop Configuration
NEXT_PUBLIC_WHOP_APP_ID=your_whop_app_id_here
WHOP_API_KEY=your_whop_api_key_here
NEXT_PUBLIC_WHOP_AGENT_USER_ID=your_agent_user_id_here
NEXT_PUBLIC_WHOP_COMPANY_ID=your_company_id_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Stock API (Optional)
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key_here
FINNHUB_API_KEY=your_finnhub_api_key_here
```

## Database Setup

1. **Run the Schema**
   - Open your Supabase project dashboard
   - Go to SQL Editor
   - Copy and paste the contents of `supabase-schema.sql`
   - Execute the SQL to create all tables, functions, and policies

2. **Verify Setup**
   - Check that all tables are created: `users`, `submissions`, `prestige_badges`, `leaderboard_resets`
   - Verify RLS policies are enabled
   - Test the database functions

## Local Development

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Start Development Server**
   ```bash
   pnpm dev
   ```

3. **Test the App**
   - Open [http://localhost:3000](http://localhost:3000)
   - Verify the stock ticker loads
   - Test the submission modal
   - Check that the leaderboard displays correctly

## Deployment Options

### Vercel (Recommended)

1. **Connect Repository**
   - Push your code to GitHub
   - Connect your repository to [Vercel](https://vercel.com/new)

2. **Configure Environment Variables**
   - Add all environment variables in Vercel dashboard
   - Set production values (not localhost URLs)

3. **Deploy**
   - Vercel will automatically deploy on push to main branch
   - Update your Whop app settings with the production URL

### Other Platforms

**Netlify**
- Connect GitHub repository
- Set build command: `pnpm build`
- Set publish directory: `.next`
- Add environment variables

**Railway**
- Connect GitHub repository
- Add environment variables
- Deploy automatically

**DigitalOcean App Platform**
- Connect GitHub repository
- Configure build settings
- Add environment variables

## Post-Deployment

1. **Update Whop App Settings**
   - Set Base URL to your production domain
   - Update webhook URLs if needed
   - Test app installation in a Whop community

2. **Test Production Features**
   - Verify database connections
   - Test submission flow
   - Check real-time updates
   - Verify admin panel access

3. **Monitor Performance**
   - Set up error monitoring (Sentry recommended)
   - Monitor database performance
   - Track user engagement metrics

## Troubleshooting

**Common Issues:**

1. **Database Connection Errors**
   - Verify Supabase URL and keys
   - Check RLS policies
   - Ensure tables exist

2. **Whop Authentication Issues**
   - Verify all Whop environment variables
   - Check app installation in Whop
   - Ensure proper user permissions

3. **Stock API Errors**
   - Check API key validity
   - Verify rate limits
   - Fallback to mock data if needed

4. **Build Errors**
   - Check TypeScript errors
   - Verify all dependencies installed
   - Check environment variable names

## Security Considerations

1. **Environment Variables**
   - Never commit `.env.local` to version control
   - Use different keys for development/production
   - Rotate API keys regularly

2. **Database Security**
   - Enable RLS policies
   - Use service role key only on server
   - Monitor database access logs

3. **API Security**
   - Implement rate limiting
   - Validate all inputs
   - Use HTTPS in production

## Maintenance

1. **Regular Updates**
   - Keep dependencies updated
   - Monitor security advisories
   - Update API keys as needed

2. **Performance Monitoring**
   - Monitor database query performance
   - Track API response times
   - Optimize images and assets

3. **User Support**
   - Monitor error logs
   - Respond to user feedback
   - Update documentation as needed

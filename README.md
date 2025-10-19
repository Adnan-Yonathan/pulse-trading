# Pulse Trades

A gamified trading performance leaderboard app for Whop communities, featuring a Robinhood-inspired design aesthetic.

## Features

- **Daily Leaderboard**: Rank members by their daily percentage gains
- **Stock Ticker**: Real-time stock price display
- **Prestige System**: Badge rewards for top performers
- **Proof Upload**: Optional screenshot verification
- **Admin Panel**: Community management and submission review
- **Real-time Updates**: Live leaderboard updates
- **Mobile-First Design**: Optimized for mobile trading communities

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS with custom Robinhood theme
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Database**: Supabase PostgreSQL
- **Authentication**: Whop SDK
- **Icons**: Lucide React

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the project root:

```env
# Whop Configuration
NEXT_PUBLIC_WHOP_APP_ID=your_whop_app_id
WHOP_API_KEY=your_whop_api_key
NEXT_PUBLIC_WHOP_AGENT_USER_ID=your_agent_user_id
NEXT_PUBLIC_WHOP_COMPANY_ID=your_company_id

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stock API (Optional)
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
```

### 2. Database Setup

1. Create a new Supabase project
2. Run the SQL schema from `supabase-schema.sql` in your Supabase SQL editor
3. Enable Row Level Security (RLS) policies as defined in the schema

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Database Schema

The app uses the following main tables:

- **users**: User profiles and prestige levels
- **submissions**: Daily trading performance submissions
- **prestige_badges**: Achievement badges earned by users
- **leaderboard_resets**: Track when leaderboards are reset

## API Endpoints

- `GET /api/leaderboard` - Get current leaderboard
- `POST /api/submit` - Submit trading performance
- `GET /api/stocks/ticker` - Get stock ticker data
- `GET /api/user/dashboard` - Get user statistics
- `POST /api/admin/reset` - Reset leaderboard (admin only)

## Design System

The app uses a custom Robinhood-inspired design system:

- **Colors**: Pure black background, Robinhood green/red for gains/losses
- **Typography**: SF Pro Display font family
- **Components**: Rounded corners, subtle shadows, smooth animations
- **Layout**: Mobile-first responsive design

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please contact the development team or create an issue in the repository.
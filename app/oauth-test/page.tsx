'use client';

import { useState } from 'react';
import WhopLoginButton from '@/components/WhopLoginButton';

export default function OAuthTestPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const checkEnvironment = () => {
    const info = {
      clientId: process.env.NEXT_PUBLIC_WHOP_CLIENT_ID,
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
      hasClientId: !!process.env.NEXT_PUBLIC_WHOP_CLIENT_ID,
      redirectUri: `${window.location.origin}/api/auth/whop/callback`,
    };
    setDebugInfo(info);
    console.log('Environment Debug:', info);
  };

  const testOAuthUrl = () => {
    const clientId = process.env.NEXT_PUBLIC_WHOP_CLIENT_ID;
    const redirectUri = `${window.location.origin}/api/auth/whop/callback`;
    
    const whopAuthUrl = new URL('https://api.whop.com/v5/oauth/authorize');
    whopAuthUrl.searchParams.set('client_id', clientId || '');
    whopAuthUrl.searchParams.set('redirect_uri', redirectUri);
    whopAuthUrl.searchParams.set('response_type', 'code');
    whopAuthUrl.searchParams.set('scope', 'read:user');
    whopAuthUrl.searchParams.set('state', 'pulse-trades-auth');
    
    const finalUrl = whopAuthUrl.toString();
    console.log('Generated OAuth URL:', finalUrl);
    
    // Open in new tab for testing
    window.open(finalUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-robinhood-black p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-robinhood-text-primary mb-8">
          OAuth Test Page
        </h1>
        
        <div className="space-y-6">
          {/* Environment Check */}
          <div className="bg-robinhood-card-bg border border-robinhood-border rounded-robinhood p-6">
            <h2 className="text-xl font-semibold text-robinhood-text-primary mb-4">
              Environment Variables
            </h2>
            <button
              onClick={checkEnvironment}
              className="bg-robinhood-green text-robinhood-black px-4 py-2 rounded-robinhood font-semibold mb-4"
            >
              Check Environment
            </button>
            
            {debugInfo && (
              <div className="bg-robinhood-black border border-robinhood-border rounded p-4">
                <pre className="text-robinhood-text-secondary text-sm">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* OAuth URL Test */}
          <div className="bg-robinhood-card-bg border border-robinhood-border rounded-robinhood p-6">
            <h2 className="text-xl font-semibold text-robinhood-text-primary mb-4">
              OAuth URL Test
            </h2>
            <button
              onClick={testOAuthUrl}
              className="bg-robinhood-green text-robinhood-black px-4 py-2 rounded-robinhood font-semibold mb-4"
            >
              Test OAuth URL (Opens in New Tab)
            </button>
            <p className="text-robinhood-text-secondary text-sm">
              This will open the OAuth URL in a new tab so you can see what happens.
            </p>
          </div>

          {/* Login Button Test */}
          <div className="bg-robinhood-card-bg border border-robinhood-border rounded-robinhood p-6">
            <h2 className="text-xl font-semibold text-robinhood-text-primary mb-4">
              Login Button Test
            </h2>
            <WhopLoginButton
              onLogin={() => console.log('Login clicked')}
              variant="primary"
              size="lg"
            />
          </div>

          {/* Instructions */}
          <div className="bg-robinhood-card-bg border border-robinhood-border rounded-robinhood p-6">
            <h2 className="text-xl font-semibold text-robinhood-text-primary mb-4">
              Setup Instructions
            </h2>
            <div className="text-robinhood-text-secondary space-y-2">
              <p>1. Go to <a href="https://whop.com/developers" target="_blank" rel="noopener noreferrer" className="text-robinhood-green hover:underline">Whop Developer Dashboard</a></p>
              <p>2. Create a new OAuth Application</p>
              <p>3. Set Redirect URI to: <code className="bg-robinhood-black px-2 py-1 rounded text-robinhood-green">http://localhost:3000/api/auth/whop/callback</code></p>
              <p>4. Copy Client ID and Client Secret</p>
              <p>5. Add to your .env.local file:</p>
              <pre className="bg-robinhood-black p-3 rounded text-sm mt-2">
{`NEXT_PUBLIC_WHOP_CLIENT_ID=your_client_id_here
WHOP_CLIENT_SECRET=your_client_secret_here
NEXT_PUBLIC_APP_URL=http://localhost:3000`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

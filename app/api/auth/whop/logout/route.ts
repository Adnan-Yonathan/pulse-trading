import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    // Get the access token to revoke it
    const accessToken = cookieStore.get('whop_access_token')?.value;
    
    if (accessToken) {
      try {
        // Revoke the token with Whop
        await fetch('https://api.whop.com/v5/oauth/revoke', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: accessToken,
            client_id: process.env.NEXT_PUBLIC_WHOP_CLIENT_ID,
            client_secret: process.env.WHOP_CLIENT_SECRET,
          }),
        });
      } catch (error) {
        console.warn('Failed to revoke token with Whop:', error);
      }
    }

    // Clear all cookies
    cookieStore.delete('whop_access_token');
    cookieStore.delete('whop_refresh_token');
    cookieStore.delete('whop_user_data');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}

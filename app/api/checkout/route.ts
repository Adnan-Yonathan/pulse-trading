import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userId, plan } = await request.json();

    if (!userId || !plan) {
      return NextResponse.json(
        { error: 'User ID and plan are required' },
        { status: 400 }
      );
    }

    // Get the Whop product ID from environment variables
    const productId = process.env.NEXT_PUBLIC_WHOP_PRODUCT_ID;
    
    if (!productId) {
      return NextResponse.json(
        { error: 'Whop product ID not configured' },
        { status: 500 }
      );
    }

    // Build Whop checkout URL
    // Using Whop's standard checkout flow
    const baseUrl = 'https://whop.com/checkout';
    const checkoutUrl = new URL(baseUrl);
    
    // Add required parameters
    checkoutUrl.searchParams.set('plan', productId);
    checkoutUrl.searchParams.set('user_id', userId);
    checkoutUrl.searchParams.set('success_url', `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/subscription/success`);
    checkoutUrl.searchParams.set('cancel_url', `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/subscription/cancel`);
    
    // Add metadata for tracking
    checkoutUrl.searchParams.set('metadata', JSON.stringify({
      app: 'pulse-trades',
      plan: plan,
      userId: userId
    }));

    return NextResponse.json({ 
      checkoutUrl: checkoutUrl.toString(),
      productId: productId
    });

  } catch (error) {
    console.error('Checkout API error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

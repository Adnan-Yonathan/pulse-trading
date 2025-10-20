import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Query the user_subscriptions table to get subscription status
    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .select(`
        plan_type,
        status,
        expires_at,
        created_at,
        updated_at
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch subscription status' },
        { status: 500 }
      );
    }

    // If no subscription found, return free plan
    if (!subscription) {
      return NextResponse.json({
        isSubscribed: false,
        plan: 'free',
        expiresAt: null,
        status: 'free'
      });
    }

    // Check if subscription is active
    const isExpired = subscription.expires_at && new Date(subscription.expires_at) < new Date();
    const isActive = subscription.status === 'active' && !isExpired;

    return NextResponse.json({
      isSubscribed: isActive,
      plan: isActive ? subscription.plan_type : 'free',
      expiresAt: subscription.expires_at,
      status: subscription.status,
      createdAt: subscription.created_at,
      updatedAt: subscription.updated_at
    });

  } catch (error) {
    console.error('Subscription API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const body = await request.json();
    const { whopMembershipId, planType, status, expiresAt } = body;

    if (!userId || !whopMembershipId) {
      return NextResponse.json(
        { error: 'User ID and Whop membership ID are required' },
        { status: 400 }
      );
    }

    // Upsert subscription record
    const { data, error } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: userId,
        whop_membership_id: whopMembershipId,
        plan_type: planType || 'community',
        status: status || 'active',
        expires_at: expiresAt || null,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'whop_membership_id'
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update subscription' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      subscription: data 
    });

  } catch (error) {
    console.error('Subscription update API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

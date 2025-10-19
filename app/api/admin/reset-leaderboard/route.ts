import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { resetType, communityId, resetBy } = await request.json();

    // Validate input
    if (!resetType || !['community', 'global'].includes(resetType)) {
      return NextResponse.json(
        { error: 'Invalid reset type. Must be "community" or "global"' },
        { status: 400 }
      );
    }

    if (resetType === 'community' && !communityId) {
      return NextResponse.json(
        { error: 'Community ID is required for community reset' },
        { status: 400 }
      );
    }

    // TODO: Add admin authentication check here
    // For now, we'll allow the reset (in production, verify the user is an admin)

    let result;
    
    if (resetType === 'community') {
      // Reset community leaderboard
      const { data, error } = await supabase.rpc('reset_community_leaderboard', {
        community_id_param: communityId,
        reset_by_user: resetBy || 'admin'
      });

      if (error) {
        console.error('Error resetting community leaderboard:', error);
        return NextResponse.json(
          { error: 'Failed to reset community leaderboard' },
          { status: 500 }
        );
      }

      result = data;
    } else {
      // Reset global leaderboard
      const { data, error } = await supabase.rpc('reset_global_leaderboard', {
        reset_by_user: resetBy || 'admin'
      });

      if (error) {
        console.error('Error resetting global leaderboard:', error);
        return NextResponse.json(
          { error: 'Failed to reset global leaderboard' },
          { status: 500 }
        );
      }

      result = data;
    }

    return NextResponse.json({
      success: true,
      message: `${resetType} leaderboard reset successfully`,
      data: result
    });

  } catch (error) {
    console.error('Error in reset leaderboard API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

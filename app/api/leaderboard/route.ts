import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    // Get leaderboard for the specified date
    const { data, error } = await supabase
      .from('submissions')
      .select(`
        *,
        user:users(*)
      `)
      .eq('submission_date', date)
      .order('percentage_gain', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
    }

    // Add rank to each submission
    const leaderboard = data?.map((submission, index) => ({
      ...submission,
      rank: index + 1,
    })) || [];

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

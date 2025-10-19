import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get user data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user:', userError);
      return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
    }

    // Get user's submissions
    const { data: submissions, error: submissionsError } = await supabase
      .from('submissions')
      .select('*')
      .eq('user_id', userId)
      .order('submission_date', { ascending: false })
      .limit(30);

    if (submissionsError) {
      console.error('Error fetching submissions:', submissionsError);
      return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
    }

    // Get user's badges
    const { data: badges, error: badgesError } = await supabase
      .from('prestige_badges')
      .select('*')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (badgesError) {
      console.error('Error fetching badges:', badgesError);
      return NextResponse.json({ error: 'Failed to fetch badges' }, { status: 500 });
    }

    // Calculate stats
    const totalSubmissions = submissions?.length || 0;
    const totalWins = submissions?.filter(s => s.percentage_gain > 0).length || 0;
    const averageGain = totalSubmissions > 0 
      ? submissions!.reduce((sum, s) => sum + s.percentage_gain, 0) / totalSubmissions 
      : 0;
    const bestDay = submissions?.length > 0 
      ? Math.max(...submissions!.map(s => s.percentage_gain)) 
      : 0;
    const worstDay = submissions?.length > 0 
      ? Math.min(...submissions!.map(s => s.percentage_gain)) 
      : 0;
    const winRate = totalSubmissions > 0 ? (totalWins / totalSubmissions) * 100 : 0;

    // Calculate current streak
    let currentStreak = 0;
    const sortedSubmissions = [...(submissions || [])].sort((a, b) => 
      new Date(b.submission_date).getTime() - new Date(a.submission_date).getTime()
    );
    
    for (const submission of sortedSubmissions) {
      if (submission.percentage_gain > 0) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate consistency score
    const variance = totalSubmissions > 0 
      ? submissions!.reduce((sum, s) => sum + Math.pow(s.percentage_gain - averageGain, 2), 0) / totalSubmissions 
      : 0;
    const consistencyScore = Math.max(0, 100 - Math.sqrt(variance) * 10);

    const stats = {
      totalSubmissions,
      totalWins,
      averageGain,
      bestDay,
      worstDay,
      currentStreak,
      winRate,
      consistencyScore,
    };

    return NextResponse.json({
      user,
      submissions: submissions || [],
      badges: badges || [],
      stats,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, date } = body;

    // TODO: Add admin authentication check here
    // const isAdmin = await checkAdminPermissions(request);
    // if (!isAdmin) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const targetDate = date || new Date().toISOString().split('T')[0];

    if (type === 'manual') {
      // Get current day's submissions for stats
      const { data: submissions, error: fetchError } = await supabase
        .from('submissions')
        .select('*')
        .eq('submission_date', targetDate);

      if (fetchError) {
        console.error('Error fetching submissions:', fetchError);
        return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
      }

      const submissionsCount = submissions?.length || 0;
      const averageGain = submissionsCount > 0 
        ? submissions!.reduce((sum, s) => sum + s.percentage_gain, 0) / submissionsCount 
        : 0;

      // Record the reset
      const { error: resetError } = await supabase
        .from('leaderboard_resets')
        .insert({
          reset_at: new Date().toISOString(),
          reset_by: 'manual', // TODO: Replace with actual admin user ID
          submissions_count: submissionsCount,
          average_gain: averageGain,
        });

      if (resetError) {
        console.error('Error recording reset:', resetError);
        return NextResponse.json({ error: 'Failed to record reset' }, { status: 500 });
      }

      // Delete all submissions for the target date
      const { error: deleteError } = await supabase
        .from('submissions')
        .delete()
        .eq('submission_date', targetDate);

      if (deleteError) {
        console.error('Error deleting submissions:', deleteError);
        return NextResponse.json({ error: 'Failed to reset leaderboard' }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Leaderboard reset successfully',
        stats: {
          submissionsCount,
          averageGain,
          resetDate: targetDate,
        }
      });
    }

    if (type === 'scheduled') {
      // TODO: Implement scheduled reset logic
      // This would typically be handled by a cron job or scheduled function
      return NextResponse.json({ 
        success: true, 
        message: 'Scheduled reset configured' 
      });
    }

    return NextResponse.json({ error: 'Invalid reset type' }, { status: 400 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

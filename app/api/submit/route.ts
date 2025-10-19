import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { percentage_gain, user_id } = body;

    // Validate input
    if (typeof percentage_gain !== 'number' || percentage_gain < -100 || percentage_gain > 1000) {
      return NextResponse.json(
        { error: 'Percentage must be between -100 and 1000' },
        { status: 400 }
      );
    }

    if (!user_id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const today = new Date().toISOString().split('T')[0];

    // Check if user already submitted today
    const { data: existingSubmission } = await supabase
      .from('submissions')
      .select('id, submitted_at')
      .eq('user_id', user_id)
      .eq('submission_date', today)
      .single();

    if (existingSubmission) {
      // Check if submission is within 30 minutes (editable window)
      const submissionTime = new Date(existingSubmission.submitted_at);
      const now = new Date();
      const timeDiff = now.getTime() - submissionTime.getTime();
      const thirtyMinutes = 30 * 60 * 1000;

      if (timeDiff > thirtyMinutes) {
        return NextResponse.json(
          { error: 'Submission window has closed. You can only edit within 30 minutes.' },
          { status: 400 }
        );
      }

      // Update existing submission
      const { data, error } = await supabase
        .from('submissions')
        .update({
          percentage_gain,
          submitted_at: new Date().toISOString(),
        })
        .eq('id', existingSubmission.id)
        .select(`
          *,
          user:users(*)
        `)
        .single();

      if (error) {
        console.error('Update error:', error);
        return NextResponse.json({ error: 'Failed to update submission' }, { status: 500 });
      }

      return NextResponse.json({ submission: data, isUpdate: true });
    }

    // Create new submission
    const { data, error } = await supabase
      .from('submissions')
      .insert({
        user_id,
        percentage_gain,
        submission_date: today,
      })
      .select(`
        *,
        user:users(*)
      `)
      .single();

    if (error) {
      console.error('Insert error:', error);
      return NextResponse.json({ error: 'Failed to create submission' }, { status: 500 });
    }

    return NextResponse.json({ submission: data, isUpdate: false });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

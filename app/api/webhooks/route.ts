import { waitUntil } from "@vercel/functions";
import { makeWebhookValidator } from "@whop/api";
import type { NextRequest } from "next/server";

const validateWebhook = makeWebhookValidator({
	webhookSecret: process.env.WHOP_WEBHOOK_SECRET ?? "fallback",
});

export async function POST(request: NextRequest): Promise<Response> {
	// Validate the webhook to ensure it's from Whop
	const webhookData = await validateWebhook(request);

	// Handle the webhook event
	if (webhookData.action === "payment.succeeded") {
		const { id, final_amount, amount_after_fees, currency, user_id } =
			webhookData.data;

		// final_amount is the amount the user paid
		// amount_after_fees is the amount that is received by you, after card fees and processing fees are taken out

		console.log(
			`Payment ${id} succeeded for ${user_id} with amount ${final_amount} ${currency}`,
		);

		// if you need to do work that takes a long time, use waitUntil to run it in the background
		waitUntil(
			potentiallyLongRunningHandler(
				user_id,
				final_amount,
				currency,
				amount_after_fees,
			),
		);
	}

	// Handle membership events
	if (webhookData.action === "membership.went_valid") {
		const membershipData = webhookData.data as any;
		const { id: membership_id, user_id, plan_id, expires_at } = membershipData;
		
		console.log(`Membership ${membership_id} became valid for user ${user_id}`);
		
		waitUntil(
			handleMembershipValid(user_id, membership_id, plan_id, expires_at)
		);
	}

	if (webhookData.action === "membership.went_invalid") {
		const membershipData = webhookData.data as any;
		const { id: membership_id, user_id } = membershipData;
		
		console.log(`Membership ${membership_id} became invalid for user ${user_id}`);
		
		waitUntil(
			handleMembershipInvalid(user_id, membership_id)
		);
	}

	// Make sure to return a 2xx status code quickly. Otherwise the webhook will be retried.
	return new Response("OK", { status: 200 });
}

async function potentiallyLongRunningHandler(
	_user_id: string | null | undefined,
	_amount: number,
	_currency: string,
	_amount_after_fees: number | null | undefined,
) {
	// Handle payment success logic here
	// For example, send confirmation email, update user credits, etc.
}

async function handleMembershipValid(
	user_id: string | null | undefined,
	membership_id: string,
	plan_id: string,
	expires_at: string | null | undefined
) {
	if (!user_id) {
		console.error('No user_id provided for membership.went_valid');
		return;
	}

	try {
		// Import supabase client
		const { supabase } = await import('@/lib/supabase');
		
		// First, get the user's database ID from their Whop user ID
		const { data: user, error: userError } = await supabase
			.from('users')
			.select('id')
			.eq('whop_user_id', user_id)
			.single();

		if (userError || !user) {
			console.error('User not found in database:', userError);
			return;
		}

		// Update or insert subscription record
		const { error: subscriptionError } = await supabase
			.from('user_subscriptions')
			.upsert({
				user_id: user.id,
				whop_membership_id: membership_id,
				plan_type: 'community', // Default plan type
				status: 'active',
				expires_at: expires_at,
				updated_at: new Date().toISOString()
			}, {
				onConflict: 'whop_membership_id'
			});

		if (subscriptionError) {
			console.error('Failed to update subscription:', subscriptionError);
		} else {
			console.log(`Successfully activated subscription for user ${user_id}`);
		}
	} catch (error) {
		console.error('Error handling membership.went_valid:', error);
	}
}

async function handleMembershipInvalid(
	user_id: string | null | undefined,
	membership_id: string
) {
	if (!user_id) {
		console.error('No user_id provided for membership.went_invalid');
		return;
	}

	try {
		// Import supabase client
		const { supabase } = await import('@/lib/supabase');
		
		// Update subscription status to expired
		const { error } = await supabase
			.from('user_subscriptions')
			.update({
				status: 'expired',
				updated_at: new Date().toISOString()
			})
			.eq('whop_membership_id', membership_id);

		if (error) {
			console.error('Failed to expire subscription:', error);
		} else {
			console.log(`Successfully expired subscription for user ${user_id}`);
		}
	} catch (error) {
		console.error('Error handling membership.went_invalid:', error);
	}
}

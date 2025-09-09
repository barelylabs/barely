import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

interface WaitlistRequest {
	email?: string;
}

export async function POST(request: NextRequest) {
	try {
		const body = (await request.json()) as WaitlistRequest;
		const { email } = body;

		if (!email?.includes('@')) {
			return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
		}

		// TODO: Implement actual database storage
		// For now, we'll just log and return success
		console.log('Waitlist signup:', email);

		// In production, you would:
		// 1. Save to database
		// 2. Send confirmation email
		// 3. Add to email marketing service
		// 4. Track analytics event

		return NextResponse.json(
			{
				success: true,
				message: 'Successfully added to waitlist',
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error('Waitlist signup error:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

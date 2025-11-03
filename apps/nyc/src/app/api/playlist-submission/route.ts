import { sendEmail } from '@barely/email';
import { PlaylistSubmissionEmail } from '@barely/email/templates/nyc/playlist-submission';
import { ratelimit } from '@barely/lib';
import { isProduction } from '@barely/utils';
import { playlistSubmissionSchema } from '@barely/validators';
import { ipAddress } from '@vercel/edge';
import { z } from 'zod/v4';

export async function POST(request: Request) {
	try {
		// Validate input
		const validatedData = playlistSubmissionSchema.parse(await request.json());

		// Get IP address for rate limiting
		const ip = ipAddress(request) ?? 'anonymous';

		// Rate limit by IP (10 requests per minute)
		const ipRateLimit = ratelimit(10, '1 m');
		const { success: ipSuccess } = await ipRateLimit.limit(ip);

		if (!ipSuccess) {
			const response = new Response('Too many requests from this IP', { status: 429 });
			setCorsHeaders(response);
			return response;
		}

		// Rate limit by email (5 requests per week)
		const emailRateLimit = ratelimit(5, '7 d');
		const { success: emailSuccess } = await emailRateLimit.limit(validatedData.email);

		if (!emailSuccess) {
			const response = new Response('Too many requests from this email', {
				status: 429,
			});
			setCorsHeaders(response);
			return response;
		}

		// Send email notification
		const emailResult = await sendEmail({
			from: 'noreply@mail.barely.nyc',
			fromFriendlyName: '@barely.indie',
			to: 'hello@barely.nyc',
			subject: `New @barely.indie Playlist Submission - ${validatedData.artistName}`,
			react: PlaylistSubmissionEmail({
				artistName: validatedData.artistName,
				email: validatedData.email,
				spotifyTrackUrl: validatedData.spotifyTrackUrl,
				instagramHandle: validatedData.instagramHandle,
			}),
			type: 'transactional',
			replyTo: validatedData.email,
		});

		if (emailResult.error) {
			console.error('Failed to send email:', emailResult.error);
			const response = new Response('Failed to send email', { status: 500 });
			setCorsHeaders(response);
			return response;
		}

		const successResponse = new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
		setCorsHeaders(successResponse);
		return successResponse;
	} catch (error) {
		if (error instanceof z.ZodError) {
			const zodErrors = error.issues.map(issue => ({
				path: issue.path.join('.'),
				message: issue.message,
			}));
			const errorResponse = new Response(JSON.stringify({ errors: zodErrors }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
			setCorsHeaders(errorResponse);
			return errorResponse;
		}

		console.error('Playlist submission error:', error);
		const response = new Response('Internal server error', { status: 500 });
		setCorsHeaders(response);
		return response;
	}
}

function setCorsHeaders(res: Response) {
	const origin = isProduction() ? 'https://barely.nyc' : '*';

	res.headers.set('Access-Control-Allow-Origin', origin);
	res.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
	res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	res.headers.set('Access-Control-Max-Age', '86400');
}

export function OPTIONS() {
	const response = new Response(null, {
		status: 204,
	});
	setCorsHeaders(response);
	return response;
}

import type { NextRequest } from 'next/server';
import { sendEmail } from '@barely/email';
import { PlaylistSubmissionEmail } from '@barely/email/templates/nyc/playlist-submission';
import { PlaylistSubmissionConfirmationEmail } from '@barely/email/templates/nyc/playlist-submission-confirmation';
import { ratelimit } from '@barely/lib';
import { upsertPlaylistSubmissionLead } from '@barely/lib/functions/airtable-lead.fns';
import { recordNYCEvent } from '@barely/lib/functions/nyc-event.fns';
import { parseReqForVisitorInfo } from '@barely/lib/middleware/request-parsing';
import { isProduction } from '@barely/utils';
import { playlistSubmissionSchema } from '@barely/validators';
import { ipAddress } from '@vercel/edge';
import { z } from 'zod/v4';

export async function POST(request: NextRequest) {
	try {
		// Parse visitor info for Meta Pixel tracking
		const visitor = parseReqForVisitorInfo({
			req: request,
			handle: 'barely',
			key: 'nyc',
		});

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

		// Send email notification to hello@barely.nyc
		const notificationEmailResult = await sendEmail({
			from: 'noreply@mail.barely.nyc',
			fromFriendlyName: '@barely.indie',
			to: 'hello@barely.nyc',
			subject: `New @barely.indie Playlist Submission - ${validatedData.artistName}${validatedData.interestedInServices ? ' [INTERESTED IN SERVICES]' : ''}`,
			react: PlaylistSubmissionEmail({
				artistName: validatedData.artistName,
				email: validatedData.email,
				spotifyTrackUrl: validatedData.spotifyTrackUrl,
				instagramHandle: validatedData.instagramHandle,
				interestedInServices: validatedData.interestedInServices,
			}),
			type: 'transactional',
			replyTo: validatedData.email,
		});

		if (notificationEmailResult.error) {
			console.error('Failed to send notification email:', notificationEmailResult.error);
			const response = new Response('Failed to send email', { status: 500 });
			setCorsHeaders(response);
			return response;
		}

		// Send confirmation email to artist
		const confirmationEmailResult = await sendEmail({
			from: 'hello@mail.barely.nyc',
			fromFriendlyName: 'Adam Barito',
			to: validatedData.email,
			subject: `Your @barely.indie submission is in! (+ How we helped The Now grow from 1.3k→19k listeners)`,
			react: PlaylistSubmissionConfirmationEmail({
				artistName: validatedData.artistName,
			}),
			type: 'transactional',
			replyTo: 'hello@mail.barely.nyc',
		});

		if (confirmationEmailResult.error) {
			console.error('Failed to send confirmation email:', confirmationEmailResult.error);
			// Don't fail the request if confirmation email fails - the submission was successful
		}

		// Track playlist submission to Meta Pixel
		await recordNYCEvent({
			type: 'nyc/playlistSubmit',
			visitor,
			email: validatedData.email,
			customData: {
				artist_name: validatedData.artistName,
				spotify_track_url: validatedData.spotifyTrackUrl,
				instagram_handle: validatedData.instagramHandle,
			},
		});

		// Capture lead in Airtable CRM (non-blocking - silent failure)
		upsertPlaylistSubmissionLead({
			email: validatedData.email,
			artistName: validatedData.artistName,
			spotifyTrackUrl: validatedData.spotifyTrackUrl,
			instagramHandle: validatedData.instagramHandle,
		}).catch(error => {
			console.error('Failed to update Airtable lead from playlist submission:', error);
			// Silent failure - don't block the request
		});

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

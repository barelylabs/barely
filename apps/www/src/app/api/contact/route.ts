import { sendEmail } from '@barely/email';
import { ContactInquiryEmail } from '@barely/email/templates/www/contact-inquiry';
import { ratelimit } from '@barely/lib';
import { isProduction } from '@barely/utils';
import { ipAddress } from '@vercel/edge';
import { z } from 'zod/v4';

const contactFormSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	email: z.string().email('Invalid email address'),
	artistName: z.string().optional(),
	message: z.string().min(10, 'Message must be at least 10 characters'),
});

export async function POST(request: Request) {
	try {
		const body = (await request.json()) as Record<string, unknown>;
		const validatedData = contactFormSchema.parse(body);
		const variant = (body.variant as string | undefined) ?? 'demo';

		// Get IP address for rate limiting
		const ip = ipAddress(request) ?? 'anonymous';

		// Rate limit by IP (10 requests per minute)
		const ipRateLimit = ratelimit(10, '1 m');
		const { success: ipSuccess } = await ipRateLimit.limit(ip);

		if (!ipSuccess) {
			return new Response('Too many requests from this IP', { status: 429 });
		}

		// Rate limit by email (3 requests per hour)
		const emailRateLimit = ratelimit(3, '1 h');
		const { success: emailSuccess } = await emailRateLimit.limit(validatedData.email);

		if (!emailSuccess) {
			const response = new Response('Too many requests from this email', { status: 429 });
			setCorsHeaders(response);
			return response;
		}

		// Send email
		const emailResult = await sendEmail({
			from: 'noreply@mail.barely.ai',
			fromFriendlyName: 'barely.ai',
			to: 'hello@barely.ai',
			subject: `New ${variant === 'demo' ? 'Demo Request' : 'Contact'} - ${validatedData.name}`,
			react: ContactInquiryEmail({
				...validatedData,
				variant: variant as 'demo' | 'support',
			}),
			type: 'transactional',
			replyTo: validatedData.email,
		});

		if ('error' in emailResult && emailResult.error) {
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

		console.error('Contact form error:', error);
		const response = new Response('Internal server error', { status: 500 });
		setCorsHeaders(response);
		return response;
	}
}

function setCorsHeaders(res: Response) {
	const origin = isProduction() ? 'https://barely.ai' : '*';

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

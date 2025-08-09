import { sendEmail } from '@barely/email';
import { ContactInquiryEmail } from '@barely/email/templates/nyc/contact-inquiry';
import { ratelimit } from '@barely/lib';
import { isProduction } from '@barely/utils';
import { ipAddress } from '@vercel/edge';
import { z } from 'zod/v4';

const contactFormSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	email: z.string().email('Invalid email address'),
	artistName: z.string().optional(),
	monthlyListeners: z.string().optional(),
	service: z.enum(['bedroom', 'rising', 'breakout', '']).optional(),
	message: z.string().min(10, 'Message must be at least 10 characters'),
});

export async function POST(request: Request) {
	try {
		// Validate input
		const validatedData = contactFormSchema.parse(await request.json());

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
			from: 'noreply@mail.barely.nyc',
			fromFriendlyName: 'Barely',
			to: 'hello@barely.nyc',
			subject: `New Contact Form Submission - ${validatedData.service ? validatedData.service.charAt(0).toUpperCase() + validatedData.service.slice(1) + '+' : 'General Inquiry'}`,
			react: ContactInquiryEmail({
				name: validatedData.name,
				email: validatedData.email,
				artistName: validatedData.artistName,
				monthlyListeners: validatedData.monthlyListeners,
				service: validatedData.service,
				message: validatedData.message,
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

		console.error('Contact form error:', error);
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

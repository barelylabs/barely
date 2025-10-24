import { sendEmail } from '@barely/email';
import { TestimonialSubmissionEmail } from '@barely/email/templates/nyc/testimonial-submission';
import { ratelimit } from '@barely/lib';
import { isProduction } from '@barely/utils';
import { ipAddress } from '@vercel/edge';
import { z } from 'zod/v4';

const testimonialFormSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	bandName: z.string().min(1, 'Band/Artist name is required'),
	tier: z.enum(['bedroom', 'rising', 'breakout'], 'Please select your current tier'),
	duration: z.enum(
		['less-3', '3-6', '6-12', '12-plus'],
		"Please select how long you've been with Barely",
	),
	testimonial: z
		.string()
		.min(50, 'Please provide at least 50 characters')
		.max(1000, 'Please keep your testimonial under 1000 characters'),
	consent: z
		.boolean()
		.refine(val => val === true, 'You must give consent to share your testimonial'),
});

// type TestimonialFormData = z.infer<typeof testimonialFormSchema>;

export async function POST(request: Request) {
	try {
		// Validate input
		const validatedData = testimonialFormSchema.parse(await request.json());

		// Get IP address for rate limiting
		const ip = ipAddress(request) ?? 'anonymous';

		// Rate limit by IP (5 requests per hour)
		const ipRateLimit = ratelimit(5, '1 h');
		const { success: ipSuccess } = await ipRateLimit.limit(ip);

		if (!ipSuccess) {
			return new Response('Too many requests from this IP', { status: 429 });
		}

		// Send email to testimonials@barely.nyc
		const emailResult = await sendEmail({
			from: 'noreply@mail.barely.nyc',
			fromFriendlyName: 'Barely NYC',
			to: 'testimonials@barely.nyc',
			subject: `New Testimonial - ${validatedData.bandName} (${validatedData.tier.charAt(0).toUpperCase() + validatedData.tier.slice(1)}+)`,
			react: TestimonialSubmissionEmail({
				name: validatedData.name,
				bandName: validatedData.bandName,
				tier: validatedData.tier,
				duration: validatedData.duration,
				testimonial: validatedData.testimonial,
				consent: validatedData.consent,
			}),
			type: 'transactional',
		});

		if (emailResult.error) {
			console.error('Failed to send testimonial email:', emailResult.error);
			const response = new Response('Failed to send testimonial', { status: 500 });
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

		console.error('Testimonial submission error:', error);
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

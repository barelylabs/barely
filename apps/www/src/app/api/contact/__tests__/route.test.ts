import { beforeEach, describe, expect, it, vi } from 'vitest';

import { OPTIONS, POST } from '../route';

// Define types for our test responses
interface SuccessResponse {
	success: true;
}

interface ErrorResponse {
	errors: {
		path: string;
		message: string;
	}[];
}

interface SendEmailSuccessResult {
	resendId: string;
}

interface SendEmailErrorResult {
	error: string;
}

// Mock dependencies
vi.mock('@barely/email', () => ({
	sendEmail: vi.fn(),
}));

vi.mock('@barely/lib', () => ({
	ratelimit: vi.fn(),
}));

vi.mock('@vercel/edge', () => ({
	ipAddress: vi.fn(() => '127.0.0.1'),
}));

const { sendEmail } = await import('@barely/email');
const { ratelimit } = await import('@barely/lib');
const mockedSendEmail = vi.mocked(sendEmail);
const mockedRatelimit = vi.mocked(ratelimit);

describe('/api/contact', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Default success response for sendEmail
		const sendEmailSuccessResult: SendEmailSuccessResult = { resendId: 'test-resend-id' };
		mockedSendEmail.mockResolvedValue(sendEmailSuccessResult);
		// Default rate limit behavior - allow all requests
		mockedRatelimit.mockReturnValue({
			limit: vi.fn(() => ({
				success: true,
				limit: 10,
				remaining: 10,
				reset: 0,
				retryAfter: 0,
			})),
		});
	});

	describe('POST', () => {
		it('should successfully send a demo request', async () => {
			const request = new Request('http://localhost:3000/api/contact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: 'John Doe',
					email: 'john@example.com',
					artistName: 'Test Artist',
					message: 'I would like to learn more about barely.ai',
					variant: 'demo',
				}),
			});

			const response = await POST(request);
			const data = (await response.json()) as SuccessResponse;

			expect(response.status).toBe(200);
			expect(data).toEqual({ success: true });
			expect(mockedSendEmail).toHaveBeenCalledWith(
				expect.objectContaining({
					from: 'noreply@mail.barely.ai',
					to: 'hello@barely.ai',
					subject: 'New Demo Request - John Doe',
					type: 'transactional',
					replyTo: 'john@example.com',
				}),
			);
		});

		it('should successfully send a support request', async () => {
			const request = new Request('http://localhost:3000/api/contact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: 'Jane Smith',
					email: 'jane@example.com',
					message: 'I need help with my account',
					variant: 'support',
				}),
			});

			const response = await POST(request);
			const data = (await response.json()) as SuccessResponse;

			expect(response.status).toBe(200);
			expect(data).toEqual({ success: true });
			expect(mockedSendEmail).toHaveBeenCalledWith(
				expect.objectContaining({
					subject: 'New Contact - Jane Smith',
				}),
			);
		});

		it('should validate required fields', async () => {
			const request = new Request('http://localhost:3000/api/contact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: '',
					email: 'invalid-email',
					message: 'short',
				}),
			});

			const response = await POST(request);
			const data = (await response.json()) as ErrorResponse;

			expect(response.status).toBe(400);
			expect(data.errors).toBeDefined();
			expect(data.errors).toContainEqual(
				expect.objectContaining({
					path: 'name',
					message: 'Name is required',
				}),
			);
			expect(data.errors).toContainEqual(
				expect.objectContaining({
					path: 'email',
					message: 'Invalid email address',
				}),
			);
			expect(data.errors).toContainEqual(
				expect.objectContaining({
					path: 'message',
					message: 'Message must be at least 10 characters',
				}),
			);
		});

		it('should handle rate limiting by IP', async () => {
			// First rate limit call (IP) should fail
			mockedRatelimit.mockReturnValueOnce({
				limit: vi.fn(() => ({
					success: false,
					limit: 10,
					remaining: 0,
					reset: Date.now() + 60000,
					retryAfter: 60,
				})),
			});

			const request = new Request('http://localhost:3000/api/contact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: 'John Doe',
					email: 'john@example.com',
					message: 'Test message for rate limiting',
				}),
			});

			const response = await POST(request);
			const text = await response.text();

			expect(response.status).toBe(429);
			expect(text).toBe('Too many requests from this IP');
		});

		it('should handle rate limiting by email', async () => {
			// First call for IP succeeds, second call for email fails
			mockedRatelimit
				.mockReturnValueOnce({
					limit: vi.fn(() => ({
						success: true,
						limit: 10,
						remaining: 10,
						reset: 0,
						retryAfter: 0,
					})),
				})
				.mockReturnValueOnce({
					limit: vi.fn(() => ({
						success: false,
						limit: 3,
						remaining: 0,
						reset: Date.now() + 3600000,
						retryAfter: 3600,
					})),
				});

			const request = new Request('http://localhost:3000/api/contact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: 'John Doe',
					email: 'john@example.com',
					message: 'Test message for email rate limiting',
				}),
			});

			const response = await POST(request);
			const text = await response.text();

			expect(response.status).toBe(429);
			expect(text).toBe('Too many requests from this email');
		});

		it('should handle email sending errors', async () => {
			const sendEmailErrorResult: SendEmailErrorResult = {
				error: 'Failed to send email',
			};
			mockedSendEmail.mockResolvedValue(sendEmailErrorResult);

			const request = new Request('http://localhost:3000/api/contact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: 'John Doe',
					email: 'john@example.com',
					message: 'Test message that will fail',
				}),
			});

			const response = await POST(request);
			const text = await response.text();

			expect(response.status).toBe(500);
			expect(text).toBe('Failed to send email');
		});

		it('should handle unexpected errors', async () => {
			mockedSendEmail.mockRejectedValue(new Error('Unexpected error'));

			const request = new Request('http://localhost:3000/api/contact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: 'John Doe',
					email: 'john@example.com',
					message: 'Test message that will cause error',
				}),
			});

			const response = await POST(request);
			const text = await response.text();

			expect(response.status).toBe(500);
			expect(text).toBe('Internal server error');
		});
	});

	describe('OPTIONS', () => {
		it('should handle CORS preflight requests', () => {
			const response = OPTIONS();

			expect(response.status).toBe(204);
			expect(response.headers.get('Access-Control-Allow-Origin')).toBeTruthy();
			expect(response.headers.get('Access-Control-Allow-Methods')).toBe(
				'GET, POST, OPTIONS',
			);
			expect(response.headers.get('Access-Control-Allow-Headers')).toBe(
				'Content-Type, Authorization',
			);
		});
	});
});

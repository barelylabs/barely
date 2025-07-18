import { sendEmail } from '@barely/email';
import { ratelimit } from '@barely/lib';
import { ipAddress } from '@vercel/edge';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { OPTIONS, POST } from '../route';

// Mock dependencies
vi.mock('@barely/email', () => ({
	sendEmail: vi.fn(),
}));

vi.mock('@barely/lib', () => ({
	ratelimit: vi.fn(() => ({
		limit: vi.fn().mockResolvedValue({ success: true }),
	})),
}));

vi.mock('@vercel/edge', () => ({
	ipAddress: vi.fn(() => '127.0.0.1'),
}));

interface ContactFormData {
	name: string;
	email: string;
	artistName?: string;
	monthlyListeners?: string;
	service?: string;
	message: string;
}

interface ApiResponse {
	success?: boolean;
	errors?: { path: string; message: string }[];
}

describe('Contact API Route', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('POST /api/contact', () => {
		it('successfully processes valid contact form submission', async () => {
			const mockSendEmail = vi.mocked(sendEmail);
			mockSendEmail.mockResolvedValueOnce({ resendId: '123' });

			const request = new Request('http://localhost:3000/api/contact', {
				method: 'POST',
				body: JSON.stringify({
					name: 'John Doe',
					email: 'john@example.com',
					artistName: 'Test Artist',
					monthlyListeners: '10000',
					service: 'bedroom',
					message: 'This is a test message with enough characters',
				} satisfies ContactFormData),
			});

			const response = await POST(request);
			const data = (await response.json()) as ApiResponse;

			expect(response.status).toBe(200);
			expect(data).toEqual({ success: true });
			expect(mockSendEmail).toHaveBeenCalledWith({
				from: 'noreply@mail.barelysparrow.com',
				fromFriendlyName: 'Barely Sparrow',
				to: 'hello@barelysparrow.com',
				subject: 'New Contact Form Submission - Bedroom+',
				react: expect.any(Object) as unknown,
				type: 'transactional',
				replyTo: 'john@example.com',
			});
		});

		it('returns 400 for invalid email', async () => {
			const request = new Request('http://localhost:3000/api/contact', {
				method: 'POST',
				body: JSON.stringify({
					name: 'John Doe',
					email: 'invalid-email',
					message: 'This is a test message',
				}),
			});

			const response = await POST(request);
			const data = (await response.json()) as ApiResponse;

			expect(response.status).toBe(400);
			expect(data.errors).toContainEqual({
				path: 'email',
				message: 'Invalid email address',
			});
		});

		it('returns 400 for missing required fields', async () => {
			const request = new Request('http://localhost:3000/api/contact', {
				method: 'POST',
				body: JSON.stringify({
					email: 'john@example.com',
				}),
			});

			const response = await POST(request);
			const data = (await response.json()) as ApiResponse;

			expect(response.status).toBe(400);
			expect(data.errors).toContainEqual({
				path: 'name',
				message: 'Invalid input: expected string, received undefined',
			});
			expect(data.errors).toContainEqual({
				path: 'message',
				message: 'Invalid input: expected string, received undefined',
			});
		});

		it('returns 400 for short message', async () => {
			const request = new Request('http://localhost:3000/api/contact', {
				method: 'POST',
				body: JSON.stringify({
					name: 'John Doe',
					email: 'john@example.com',
					message: 'Short',
				}),
			});

			const response = await POST(request);
			const data = (await response.json()) as ApiResponse;

			expect(response.status).toBe(400);
			expect(data.errors).toContainEqual({
				path: 'message',
				message: 'Message must be at least 10 characters',
			});
		});

		it('returns 429 when IP rate limit is exceeded', async () => {
			const mockRatelimit = vi.mocked(ratelimit);
			mockRatelimit.mockReturnValueOnce({
				limit: vi.fn().mockResolvedValue({ success: false }),
			});

			const request = new Request('http://localhost:3000/api/contact', {
				method: 'POST',
				body: JSON.stringify({
					name: 'John Doe',
					email: 'john@example.com',
					message: 'This is a test message with enough characters',
				}),
			});

			const response = await POST(request);

			expect(response.status).toBe(429);
			expect(await response.text()).toBe('Too many requests from this IP');
		});

		it('returns 429 when email rate limit is exceeded', async () => {
			const mockRatelimit = vi.mocked(ratelimit);
			mockRatelimit
				.mockReturnValueOnce({
					limit: vi.fn().mockResolvedValue({ success: true }),
				})
				.mockReturnValueOnce({
					limit: vi.fn().mockResolvedValue({ success: false }),
				});

			const request = new Request('http://localhost:3000/api/contact', {
				method: 'POST',
				body: JSON.stringify({
					name: 'John Doe',
					email: 'john@example.com',
					message: 'This is a test message with enough characters',
				}),
			});

			const response = await POST(request);

			expect(response.status).toBe(429);
			expect(await response.text()).toBe('Too many requests from this email');
			expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
		});

		it('returns 500 when email sending fails', async () => {
			const mockSendEmail = vi.mocked(sendEmail);
			mockSendEmail.mockResolvedValueOnce({ error: 'Email service error' });

			const request = new Request('http://localhost:3000/api/contact', {
				method: 'POST',
				body: JSON.stringify({
					name: 'John Doe',
					email: 'john@example.com',
					message: 'This is a test message with enough characters',
				}),
			});

			const response = await POST(request);

			expect(response.status).toBe(500);
			expect(await response.text()).toBe('Failed to send email');
			expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
		});

		it('returns 500 for unexpected errors', async () => {
			const request = new Request('http://localhost:3000/api/contact', {
				method: 'POST',
				body: 'invalid json',
			});

			const response = await POST(request);

			expect(response.status).toBe(500);
			expect(await response.text()).toBe('Internal server error');
			expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
		});

		it('handles general inquiry without service type', async () => {
			const mockSendEmail = vi.mocked(sendEmail);
			mockSendEmail.mockResolvedValueOnce({ resendId: '123' });

			const request = new Request('http://localhost:3000/api/contact', {
				method: 'POST',
				body: JSON.stringify({
					name: 'John Doe',
					email: 'john@example.com',
					message: 'This is a test message with enough characters',
				}),
			});

			const response = await POST(request);

			expect(response.status).toBe(200);
			expect(mockSendEmail).toHaveBeenCalledWith(
				expect.objectContaining({
					subject: 'New Contact Form Submission - General Inquiry',
				}),
			);
		});

		it('handles anonymous users when IP is not available', async () => {
			vi.mocked(ipAddress).mockReturnValueOnce(undefined);
			const mockSendEmail = vi.mocked(sendEmail);
			mockSendEmail.mockResolvedValueOnce({ resendId: '123' });

			const request = new Request('http://localhost:3000/api/contact', {
				method: 'POST',
				body: JSON.stringify({
					name: 'John Doe',
					email: 'john@example.com',
					message: 'This is a test message with enough characters',
				}),
			});

			const response = await POST(request);

			expect(response.status).toBe(200);
			expect(ratelimit).toHaveBeenCalledWith(10, '1 m');
		});
	});

	describe('OPTIONS /api/contact', () => {
		it('returns proper CORS headers', () => {
			const response = OPTIONS();

			expect(response.status).toBe(204);
			expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
			expect(response.headers.get('Access-Control-Allow-Methods')).toBe(
				'GET, POST, OPTIONS',
			);
			expect(response.headers.get('Access-Control-Allow-Headers')).toBe(
				'Content-Type, Authorization',
			);
		});
	});
});

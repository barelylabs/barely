import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ContactModal } from '../ContactModal';

// Mock fetch
global.fetch = vi.fn();

describe('ContactModal', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders the contact form correctly', () => {
		render(<ContactModal isOpen={true} onClose={vi.fn()} service="bedroom" />);

		expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/artist name/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/monthly spotify listeners/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
	});

	it('validates required fields', async () => {
		const user = userEvent.setup();
		render(<ContactModal isOpen={true} onClose={vi.fn()} service="bedroom" />);

		const submitButton = screen.getByRole('button', { name: /send message/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(screen.getByText(/name is required/i)).toBeInTheDocument();
			expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
			expect(screen.getByText(/message must be at least 10 characters/i)).toBeInTheDocument();
		});
	});

	it('validates email format', async () => {
		const user = userEvent.setup();
		render(<ContactModal isOpen={true} onClose={vi.fn()} service="bedroom" />);

		const emailInput = screen.getByLabelText(/email/i);
		await user.type(emailInput, 'invalid-email');

		const submitButton = screen.getByRole('button', { name: /send message/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
		});
	});

	it('validates message length', async () => {
		const user = userEvent.setup();
		render(<ContactModal isOpen={true} onClose={vi.fn()} service="bedroom" />);

		const messageInput = screen.getByLabelText(/message/i);
		await user.type(messageInput, 'Short');

		const submitButton = screen.getByRole('button', { name: /send message/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(screen.getByText(/message must be at least 10 characters/i)).toBeInTheDocument();
		});
	});

	it('submits form with valid data', async () => {
		const user = userEvent.setup();
		const onClose = vi.fn();
		
		(global.fetch as any).mockResolvedValueOnce({
			ok: true,
			json: async () => ({ success: true }),
		});

		render(<ContactModal isOpen={true} onClose={onClose} service="bedroom" />);

		// Fill form with valid data
		await user.type(screen.getByLabelText(/name/i), 'John Doe');
		await user.type(screen.getByLabelText(/email/i), 'john@example.com');
		await user.type(screen.getByLabelText(/artist name/i), 'Test Artist');
		await user.type(screen.getByLabelText(/monthly spotify listeners/i), '10000');
		await user.type(screen.getByLabelText(/message/i), 'This is a test message with enough characters');

		const submitButton = screen.getByRole('button', { name: /send message/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(global.fetch).toHaveBeenCalledWith('/api/contact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: 'John Doe',
					email: 'john@example.com',
					artistName: 'Test Artist',
					monthlyListeners: '10000',
					service: 'bedroom',
					message: 'This is a test message with enough characters',
				}),
			});
		});

		await waitFor(() => {
			expect(screen.getByText(/message sent successfully/i)).toBeInTheDocument();
		});

		// Wait for success message to disappear and modal to close
		await waitFor(() => {
			expect(onClose).toHaveBeenCalled();
		}, { timeout: 3500 });
	});

	it('handles API errors gracefully', async () => {
		const user = userEvent.setup();
		
		(global.fetch as any).mockResolvedValueOnce({
			ok: false,
			status: 500,
		});

		render(<ContactModal isOpen={true} onClose={vi.fn()} service="bedroom" />);

		// Fill form with valid data
		await user.type(screen.getByLabelText(/name/i), 'John Doe');
		await user.type(screen.getByLabelText(/email/i), 'john@example.com');
		await user.type(screen.getByLabelText(/message/i), 'This is a test message with enough characters');

		const submitButton = screen.getByRole('button', { name: /send message/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(screen.getByText(/failed to send message/i)).toBeInTheDocument();
		});
	});

	it('handles rate limiting', async () => {
		const user = userEvent.setup();
		
		(global.fetch as any).mockResolvedValueOnce({
			ok: false,
			status: 429,
		});

		render(<ContactModal isOpen={true} onClose={vi.fn()} service="bedroom" />);

		// Fill form with valid data
		await user.type(screen.getByLabelText(/name/i), 'John Doe');
		await user.type(screen.getByLabelText(/email/i), 'john@example.com');
		await user.type(screen.getByLabelText(/message/i), 'This is a test message with enough characters');

		const submitButton = screen.getByRole('button', { name: /send message/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(screen.getByText(/too many requests/i)).toBeInTheDocument();
		});
	});

	it('closes modal when close button is clicked', async () => {
		const user = userEvent.setup();
		const onClose = vi.fn();
		
		render(<ContactModal isOpen={true} onClose={onClose} service="bedroom" />);

		const closeButton = screen.getByRole('button', { name: /close/i });
		await user.click(closeButton);

		expect(onClose).toHaveBeenCalled();
	});

	it('disables submit button while loading', async () => {
		const user = userEvent.setup();
		
		// Mock a slow network request
		(global.fetch as any).mockImplementation(() => 
			new Promise((resolve) => {
				setTimeout(() => {
					resolve({
						ok: true,
						json: async () => ({ success: true }),
					});
				}, 1000);
			})
		);

		render(<ContactModal isOpen={true} onClose={vi.fn()} service="bedroom" />);

		// Fill form with valid data
		await user.type(screen.getByLabelText(/name/i), 'John Doe');
		await user.type(screen.getByLabelText(/email/i), 'john@example.com');
		await user.type(screen.getByLabelText(/message/i), 'This is a test message with enough characters');

		const submitButton = screen.getByRole('button', { name: /send message/i });
		await user.click(submitButton);

		// Button should be disabled and show loading text
		expect(submitButton).toBeDisabled();
		expect(screen.getByText(/sending.../i)).toBeInTheDocument();
	});
});
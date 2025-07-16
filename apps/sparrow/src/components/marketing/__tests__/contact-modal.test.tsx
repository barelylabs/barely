import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ContactModal } from '../contact-modal';

// Mock fetch
global.fetch = vi.fn() as typeof global.fetch;

describe('ContactModal', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders the contact form correctly', () => {
		render(
			<ContactModal
				showModal={true}
				setShowModal={vi.fn()}
				preSelectedService='bedroom'
			/>,
		);

		expect(screen.getByLabelText(/your name \*/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/email \*/i)).toBeInTheDocument();
		expect(screen.getByText(/add more details/i)).toBeInTheDocument();
		expect(
			screen.getByLabelText(/what's your biggest music marketing challenge\? \*/i),
		).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
	});

	it('validates required fields', async () => {
		const user = userEvent.setup();
		render(
			<ContactModal
				showModal={true}
				setShowModal={vi.fn()}
				preSelectedService='bedroom'
			/>,
		);

		const submitButton = screen.getByRole('button', { name: /send message/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(screen.getByText(/name is required/i)).toBeInTheDocument();
			expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
			expect(
				screen.getByText(/message must be at least 10 characters/i),
			).toBeInTheDocument();
		});
	});

	it('validates email format', async () => {
		const user = userEvent.setup();
		render(
			<ContactModal
				showModal={true}
				setShowModal={vi.fn()}
				preSelectedService='bedroom'
			/>,
		);

		// Fill name (required field)
		await user.type(screen.getByLabelText(/your name \*/i), 'John Doe');

		// Fill message (required field)
		await user.type(
			screen.getByLabelText(/what's your biggest music marketing challenge\? \*/i),
			'This is a test message with enough characters',
		);

		// Fill email with invalid value
		const emailInput = screen.getByLabelText(/email \*/i);
		await user.type(emailInput, 'invalid-email');

		// Trigger blur to show validation
		await user.tab();

		const submitButton = screen.getByRole('button', { name: /send message/i });
		await user.click(submitButton);

		// Wait for the error message to appear
		await waitFor(
			() => {
				const errorMessage = screen.queryByText(/invalid email address/i);
				expect(errorMessage).toBeInTheDocument();
			},
			{ timeout: 2000 },
		);
	});

	it('validates message length', async () => {
		const user = userEvent.setup();
		render(
			<ContactModal
				showModal={true}
				setShowModal={vi.fn()}
				preSelectedService='bedroom'
			/>,
		);

		const messageInput = screen.getByLabelText(
			/what's your biggest music marketing challenge/i,
		);
		await user.type(messageInput, 'Short');

		const submitButton = screen.getByRole('button', { name: /send message/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(
				screen.getByText(/message must be at least 10 characters/i),
			).toBeInTheDocument();
		});
	});

	it('submits form with valid data', async () => {
		const user = userEvent.setup();
		const setShowModal = vi.fn();

		vi.mocked(global.fetch).mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({ success: true }),
		} as Response);

		render(
			<ContactModal
				showModal={true}
				setShowModal={setShowModal}
				preSelectedService='bedroom'
			/>,
		);

		// Fill form with valid data
		await user.type(screen.getByLabelText(/your name \*/i), 'John Doe');
		await user.type(screen.getByLabelText(/email \*/i), 'john@example.com');
		// Click on the details section to expand it
		const detailsSection = screen.getByText(/add more details/i);
		await user.click(detailsSection);

		// Now we can fill the optional fields
		await user.type(screen.getByLabelText(/artist\/band name/i), 'Test Artist');
		await user.type(screen.getByLabelText(/monthly listeners/i), '10000');
		await user.type(
			screen.getByLabelText(/what's your biggest music marketing challenge\? \*/i),
			'This is a test message with enough characters',
		);

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
			// Check for the success message body text
			expect(
				screen.getByText(/I'll get back to you within 24 hours/i),
			).toBeInTheDocument();
		});

		// Wait for success message to disappear and modal to close
		await waitFor(
			() => {
				expect(setShowModal).toHaveBeenCalledWith(false);
			},
			{ timeout: 3500 },
		);
	});

	it('handles API errors gracefully', async () => {
		const user = userEvent.setup();

		vi.mocked(global.fetch).mockResolvedValueOnce({
			ok: false,
			status: 500,
			text: () => Promise.resolve('Internal server error'),
		} as Response);

		render(
			<ContactModal
				showModal={true}
				setShowModal={vi.fn()}
				preSelectedService='bedroom'
			/>,
		);

		// Fill form with valid data
		await user.type(screen.getByLabelText(/your name \*/i), 'John Doe');
		await user.type(screen.getByLabelText(/email \*/i), 'john@example.com');
		await user.type(
			screen.getByLabelText(/what's your biggest music marketing challenge\? \*/i),
			'This is a test message with enough characters',
		);

		const submitButton = screen.getByRole('button', { name: /send message/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(screen.getByText(/internal server error/i)).toBeInTheDocument();
		});
	});

	it('handles rate limiting', async () => {
		const user = userEvent.setup();

		vi.mocked(global.fetch).mockResolvedValueOnce({
			ok: false,
			status: 429,
			text: () => Promise.resolve('Too many requests'),
		} as Response);

		render(
			<ContactModal
				showModal={true}
				setShowModal={vi.fn()}
				preSelectedService='bedroom'
			/>,
		);

		// Fill form with valid data
		await user.type(screen.getByLabelText(/your name \*/i), 'John Doe');
		await user.type(screen.getByLabelText(/email \*/i), 'john@example.com');
		await user.type(
			screen.getByLabelText(/what's your biggest music marketing challenge\? \*/i),
			'This is a test message with enough characters',
		);

		const submitButton = screen.getByRole('button', { name: /send message/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(screen.getByText(/too many requests/i)).toBeInTheDocument();
		});
	});

	it('closes modal when close button is clicked', async () => {
		const user = userEvent.setup();
		const setShowModal = vi.fn();

		render(
			<ContactModal
				showModal={true}
				setShowModal={setShowModal}
				preSelectedService='bedroom'
			/>,
		);

		// Click the Cancel button
		const cancelButton = screen.getByRole('button', { name: /cancel/i });
		await user.click(cancelButton);

		expect(setShowModal).toHaveBeenCalledWith(false);
	});

	it('disables submit button while loading', async () => {
		const user = userEvent.setup();

		// Mock a slow network request
		vi.mocked(global.fetch).mockImplementation(
			() =>
				new Promise<Response>(resolve => {
					setTimeout(() => {
						resolve({
							ok: true,
							json: () => Promise.resolve({ success: true }),
						} as Response);
					}, 1000);
				}),
		);

		render(
			<ContactModal
				showModal={true}
				setShowModal={vi.fn()}
				preSelectedService='bedroom'
			/>,
		);

		// Fill form with valid data
		await user.type(screen.getByLabelText(/your name \*/i), 'John Doe');
		await user.type(screen.getByLabelText(/email \*/i), 'john@example.com');
		await user.type(
			screen.getByLabelText(/what's your biggest music marketing challenge\? \*/i),
			'This is a test message with enough characters',
		);

		const submitButton = screen.getByRole('button', { name: /send message/i });
		await user.click(submitButton);

		// Button should be disabled and show loading text
		expect(submitButton).toBeDisabled();
		expect(screen.getByText(/sending.../i)).toBeInTheDocument();
	});
});

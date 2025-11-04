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

		// Don't fill in other fields, just email with invalid value
		const emailInput = screen.getByLabelText(/email \*/i);
		await user.type(emailInput, 'invalid-email');

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

		// Fill only required fields for simplicity
		await user.type(screen.getByLabelText(/your name \*/i), 'John Doe');
		await user.type(screen.getByLabelText(/email \*/i), 'john@example.com');
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
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				body: expect.stringContaining('John Doe'),
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

		await waitFor(
			() => {
				expect(screen.getByText(/internal server error/i)).toBeInTheDocument();
			},
			{ timeout: 2000 },
		);
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

		await waitFor(
			() => {
				expect(screen.getByText(/too many requests/i)).toBeInTheDocument();
			},
			{ timeout: 2000 },
		);
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
		let resolveFunc: ((value: Response) => void) | undefined;
		const fetchPromise = new Promise<Response>(resolve => {
			resolveFunc = resolve;
		});
		vi.mocked(global.fetch).mockReturnValueOnce(fetchPromise);

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

		// Wait for the button to be in loading state
		await waitFor(() => {
			expect(screen.getByText(/sending.../i)).toBeInTheDocument();
		});

		// Now resolve the fetch promise
		if (resolveFunc) {
			resolveFunc({
				ok: true,
				json: () => Promise.resolve({ success: true }),
			} as Response);
		}
	});
});

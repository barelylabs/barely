/**
 * Utility for retrying async operations with exponential backoff
 * @param fn - The async function to retry
 * @param options - Retry configuration options
 * @returns The result of the function
 */
export async function withRetry<T>(
	fn: () => Promise<T>,
	options: {
		retries?: number;
		initialDelay?: number;
		maxDelay?: number;
		backoffMultiplier?: number;
		shouldRetry?: (error: unknown) => boolean;
		onRetry?: (error: unknown, attempt: number) => void;
	} = {},
): Promise<T> {
	const {
		retries = 3,
		initialDelay = 1000,
		maxDelay = 30000,
		backoffMultiplier = 2,
		shouldRetry = () => true,
		onRetry,
	} = options;

	let lastError: unknown;

	for (let attempt = 0; attempt < retries; attempt++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error;

			// Check if this is the last attempt
			if (attempt === retries - 1) {
				throw error;
			}

			// Check if we should retry this particular error
			if (!shouldRetry(error)) {
				throw error;
			}

			// Call retry callback if provided
			if (onRetry) {
				onRetry(error, attempt + 1);
			}

			// Calculate delay with exponential backoff
			const delay = Math.min(
				initialDelay * Math.pow(backoffMultiplier, attempt),
				maxDelay,
			);

			// Wait before retrying
			await new Promise(resolve => setTimeout(resolve, delay));
		}
	}

	// This should never be reached, but TypeScript doesn't know that
	throw lastError;
}

/**
 * Checks if an error is a Spotify API error that should be retried
 */
export function isRetryableSpotifyError(error: unknown): boolean {
	// Network errors should be retried
	if (error instanceof TypeError && error.message.includes('fetch')) {
		return true;
	}

	// Check for specific HTTP status codes if available
	if (
		error &&
		typeof error === 'object' &&
		'status' in error &&
		typeof error.status === 'number'
	) {
		const status = error.status;
		// Retry on:
		// - 429 (Rate Limited - though we handle this separately)
		// - 500-599 (Server errors)
		// - 502 (Bad Gateway)
		// - 503 (Service Unavailable)
		// - 504 (Gateway Timeout)
		return status === 429 || (status >= 500 && status < 600);
	}

	// Don't retry client errors (400-499 except 429)
	return false;
}

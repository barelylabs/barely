import { log } from '../utils/log';

interface RetryOptions {
	maxRetries?: number;
	retryDelay?: number;
	backoffMultiplier?: number;
}

/**
 * Wrapper function to retry email sending operations with exponential backoff
 * @param emailFn - The email function to retry
 * @param emailName - Name of the email for logging
 * @param options - Retry configuration options
 */
export async function sendEmailWithRetry<T>(
	emailFn: () => Promise<T>,
	emailName: string,
	options: RetryOptions = {},
): Promise<T> {
	const { maxRetries = 3, retryDelay = 1000, backoffMultiplier = 2 } = options;

	let lastError: Error | undefined;
	let delay = retryDelay;

	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			// Attempt to send the email
			const result = await emailFn();

			// If successful, log and return
			if (attempt > 1) {
				await log({
					type: 'logs',
					location: 'sendEmailWithRetry',
					message: `${emailName} succeeded on attempt ${attempt}`,
				});
			}

			return result;
		} catch (error) {
			lastError = error instanceof Error ? error : new Error(String(error));

			// Log the failure
			await log({
				type: 'errors',
				location: 'sendEmailWithRetry',
				message: `${emailName} failed on attempt ${attempt}/${maxRetries}: ${lastError.message}`,
			});

			// If this was the last attempt, throw the error
			if (attempt === maxRetries) {
				await log({
					type: 'errors',
					location: 'sendEmailWithRetry',
					message: `${emailName} failed after ${maxRetries} attempts: ${lastError.message}`,
				});
				throw lastError;
			}

			// Wait before retrying with exponential backoff
			await new Promise(resolve => setTimeout(resolve, delay));
			delay *= backoffMultiplier;
		}
	}

	// This should never be reached, but TypeScript needs it
	throw lastError ?? new Error(`${emailName} failed unexpectedly`);
}

/**
 * Queue an email for retry in the background
 * This doesn't block the main operation if email fails
 */
export function queueEmailRetry<T>(
	emailFn: () => Promise<T>,
	emailName: string,
	options: RetryOptions = {},
): void {
	// Fire and forget - don't await this
	void sendEmailWithRetry(emailFn, emailName, options).catch(async error => {
		// Final failure is already logged in sendEmailWithRetry
		// Just ensure we don't have unhandled promise rejection
		await log({
			type: 'errors',
			location: 'queueEmailRetry',
			message: `${emailName} queued retry failed completely: ${error instanceof Error ? error.message : String(error)}`,
		});
	});
}

import type { Schema, z, ZodType } from 'zod/v4';
import { zGet, zPost } from '@barely/utils';

import { log } from '../../utils/log';
import { isRetryableSpotifyError, withRetry } from '../../utils/retry';

interface ZFetchProps<ErrorSchema extends Schema> {
	headers?: Record<string, string>;
	auth?: string;
	returnType?: 'json' | 'text' | 'xml';
	errorSchema?: ErrorSchema;
	logResponse?: boolean;
}

type ZFetchResponse<Schema extends ZodType, ErrorSchema extends ZodType> = {
	status: number;
	res: Response;
} & (
	| {
			success: true;
			parsed: true;
			data: z.infer<Schema>;
	  }
	| {
			success: true;
			parsed: false;
			data: unknown;
	  }
	| {
			success: false;
			parsed: true;
			data: z.infer<ErrorSchema>;
	  }
	| {
			success: false;
			parsed: false;
			data: unknown;
	  }
);

/**
 * Wrapper around zGet that adds retry logic for Spotify API calls
 */
export async function spotifyGet<Schema extends ZodType, ErrorSchema extends ZodType>(
	endpoint: string,
	schema: Schema,
	options?: ZFetchProps<ErrorSchema>,
): Promise<ZFetchResponse<Schema, ErrorSchema>> {
	return withRetry(() => zGet(endpoint, schema, options), {
		retries: 3,
		initialDelay: 1000,
		maxDelay: 10000,
		shouldRetry: error => {
			// Check if zGet threw an error
			if (error instanceof Error && error.message === 'zGet err') {
				return true;
			}

			// Check the response for retryable errors
			if (
				error &&
				typeof error === 'object' &&
				'status' in error &&
				'success' in error &&
				error.success === false
			) {
				return isRetryableSpotifyError(error);
			}

			return false;
		},
		onRetry: (error, attempt) => {
			void log({
				message: `Retrying Spotify API call to ${endpoint} (attempt ${attempt}/3): ${String(error)}`,
				type: 'logs',
				location: 'spotifyGet.retry',
			});
		},
	});
}

/**
 * Wrapper around zPost that adds retry logic for Spotify API calls
 */
export async function spotifyPost<Schema extends ZodType, ErrorSchema extends ZodType>(
	endpoint: string,
	schema: Schema,
	options: ZFetchProps<ErrorSchema> & { body?: object },
): Promise<ZFetchResponse<Schema, ErrorSchema>> {
	return withRetry(() => zPost(endpoint, schema, options), {
		retries: 3,
		initialDelay: 1000,
		maxDelay: 10000,
		shouldRetry: error => {
			// Check if zPost threw an error
			if (error instanceof Error && error.message === 'zPost err') {
				return true;
			}

			// Check the response for retryable errors
			if (
				error &&
				typeof error === 'object' &&
				'status' in error &&
				'success' in error &&
				error.success === false
			) {
				return isRetryableSpotifyError(error);
			}

			return false;
		},
		onRetry: (error, attempt) => {
			void log({
				message: `Retrying Spotify API POST to ${endpoint} (attempt ${attempt}/3): ${String(error)}`,
				type: 'logs',
				location: 'spotifyPost.retry',
			});
		},
	});
}

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

import { libEnv } from '../../../env';

// Re-export types that are used in the public API
export type { Ratelimit } from '@upstash/ratelimit';
export type { Redis } from '@upstash/redis';

// Initiate Redis instance by connecting to REST URL
export const redis = new Redis({
	url: libEnv.UPSTASH_REDIS_REST_URL || '',
	token: libEnv.UPSTASH_REDIS_REST_TOKEN || '',
});

// Create a new ratelimiter that allows 10 requests per 10 seconds by default

type RateLimitTime =
	| `${number} ms`
	| `${number} s`
	| `${number} m`
	| `${number} h`
	| `${number} d`;

export function ratelimit(requests = 10, seconds: RateLimitTime = '10 s') {
	if (!libEnv.UPSTASH_REDIS_REST_URL || !libEnv.UPSTASH_REDIS_REST_TOKEN) {
		console.log('no redis url or token, returning dummy ratelimiter');

		return {
			limit: () => ({
				success: true,
				limit: 10,
				remaining: 10,
				reset: 0,
				retryAfter: 0,
			}),
		};
	}

	return new Ratelimit({
		redis: Redis.fromEnv(),
		limiter: Ratelimit.slidingWindow(requests, seconds),
		analytics: true,
		/**
		 * Optional prefix for the keys used in redis. This is useful if you want to share a redis
		 * instance with other applications and want to avoid key collisions. The default prefix is
		 * "@upstash/ratelimit"
		 */
		prefix: '@upstash/ratelimit',
	});
}

/**
 * Session-based rate limiting for more accurate user tracking
 * Uses sessionId as primary key, falls back to IP if no session
 */
export function sessionRatelimit(
	requests = 1,
	window: RateLimitTime = '1 h',
	sessionId?: string | null,
	ipAddress?: string | null,
) {
	// Use sessionId if available, otherwise fall back to IP
	const identifier = sessionId ?? ipAddress ?? 'unknown';

	if (!libEnv.UPSTASH_REDIS_REST_URL || !libEnv.UPSTASH_REDIS_REST_TOKEN) {
		console.log('no redis url or token, returning dummy session ratelimiter');

		return {
			limit: () => ({
				success: true,
				limit: requests,
				remaining: requests,
				reset: 0,
				retryAfter: 0,
			}),
			identifier,
		};
	}

	const limiter = new Ratelimit({
		redis: Redis.fromEnv(),
		limiter: Ratelimit.slidingWindow(requests, window),
		analytics: true,
		prefix: '@upstash/session-ratelimit',
	});

	return {
		limit: (key: string) => limiter.limit(`${key}:${identifier}`),
		identifier,
	};
}

/**
 * Recording metatags that were generated via link.getMetaTags
 * If there's an error, it will be logged to a separate redist list for debugging
 */

export async function recordMetatags(url: string, error: boolean) {
	return await redis.lpush(error ? 'metatags-errors' : 'metatags', {
		url,
	});
}

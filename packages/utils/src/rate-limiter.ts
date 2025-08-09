import { RateLimiter as TokenBucketRateLimiter } from 'limiter';

export interface RateLimiterOptions {
	tokensPerInterval: number;
	interval: 'second' | 'minute' | 'hour' | 'day';
	fireImmediately?: boolean;
}

export class RateLimiter {
	private limiter: TokenBucketRateLimiter;
	private tokensPerInterval: number;

	constructor(options: RateLimiterOptions) {
		this.tokensPerInterval = options.tokensPerInterval;
		this.limiter = new TokenBucketRateLimiter({
			tokensPerInterval: options.tokensPerInterval,
			interval: options.interval,
			fireImmediately: options.fireImmediately ?? true,
		});
	}

	async checkLimit(tokens = 1): Promise<void> {
		const remainingRequests = await this.limiter.removeTokens(tokens);

		if (remainingRequests < 0) {
			// Calculate wait time based on the deficit and rate
			const waitTime = this.calculateWaitTime(Math.abs(remainingRequests));
			await new Promise(resolve => setTimeout(resolve, waitTime));
		}
	}

	async checkBatchLimit(count: number): Promise<void> {
		return this.checkLimit(count);
	}

	private calculateWaitTime(deficit: number): number {
		// Convert interval to milliseconds
		const intervalMs = this.getIntervalMs();
		// Calculate how long to wait based on the token deficit
		return (deficit * intervalMs) / this.tokensPerInterval;
	}

	private getIntervalMs(): number {
		// The 'limiter' package uses these intervals
		return 1000; // For 'second' interval
	}
}

// Factory function for creating rate limiters with common presets
export function createRateLimiter(options: RateLimiterOptions): RateLimiter {
	return new RateLimiter(options);
}

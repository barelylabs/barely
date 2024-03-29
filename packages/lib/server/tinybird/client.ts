import { z } from 'zod';

import type { PipeErrorResponse } from './util';
import { eventIngestReponseData, pipeResponseWithoutData } from './util';

export type IngestEndpoint<TOutput extends Record<string, unknown>, TInput = TOutput> = (
	events: TInput | TInput[],
) => Promise<z.infer<typeof eventIngestReponseData>>;

export class Tinybird {
	private readonly baseUrl: string;
	private readonly token: string;

	constructor(opts: { token: string; baseUrl?: string }) {
		this.baseUrl = opts.baseUrl ?? 'https://api.us-east.tinybird.co';
		this.token = opts.token;
	}

	private async fetch(
		pipe: string,
		parameters: Record<string, unknown> = {},
		opts?: { cache?: RequestCache; revalidate?: number },
	): Promise<unknown> {
		const url = new URL(`/v0/pipes/${pipe}.json`, this.baseUrl);
		for (const [key, value] of Object.entries(parameters)) {
			if (typeof value === 'undefined' || value === null) {
				continue;
			}
			const stringValue =
				value !== null && typeof value === 'object'
					? JSON.stringify(value)
					: String(value);
			url.searchParams.set(key, stringValue);
		}
		console.log('fetchUrl => ', url.href);
		const res = await fetch(url, {
			headers: {
				Authorization: `Bearer ${this.token}`,
			},
			cache: opts?.cache,

			next: {
				revalidate: opts?.revalidate,
			},
		});
		if (!res.ok) {
			const error = (await res.json()) as PipeErrorResponse;
			throw new Error(error.error);
		}
		const body = (await res.json()) as unknown;

		return body;
	}

	public buildPipe<
		TParameters extends Record<string, unknown>,
		TData extends Record<string, unknown>,
	>(req: {
		pipe: string;
		parameters?: z.ZodSchema<TParameters>;
		// rome-ignore lint/suspicious/noExplicitAny: <explanation>
		data: z.ZodSchema<TData, z.ZodTypeDef, unknown>;

		opts?: {
			logParams?: boolean;
			cache?: RequestCache;
			/**
			 * Number of seconds to revalidate the cache
			 */
			revalidate?: number;
		};
	}): (
		params: TParameters,
	) => Promise<z.infer<typeof pipeResponseWithoutData> & { data: TData[] }> {
		const outputSchema = pipeResponseWithoutData.setKey('data', z.array(req.data));
		return async (params: TParameters) => {
			let validatedParams: TParameters | undefined = undefined;
			if (req.parameters) {
				const v = req.parameters.safeParse(params);
				if (!v.success) {
					throw new Error(v.error.message);
				}
				validatedParams = v.data;
			}

			if (req.opts?.logParams) console.log('validatedParams => ', validatedParams);

			const res = await this.fetch(req.pipe, validatedParams, req.opts);
			const validatedResponse = outputSchema.safeParse(res);
			if (!validatedResponse.success) {
				throw new Error(validatedResponse.error.message);
			}

			return validatedResponse.data;
		};
	}

	public buildIngestEndpoint<
		TOutput extends Record<string, unknown>,
		TInput = TOutput,
	>(req: {
		datasource: string;
		event: z.ZodSchema<TOutput, z.ZodTypeDef, TInput>;
	}): IngestEndpoint<TOutput, TInput> {
		return async (events: TInput | TInput[]) => {
			let validatedEvents: TOutput | TOutput[] | undefined = undefined;
			if (req.event) {
				const v = Array.isArray(events)
					? req.event.array().safeParse(events)
					: req.event.safeParse(events);
				if (!v.success) {
					throw new Error(v.error.message);
				}
				validatedEvents = v.data;
			}

			const url = new URL('/v0/events', this.baseUrl);
			url.searchParams.set('name', req.datasource);

			const body = (Array.isArray(validatedEvents) ? validatedEvents : [validatedEvents])
				.map(p => JSON.stringify(p))
				.join('\n');

			// console.log("body => ", body);

			let res = await fetch(url, {
				method: 'POST',
				body,
				headers: { Authorization: `Bearer ${this.token}` },
			});

			/**
			 * Add one retry in case of 429 ratelimit response
			 */
			if (res.status === 429) {
				const limit = res.headers.get('X-RateLimit-Limit');
				const remaining = res.headers.get('X-RateLimit-Remaining');
				const reset = res.headers.get('X-RateLimit-Reset');
				const retryAfter = res.headers.get('Retry-After');
				console.warn(`Hit Tinybird ratelimit: ${url.href}`, {
					limit,
					remaining,
					reset,
					retryAfter,
				});

				await new Promise(r => setTimeout(r, retryAfter ? parseInt(retryAfter) : 1000));
				res = await fetch(url, {
					method: 'POST',
					body,
					headers: { Authorization: `Bearer ${this.token}` },
				});
			}

			if (!res.ok) {
				throw new Error(
					`Unable to ingest to ${req.datasource}: [${res.status}] ${await res.text()}`,
				);
			}

			const validatedResponse = eventIngestReponseData.safeParse(await res.json());

			if (!validatedResponse.success) {
				throw new Error(validatedResponse.error.message);
			}

			return validatedResponse.data;
		};
	}
}

export const tinybird = new Tinybird({
	token: process.env.TINYBIRD_API_KEY ?? '',
});

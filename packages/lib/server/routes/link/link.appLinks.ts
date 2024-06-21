import type { FollowOptions, ResponseDetails } from 'follow-redirects';
import type { RequestOptions } from 'https';
import { eq } from 'drizzle-orm';
import { http, https } from 'follow-redirects';

import { dbHttp } from '../../db';
import { Links } from './link.sql';

export function getDiceAppLinkUrl({ url, linkId }: { url: string; linkId: string }) {
	const client = url.startsWith('https') ? https : http;

	const options: RequestOptions & FollowOptions<RequestOptions> = {
		headers: {
			'User-Agent':
				'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3 like Mac OS X) AppleWebKit/602.1.50 (KHTML, like Gecko) CriOS/56.0.2924.75 Mobile/14E5239e Safari/602.1',
			Accept:
				'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
			'Accept-Language': 'en-US,en;q=0.5',
		},
		beforeRedirect: (
			options: FollowOptions<RequestOptions>,
			response: ResponseDetails,
		) => {
			const nextUrl = response.headers.location as unknown;

			if (typeof nextUrl === 'string' && nextUrl.includes('agzl.app.link')) {
				console.log('setting app link', nextUrl);

				dbHttp
					.update(Links)
					.set({ externalAppLinkUrl: nextUrl })
					.where(eq(Links.id, linkId))
					.then(() => {
						console.log('updated app link url');
						return nextUrl;
					})
					.catch(err => {
						console.error('error updating app link url', err);
						return null;
					});
			}
		},
	};

	return new Promise((resolve, reject) => {
		const req = client.get(url, options, res => {
			console.log('final destination', res.responseUrl);
			resolve(res.responseUrl);
		});

		req.on('error', err => {
			console.error(err);
			reject(err);
		});

		req.end();
	});
}

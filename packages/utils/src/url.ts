import type { Metadata } from 'next';
import { ccTLDs, SECOND_LEVEL_DOMAINS, SPECIAL_APEX_DOMAINS } from '@barely/const';
import { parse } from 'node-html-parser';

export function parseInstagramLink(link: string) {
	const match = /https?:\/\/(?:www\.)?instagram\.com\/([^/?]+)/.exec(link);

	if (!match) {
		return null;
	}

	return {
		username: match[1],
	};
}

export function parseTikTokLink(link: string) {
	const match = /https?:\/\/(?:www\.)?tiktok\.com\/@([^/?]+)/.exec(link);

	if (!match) {
		return null;
	}

	return {
		username: match[1],
	};
}

export function parseYoutubeLink(link: string) {
	const match =
		/https?:\/\/(?:www\.)?(youtube\.com|youtu\.be)\/(channel|user|watch)\/?([^?]*).*/.exec(
			link,
		);

	if (!match) {
		return null;
	}

	return {
		type: match[2],
		id: match[3],
	};
}

export function parseSpotifyUrl(url: string) {
	const match =
		/https?:\/\/open\.spotify\.com\/(artist|track|album|playlist)\/([a-zA-Z0-9]+)/.exec(
			url,
		);

	if (!match) {
		return null;
	}

	return {
		type: match[1],
		id: match[2],
	};
}

export function getSpotifyPlaylistTrackDeeplink({
	playlistUrl,
	trackUrl,
}: {
	playlistUrl: string;
	trackUrl: string;
}) {
	// we have a playlist url in this format: https://open.spotify.com/playlist/4mW0Wo6gMrE0K8iALUCByK?si=26c13373e28944b8
	// we have a track url in this format: https://open.spotify.com/track/5nYrALRnMuqCeqXl2oK2qh?si=26c13373e28944b8
	// we want to return a deeplink in this format: https://open.spotify.com/track/5nYrALRnMuqCeqXl2oK2qh?context=spotify:playlist:4mW0Wo6gMrE0K8iALUCByK?si=

	const parsedPlaylistLink = parseSpotifyUrl(playlistUrl);
	const parsedTrackLink = parseSpotifyUrl(trackUrl);

	if (!parsedPlaylistLink || !parsedTrackLink) {
		return null;
	}

	return `https://open.spotify.com/track/${parsedTrackLink.id}?context=spotify:playlist:${parsedPlaylistLink.id}`;
}

// export function getShortLinkUrlFromLink({
// 	domain,
// 	key,
// }: {
// 	domain: string;
// 	key: string;
// }) {
// 	if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
// 		return `${process.env.NEXT_PUBLIC_LINK_BASE_URL}/${key}?domain=${domain}`;
// 	}
// 	return `https://${domain}/${key}`;
// }

export function constructMetadata({
	title = `barely.link - Link Management for Modern Marketing Teams`,
	description = `barely.link is the open-source link management infrastructure for modern marketing teams to create, share, and track short links.`,
	image = 'https://app.barely.ai/_static/thumbnail.png',
	icons = [
		{
			rel: 'apple-touch-icon',
			sizes: '32x32',
			url: '/apple-touch-icon.png',
		},
		{
			rel: 'icon',
			type: 'image/png',
			sizes: '32x32',
			url: '/favicon-32x32.png',
		},
		{
			rel: 'icon',
			type: 'image/png',
			sizes: '16x16',
			url: '/favicon-16x16.png',
		},
	],
	noIndex = false,
}: {
	title?: string;
	description?: string;
	image?: string;
	icons?: Metadata['icons'];
	noIndex?: boolean;
} = {}): Metadata {
	return {
		title,
		description,
		openGraph: {
			title,
			description,
			images: [
				{
					url: image,
				},
			],
		},
		twitter: {
			card: 'summary_large_image',
			title,
			description,
			images: [image],
			creator: '@dubdotco',
		},
		icons,
		metadataBase: new URL(process.env.NEXT_PUBLIC_APP_BASE_URL ?? ''),
		...(noIndex && {
			robots: {
				index: false,
				follow: false,
			},
		}),
	};
}

export async function getHtml(url: string) {
	try {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 5000); // timeout if request takes longer than 5 seconds
		const response = await fetch(url, {
			signal: controller.signal,
			headers: {
				'User-Agent': 'barely-bot/1.0',
			},
		});
		clearTimeout(timeoutId);
		return await response.text();
	} catch (error) {
		if ((error as Error).name === 'AbortError') {
			console.log('Fetch request aborted due to timeout');
		} else {
			console.error('Fetch request failed:', error);
		}
		return null;
	}
}

export function getHeadChildNodes(html: string) {
	const ast = parse(html); // parse the html into an abstract syntax tree w/ node-html-parser

	const metaTags = ast.querySelectorAll('meta').map(({ attributes }) => {
		const property = attributes.property ?? attributes.name ?? attributes.href;

		return {
			property,
			content: attributes.content,
		};
	});

	const title = ast.querySelector('title')?.innerText;
	const linkTags = ast.querySelectorAll('link').map(({ attributes }) => {
		const { rel, href } = attributes;
		return {
			rel,
			href,
		};
	});

	return { metaTags, title, linkTags };
}

export function getRelativeUrl(url: string, imageUrl: string | null | undefined) {
	if (!imageUrl) {
		return null;
	}

	if (isValidUrl(imageUrl)) {
		return imageUrl;
	}

	const { protocol, host } = new URL(url);
	const baseUrl = `${protocol}//${host}`;
	return new URL(imageUrl, baseUrl).toString();
}

export function isDomainName(domain: string) {
	const domainRegex = /^([a-z\d]([a-z\d-]*[a-z\d])*\.)+[a-z]{2,}$/i;
	return domainRegex.test(domain);
}

export function isValidUrl(url: string | undefined | null) {
	if (!url) return false;

	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
}

export function getDomainWithoutWWW(url: string) {
	if (isValidUrl(url)) {
		return new URL(url).hostname.replace(/^www\./, '');
	}

	const hostnameRegex =
		/^(([a-z\d]([a-z\d-]*[a-z\d])*)\.)+([a-z]{2,}|d{1,3})(:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(#[-a-z\d_]*)?$/i;

	const isValidHostname = hostnameRegex.test(url);

	if (!isValidHostname) {
		return null;
	}

	console.log('isValidUrl!');

	try {
		if (url.includes('.') && !url.includes(' ')) {
			return new URL(`https://${url}`).hostname.replace(/^www\./, '');
		}
	} catch {
		return null;
	}

	return null;
}

export const paramsMetadata = [
	{ display: 'Referral (ref)', key: 'ref', examples: 'twitter, facebook' },
	{ display: 'UTM Source', key: 'utm_source', examples: 'twitter, facebook' },
	{ display: 'UTM Medium', key: 'utm_medium', examples: 'social, email' },
	{ display: 'UTM Campaign', key: 'utm_campaign', examples: 'summer_sale' },
	{ display: 'UTM Term', key: 'utm_term', examples: 'blue_shoes' },
	{ display: 'UTM Content', key: 'utm_content', examples: 'logolink' },
];

export function getUrlWithoutUTMParams(url: string) {
	try {
		const newUrl = new URL(url);
		paramsMetadata.forEach(params => newUrl.searchParams.delete(params.key));
		return newUrl.toString();
	} catch {
		return url;
	}
}

export const trackingParams = ['si'];

export function getUrlWithoutTrackingParams(url: string) {
	try {
		const newUrl = new URL(url);
		trackingParams.forEach(params => newUrl.searchParams.delete(params));
		return newUrl.toString();
	} catch {
		return url;
	}
}

export function getApexDomain(url: string) {
	let domain;
	try {
		// Check if input is a valid URL
		if (isValidUrl(url) && !isDomainName(url)) {
			// replace any custom scheme (e.g. notion://) with https://
			// use the URL constructor to get the hostname
			domain = new URL(url.replace(/^[a-zA-Z]+:\/\//, 'https://')).hostname;
		} else {
			// If input is not a valid URL, treat it as a domain
			domain = url;
		}
	} catch {
		// if the URL constructor fails, the url is invalid
		return '';
	}
	if (domain === 'youtu.be') return 'youtube.com';
	if (domain === 'open.spotify.com') return 'spotify.com';
	if (domain === 'raw.githubusercontent.com') return 'github.com';

	const parts = domain.split('.');
	if (parts.length > 2) {
		if (
			// if this is a second-level TLD (e.g. co.uk, .com.ua, .org.tt), we need to return the last 3 parts
			(SECOND_LEVEL_DOMAINS.has(parts[parts.length - 2] ?? '') &&
				ccTLDs.has(parts[parts.length - 1] ?? '')) ||
			// if it's a special subdomain for website builders (e.g. weathergpt.vercel.app/)
			SPECIAL_APEX_DOMAINS.has(parts.slice(-2).join('.'))
		) {
			return parts.slice(-3).join('.');
		}

		// otherwise, it's a subdomain (app.barely.ai), so return the last 2 parts
		return parts.slice(-2).join('.');
	}
	// if it's a normal domain (e.g. barely.ai), we return the full domain
	return domain;
}

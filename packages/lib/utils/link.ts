import { Metadata } from 'next';
import { parse } from 'node-html-parser';

import { Link, LinkMetaTags } from '../server/link.schema';
import {
	ccTLDs,
	GOOGLE_FAVICON_URL,
	HOME_DOMAIN,
	LINK_ABSOLUTE_BASE_URL,
	SECOND_LEVEL_DOMAINS,
	SPECIAL_APEX_DOMAINS,
} from './constants';
import { convertToHandle } from './handle';

export function getShortLinkUrlFromLink(link: Link) {
	if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
		return `${LINK_ABSOLUTE_BASE_URL}/${link.key}?domain=${link.domain}`;
	}
	return `https://${link.domain}/${link.key}`;
}

export function getAppAndAppRouteFromUrl(url: string) {
	// {handle}.barely.link/app -OR- {handle}.barely.link/{app}/{appRoute}/{appId}

	// an example url: https://open.spotify.com/artist/7ukNuZ9893467DP0KV6NHA?si=4NxdFI70Q0S8b6bu_wWl5A&ref=twitter
	// in this case, the app would be 'spotify', the appRoute would be 'artist', and the appId would be '7ukNuZ9893467DP0KV6NHA'

	// an example url: https://www.youtube.com/watch?v=9bZkp7q19f0
	// in this case, the app would be 'youtube', the appRoute would be 'watch', and the appId would be '9bZkp7q19f0'

	// an example url: https://www.youtube.com/channel/UC-lHJZR3Gqxm24_Vd_AJ5Yw
	// in this case, the app would be 'youtube', the appRoute would be 'channel', and the appId would be 'UC-lHJZR3Gqxm24_Vd_AJ5Yw'

	if (!isValidUrl(url)) return null;

	// get the domain of the url (e.g. 'youtube.com' or 'open.spotify.com')
	const domain = getDomainWithoutWWW(url);

	if (!domain) {
		return null;
	}

	// get the path of the url (e.g. '/watch?v=9bZkp7q19f0' or '/artist/7ukNuZ9893467DP0KV6NHA') and remove any search params
	const urlObject = new URL(url);
	const pathname = urlObject.pathname + urlObject.search;
	const appRoute = pathname.length > 1 ? getUrlWithoutUTMParams(pathname.slice(1)) : '';

	// get the app from the domain (e.g. 'youtube' or 'spotify')
	let app: string;

	switch (true) {
		case domain.includes('open.spotify'):
			app = 'spotify';
			break;

		case domain.includes('youtube') || domain.includes('youtu.be'):
			app = 'youtube';
			break;

		default:
			app = convertToHandle(domain);
	}

	return {
		app,
		appRoute,
	};
}

export async function getMetaTags(url: string): Promise<LinkMetaTags> {
	const html = await getHtml(url);

	if (!html) {
		return {
			title: url,
			description: 'No description',
			image: null,
			favicon: null,
		};
	}

	const { metaTags, title: titleTag, linkTags } = getHeadChildNodes(html);

	const object: { [key: string]: string } = {};

	for (const k of metaTags) {
		if (k) {
			const { property, content } = k;

			if (property && content) {
				object[property] = content;
			}
		}
	}

	for (const m of linkTags) {
		if (m) {
			const { rel, href } = m;

			if (rel && href) {
				object[rel] = href;
			}
		}
	}

	const title = object['og:title'] || object['twitter:title'] || titleTag;

	const description =
		object['description'] ||
		object['og:description'] ||
		object['twitter:description'] ||
		'No description';

	const image =
		object['og:image'] ||
		object['twitter:image'] ||
		object['image_src'] ||
		object['icon'] ||
		object['shortcut icon'];

	const favicon = `${GOOGLE_FAVICON_URL}${getApexDomain(url)}`;

	return {
		title: title ?? url,
		description: description ?? 'No description',
		image: getRelativeUrl(url, image),
		favicon,
	};
}

export function constructMetadata({
	title = `barely.link - Link Management for Modern Marketing Teams`,
	description = `barely.link is the open-source link management infrastructure for modern marketing teams to create, share, and track short links.`,
	image = 'https://app.barely.io/_static/thumbnail.png',
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
		metadataBase: new URL(HOME_DOMAIN),
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
		const property = attributes.property || attributes.name || attributes.href;

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
	} catch (e) {
		// if it's not a valid URL, check if it's a valid hostname
		// console.log('is valid url error', e);
		// const hostnameRegex =
		// 	/^(([a-z\d]([a-z\d-]*[a-z\d])*)\.)+([a-z]{2,}|d{1,3})(:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(#[-a-z\d_]*)?$/i;

		// const isValidHostname = hostnameRegex.test(url);

		// console.log('isValidHostname for url', url, isValidHostname);
		// if (isValidHostname) {
		// 	console.log('returning true');
		// 	return true;
		// }
		return false;
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
	} catch (e) {
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
			(SECOND_LEVEL_DOMAINS.has(parts[parts.length - 2]!) &&
				ccTLDs.has(parts[parts.length - 1]!)) ||
			// if it's a special subdomain for website builders (e.g. weathergpt.vercel.app/)
			SPECIAL_APEX_DOMAINS.has(parts.slice(-2).join('.'))
		) {
			return parts.slice(-3).join('.');
		}

		// otherwise, it's a subdomain (app.barely.io), so return the last 2 parts
		return parts.slice(-2).join('.');
	}
	// if it's a normal domain (e.g. barely.io), we return the full domain
	return domain;
}

export function getDomainWithoutWWW(url: string) {
	// console.log('checking if url is valid', url);
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
	} catch (error) {
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
	} catch (error) {
		return url;
	}
}

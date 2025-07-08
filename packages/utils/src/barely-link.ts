import type { SessionWorkspace } from '@barely/auth';
import type { Link, LinkMetaTags } from '@barely/validators/schemas';
import { GOOGLE_FAVICON_URL } from '@barely/const';

import { utilsEnv } from '../env';
import {
	getApexDomain,
	getDomainWithoutWWW,
	getHeadChildNodes,
	getHtml,
	getRelativeUrl,
	getUrlWithoutUTMParams,
	isValidUrl,
} from './url';

export function getShortLinkUrlFromLink(link: Link) {
	if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
		return `${utilsEnv.NEXT_PUBLIC_LINK_BASE_URL}/${link.key}?domain=${link.domain}`;
	}
	return `https://${link.domain}/${link.key}`;
}

export type TransparentLinkData = ReturnType<typeof getTransparentLinkDataFromUrl>;

export function getTransparentLinkDataFromUrl(url: string, workspace: SessionWorkspace) {
	if (!isValidUrl(url)) {
		console.log('url is not valid');
		return null;
	}

	// get the domain of the url (e.g. 'youtube.com' or 'open.spotify.com')
	const domain = getDomainWithoutWWW(url);

	if (!domain) {
		console.log('domain is not valid');
		return null;
	}

	// get the path of the url (e.g. '/watch?v=9bZkp7q19f0' or '/artist/7ukNuZ9893467DP0KV6NHA') and remove any search params

	const urlObject = new URL(url);

	let app: string;
	const pathname = urlObject.pathname;
	const searchParams = urlObject.searchParams;

	switch (true) {
		case domain.includes('open.spotify'): {
			app = 'spotify';
			searchParams.delete('si');
			console.log('wsSpotArtistId', workspace.spotifyArtistId);
			break;
		}

		// todo - handle youtube cases with channels & videos (we need to handle search params. it makes parsing too hard if some search params are part of the appRoute)
		// case domain.includes('youtube') || domain.includes('youtu.be'):
		// 	app = 'youtube';
		// 	break;

		default: {
			// app = convertToHandle(domain);
			return null;
		}
	}

	const path = pathname + searchParams.toString();

	const appRoute = path.length > 1 ? getUrlWithoutUTMParams(path.slice(1)) : null;

	const transparentLink = `${workspace.handle}.barely.link/${app}${appRoute ? `/${appRoute}` : ''}`;

	return {
		app,
		appRoute,
		transparentLink,
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

	const object: Record<string, string> = {};

	for (const k of metaTags) {
		const { property, content } = k;

		if (property && content) {
			object[property] = content;
		}
	}

	for (const m of linkTags) {
		const { rel, href } = m;

		if (rel && href) {
			object[rel] = href;
		}
	}

	const title = object['og:title'] ?? object['twitter:title'] ?? titleTag;

	const description =
		object.description ??
		object['og:description'] ??
		object['twitter:description'] ??
		'No description';

	const image =
		object['og:image'] ??
		object['twitter:image'] ??
		object.image_src ??
		object.icon ??
		object['shortcut icon'];

	const favicon = `${GOOGLE_FAVICON_URL}${getApexDomain(url)}`;

	return {
		title: title ?? url,
		description: description,
		image: getRelativeUrl(url, image),
		favicon,
	};
}

// export function constructMetadata({
// 	title = `barely.link - Link Management for Modern Marketing Teams`,
// 	description = `barely.link is the open-source link management infrastructure for modern marketing teams to create, share, and track short links.`,
// 	image = 'https://app.barely.io/_static/thumbnail.png',
// 	icons = [
// 		{
// 			rel: 'apple-touch-icon',
// 			sizes: '32x32',
// 			url: '/apple-touch-icon.png',
// 		},
// 		{
// 			rel: 'icon',
// 			type: 'image/png',
// 			sizes: '32x32',
// 			url: '/favicon-32x32.png',
// 		},
// 		{
// 			rel: 'icon',
// 			type: 'image/png',
// 			sizes: '16x16',
// 			url: '/favicon-16x16.png',
// 		},
// 	],
// 	noIndex = false,
// }: {
// 	title?: string;
// 	description?: string;
// 	image?: string;
// 	icons?: Metadata['icons'];
// 	noIndex?: boolean;
// } = {}): Metadata {
// 	return {
// 		title,
// 		description,
// 		openGraph: {
// 			title,
// 			description,
// 			images: [
// 				{
// 					url: image,
// 				},
// 			],
// 		},
// 		twitter: {
// 			card: 'summary_large_image',
// 			title,
// 			description,
// 			images: [image],
// 			creator: '@dubdotco',
// 		},
// 		icons,
// 		metadataBase: new URL(env.NEXT_PUBLIC_APP_BASE_URL),
// 		...(noIndex && {
// 			robots: {
// 				index: false,
// 				follow: false,
// 			},
// 		}),
// 	};
// }

// export async function getHtml(url: string) {
// 	try {
// 		const controller = new AbortController();
// 		const timeoutId = setTimeout(() => controller.abort(), 5000); // timeout if request takes longer than 5 seconds
// 		const response = await fetch(url, {
// 			signal: controller.signal,
// 			headers: {
// 				'User-Agent': 'barely-bot/1.0',
// 			},
// 		});
// 		clearTimeout(timeoutId);
// 		return await response.text();
// 	} catch (error) {
// 		if ((error as Error).name === 'AbortError') {
// 			console.log('Fetch request aborted due to timeout');
// 		} else {
// 			console.error('Fetch request failed:', error);
// 		}
// 		return null;
// 	}
// }

// export function getHeadChildNodes(html: string) {
// 	const ast = parse(html); // parse the html into an abstract syntax tree w/ node-html-parser

// 	const metaTags = ast.querySelectorAll('meta').map(({ attributes }) => {
// 		const property = attributes.property ?? attributes.name ?? attributes.href;

// 		return {
// 			property,
// 			content: attributes.content,
// 		};
// 	});

// 	const title = ast.querySelector('title')?.innerText;
// 	const linkTags = ast.querySelectorAll('link').map(({ attributes }) => {
// 		const { rel, href } = attributes;
// 		return {
// 			rel,
// 			href,
// 		};
// 	});

// 	return { metaTags, title, linkTags };
// }

// export function getRelativeUrl(url: string, imageUrl: string | null | undefined) {
// 	if (!imageUrl) {
// 		return null;
// 	}

// 	if (isValidUrl(imageUrl)) {
// 		return imageUrl;
// 	}

// 	const { protocol, host } = new URL(url);
// 	const baseUrl = `${protocol}//${host}`;
// 	return new URL(imageUrl, baseUrl).toString();
// }

// export function isDomainName(domain: string) {
// 	const domainRegex = /^([a-z\d]([a-z\d-]*[a-z\d])*\.)+[a-z]{2,}$/i;
// 	return domainRegex.test(domain);
// }

// export function isValidUrl(url: string | undefined | null) {
// 	if (!url) return false;

// 	try {
// 		new URL(url);
// 		return true;
// 	} catch {
// 		// if it's not a valid URL, check if it's a valid hostname
// 		// console.log('is valid url error', e);
// 		// const hostnameRegex =
// 		// 	/^(([a-z\d]([a-z\d-]*[a-z\d])*)\.)+([a-z]{2,}|d{1,3})(:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(#[-a-z\d_]*)?$/i;

// 		// const isValidHostname = hostnameRegex.test(url);

// 		// console.log('isValidHostname for url', url, isValidHostname);
// 		// if (isValidHostname) {
// 		// 	console.log('returning true');
// 		// 	return true;
// 		// }
// 		return false;
// 	}
// }

// export function getDomainWithoutWWW(url: string) {
// 	// console.log('checking if url is valid', url);
// 	if (isValidUrl(url)) {
// 		return new URL(url).hostname.replace(/^www\./, '');
// 	}

// 	const hostnameRegex =
// 		/^(([a-z\d]([a-z\d-]*[a-z\d])*)\.)+([a-z]{2,}|d{1,3})(:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(#[-a-z\d_]*)?$/i;

// 	const isValidHostname = hostnameRegex.test(url);

// 	if (!isValidHostname) {
// 		return null;
// 	}

// 	console.log('isValidUrl!');

// 	try {
// 		if (url.includes('.') && !url.includes(' ')) {
// 			return new URL(`https://${url}`).hostname.replace(/^www\./, '');
// 		}
// 	} catch {
// 		return null;
// 	}

// 	return null;
// }

// export const paramsMetadata = [
// 	{ display: 'Referral (ref)', key: 'ref', examples: 'twitter, facebook' },
// 	{ display: 'UTM Source', key: 'utm_source', examples: 'twitter, facebook' },
// 	{ display: 'UTM Medium', key: 'utm_medium', examples: 'social, email' },
// 	{ display: 'UTM Campaign', key: 'utm_campaign', examples: 'summer_sale' },
// 	{ display: 'UTM Term', key: 'utm_term', examples: 'blue_shoes' },
// 	{ display: 'UTM Content', key: 'utm_content', examples: 'logolink' },
// ];

// export function getUrlWithoutUTMParams(url: string) {
// 	try {
// 		const newUrl = new URL(url);
// 		paramsMetadata.forEach(params => newUrl.searchParams.delete(params.key));
// 		return newUrl.toString();
// 	} catch {
// 		return url;
// 	}
// }

// export const trackingParams = ['si'];

// export function getUrlWithoutTrackingParams(url: string) {
// 	try {
// 		const newUrl = new URL(url);
// 		trackingParams.forEach(params => newUrl.searchParams.delete(params));
// 		return newUrl.toString();
// 	} catch {
// 		return url;
// 	}
// }

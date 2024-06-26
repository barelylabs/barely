import { env } from '../env';
import { raise } from './raise';

const apps = ['app', 'bio', 'cart', 'fm', 'link', 'page', 'press', 'www'] as const;

export function getBaseUrl(app: (typeof apps)[number], absolute = false) {
	if (!absolute && typeof window !== 'undefined') return ''; // browser should use relative url

	const currentApp = env.NEXT_PUBLIC_CURRENT_APP;

	const vercelEnv =
		process.env.VERCEL_ENV ??
		process.env.NEXT_PUBLIC_VERCEL_ENV ??
		raise('getBaseUrl :: VERCEL_ENV not found');

	if (vercelEnv === 'development') {
		let devPort;
		switch (app) {
			case 'app':
				devPort =
					env.NEXT_PUBLIC_APP_DEV_PORT ?? raise('NEXT_PUBLIC_APP_DEV_PORT not found');
				break;
			case 'bio':
				devPort =
					env.NEXT_PUBLIC_BIO_DEV_PORT ?? raise('NEXT_PUBLIC_BIO_DEV_PORT not found');
				break;
			case 'cart':
				devPort =
					env.NEXT_PUBLIC_CART_DEV_PORT ?? raise('NEXT_PUBLIC_CART_DEV_PORT not found');
				break;
			case 'fm':
				devPort =
					env.NEXT_PUBLIC_FM_DEV_PORT ?? raise('NEXT_PUBLIC_FM_DEV_PORT not found');
				break;
			case 'link':
				devPort =
					env.NEXT_PUBLIC_LINK_DEV_PORT ?? raise('NEXT_PUBLIC_LINK_DEV_PORT not found');
				break;
			case 'page':
				devPort =
					env.NEXT_PUBLIC_PAGE_DEV_PORT ?? raise('NEXT_PUBLIC_PAGE_DEV_PORT not found');
				break;
			case 'press':
				devPort =
					env.NEXT_PUBLIC_PRESS_DEV_PORT ?? raise('NEXT_PUBLIC_PRESS_DEV_PORT not found');
				break;
			case 'www':
				devPort =
					env.NEXT_PUBLIC_WWW_DEV_PORT ?? raise('NEXT_PUBLIC_WWW_DEV_PORT not found');
				break;
			default:
				raise('Invalid app');
		}

		return `https://${app === 'app' ? '127.0.0.1' : 'localhost'}:${devPort}`; // dev SSR should use localhost
	}

	const vercelUrl =
		process.env.VERCEL_URL ??
		process.env.NEXT_PUBLIC_VERCEL_URL ??
		raise('getBaseUrl :: VERCEL_URL not found');

	let baseUrl;
	switch (app) {
		case 'app':
			baseUrl = env.NEXT_PUBLIC_APP_BASE_URL;
			break;
		case 'link':
			baseUrl = env.NEXT_PUBLIC_LINK_BASE_URL;
			break;
		case 'page':
			baseUrl = env.NEXT_PUBLIC_PAGE_BASE_URL;
			break;
		case 'www':
			baseUrl = env.NEXT_PUBLIC_WWW_BASE_URL;
			break;
		case 'bio':
			baseUrl = env.NEXT_PUBLIC_BIO_BASE_URL;
			break;
		case 'cart':
			baseUrl = env.NEXT_PUBLIC_CART_BASE_URL;
			break;
		case 'press':
			baseUrl = env.NEXT_PUBLIC_PRESS_BASE_URL;
			break;
		default:
			raise('Invalid app');
	}
	if (vercelEnv === 'preview') {
		const previewBaseUrl = app === currentApp ? vercelUrl : baseUrl;
		return `https://${previewBaseUrl}`; // SSR should use vercel url
	}

	if (vercelEnv === 'production') {
		return `https://${baseUrl}`;
	}

	return raise('getBaseUrl :: Invalid vercel env');
}

export function getAbsoluteUrl(
	app: (typeof apps)[number],
	path?: string,
	opts?: { subdomain?: string; query?: Record<string, string> },
) {
	const appBaseUrl = getBaseUrl(app, true);

	return `${opts?.subdomain ? `${opts.subdomain}.` : ''}${appBaseUrl}${path ? `/${path.replace(/^\//, '')}` : ''}${opts?.query ? `?${new URLSearchParams(opts.query).toString()}` : ''}`;
}

export const getSearchParams = (url: string) => {
	// Create a params object
	const params = {} as Record<string, string>;

	new URL(url).searchParams.forEach(function (val, key) {
		params[key] = val;
	});

	return params;
};

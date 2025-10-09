import type { APPS } from '@barely/const';

import { authEnv } from '../env';

const raise = (err: unknown): never => {
	throw typeof err === 'string' ? new Error(err) : err;
};

export function getBaseUrl(app: (typeof APPS)[number], absolute = false) {
	if (!absolute && typeof window !== 'undefined') return ''; // browser should use relative url

	const currentApp = authEnv.NEXT_PUBLIC_CURRENT_APP;

	const vercelEnv =
		process.env.NEXT_PUBLIC_VERCEL_ENV ?? raise('getBaseUrl :: VERCEL_ENV not found');

	if (vercelEnv === 'development') {
		let devPort;
		switch (app) {
			case 'app':
			case 'appFm':
				devPort =
					authEnv.NEXT_PUBLIC_APP_DEV_PORT ?? raise('NEXT_PUBLIC_APP_DEV_PORT not found');
				break;
			case 'appInvoice':
				devPort =
					authEnv.NEXT_PUBLIC_APP_DEV_PORT ?? raise('NEXT_PUBLIC_APP_DEV_PORT not found');
				break;
			case 'bio':
				devPort =
					authEnv.NEXT_PUBLIC_BIO_DEV_PORT ?? raise('NEXT_PUBLIC_BIO_DEV_PORT not found');
				break;
			case 'cart':
				devPort =
					authEnv.NEXT_PUBLIC_CART_DEV_PORT ??
					raise('NEXT_PUBLIC_CART_DEV_PORT not found');
				break;
			case 'fm':
				devPort =
					authEnv.NEXT_PUBLIC_FM_DEV_PORT ?? raise('NEXT_PUBLIC_FM_DEV_PORT not found');
				break;
			case 'invoice':
				devPort =
					authEnv.NEXT_PUBLIC_INVOICE_DEV_PORT ??
					raise('NEXT_PUBLIC_INVOICE_DEV_PORT not found');
				break;
			case 'link':
				devPort =
					authEnv.NEXT_PUBLIC_LINK_DEV_PORT ??
					raise('NEXT_PUBLIC_LINK_DEV_PORT not found');
				break;
			case 'manageEmail':
				devPort =
					authEnv.NEXT_PUBLIC_MANAGE_EMAIL_DEV_PORT ??
					raise('NEXT_PUBLIC_MANAGE_EMAIL_DEV_PORT not found');
				break;
			case 'page':
				devPort =
					authEnv.NEXT_PUBLIC_PAGE_DEV_PORT ??
					raise('NEXT_PUBLIC_PAGE_DEV_PORT not found');
				break;
			case 'press':
				devPort =
					authEnv.NEXT_PUBLIC_PRESS_DEV_PORT ??
					raise('NEXT_PUBLIC_PRESS_DEV_PORT not found');
				break;
			case 'nyc':
				devPort =
					authEnv.NEXT_PUBLIC_NYC_DEV_PORT ?? raise('NEXT_PUBLIC_NYC_DEV_PORT not found');
				break;
			case 'vip':
				devPort =
					authEnv.NEXT_PUBLIC_VIP_DEV_PORT ?? raise('NEXT_PUBLIC_VIP_DEV_PORT not found');
				break;
			case 'www':
				devPort =
					authEnv.NEXT_PUBLIC_WWW_DEV_PORT ?? raise('NEXT_PUBLIC_WWW_DEV_PORT not found');
				break;
			default:
				raise('Invalid app');
		}

		return `https://${app === 'app' || app === 'appFm' || app === 'appInvoice' || app === 'cart' ? '127.0.0.1' : 'localhost'}:${devPort}`; // dev SSR should use localhost
	}

	let baseUrl;
	switch (app) {
		case 'app':
			baseUrl = authEnv.NEXT_PUBLIC_APP_BASE_URL;
			break;
		case 'appFm':
			baseUrl = authEnv.NEXT_PUBLIC_APP_FM_BASE_URL;
			break;
		case 'appInvoice':
			baseUrl = authEnv.NEXT_PUBLIC_APP_INVOICE_BASE_URL;
			break;
		case 'bio':
			baseUrl = authEnv.NEXT_PUBLIC_BIO_BASE_URL;
			break;
		case 'cart':
			baseUrl = authEnv.NEXT_PUBLIC_CART_BASE_URL;
			break;
		case 'fm':
			baseUrl = authEnv.NEXT_PUBLIC_FM_BASE_URL;
			break;
		case 'invoice':
			baseUrl = authEnv.NEXT_PUBLIC_INVOICE_BASE_URL;
			break;
		case 'link':
			baseUrl = authEnv.NEXT_PUBLIC_LINK_BASE_URL;
			break;
		case 'manageEmail':
			baseUrl = authEnv.NEXT_PUBLIC_MANAGE_EMAIL_BASE_URL;
			break;
		case 'page':
			baseUrl = authEnv.NEXT_PUBLIC_PAGE_BASE_URL;
			break;
		case 'press':
			baseUrl = authEnv.NEXT_PUBLIC_PRESS_BASE_URL;
			break;
		case 'nyc':
			baseUrl = authEnv.NEXT_PUBLIC_NYC_BASE_URL;
			break;
		case 'vip':
			baseUrl = authEnv.NEXT_PUBLIC_VIP_BASE_URL;
			break;
		case 'www':
			baseUrl = authEnv.NEXT_PUBLIC_WWW_BASE_URL;
			break;
		default:
			raise('Invalid app');
	}
	if (vercelEnv === 'preview') {
		const vercelUrl =
			process.env.VERCEL_URL ??
			process.env.NEXT_PUBLIC_VERCEL_URL ??
			raise('getBaseUrl :: VERCEL_URL not found'); // this will need to be manually synced in trigger.dev staging env
		const previewBaseUrl = app === currentApp ? vercelUrl : baseUrl;
		return `https://${previewBaseUrl}`; // SSR should use vercel url
	}

	if (vercelEnv === 'production') {
		return `https://${baseUrl}`;
	}

	return raise('getBaseUrl :: Invalid vercel env');
}

export function getAbsoluteUrl(
	app: (typeof APPS)[number],
	path?: string,
	opts?: { subdomain?: string; query?: Record<string, string> },
) {
	const appBaseUrl = getBaseUrl(app, true);

	return `${opts?.subdomain ? `${opts.subdomain}.` : ''}${appBaseUrl}${path ? `/${path.replace(/^\//, '')}` : ''}${opts?.query ? `?${new URLSearchParams(opts.query).toString()}` : ''}`;
}

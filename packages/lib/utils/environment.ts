import { env } from '../env';

export function isDevelopment() {
	return env.NEXT_PUBLIC_VERCEL_ENV === 'development';
}

export function isPreview() {
	return env.NEXT_PUBLIC_VERCEL_ENV === 'preview';
}

export function isProduction() {
	return env.NEXT_PUBLIC_VERCEL_ENV === 'production';
}

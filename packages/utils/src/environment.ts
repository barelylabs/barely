import { utilsEnv } from '../env';

export function isDevelopment() {
	return utilsEnv.NEXT_PUBLIC_VERCEL_ENV === 'development';
}

export function isPreview() {
	return utilsEnv.NEXT_PUBLIC_VERCEL_ENV === 'preview';
}

export function isProduction() {
	return utilsEnv.NEXT_PUBLIC_VERCEL_ENV === 'production';
}

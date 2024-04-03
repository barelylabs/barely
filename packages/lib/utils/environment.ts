import { zEnv } from '@barely/env';

// import { env } from '../env';
const { env } = zEnv({
	serverEnvKeys: [],
	clientEnvKeys: ['NEXT_PUBLIC_VERCEL_ENV'],
});

export function isDevelopment() {
	return env.NEXT_PUBLIC_VERCEL_ENV === 'development';
}

export function isPreview() {
	return env.NEXT_PUBLIC_VERCEL_ENV === 'preview';
}

export function isProduction() {
	return env.NEXT_PUBLIC_VERCEL_ENV === 'production';
}

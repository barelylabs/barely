import env from '../../env';

export function absoluteUrl_App(path: string) {
	return `${env.NEXT_PUBLIC_APP_BASE_URL}${path}`;
}

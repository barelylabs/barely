interface GetBaseUrlProps {
	prodBaseUrl?: string;
	devPort?: string;
}

export function get(props: GetBaseUrlProps) {
	if (typeof window !== 'undefined') return ''; // browser should use relative url
	if (props.prodBaseUrl) return `https://${props.prodBaseUrl}`; // SSR should use vercel url
	if (props.devPort) return `http://localhost:${props.devPort}`; // dev SSR should use localhost
	throw new Error('getBaseUrl: no baseUrl or devPort provided');
}

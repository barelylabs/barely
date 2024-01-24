'use client';

import { useEffect } from 'react';
interface RedirectProps {
	scheme: string;
	fallback: string;
}

export default function ClientRedirect({ scheme, fallback }: RedirectProps) {
	useEffect(() => {
		if (!document) return;
		const appSchemes = [scheme];
		appSchemes.map((scheme, index) => {
			if (scheme === null) return;
			setTimeout(() => (document.location = decodeURIComponent(scheme)), index * 300);
			console.log('scheme', scheme);
		});

		if (fallback === null) return;

		console.log('fallback', fallback);
		setTimeout(
			() => (document.location = decodeURIComponent(fallback)),
			appSchemes.length === 1 ? 400 : 700
		);
	}, [scheme, fallback]);

	return <></>;
}

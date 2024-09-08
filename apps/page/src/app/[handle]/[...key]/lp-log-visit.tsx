'use client';

import { useEffect, useRef } from 'react';
import { landingPageApi } from '@barely/lib/server/routes/landing-page-render/landing-page-render.api.react';

export function LogVisit({ landingPageId }: { landingPageId: string }) {
	const { mutate: logEvent } = landingPageApi.log.useMutation();

	const hasLoggedView = useRef(false);

	useEffect(() => {
		if (hasLoggedView.current) return;

		console.log('logging lp visit');

		logEvent({
			landingPageId,
			type: 'page/view',
		});

		hasLoggedView.current = true;
	}, [logEvent, landingPageId]);

	return null;
}

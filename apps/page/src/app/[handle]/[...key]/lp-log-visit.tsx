'use client';

import { useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';

import { useLandingPageRenderTRPC } from '@barely/api/public/landing-page.trpc.react';

export function LogVisit({ landingPageId }: { landingPageId: string }) {
	const trpc = useLandingPageRenderTRPC();

	const { mutate: logEvent } = useMutation(trpc.log.mutationOptions());

	const hasLoggedView = useRef(false);

	useEffect(() => {
		if (hasLoggedView.current) return;

		logEvent({
			landingPageId,
			type: 'page/view',
		});

		hasLoggedView.current = true;
	}, [logEvent, landingPageId]);

	return null;
}

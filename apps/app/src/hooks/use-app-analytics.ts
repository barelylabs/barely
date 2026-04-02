'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

export function useAppPageView() {
	const trpc = useTRPC();
	const pathname = usePathname();
	const lastPathRef = useRef<string | null>(null);

	const { mutate: trackEvent } = useMutation(
		trpc.appAnalytics.trackAppEvent.mutationOptions({}),
	);

	useEffect(() => {
		if (pathname === lastPathRef.current) return;
		lastPathRef.current = pathname;

		// Extract workspaceId from path (e.g., /handle/links -> handle)
		const segments = pathname.split('/').filter(Boolean);
		const handle = segments[0]; // workspace handle is the first segment

		trackEvent({
			type: 'app/pageView',
			pagePath: pathname,
			workspaceId: handle,
		});
	}, [pathname, trackEvent]);
}

'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Client-side component that tracks page views to Meta Pixel.
 * Fires on initial load and on route changes.
 *
 * Pattern inspired by bio-log-visit.tsx - uses useRef to prevent double-logging
 * in React strict mode (development), but resets on route changes.
 */
export function PageViewTracker() {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const lastTrackedRoute = useRef<string>('');

	useEffect(() => {
		const currentRoute = `${pathname}?${searchParams.toString()}`;

		// Prevent double-logging the same route in React strict mode
		if (lastTrackedRoute.current === currentRoute) return;

		// Track page view on mount and route changes
		const trackPageView = async () => {
			try {
				await fetch('/api/track-page-view', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
				});
			} catch (error) {
				// Silently fail - we don't want to disrupt user experience
				console.error('Failed to track page view:', error);
			}
		};

		void trackPageView();
		lastTrackedRoute.current = currentRoute;
	}, [pathname, searchParams]);

	return null; // This component doesn't render anything
}

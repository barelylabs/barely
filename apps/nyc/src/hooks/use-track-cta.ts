'use client';

import { useCallback } from 'react';

type CtaType = 'contact_form' | 'discovery_call';
type CtaLocation = 'hero' | 'features' | 'pricing' | 'faq' | 'footer';
type ServiceInterest = 'stan' | 'rising_with_stan';

interface TrackCtaOptions {
	ctaType: CtaType;
	ctaLocation: CtaLocation;
	service?: ServiceInterest;
}

export function useTrackCta() {
	const trackCta = useCallback(async (options: TrackCtaOptions) => {
		try {
			await fetch('/api/track-cta', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(options),
			});
		} catch (error) {
			// Fire-and-forget tracking - don't block UI on errors
			console.error('CTA tracking error:', error);
		}
	}, []);

	return { trackCta };
}

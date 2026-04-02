'use client';

import { useAppPageView } from '~/hooks/use-app-analytics';

export function AppAnalyticsTracker() {
	useAppPageView();
	return null;
}

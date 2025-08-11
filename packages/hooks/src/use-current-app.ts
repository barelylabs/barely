import type { AppFeature, AppVariant, AppVariantConfig } from '@barely/utils';
import { useMemo } from 'react';
import {
	getCurrentAppConfig,
	getCurrentAppVariant,
	getEnabledFeatures,
	hasFeature,
	isAppVariant,
	isFmVariant,
	isFullApp,
} from '@barely/utils';

export interface UseCurrentAppReturn {
	variant: AppVariant | undefined;
	config: AppVariantConfig;
	features: AppFeature[];
	hasFeature: (feature: AppFeature) => boolean;
	isVariant: (variant: AppVariant) => boolean;
	isFmVariant: boolean;
	isFullApp: boolean;
}

/**
 * Hook to access current app variant information
 * @returns {UseCurrentAppReturn} Current app variant details and helper functions
 */
export function useCurrentApp(): UseCurrentAppReturn {
	return useMemo(() => {
		const variant = getCurrentAppVariant();
		const config = getCurrentAppConfig();
		const features = getEnabledFeatures();

		return {
			variant,
			config,
			features,
			hasFeature,
			isVariant: isAppVariant,
			isFmVariant: isFmVariant(),
			isFullApp: isFullApp(),
		};
	}, []);
}

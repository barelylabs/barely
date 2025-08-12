import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
	APP_VARIANT_CONFIGS,
	getCurrentAppConfig,
	getCurrentAppVariant,
	getEnabledFeatures,
	hasFeature,
	isAppVariant,
	isFmVariant,
	isFullApp,
} from '../app-variants';

describe('app-variants utilities', () => {
	const originalEnv = process.env.NEXT_PUBLIC_CURRENT_APP;

	beforeEach(() => {
		// Clear the environment variable before each test
		delete process.env.NEXT_PUBLIC_CURRENT_APP;
	});

	afterEach(() => {
		// Restore original environment variable
		if (originalEnv !== undefined) {
			process.env.NEXT_PUBLIC_CURRENT_APP = originalEnv;
		} else {
			delete process.env.NEXT_PUBLIC_CURRENT_APP;
		}
	});

	describe('getCurrentAppVariant', () => {
		it('should return undefined when no environment variable is set', () => {
			expect(getCurrentAppVariant()).toBeUndefined();
		});

		it('should return the correct variant when environment variable is set', () => {
			process.env.NEXT_PUBLIC_CURRENT_APP = 'appFm';
			expect(getCurrentAppVariant()).toBe('appFm');
		});
	});

	describe('getCurrentAppConfig', () => {
		it('should return full app config when no variant is set', () => {
			const config = getCurrentAppConfig();
			expect(config.name).toBe('app');
			expect(config.displayName).toBe('barely.ai');
			expect(config.features).toContain('analytics');
			expect(config.features).toContain('links');
		});

		it('should return FM variant config when appFm is set', () => {
			process.env.NEXT_PUBLIC_CURRENT_APP = 'appFm';
			const config = getCurrentAppConfig();
			expect(config.name).toBe('appFm');
			expect(config.displayName).toBe('barely.fm');
			expect(config.features).toEqual(['fm', 'media', 'settings', 'workspace']);
		});

		it('should return full app config for unknown variants', () => {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
			process.env.NEXT_PUBLIC_CURRENT_APP = 'unknownVariant' as any;
			const config = getCurrentAppConfig();
			expect(config.name).toBe('app');
		});
	});

	describe('hasFeature', () => {
		it('should return true for features in full app', () => {
			expect(hasFeature('analytics')).toBe(true);
			expect(hasFeature('fm')).toBe(true);
			expect(hasFeature('links')).toBe(true);
		});

		it('should return correct feature availability for FM variant', () => {
			process.env.NEXT_PUBLIC_CURRENT_APP = 'appFm';
			expect(hasFeature('fm')).toBe(true);
			expect(hasFeature('media')).toBe(true);
			expect(hasFeature('analytics')).toBe(false);
			expect(hasFeature('links')).toBe(false);
		});
	});

	describe('getEnabledFeatures', () => {
		it('should return all features for full app', () => {
			const features = getEnabledFeatures();
			const appConfig = APP_VARIANT_CONFIGS.app;
			expect(appConfig).toBeDefined();
			expect(features).toEqual(appConfig?.features);
			expect(features.length).toBeGreaterThan(10);
		});

		it('should return limited features for FM variant', () => {
			process.env.NEXT_PUBLIC_CURRENT_APP = 'appFm';
			const features = getEnabledFeatures();
			expect(features).toEqual(['fm', 'media', 'settings', 'workspace']);
			expect(features.length).toBe(4);
		});
	});

	describe('isAppVariant', () => {
		it('should correctly identify app variants', () => {
			expect(isAppVariant('app')).toBe(false); // No variant set
			expect(isAppVariant('appFm')).toBe(false);

			process.env.NEXT_PUBLIC_CURRENT_APP = 'appFm';
			expect(isAppVariant('appFm')).toBe(true);
			expect(isAppVariant('app')).toBe(false);
		});
	});

	describe('isFmVariant', () => {
		it('should return false when not FM variant', () => {
			expect(isFmVariant()).toBe(false);

			process.env.NEXT_PUBLIC_CURRENT_APP = 'app';
			expect(isFmVariant()).toBe(false);
		});

		it('should return true when FM variant is set', () => {
			process.env.NEXT_PUBLIC_CURRENT_APP = 'appFm';
			expect(isFmVariant()).toBe(true);
		});
	});

	describe('isFullApp', () => {
		it('should return true when no variant is set', () => {
			expect(isFullApp()).toBe(true);
		});

		it('should return true when app variant is set', () => {
			process.env.NEXT_PUBLIC_CURRENT_APP = 'app';
			expect(isFullApp()).toBe(true);
		});

		it('should return false when other variant is set', () => {
			process.env.NEXT_PUBLIC_CURRENT_APP = 'appFm';
			expect(isFullApp()).toBe(false);
		});
	});
});

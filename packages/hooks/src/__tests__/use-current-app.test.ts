import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { useCurrentApp } from '../use-current-app';

describe('useCurrentApp', () => {
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

	it('should return full app config when no variant is set', () => {
		const { result } = renderHook(() => useCurrentApp());

		expect(result.current.variant).toBeUndefined();
		expect(result.current.isFullApp).toBe(true);
		expect(result.current.isFmVariant).toBe(false);
		expect(result.current.config.name).toBe('app');
		expect(result.current.config.displayName).toBe('barely.ai');
		expect(result.current.features).toContain('analytics');
		expect(result.current.features).toContain('fm');
		expect(result.current.features).toContain('links');
	});

	it('should return FM variant config when NEXT_PUBLIC_CURRENT_APP is appFm', () => {
		process.env.NEXT_PUBLIC_CURRENT_APP = 'appFm';
		const { result } = renderHook(() => useCurrentApp());

		expect(result.current.variant).toBe('appFm');
		expect(result.current.isFullApp).toBe(false);
		expect(result.current.isFmVariant).toBe(true);
		expect(result.current.config.name).toBe('appFm');
		expect(result.current.config.displayName).toBe('barely.fm');
		expect(result.current.features).toEqual(['fm', 'media', 'settings', 'workspace']);
	});

	it('should correctly check for features in full app', () => {
		const { result } = renderHook(() => useCurrentApp());

		expect(result.current.hasFeature('fm')).toBe(true);
		expect(result.current.hasFeature('analytics')).toBe(true);
		expect(result.current.hasFeature('links')).toBe(true);
		expect(result.current.hasFeature('media')).toBe(true);
	});

	it('should correctly check for features in FM variant', () => {
		process.env.NEXT_PUBLIC_CURRENT_APP = 'appFm';
		const { result } = renderHook(() => useCurrentApp());

		expect(result.current.hasFeature('fm')).toBe(true);
		expect(result.current.hasFeature('media')).toBe(true);
		expect(result.current.hasFeature('settings')).toBe(true);
		expect(result.current.hasFeature('workspace')).toBe(true);
		// Features not in FM variant
		expect(result.current.hasFeature('analytics')).toBe(false);
		expect(result.current.hasFeature('links')).toBe(false);
		expect(result.current.hasFeature('campaigns')).toBe(false);
	});

	it('should correctly identify app variants', () => {
		process.env.NEXT_PUBLIC_CURRENT_APP = 'appFm';
		const { result } = renderHook(() => useCurrentApp());

		expect(result.current.isVariant('appFm')).toBe(true);
		expect(result.current.isVariant('app')).toBe(false);
		// expect(result.current.isVariant('cart')).toBe(false);
	});

	it('should handle invalid variant gracefully', () => {
		// Test with an invalid variant (TypeScript would normally prevent this)
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
		process.env.NEXT_PUBLIC_CURRENT_APP = 'invalidVariant' as any;
		const { result } = renderHook(() => useCurrentApp());

		// Should fall back to full app config
		expect(result.current.variant).toBe('invalidVariant');
		expect(result.current.config.name).toBe('app');
		expect(result.current.isFullApp).toBe(false); // Because variant is set but invalid
	});

	it('should return the same object reference on re-renders', () => {
		const { result, rerender } = renderHook(() => useCurrentApp());
		const firstResult = result.current;

		rerender();
		const secondResult = result.current;

		expect(firstResult).toBe(secondResult);
	});
});

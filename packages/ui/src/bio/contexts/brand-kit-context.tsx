'use client';

import type { PublicBrandKit } from '@barely/validators';
import type { CSSProperties } from 'react';
import React, { createContext, useContext } from 'react';

type BrandKitContextValue = PublicBrandKit;

type CSSPropertiesWithCustomVars = CSSProperties &
	Record<`--${string}`, string | number | undefined>;

const BrandKitContext = createContext<BrandKitContextValue | undefined>(undefined);

export function BrandKitProvider({
	brandKit,
	children,
	context = 'bio',
}: {
	brandKit: PublicBrandKit;
	children: React.ReactNode;
	context?: 'bio' | 'cart';
}) {
	// Determine which color scheme to use based on context
	let brandKitStyles: CSSPropertiesWithCustomVars;

	if (context === 'bio' && brandKit.color1 && brandKit.color2 && brandKit.color3) {
		// Use new bio color scheme if available
		const colorArray = [brandKit.color1, brandKit.color2, brandKit.color3];
		brandKitStyles = {
			'--brandKit-bg': colorArray[brandKit.bioColorScheme.bgColor] ?? '',
			'--brandKit-text': colorArray[brandKit.bioColorScheme.textColor] ?? '',
			'--brandKit-block': colorArray[brandKit.bioColorScheme.blockColor] ?? '',
			'--brandKit-block-text': colorArray[brandKit.bioColorScheme.blockTextColor] ?? '',
			'--brandKit-banner': colorArray[brandKit.bioColorScheme.bannerColor] ?? '',
			// Also expose raw colors for flexibility
			'--brandKit-color-0': colorArray[0] ?? '',
			'--brandKit-color-1': colorArray[1] ?? '',
			'--brandKit-color-2': colorArray[2] ?? '',
			// Use display: contents to make this div invisible to layout
			display: 'contents',
		};
	} else if (
		context === 'cart' &&
		brandKit.color1 &&
		brandKit.color2 &&
		brandKit.color3
	) {
		// Use new cart color scheme if available
		const colorArray = [brandKit.color1, brandKit.color2, brandKit.color3];
		brandKitStyles = {
			'--brandKit-bg': colorArray[brandKit.cartColorScheme.bgColor] ?? '',
			'--brandKit-text': colorArray[brandKit.cartColorScheme.textColor] ?? '',
			'--brandKit-block': colorArray[brandKit.cartColorScheme.blockColor] ?? '',
			'--brandKit-block-text': colorArray[brandKit.cartColorScheme.blockTextColor],
			'--brandKit-banner': colorArray[brandKit.cartColorScheme.blockColor] ?? '', // Cart doesn't have banner, use block color
			// Also expose raw colors for flexibility
			'--brandKit-color-0': colorArray[0] ?? '',
			'--brandKit-color-1': colorArray[1] ?? '',
			'--brandKit-color-2': colorArray[2] ?? '',
			// Use display: contents to make this div invisible to layout
			display: 'contents',
		};
	} else {
		// Fall back to legacy colorScheme
		const { colors, mapping } = brandKit.colorScheme;
		brandKitStyles = {
			'--brandKit-bg': colors[mapping.backgroundColor],
			'--brandKit-text': colors[mapping.textColor],
			'--brandKit-block': colors[mapping.blockColor],
			'--brandKit-block-text': colors[mapping.blockTextColor],
			'--brandKit-banner': colors[mapping.bannerColor],
			// Also expose raw colors for flexibility
			'--brandKit-color-0': colors[0],
			'--brandKit-color-1': colors[1],
			'--brandKit-color-2': colors[2],
			// Use display: contents to make this div invisible to layout
			display: 'contents',
		};
	}

	return (
		<BrandKitContext.Provider value={brandKit}>
			<div style={brandKitStyles}>{children}</div>
		</BrandKitContext.Provider>
	);
}

export function useBrandKit() {
	const context = useContext(BrandKitContext);
	if (!context) {
		throw new Error('useBrandKit must be used within a BrandKitProvider');
	}
	return context;
}

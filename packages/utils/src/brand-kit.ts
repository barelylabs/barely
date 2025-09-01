import type {
	BioColorMapping,
	BrandKitColorPreset,
	BrandKitColorPresetKey,
	BrandKitColorScheme,
	BrandKitThemeCategory,
	CartColorMapping,
	FontConfig,
} from '@barely/const';
import type { BrandKit } from '@barely/validators';
import {
	BRAND_KIT_COLOR_PRESETS,
	BRAND_KIT_FONT_PRESETS,
	BRAND_KIT_THEMES,
} from '@barely/const';

// Helper function to shuffle color mapping
export function shuffleColorMapping(
	colorScheme: BrandKitColorScheme,
): BrandKitColorScheme {
	const indices: (0 | 1 | 2)[] = [0, 1, 2];

	// Helper to get a random index from available options
	const getRandomIndex = (exclude: (0 | 1 | 2)[] = []): 0 | 1 | 2 => {
		const available = indices.filter(i => !exclude.includes(i));
		if (available.length === 0) {
			// This should theoretically never happen with 3 colors and our constraint rules
			// but we handle it defensively
			throw new Error('No available color indices for mapping');
		}
		const randomIndex = available[Math.floor(Math.random() * available.length)];
		if (randomIndex === undefined) {
			// Additional safety check for array access
			throw new Error('Failed to select random color index');
		}
		return randomIndex;
	};

	// Pick colors sequentially with constraints
	const backgroundColor = getRandomIndex();

	// textColor must be different from backgroundColor
	const textColor = getRandomIndex([backgroundColor]);

	// buttonColor must be different from backgroundColor
	const buttonColor = getRandomIndex([backgroundColor]);

	// buttonTextColor must be different from buttonColor
	const buttonTextColor = getRandomIndex([buttonColor]);

	// buttonOutlineColor must be different from buttonColor
	const buttonOutlineColor = getRandomIndex([buttonColor]);

	// blockColor must be different from backgroundColor
	const blockColor = getRandomIndex([backgroundColor]);

	// blockTextColor must be different from blockColor
	const blockTextColor = getRandomIndex([blockColor]);

	// bannerColor must be different from backgroundColor
	const bannerColor = getRandomIndex([backgroundColor]);

	return {
		colors: colorScheme.colors,
		mapping: {
			backgroundColor,
			textColor,
			buttonColor,
			buttonTextColor,
			buttonOutlineColor,
			blockColor,
			blockTextColor,
			bannerColor,
		},
	};
}

// Helper function to shuffle bio color mapping
export function shuffleBioColorMapping(): BioColorMapping {
	const indices: (0 | 1 | 2)[] = [0, 1, 2];

	// Helper to get a random index from available options
	const getRandomIndex = (exclude: (0 | 1 | 2)[] = []): 0 | 1 | 2 => {
		const available = indices.filter(i => !exclude.includes(i));
		if (available.length === 0) {
			throw new Error('No available color indices for mapping');
		}
		const randomIndex = available[Math.floor(Math.random() * available.length)];
		if (randomIndex === undefined) {
			throw new Error('Failed to select random color index');
		}
		return randomIndex;
	};

	// Pick colors sequentially with constraints for bio
	const bgColor = getRandomIndex();
	const textColor = getRandomIndex([bgColor]);
	const blockColor = getRandomIndex([bgColor]);
	const blockTextColor = getRandomIndex([blockColor]);
	const bannerColor = getRandomIndex([bgColor]);

	return {
		bgColor,
		textColor,
		blockColor,
		blockTextColor,
		bannerColor,
	};
}

// Helper function to shuffle cart color mapping
export function shuffleCartColorMapping(): CartColorMapping {
	const indices: (0 | 1 | 2)[] = [0, 1, 2];

	// Helper to get a random index from available options
	const getRandomIndex = (exclude: (0 | 1 | 2)[] = []): 0 | 1 | 2 => {
		const available = indices.filter(i => !exclude.includes(i));
		if (available.length === 0) {
			throw new Error('No available color indices for mapping');
		}
		const randomIndex = available[Math.floor(Math.random() * available.length)];
		if (randomIndex === undefined) {
			throw new Error('Failed to select random color index');
		}
		return randomIndex;
	};

	// Pick colors sequentially with constraints for cart
	const bgColor = getRandomIndex();
	const textColor = getRandomIndex([bgColor]);
	const blockColor = getRandomIndex([bgColor]);
	const blockTextColor = getRandomIndex([blockColor]);

	return {
		bgColor,
		textColor,
		blockColor,
		blockTextColor,
	};
}

export interface ComputedStyles {
	colors: {
		background: string;
		text: string;
		button: string;
		buttonText: string;
		buttonOutline: string;
		block: string;
		blockText: string;
		banner: string;
	};
	fonts: FontConfig;
	block: {
		radius: string;
		padding: string;
		width: string;
		shadow: string;
		outline: string;
	};
}

export function getComputedStyles(
	brandKit: Omit<
		BrandKit,
		'id' | 'createdAt' | 'updatedAt' | 'archivedAt' | 'deletedAt'
	> | null,
	context: 'bio' | 'cart' = 'bio',
): ComputedStyles {
	if (!brandKit) {
		return {
			colors: {
				background: 'oklch(100% 0 0)',
				text: 'oklch(0% 0 0)',
				button: 'oklch(96% 0.005 260)',
				buttonText: 'oklch(25% 0.01 260)',
				buttonOutline: 'oklch(0% 0 0)',
				block: 'oklch(96% 0.005 260)',
				blockText: 'oklch(25% 0.01 260)',
				banner: 'oklch(96% 0.005 260)',
			},
			fonts: BRAND_KIT_FONT_PRESETS['modern.cal'],
			block: {
				radius: '12px',
				padding: '12px 24px',
				width: 'auto',
				shadow: 'none',
				outline: 'none',
			},
		};
	}

	const {
		colorScheme,
		bioColorScheme,
		cartColorScheme,
		color1,
		color2,
		color3,
		fontPreset,
		blockStyle,
		blockShadow,
		blockOutline,
	} = brandKit;

	// Get colors based on context
	let colors: {
		background: string;
		text: string;
		button: string;
		buttonText: string;
		buttonOutline: string;
		block: string;
		blockText: string;
		banner: string;
	};

	if (context === 'bio' && color1 && color2 && color3) {
		// Use new bio color scheme if available
		const colorArray: [string, string, string] = [color1, color2, color3];
		colors = {
			background: colorArray[bioColorScheme.bgColor],
			text: colorArray[bioColorScheme.textColor],
			button: colorArray[bioColorScheme.blockColor],
			buttonText: colorArray[bioColorScheme.blockTextColor],
			buttonOutline: colorArray[bioColorScheme.textColor],
			block: colorArray[bioColorScheme.blockColor],
			blockText: colorArray[bioColorScheme.blockTextColor],
			banner: colorArray[bioColorScheme.bannerColor],
		};
	} else if (context === 'cart' && color1 && color2 && color3) {
		// Use new cart color scheme if available
		const colorArray: [string, string, string] = [color1, color2, color3];
		colors = {
			background: colorArray[cartColorScheme.bgColor],
			text: colorArray[cartColorScheme.textColor],
			button: colorArray[cartColorScheme.blockColor],
			buttonText: colorArray[cartColorScheme.blockTextColor],
			buttonOutline: colorArray[cartColorScheme.textColor],
			block: colorArray[cartColorScheme.blockColor],
			blockText: colorArray[cartColorScheme.blockTextColor],
			banner: colorArray[cartColorScheme.blockColor], // Cart doesn't have banner
		};
	} else {
		// Fall back to legacy colorScheme
		colors = {
			background: colorScheme.colors[colorScheme.mapping.backgroundColor],
			text: colorScheme.colors[colorScheme.mapping.textColor],
			button: colorScheme.colors[colorScheme.mapping.buttonColor],
			buttonText: colorScheme.colors[colorScheme.mapping.buttonTextColor],
			buttonOutline: colorScheme.colors[colorScheme.mapping.buttonOutlineColor],
			block: colorScheme.colors[colorScheme.mapping.blockColor],
			blockText: colorScheme.colors[colorScheme.mapping.blockTextColor],
			banner: colorScheme.colors[colorScheme.mapping.bannerColor],
		};
	}

	// Get fonts with fallback
	const fonts = BRAND_KIT_FONT_PRESETS[fontPreset];

	// Get block styles
	const blockRadius = {
		rounded: '12px',
		oval: '9999px',
		square: '0px',
		'full-width': '12px',
	}[blockStyle];

	const blockPadding = blockStyle === 'full-width' ? '16px 0' : '12px 24px';
	const blockWidth = blockStyle === 'full-width' ? '100%' : 'auto';

	return {
		colors,
		fonts,
		block: {
			radius: blockRadius,
			padding: blockPadding,
			width: blockWidth,
			shadow:
				blockShadow ?
					`0px 5px 0px 0px color-mix(in oklch, ${colors.button} 50%, transparent)`
				:	'none',
			outline: blockOutline ? `2px solid ${colors.buttonOutline}` : 'none',
		},
	};
}

// Get themes by category
export function getThemesByCategory(category: BrandKitThemeCategory) {
	return Object.entries(BRAND_KIT_THEMES)
		.filter(([_, theme]) => theme.category === category)
		.map(([key, theme]) => ({ key, ...theme }));
}

// Get appearance presets by type
export function getAppearancesByType(type: BrandKitColorPreset['type']) {
	return Object.entries(BRAND_KIT_COLOR_PRESETS)
		.filter(([_, preset]) => preset.type === type)
		.map(([key, preset]) => ({ key: key as BrandKitColorPresetKey, ...preset }));
}

/**
 * Get Tailwind classes for block shadow
 */
export function getBrandKitShadowClass(shadow: string | undefined): string {
	if (!shadow || shadow === 'none') return '';

	// Check if it's the standard shadow pattern
	if (shadow.includes('0px 5px 0px 0px')) {
		return 'shadow-[0px_5px_0px_0px_color-mix(in_oklch,var(--brandKit-block)_50%,transparent)]';
	}

	return '';
}

/**
 * Get Tailwind classes for block outline
 */
export function getBrandKitOutlineClass(outline: string | undefined): string {
	if (!outline || outline === 'none') return '';

	// Check for 2px solid pattern
	if (outline.includes('2px solid')) {
		return 'border-2 border-brandKit-text';
	}

	return '';
}

/**
 * Get Tailwind classes for block radius
 */
export function getBrandKitRadiusClass(radius: string): string {
	const radiusMap: Record<string, string> = {
		'0px': 'rounded-none',
		'12px': 'rounded-xl',
		'9999px': 'rounded-full',
	};

	return radiusMap[radius] ?? 'rounded-xl';
}

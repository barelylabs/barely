import type {
	BrandKitColorPreset,
	BrandKitColorPresetKey,
	BrandKitColorScheme,
	BrandKitThemeCategory,
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

	const { colorScheme, fontPreset, blockStyle, blockShadow, blockOutline } = brandKit;

	// Get colors from scheme or use defaults
	const colors = {
		background: colorScheme.colors[colorScheme.mapping.backgroundColor],
		text: colorScheme.colors[colorScheme.mapping.textColor],
		button: colorScheme.colors[colorScheme.mapping.buttonColor],
		buttonText: colorScheme.colors[colorScheme.mapping.buttonTextColor],
		buttonOutline: colorScheme.colors[colorScheme.mapping.buttonOutlineColor],
		block: colorScheme.colors[colorScheme.mapping.blockColor],
		blockText: colorScheme.colors[colorScheme.mapping.blockTextColor],
		banner: colorScheme.colors[colorScheme.mapping.bannerColor],
	};

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

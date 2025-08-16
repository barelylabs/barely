// Bio Design System V2 - Beacons.ai Inspired

import type { BrandKit } from '@barely/validators';

export type ThemeCategory = 'classic' | 'vibrant' | 'cozy' | 'bold';
export type HeaderStyle = 'minimal' | 'banner' | 'portrait' | 'shapes';
export type FontPreset =
	// Modern fonts
	| 'modern.cal'
	| 'modern.montserrat'
	| 'modern.bowlbyOne'
	| 'modern.anton'
	// Classic fonts
	| 'classic.playfairDisplay'
	| 'classic.playfairDisplaySc'
	| 'classic.cutive'
	| 'classic.libreBaskerville'
	// Creative fonts
	| 'creative.fredokaOne'
	| 'creative.yellowtail'
	| 'creative.permanentMarker'
	| 'creative.pacifico'
	// Logo fonts
	| 'logo.coda'
	| 'logo.miriamLibre'
	| 'logo.rammettoOne'
	| 'logo.gravitasOne'
	// Futuristic fonts
	| 'futuristic.museoModerno'
	| 'futuristic.audiowide'
	| 'futuristic.lexendZetta'
	| 'futuristic.unicaOne'
	// Custom
	| 'custom';
export type BlockStyle = 'rounded' | 'oval' | 'square' | 'full-width';

// Color scheme interface - 3 colors map to style variables
export interface ColorScheme {
	colors: [string, string, string]; // 3 base colors
	mapping: {
		backgroundColor: 0 | 1 | 2;
		textColor: 0 | 1 | 2;
		buttonColor: 0 | 1 | 2;
		buttonTextColor: 0 | 1 | 2;
		buttonOutlineColor: 0 | 1 | 2;
		blockColor: 0 | 1 | 2;
		blockTextColor: 0 | 1 | 2;
		bannerColor: 0 | 1 | 2;
	};
}

// Color preset with name and color scheme
export interface ColorPreset {
	name: string;
	type: 'neutral' | 'bold' | 'playful' | 'brand-kit' | 'custom';
	colorScheme: ColorScheme;
}

// Font configuration
export interface FontConfig {
	name: string;
	headingFont: string;
	bodyFont: string;
}

// Complete theme configuration
export interface ThemeConfig {
	category: ThemeCategory;
	name: string;
	description: string;
	defaultColorPreset: string; // color preset key
	defaultFont: FontPreset;
	defaultBlockStyle: BlockStyle;
}

// Theme definitions - 2 per category
export const THEMES: Record<string, ThemeConfig> = {
	// Classic themes
	timeless: {
		category: 'classic',
		name: 'Timeless',
		description: 'Clean and professional with a traditional aesthetic',
		defaultColorPreset: 'shuffle-random',
		defaultFont: 'classic.playfairDisplay',
		defaultBlockStyle: 'rounded',
	},
	elegant: {
		category: 'classic',
		name: 'Elegant',
		description: 'Sophisticated and refined with subtle details',
		defaultColorPreset: 'twilight-blue',
		defaultFont: 'classic.playfairDisplay',
		defaultBlockStyle: 'oval',
	},

	// Vibrant themes
	electric: {
		category: 'vibrant',
		name: 'Electric',
		description: 'Bold neon colors with high energy',
		defaultColorPreset: 'neon-nights',
		defaultFont: 'futuristic.audiowide',
		defaultBlockStyle: 'square',
	},
	sunset: {
		category: 'vibrant',
		name: 'Sunset',
		description: 'Warm gradients and vibrant hues',
		defaultColorPreset: 'golden-sand',
		defaultFont: 'modern.cal',
		defaultBlockStyle: 'rounded',
	},

	// Cozy themes
	warm: {
		category: 'cozy',
		name: 'Warm',
		description: 'Comfortable and inviting with soft colors',
		defaultColorPreset: 'earthy-elegance',
		defaultFont: 'creative.fredokaOne',
		defaultBlockStyle: 'rounded',
	},
	soft: {
		category: 'cozy',
		name: 'Soft',
		description: 'Gentle pastels and calming tones',
		defaultColorPreset: 'misty-harbor',
		defaultFont: 'modern.cal',
		defaultBlockStyle: 'oval',
	},

	// Bold themes
	impact: {
		category: 'bold',
		name: 'Impact',
		description: 'Strong contrasts and powerful presence',
		defaultColorPreset: 'high-contrast',
		defaultFont: 'logo.gravitasOne',
		defaultBlockStyle: 'square',
	},
	contrast: {
		category: 'bold',
		name: 'Contrast',
		description: 'Dramatic black and white with accent colors',
		defaultColorPreset: 'monochrome-accent',
		defaultFont: 'modern.cal',
		defaultBlockStyle: 'full-width',
	},
};

// Color presets
export const COLOR_PRESETS: Record<string, ColorPreset> = {
	// Neutral presets
	'basic-grayscale': {
		name: 'Basic Grayscale',
		type: 'neutral',
		colorScheme: {
			colors: ['#000000', '#808080', '#FFFFFF'],
			mapping: {
				backgroundColor: 2, // White background
				textColor: 0, // Black text
				buttonColor: 2, // White buttons
				buttonTextColor: 0, // Black button text
				buttonOutlineColor: 0, // Black outline
				blockColor: 2, // White blocks
				blockTextColor: 0, // Black block text
				bannerColor: 1, // Gray banner
			},
		},
	},
	'emerald-sea': {
		name: 'Emerald Sea',
		type: 'neutral',
		colorScheme: {
			colors: ['#053B3F', '#4ECDC4', '#F7FFF7'],
			mapping: {
				backgroundColor: 2, // Light mint background
				textColor: 0, // Dark emerald text
				buttonColor: 1, // Medium emerald buttons
				buttonTextColor: 2, // Light mint button text
				buttonOutlineColor: 0, // Dark emerald outline
				blockColor: 0, // Dark emerald blocks
				blockTextColor: 2, // Light mint block text
				bannerColor: 1, // Medium emerald banner
			},
		},
	},
	'golden-sand': {
		name: 'Golden Sand',
		type: 'neutral',
		colorScheme: {
			colors: ['#F9F4EF', '#8B7750', '#050A26'],
			mapping: {
				backgroundColor: 0, // Light golden background
				textColor: 2, // Dark blue text
				buttonColor: 1, // Golden buttons
				buttonTextColor: 0, // Light golden button text
				buttonOutlineColor: 2, // Dark blue outline
				blockColor: 0, // Light golden blocks
				blockTextColor: 2, // Dark blue block text
				bannerColor: 1, // Golden banner
			},
		},
	},
	'misty-harbor': {
		name: 'Misty Harbor',
		type: 'neutral',
		colorScheme: {
			colors: ['#F5F5F5', '#66B2B2', '#2C3E50'],
			mapping: {
				backgroundColor: 0, // Light gray background
				textColor: 2, // Dark gray text
				buttonColor: 1, // Teal buttons
				buttonTextColor: 0, // Light gray button text
				buttonOutlineColor: 2, // Dark gray outline
				blockColor: 0, // Light gray blocks
				blockTextColor: 2, // Dark gray block text
				bannerColor: 1, // Teal banner
			},
		},
	},
	'twilight-blue': {
		name: 'Twilight Blue',
		type: 'neutral',
		colorScheme: {
			colors: ['#242846', '#475378', '#FBFBFA'],
			mapping: {
				backgroundColor: 2, // Light background
				textColor: 0, // Dark blue text
				buttonColor: 1, // Medium blue buttons
				buttonTextColor: 2, // Light button text
				buttonOutlineColor: 0, // Dark blue outline
				blockColor: 0, // Dark blue blocks
				blockTextColor: 2, // Light block text
				bannerColor: 1, // Medium blue banner
			},
		},
	},
	'earthy-elegance': {
		name: 'Earthy Elegance',
		type: 'neutral',
		colorScheme: {
			colors: ['#5C4033', '#BC9A6A', '#F5E6D3'],
			mapping: {
				backgroundColor: 2, // Light cream background
				textColor: 0, // Dark brown text
				buttonColor: 1, // Orange buttons
				buttonTextColor: 2, // Light cream button text
				buttonOutlineColor: 0, // Dark brown outline
				blockColor: 2, // Light cream blocks
				blockTextColor: 0, // Dark brown block text
				bannerColor: 1, // Orange banner
			},
		},
	},

	// Bold presets
	'galaxy-night': {
		name: 'Galaxy Night',
		type: 'bold',
		colorScheme: {
			colors: ['#16161B', '#7E59EE', '#FEFEFD'],
			mapping: {
				backgroundColor: 0, // Dark background
				textColor: 2, // Light text
				buttonColor: 1, // Purple buttons
				buttonTextColor: 2, // Light button text
				buttonOutlineColor: 1, // Purple outline
				blockColor: 0, // Dark blocks
				blockTextColor: 2, // Light block text
				bannerColor: 1, // Purple banner
			},
		},
	},
	'urban-chic': {
		name: 'Urban Chic',
		type: 'bold',
		colorScheme: {
			colors: ['#FFFFFE', '#4EC3CE', '#181818'],
			mapping: {
				backgroundColor: 0, // White background
				textColor: 2, // Black text
				buttonColor: 1, // Cyan buttons
				buttonTextColor: 0, // White button text
				buttonOutlineColor: 2, // Black outline
				blockColor: 0, // White blocks
				blockTextColor: 2, // Black block text
				bannerColor: 1, // Cyan banner
			},
		},
	},
	'midnight-sun': {
		name: 'Midnight Sun',
		type: 'bold',
		colorScheme: {
			colors: ['#100E17', '#FD8808', '#FFFFFE'],
			mapping: {
				backgroundColor: 0, // Dark background
				textColor: 2, // Light text
				buttonColor: 1, // Orange buttons
				buttonTextColor: 0, // Dark button text
				buttonOutlineColor: 1, // Orange outline
				blockColor: 0, // Dark blocks
				blockTextColor: 2, // Light block text
				bannerColor: 1, // Orange banner
			},
		},
	},
	'classic-contrast': {
		name: 'Classic Contrast',
		type: 'bold',
		colorScheme: {
			colors: ['#FFFFFE', '#F7D100', '#262142'],
			mapping: {
				backgroundColor: 0, // White background
				textColor: 2, // Dark purple text
				buttonColor: 1, // Yellow buttons
				buttonTextColor: 2, // Dark button text
				buttonOutlineColor: 2, // Dark purple outline
				blockColor: 0, // White blocks
				blockTextColor: 2, // Dark block text
				bannerColor: 1, // Yellow banner
			},
		},
	},
	'silver-dawn': {
		name: 'Silver Dawn',
		type: 'bold',
		colorScheme: {
			colors: ['#EFF0F3', '#FD8C3A', '#0D0D0D'],
			mapping: {
				backgroundColor: 0, // Light gray background
				textColor: 2, // Black text
				buttonColor: 1, // Orange buttons
				buttonTextColor: 2, // Black button text
				buttonOutlineColor: 2, // Black outline
				blockColor: 0, // Light gray blocks
				blockTextColor: 2, // Black block text
				bannerColor: 1, // Orange banner
			},
		},
	},
	'monochrome-accent': {
		name: 'Monochrome Accent',
		type: 'bold',
		colorScheme: {
			colors: ['#000000', '#FFFFFF', '#5B8DEE'],
			mapping: {
				backgroundColor: 1, // White background
				textColor: 0, // Black text
				buttonColor: 2, // Blue buttons
				buttonTextColor: 1, // White button text
				buttonOutlineColor: 0, // Black outline
				blockColor: 1, // White blocks
				blockTextColor: 0, // Black block text
				bannerColor: 2, // Blue banner
			},
		},
	},

	// Playful presets
	'blue-skies': {
		name: 'Blue Skies',
		type: 'playful',
		colorScheme: {
			colors: ['oklch(35% 0.12 260)', 'oklch(60% 0.18 250)', 'oklch(93% 0.05 240)'],
			mapping: {
				backgroundColor: 2, // Light blue background
				textColor: 0, // Dark blue text
				buttonColor: 1, // Medium blue buttons
				buttonTextColor: 2, // Light blue button text
				buttonOutlineColor: 0, // Dark blue outline
				blockColor: 0, // Dark blue blocks
				blockTextColor: 2, // Light blue block text
				bannerColor: 1, // Medium blue banner
			},
		},
	},
	'neon-nights': {
		name: 'Neon Nights',
		type: 'playful',
		colorScheme: {
			colors: ['#1A1A1A', '#00FF88', '#FF00FF'],
			mapping: {
				backgroundColor: 0, // Black background
				textColor: 1, // Neon green text
				buttonColor: 2, // Magenta buttons
				buttonTextColor: 0, // Black button text
				buttonOutlineColor: 1, // Neon green outline
				blockColor: 2, // Magenta blocks
				blockTextColor: 0, // Black block text
				bannerColor: 1, // Neon green banner
			},
		},
	},
	'sunny-pastel': {
		name: 'Sunny Pastel',
		type: 'playful',
		colorScheme: {
			colors: ['#FEF6E4', '#F280AB', '#031857'],
			mapping: {
				backgroundColor: 0, // Light cream background
				textColor: 2, // Dark blue text
				buttonColor: 1, // Pink buttons
				buttonTextColor: 2, // Dark button text
				buttonOutlineColor: 2, // Dark blue outline
				blockColor: 0, // Light cream blocks
				blockTextColor: 2, // Dark block text
				bannerColor: 1, // Pink banner
			},
		},
	},
	'tropical-green': {
		name: 'Tropical Green',
		type: 'playful',
		colorScheme: {
			colors: ['#F2F7F5', '#F5AB2B', '#00473F'],
			mapping: {
				backgroundColor: 0, // Light mint background
				textColor: 2, // Dark green text
				buttonColor: 1, // Yellow buttons
				buttonTextColor: 2, // Dark button text
				buttonOutlineColor: 2, // Dark green outline
				blockColor: 0, // Light mint blocks
				blockTextColor: 2, // Dark green block text
				bannerColor: 1, // Yellow banner
			},
		},
	},
	'oceanic-wave': {
		name: 'Oceanic Wave',
		type: 'playful',
		colorScheme: {
			colors: ['#FFFFFE', '#00E9C5', '#02204C'],
			mapping: {
				backgroundColor: 0, // White background
				textColor: 2, // Dark blue text
				buttonColor: 1, // Cyan buttons
				buttonTextColor: 2, // Dark button text
				buttonOutlineColor: 2, // Dark blue outline
				blockColor: 0, // White blocks
				blockTextColor: 2, // Dark blue block text
				bannerColor: 1, // Cyan banner
			},
		},
	},
	'royal-purple': {
		name: 'Royal Purple',
		type: 'playful',
		colorScheme: {
			colors: ['#FFFFFE', '#9D91D8', '#292B32'],
			mapping: {
				backgroundColor: 0, // White background
				textColor: 2, // Dark text
				buttonColor: 1, // Purple buttons
				buttonTextColor: 2, // Dark button text
				buttonOutlineColor: 2, // Dark outline
				blockColor: 0, // White blocks
				blockTextColor: 2, // Dark block text
				bannerColor: 1, // Purple banner
			},
		},
	},
	'blossom-pink': {
		name: 'Blossom Pink',
		type: 'playful',
		colorScheme: {
			colors: ['#FEC7D7', '#EF7EA9', '#0E172C'],
			mapping: {
				backgroundColor: 0, // Light pink background
				textColor: 2, // Dark text
				buttonColor: 1, // Pink buttons
				buttonTextColor: 2, // Dark button text
				buttonOutlineColor: 2, // Dark outline
				blockColor: 0, // Light pink blocks
				blockTextColor: 2, // Dark block text
				bannerColor: 1, // Pink banner
			},
		},
	},
};

// Font presets
export const FONT_PRESETS: Record<FontPreset, FontConfig> = {
	// Modern fonts
	'modern.cal': {
		name: 'Cal',
		headingFont:
			"var(--font-heading, 'Cal Sans'), 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
		bodyFont: "var(--font-poppins, 'Poppins'), sans-serif",
	},
	'modern.montserrat': {
		name: 'Montserrat',
		headingFont: "var(--font-montserrat, 'Montserrat'), sans-serif",
		bodyFont: "var(--font-montserrat, 'Montserrat'), sans-serif",
	},
	'modern.bowlbyOne': {
		name: 'Bowlby One',
		headingFont: "var(--font-bowlby-one, 'Bowlby One'), sans-serif",
		bodyFont: "var(--font-alata, 'Alata'), sans-serif",
	},
	'modern.anton': {
		name: 'Anton',
		headingFont: "var(--font-anton, 'Anton'), sans-serif",
		bodyFont: "var(--font-gothic-a1, 'Gothic A1'), sans-serif",
	},
	// Classic fonts
	'classic.playfairDisplay': {
		name: 'Playfair Display',
		headingFont: "var(--font-playfair-display, 'Playfair Display'), serif",
		bodyFont: "var(--font-inter, 'Inter'), sans-serif",
	},
	'classic.playfairDisplaySc': {
		name: 'Playfair Display SC',
		headingFont: "var(--font-playfair-display-sc, 'Playfair Display SC'), serif",
		bodyFont: "var(--font-playfair-display, 'Playfair Display'), serif",
	},
	'classic.cutive': {
		name: 'Cutive',
		headingFont: "var(--font-cutive, 'Cutive'), serif",
		bodyFont: "var(--font-aleo, 'Aleo'), serif",
	},
	'classic.libreBaskerville': {
		name: 'Libre Baskerville',
		headingFont: "var(--font-libre-baskerville, 'Libre Baskerville'), serif",
		bodyFont: "var(--font-libre-baskerville, 'Libre Baskerville'), serif",
	},
	// Creative fonts
	'creative.fredokaOne': {
		name: 'Fredoka One',
		headingFont: "var(--font-fredoka-one, 'Fredoka One'), sans-serif",
		bodyFont: "var(--font-open-sans, 'Open Sans'), sans-serif",
	},
	'creative.yellowtail': {
		name: 'Yellowtail',
		headingFont: "var(--font-yellowtail, 'Yellowtail'), cursive",
		bodyFont: "var(--font-open-sans, 'Open Sans'), sans-serif",
	},
	'creative.permanentMarker': {
		name: 'Permanent Marker',
		headingFont: "var(--font-permanent-marker, 'Permanent Marker'), cursive",
		bodyFont: "var(--font-inter, 'Inter'), sans-serif",
	},
	'creative.pacifico': {
		name: 'Pacifico',
		headingFont: "var(--font-pacifico, 'Pacifico'), cursive",
		bodyFont: "var(--font-noto-serif, 'Noto Serif'), serif",
	},
	// Logo fonts
	'logo.coda': {
		name: 'Monofett',
		headingFont: "var(--font-monofett, 'Monofett'), sans-serif",
		bodyFont: "var(--font-coda, 'Coda'), sans-serif",
	},
	'logo.miriamLibre': {
		name: 'Fascinate',
		headingFont: "var(--font-fascinate, 'Fascinate'), sans-serif",
		bodyFont: "var(--font-miriam-libre, 'Miriam Libre'), sans-serif",
	},
	'logo.rammettoOne': {
		name: 'Rammetto One',
		headingFont: "var(--font-rammetto-one, 'Rammetto One'), sans-serif",
		bodyFont: "var(--font-poppins, 'Poppins'), sans-serif",
	},
	'logo.gravitasOne': {
		name: 'Gravitas One',
		headingFont: "var(--font-gravitas-one, 'Gravitas One'), sans-serif",
		bodyFont: "var(--font-libre-franklin, 'Libre Franklin'), sans-serif",
	},
	// Futuristic fonts
	'futuristic.museoModerno': {
		name: 'MuseoModerno',
		headingFont: "var(--font-museo-moderno, 'MuseoModerno'), sans-serif",
		bodyFont: "var(--font-dm-sans, 'DM Sans'), sans-serif",
	},
	'futuristic.audiowide': {
		name: 'Audiowide',
		headingFont: "var(--font-audiowide, 'Audiowide'), sans-serif",
		bodyFont: "var(--font-space-mono, 'Space Mono'), monospace",
	},
	'futuristic.lexendZetta': {
		name: 'Lexend Zetta',
		headingFont: "var(--font-lexend-zetta, 'Lexend Zetta'), sans-serif",
		bodyFont: "var(--font-montserrat, 'Montserrat'), sans-serif",
	},
	'futuristic.unicaOne': {
		name: 'Unica One',
		headingFont: "var(--font-unica-one, 'Unica One'), sans-serif",
		bodyFont: "var(--font-poppins, 'Poppins'), 'Helvetica', sans-serif",
	},
	// Custom
	custom: {
		name: 'Custom',
		headingFont: 'inherit',
		bodyFont: 'inherit',
	},
};

// Helper function to shuffle color mapping
export function shuffleColorMapping(colorScheme: ColorScheme): ColorScheme {
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

// Helper function to get computed styles from config

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
			fonts: FONT_PRESETS['modern.cal'],
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
	const fonts = FONT_PRESETS[fontPreset];

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
export function getThemesByCategory(category: ThemeCategory) {
	return Object.entries(THEMES)
		.filter(([_, theme]) => theme.category === category)
		.map(([key, theme]) => ({ key, ...theme }));
}

// Get appearance presets by type
export function getAppearancesByType(type: ColorPreset['type']) {
	return Object.entries(COLOR_PRESETS)
		.filter(([_, preset]) => preset.type === type)
		.map(([key, preset]) => ({ key, ...preset }));
}

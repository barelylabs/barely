export const BRAND_KIT_THEME_CATEGORIES = ['classic', 'vibrant', 'cozy', 'bold'] as const;
export type BrandKitThemeCategory = (typeof BRAND_KIT_THEME_CATEGORIES)[number];

export const BRAND_KIT_FONT_PRESET_KEYS = [
	// modern
	'modern.cal',
	'modern.montserrat',
	'modern.bowlbyOne',
	'modern.anton',
	// classic
	'classic.playfairDisplay',
	'classic.playfairDisplaySc',
	'classic.cutive',
	'classic.libreBaskerville',
	// creative
	'creative.fredokaOne',
	'creative.yellowtail',
	'creative.permanentMarker',
	'creative.pacifico',
	// logo
	'logo.coda',
	'logo.miriamLibre',
	'logo.rammettoOne',
	'logo.gravitasOne',
	// futuristic
	'futuristic.museoModerno',
	'futuristic.audiowide',
	'futuristic.lexendZetta',
	'futuristic.unicaOne',
	// custom
	'custom',
] as const;
export type BrandKitFontPresetKey = (typeof BRAND_KIT_FONT_PRESET_KEYS)[number];
export interface FontConfig {
	name: string;
	headingFont: string;
	bodyFont: string;
}
export const BRAND_KIT_FONT_PRESETS: Record<BrandKitFontPresetKey, FontConfig> = {
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
// export type BrandKitFontPreset = BrandKitFontPresetKey extends keyof typeof BRAND_KIT_FONT_PRESETS

export const BRAND_KIT_BLOCK_STYLES = [
	'rounded',
	'oval',
	'square',
	'full-width',
] as const;
export type BrandKitBlockStyle = (typeof BRAND_KIT_BLOCK_STYLES)[number];

export const BRAND_KIT_COLOR_PRESET_TYPES = [
	'neutral',
	'bold',
	'playful',
	'brand-kit',
	'custom',
] as const;
export type BrandKitColorPresetType = (typeof BRAND_KIT_COLOR_PRESET_TYPES)[number];

export const BRAND_KIT_COLOR_PRESET_KEYS = [
	'basic-grayscale',
	'emerald-sea',
	'golden-sand',
	'misty-harbor',
	'twilight-blue',
	'earthy-elegance',

	'galaxy-night',
	'urban-chic',
	'midnight-sun',
	'classic-contrast',
	'silver-dawn',
	'monochrome-accent',
	'blue-skies',
	'neon-nights',
	'sunny-pastel',
	'tropical-green',
	'oceanic-wave',
	'royal-purple',
	'blossom-pink',
] as const;

export type BrandKitColorPresetKey = (typeof BRAND_KIT_COLOR_PRESET_KEYS)[number];

// Bio-specific color mapping
export interface BioColorMapping {
	bgColor: 0 | 1 | 2;
	textColor: 0 | 1 | 2;
	blockColor: 0 | 1 | 2;
	blockTextColor: 0 | 1 | 2;
	bannerColor: 0 | 1 | 2;
}

// Cart-specific color mapping
export interface CartColorMapping {
	bgColor: 0 | 1 | 2;
	textColor: 0 | 1 | 2;
	blockColor: 0 | 1 | 2;
	blockTextColor: 0 | 1 | 2;
}

// Legacy color scheme interface (for backwards compatibility)
export interface BrandKitColorScheme {
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

// New color preset structure
export interface BrandKitColorPreset {
	name: string;
	type: 'neutral' | 'bold' | 'playful' | 'brand-kit' | 'custom';
	colors: [string, string, string]; // 3 OKLCH colors
	bioMapping: BioColorMapping;
	cartMapping: CartColorMapping;
	// Legacy field for backwards compatibility
	colorScheme: BrandKitColorScheme;
}

export const BRAND_KIT_COLOR_PRESETS: Record<
	BrandKitColorPresetKey,
	BrandKitColorPreset
> = {
	// Neutral presets
	'basic-grayscale': {
		name: 'Basic Grayscale',
		type: 'neutral',
		colors: ['oklch(0.00 0.000 0)', 'oklch(0.60 0.000 0)', 'oklch(1.00 0.000 0)'] as [
			string,
			string,
			string,
		],
		bioMapping: {
			bgColor: 2, // White background
			textColor: 0, // Black text
			blockColor: 2, // White blocks
			blockTextColor: 0, // Black text on blocks
			bannerColor: 1, // Gray banner
		},
		cartMapping: {
			bgColor: 2, // White background
			textColor: 0, // Black text
			blockColor: 0, // Black accents
			blockTextColor: 2, // White text on blocks
		},
		// Legacy field for backwards compatibility
		colorScheme: {
			colors: ['oklch(0.00 0.000 0)', 'oklch(0.60 0.000 0)', 'oklch(1.00 0.000 0)'],
			mapping: {
				backgroundColor: 2,
				textColor: 0,
				buttonColor: 2,
				buttonTextColor: 0,
				buttonOutlineColor: 0,
				blockColor: 2,
				blockTextColor: 0,
				bannerColor: 1,
			},
		},
	},
	'emerald-sea': {
		name: 'Emerald Sea',
		type: 'neutral',
		colors: ['oklch(0.32 0.052 203)', 'oklch(0.78 0.112 189)', 'oklch(0.99 0.013 145)'],
		bioMapping: {
			bgColor: 2, // Light background for bio
			textColor: 0, // Dark text
			blockColor: 0, // Dark blocks for impact
			blockTextColor: 2, // Light text on blocks
			bannerColor: 1, // Medium accent banner
		},
		cartMapping: {
			bgColor: 2, // Light background for cart
			textColor: 0, // Dark text
			blockColor: 1, // Accent color for CTAs
			blockTextColor: 2, // Light text on accents
		},
		// Legacy for backwards compatibility
		colorScheme: {
			colors: ['oklch(0.32 0.052 203)', 'oklch(0.78 0.112 189)', 'oklch(0.99 0.013 145)'],
			mapping: {
				backgroundColor: 2,
				textColor: 0,
				buttonColor: 1,
				buttonTextColor: 2,
				buttonOutlineColor: 0,
				blockColor: 0,
				blockTextColor: 2,
				bannerColor: 1,
			},
		},
	},
	'golden-sand': {
		name: 'Golden Sand',
		type: 'neutral',
		colors: ['oklch(0.97 0.009 68)', 'oklch(0.58 0.060 84)', 'oklch(0.16 0.058 269)'],
		bioMapping: {
			bgColor: 0, // Light golden background
			textColor: 2, // Dark blue text
			blockColor: 0, // Light golden blocks
			blockTextColor: 2, // Dark blue block text
			bannerColor: 1, // Golden banner
		},
		cartMapping: {
			bgColor: 0, // Light golden background
			textColor: 2, // Dark blue text
			blockColor: 1, // Golden accents for CTAs
			blockTextColor: 0, // Light text on golden accents
		},
		// Legacy for backwards compatibility
		colorScheme: {
			colors: ['oklch(0.97 0.009 68)', 'oklch(0.58 0.060 84)', 'oklch(0.16 0.058 269)'],
			mapping: {
				backgroundColor: 0,
				textColor: 2,
				buttonColor: 1,
				buttonTextColor: 0,
				buttonOutlineColor: 2,
				blockColor: 0,
				blockTextColor: 2,
				bannerColor: 1,
			},
		},
	},
	'misty-harbor': {
		name: 'Misty Harbor',
		type: 'neutral',
		colors: ['oklch(0.97 0.000 0)', 'oklch(0.71 0.076 196)', 'oklch(0.36 0.039 249)'],
		bioMapping: {
			bgColor: 0, // Light gray background
			textColor: 2, // Dark gray text
			blockColor: 0, // Light gray blocks
			blockTextColor: 2, // Dark gray block text
			bannerColor: 1, // Teal banner
		},
		cartMapping: {
			bgColor: 0, // Light gray background
			textColor: 2, // Dark gray text
			blockColor: 1, // Teal accents for CTAs
			blockTextColor: 0, // Light text on teal
		},
		// Legacy for backwards compatibility
		colorScheme: {
			colors: ['oklch(0.97 0.000 0)', 'oklch(0.71 0.076 196)', 'oklch(0.36 0.039 249)'],
			mapping: {
				backgroundColor: 0,
				textColor: 2,
				buttonColor: 1,
				buttonTextColor: 0,
				buttonOutlineColor: 2,
				blockColor: 0,
				blockTextColor: 2,
				bannerColor: 1,
			},
		},
	},
	'twilight-blue': {
		name: 'Twilight Blue',
		type: 'neutral',
		colors: ['oklch(0.29 0.055 277)', 'oklch(0.45 0.063 270)', 'oklch(0.99 0.001 106)'],
		bioMapping: {
			bgColor: 2, // Light background
			textColor: 0, // Dark blue text
			blockColor: 0, // Dark blue blocks
			blockTextColor: 2, // Light block text
			bannerColor: 1, // Medium blue banner
		},
		cartMapping: {
			bgColor: 2, // Light background
			textColor: 0, // Dark blue text
			blockColor: 1, // Medium blue accents
			blockTextColor: 2, // Light text on blue
		},
		// Legacy for backwards compatibility
		colorScheme: {
			colors: ['oklch(0.29 0.055 277)', 'oklch(0.45 0.063 270)', 'oklch(0.99 0.001 106)'],
			mapping: {
				backgroundColor: 2,
				textColor: 0,
				buttonColor: 1,
				buttonTextColor: 2,
				buttonOutlineColor: 0,
				blockColor: 0,
				blockTextColor: 2,
				bannerColor: 1,
			},
		},
	},
	'earthy-elegance': {
		name: 'Earthy Elegance',
		type: 'neutral',
		colors: ['oklch(0.40 0.045 46)', 'oklch(0.71 0.076 76)', 'oklch(0.93 0.030 74)'],
		bioMapping: {
			bgColor: 2, // Light cream background
			textColor: 0, // Dark brown text
			blockColor: 2, // Light cream blocks
			blockTextColor: 0, // Dark brown block text
			bannerColor: 1, // Orange banner
		},
		cartMapping: {
			bgColor: 2, // Light cream background
			textColor: 0, // Dark brown text
			blockColor: 1, // Orange accents
			blockTextColor: 2, // Light text on orange
		},
		// Legacy for backwards compatibility
		colorScheme: {
			colors: ['oklch(0.40 0.045 46)', 'oklch(0.71 0.076 76)', 'oklch(0.93 0.030 74)'],
			mapping: {
				backgroundColor: 2,
				textColor: 0,
				buttonColor: 1,
				buttonTextColor: 2,
				buttonOutlineColor: 0,
				blockColor: 2,
				blockTextColor: 0,
				bannerColor: 1,
			},
		},
	},

	// Bold presets
	'galaxy-night': {
		name: 'Galaxy Night',
		type: 'bold',
		colors: ['oklch(0.20 0.010 285)', 'oklch(0.58 0.213 290)', 'oklch(1.00 0.001 106)'],
		bioMapping: {
			bgColor: 0, // Dark background
			textColor: 2, // Light text
			blockColor: 0, // Dark blocks
			blockTextColor: 2, // Light block text
			bannerColor: 1, // Purple banner
		},
		cartMapping: {
			bgColor: 2, // Light background for cart
			textColor: 0, // Dark text
			blockColor: 1, // Purple accents
			blockTextColor: 2, // Light text on purple
		},
		// Legacy for backwards compatibility
		colorScheme: {
			colors: ['oklch(0.20 0.010 285)', 'oklch(0.58 0.213 290)', 'oklch(1.00 0.001 106)'],
			mapping: {
				backgroundColor: 0,
				textColor: 2,
				buttonColor: 1,
				buttonTextColor: 2,
				buttonOutlineColor: 1,
				blockColor: 0,
				blockTextColor: 2,
				bannerColor: 1,
			},
		},
	},
	'urban-chic': {
		name: 'Urban Chic',
		type: 'bold',
		colors: ['oklch(1.00 0.001 106)', 'oklch(0.76 0.105 204)', 'oklch(0.21 0.000 0)'],
		bioMapping: {
			bgColor: 0, // White background
			textColor: 2, // Black text
			blockColor: 0, // White blocks
			blockTextColor: 2, // Black block text
			bannerColor: 1, // Cyan banner
		},
		cartMapping: {
			bgColor: 0, // White background
			textColor: 2, // Black text
			blockColor: 1, // Cyan accents
			blockTextColor: 0, // White text on cyan
		},
		// Legacy for backwards compatibility
		colorScheme: {
			colors: ['oklch(1.00 0.001 106)', 'oklch(0.76 0.105 204)', 'oklch(0.21 0.000 0)'],
			mapping: {
				backgroundColor: 0,
				textColor: 2,
				buttonColor: 1,
				buttonTextColor: 0,
				buttonOutlineColor: 2,
				blockColor: 0,
				blockTextColor: 2,
				bannerColor: 1,
			},
		},
	},
	'midnight-sun': {
		name: 'Midnight Sun',
		type: 'bold',
		colors: ['oklch(0.17 0.019 295)', 'oklch(0.74 0.179 57)', 'oklch(1.00 0.001 106)'],
		bioMapping: {
			bgColor: 0, // Dark background
			textColor: 2, // Light text
			blockColor: 0, // Dark blocks
			blockTextColor: 2, // Light block text
			bannerColor: 1, // Orange banner
		},
		cartMapping: {
			bgColor: 2, // Light background for cart
			textColor: 0, // Dark text
			blockColor: 1, // Orange accents
			blockTextColor: 0, // Dark text on orange
		},
		// Legacy for backwards compatibility
		colorScheme: {
			colors: ['oklch(0.17 0.019 295)', 'oklch(0.74 0.179 57)', 'oklch(1.00 0.001 106)'],
			mapping: {
				backgroundColor: 0,
				textColor: 2,
				buttonColor: 1,
				buttonTextColor: 0,
				buttonOutlineColor: 1,
				blockColor: 0,
				blockTextColor: 2,
				bannerColor: 1,
			},
		},
	},
	'classic-contrast': {
		name: 'Classic Contrast',
		type: 'bold',
		colors: ['oklch(1.00 0.001 106)', 'oklch(0.87 0.178 96)', 'oklch(0.27 0.060 289)'],
		bioMapping: {
			bgColor: 0, // White background
			textColor: 2, // Dark purple text
			blockColor: 0, // White blocks
			blockTextColor: 2, // Dark block text
			bannerColor: 1, // Yellow banner
		},
		cartMapping: {
			bgColor: 0, // White background
			textColor: 2, // Dark purple text
			blockColor: 1, // Yellow accents
			blockTextColor: 2, // Dark text on yellow
		},
		// Legacy for backwards compatibility
		colorScheme: {
			colors: ['oklch(1.00 0.001 106)', 'oklch(0.87 0.178 96)', 'oklch(0.27 0.060 289)'],
			mapping: {
				backgroundColor: 0,
				textColor: 2,
				buttonColor: 1,
				buttonTextColor: 2,
				buttonOutlineColor: 2,
				blockColor: 0,
				blockTextColor: 2,
				bannerColor: 1,
			},
		},
	},
	'silver-dawn': {
		name: 'Silver Dawn',
		type: 'bold',
		colors: ['oklch(0.96 0.004 271)', 'oklch(0.75 0.165 53)', 'oklch(0.16 0.000 0)'],
		bioMapping: {
			bgColor: 0, // Light gray background
			textColor: 2, // Black text
			blockColor: 0, // Light gray blocks
			blockTextColor: 2, // Black block text
			bannerColor: 1, // Orange banner
		},
		cartMapping: {
			bgColor: 0, // Light gray background
			textColor: 2, // Black text
			blockColor: 1, // Orange accents
			blockTextColor: 2, // Black text on orange
		},
		// Legacy for backwards compatibility
		colorScheme: {
			colors: ['oklch(0.96 0.004 271)', 'oklch(0.75 0.165 53)', 'oklch(0.16 0.000 0)'],
			mapping: {
				backgroundColor: 0,
				textColor: 2,
				buttonColor: 1,
				buttonTextColor: 2,
				buttonOutlineColor: 2,
				blockColor: 0,
				blockTextColor: 2,
				bannerColor: 1,
			},
		},
	},
	'monochrome-accent': {
		name: 'Monochrome Accent',
		type: 'bold',
		colors: ['oklch(0.00 0.000 0)', 'oklch(1.00 0.000 0)', 'oklch(0.65 0.155 262)'],
		bioMapping: {
			bgColor: 1, // White background
			textColor: 0, // Black text
			blockColor: 1, // White blocks
			blockTextColor: 0, // Black block text
			bannerColor: 2, // Blue banner
		},
		cartMapping: {
			bgColor: 1, // White background
			textColor: 0, // Black text
			blockColor: 2, // Blue accents
			blockTextColor: 1, // White text on blue
		},
		// Legacy for backwards compatibility
		colorScheme: {
			colors: ['oklch(0.00 0.000 0)', 'oklch(1.00 0.000 0)', 'oklch(0.65 0.155 262)'],
			mapping: {
				backgroundColor: 1,
				textColor: 0,
				buttonColor: 2,
				buttonTextColor: 1,
				buttonOutlineColor: 0,
				blockColor: 1,
				blockTextColor: 0,
				bannerColor: 2,
			},
		},
	},

	// Playful presets
	'blue-skies': {
		name: 'Blue Skies',
		type: 'playful',
		colors: ['oklch(0.35 0.120 260)', 'oklch(0.60 0.180 250)', 'oklch(0.93 0.050 240)'],
		bioMapping: {
			bgColor: 2, // Light blue background
			textColor: 0, // Dark blue text
			blockColor: 0, // Dark blue blocks
			blockTextColor: 2, // Light blue block text
			bannerColor: 1, // Medium blue banner
		},
		cartMapping: {
			bgColor: 2, // Light blue background
			textColor: 0, // Dark blue text
			blockColor: 1, // Medium blue accents
			blockTextColor: 2, // Light text on blue
		},
		// Legacy for backwards compatibility
		colorScheme: {
			colors: ['oklch(0.35 0.120 260)', 'oklch(0.60 0.180 250)', 'oklch(0.93 0.050 240)'],
			mapping: {
				backgroundColor: 2,
				textColor: 0,
				buttonColor: 1,
				buttonTextColor: 2,
				buttonOutlineColor: 0,
				blockColor: 0,
				blockTextColor: 2,
				bannerColor: 1,
			},
		},
	},
	'neon-nights': {
		name: 'Neon Nights',
		type: 'playful',
		colors: ['oklch(0.22 0.000 0)', 'oklch(0.88 0.228 153)', 'oklch(0.70 0.322 328)'],
		bioMapping: {
			bgColor: 0, // Black background
			textColor: 1, // Neon green text
			blockColor: 2, // Magenta blocks
			blockTextColor: 0, // Black block text
			bannerColor: 1, // Neon green banner
		},
		cartMapping: {
			bgColor: 0, // Black background for bold cart
			textColor: 1, // Neon green text
			blockColor: 2, // Magenta accents
			blockTextColor: 0, // Black text on magenta
		},
		// Legacy for backwards compatibility
		colorScheme: {
			colors: ['oklch(0.22 0.000 0)', 'oklch(0.88 0.228 153)', 'oklch(0.70 0.322 328)'],
			mapping: {
				backgroundColor: 0,
				textColor: 1,
				buttonColor: 2,
				buttonTextColor: 0,
				buttonOutlineColor: 1,
				blockColor: 2,
				blockTextColor: 0,
				bannerColor: 1,
			},
		},
	},
	'sunny-pastel': {
		name: 'Sunny Pastel',
		type: 'playful',
		colors: ['oklch(0.97 0.025 87)', 'oklch(0.74 0.147 357)', 'oklch(0.25 0.116 264)'],
		bioMapping: {
			bgColor: 0, // Light cream background
			textColor: 2, // Dark blue text
			blockColor: 0, // Light cream blocks
			blockTextColor: 2, // Dark block text
			bannerColor: 1, // Pink banner
		},
		cartMapping: {
			bgColor: 0, // Light cream background
			textColor: 2, // Dark blue text
			blockColor: 1, // Pink accents
			blockTextColor: 2, // Dark text on pink
		},
		// Legacy for backwards compatibility
		colorScheme: {
			colors: ['oklch(0.97 0.025 87)', 'oklch(0.74 0.147 357)', 'oklch(0.25 0.116 264)'],
			mapping: {
				backgroundColor: 0,
				textColor: 2,
				buttonColor: 1,
				buttonTextColor: 2,
				buttonOutlineColor: 2,
				blockColor: 0,
				blockTextColor: 2,
				bannerColor: 1,
			},
		},
	},
	'tropical-green': {
		name: 'Tropical Green',
		type: 'playful',
		colors: ['oklch(0.97 0.006 170)', 'oklch(0.79 0.156 75)', 'oklch(0.36 0.064 182)'],
		bioMapping: {
			bgColor: 0, // Light mint background
			textColor: 2, // Dark green text
			blockColor: 0, // Light mint blocks
			blockTextColor: 2, // Dark green block text
			bannerColor: 1, // Yellow banner
		},
		cartMapping: {
			bgColor: 0, // Light mint background
			textColor: 2, // Dark green text
			blockColor: 1, // Yellow accents
			blockTextColor: 2, // Dark text on yellow
		},
		// Legacy for backwards compatibility
		colorScheme: {
			colors: ['oklch(0.97 0.006 170)', 'oklch(0.79 0.156 75)', 'oklch(0.36 0.064 182)'],
			mapping: {
				backgroundColor: 0,
				textColor: 2,
				buttonColor: 1,
				buttonTextColor: 2,
				buttonOutlineColor: 2,
				blockColor: 0,
				blockTextColor: 2,
				bannerColor: 1,
			},
		},
	},
	'oceanic-wave': {
		name: 'Oceanic Wave',
		type: 'playful',
		colors: ['oklch(1.00 0.001 106)', 'oklch(0.83 0.156 176)', 'oklch(0.25 0.089 258)'],
		bioMapping: {
			bgColor: 0, // White background
			textColor: 2, // Dark blue text
			blockColor: 0, // White blocks
			blockTextColor: 2, // Dark blue block text
			bannerColor: 1, // Cyan banner
		},
		cartMapping: {
			bgColor: 0, // White background
			textColor: 2, // Dark blue text
			blockColor: 1, // Cyan accents
			blockTextColor: 2, // Dark text on cyan
		},
		// Legacy for backwards compatibility
		colorScheme: {
			colors: ['oklch(1.00 0.001 106)', 'oklch(0.83 0.156 176)', 'oklch(0.25 0.089 258)'],
			mapping: {
				backgroundColor: 0,
				textColor: 2,
				buttonColor: 1,
				buttonTextColor: 2,
				buttonOutlineColor: 2,
				blockColor: 0,
				blockTextColor: 2,
				bannerColor: 1,
			},
		},
	},
	'royal-purple': {
		name: 'Royal Purple',
		type: 'playful',
		colors: ['oklch(1.00 0.001 106)', 'oklch(0.69 0.103 291)', 'oklch(0.29 0.013 273)'],
		bioMapping: {
			bgColor: 0, // White background
			textColor: 2, // Dark text
			blockColor: 0, // White blocks
			blockTextColor: 2, // Dark block text
			bannerColor: 1, // Purple banner
		},
		cartMapping: {
			bgColor: 0, // White background
			textColor: 2, // Dark text
			blockColor: 1, // Purple accents
			blockTextColor: 2, // Dark text on purple
		},
		// Legacy for backwards compatibility
		colorScheme: {
			colors: ['oklch(1.00 0.001 106)', 'oklch(0.69 0.103 291)', 'oklch(0.29 0.013 273)'],
			mapping: {
				backgroundColor: 0,
				textColor: 2,
				buttonColor: 1,
				buttonTextColor: 2,
				buttonOutlineColor: 2,
				blockColor: 0,
				blockTextColor: 2,
				bannerColor: 1,
			},
		},
	},
	'blossom-pink': {
		name: 'Blossom Pink',
		type: 'playful',
		colors: ['oklch(0.88 0.066 359)', 'oklch(0.73 0.146 357)', 'oklch(0.21 0.044 265)'],
		bioMapping: {
			bgColor: 0, // Light pink background
			textColor: 2, // Dark text
			blockColor: 0, // Light pink blocks
			blockTextColor: 2, // Dark block text
			bannerColor: 1, // Pink banner
		},
		cartMapping: {
			bgColor: 0, // Light pink background
			textColor: 2, // Dark text
			blockColor: 1, // Pink accents
			blockTextColor: 2, // Dark text on pink
		},
		// Legacy for backwards compatibility
		colorScheme: {
			colors: ['oklch(0.88 0.066 359)', 'oklch(0.73 0.146 357)', 'oklch(0.21 0.044 265)'],
			mapping: {
				backgroundColor: 0,
				textColor: 2,
				buttonColor: 1,
				buttonTextColor: 2,
				buttonOutlineColor: 2,
				blockColor: 0,
				blockTextColor: 2,
				bannerColor: 1,
			},
		},
	},
};

export interface ThemeConfig {
	category: BrandKitThemeCategory;
	name: string;
	description: string;
	defaultColorPreset: string; // color preset key
	defaultFont: BrandKitFontPresetKey;
	defaultBlockStyle: BrandKitBlockStyle;
}

export const BRAND_KIT_THEME_KEYS = [
	'timeless',
	'elegant',
	'electric',
	'sunset',
	'warm',
	'soft',
	'impact',
	'contrast',
] as const;

export type BrandKitThemeKey = (typeof BRAND_KIT_THEME_KEYS)[number];

// Theme definitions - 2 per category
export const BRAND_KIT_THEMES: Record<BrandKitThemeKey, ThemeConfig> = {
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

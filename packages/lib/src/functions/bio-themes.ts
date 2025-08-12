import type { LinkType } from './link-type.fns';

export type BioTheme =
	| 'default'
	| 'minimal'
	| 'neon'
	| 'sunset'
	| 'ocean'
	| 'forest'
	| 'monochrome';

export interface BioThemeConfig {
	name: string;
	// Button styles
	buttonBackground: string;
	buttonText: string;
	buttonBorder: string;
	buttonHoverBackground: string;
	buttonHoverBorder: string;
	// Page styles
	pageBackground: string;
	pageText: string;
	headingText: string;
	// Social button overrides (optional)
	socialButtonBackground?: string;
	socialButtonText?: string;
}

export const BIO_THEMES: Record<BioTheme, BioThemeConfig> = {
	default: {
		name: 'Default',
		buttonBackground: '#ffffff',
		buttonText: '#000000',
		buttonBorder: '#e5e5e5',
		buttonHoverBackground: '#f5f5f5',
		buttonHoverBorder: '#d4d4d4',
		pageBackground: '#ffffff',
		pageText: '#525252',
		headingText: '#000000',
	},
	minimal: {
		name: 'Minimal',
		buttonBackground: 'transparent',
		buttonText: '#000000',
		buttonBorder: '#000000',
		buttonHoverBackground: '#000000',
		buttonHoverBorder: '#000000',
		pageBackground: '#fafafa',
		pageText: '#404040',
		headingText: '#000000',
		socialButtonBackground: 'transparent',
		socialButtonText: '#000000',
	},
	neon: {
		name: 'Neon Nights',
		buttonBackground: '#1a1a1a',
		buttonText: '#00ff88',
		buttonBorder: '#00ff88',
		buttonHoverBackground: '#00ff88',
		buttonHoverBorder: '#00ff88',
		pageBackground: '#0a0a0a',
		pageText: '#00ff88',
		headingText: '#00ffff',
	},
	sunset: {
		name: 'Sunset Vibes',
		buttonBackground: '#ff6b6b',
		buttonText: '#ffffff',
		buttonBorder: '#ff6b6b',
		buttonHoverBackground: '#ff5252',
		buttonHoverBorder: '#ff5252',
		pageBackground: 'linear-gradient(135deg, #667eea 0%, #f093fb 100%)',
		pageText: '#ffffff',
		headingText: '#ffffff',
		socialButtonBackground: '#ffffff20',
		socialButtonText: '#ffffff',
	},
	ocean: {
		name: 'Ocean Blue',
		buttonBackground: '#0891b2',
		buttonText: '#ffffff',
		buttonBorder: '#0891b2',
		buttonHoverBackground: '#0e7490',
		buttonHoverBorder: '#0e7490',
		pageBackground: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
		pageText: '#ffffff',
		headingText: '#ffffff',
		socialButtonBackground: '#ffffff20',
		socialButtonText: '#ffffff',
	},
	forest: {
		name: 'Forest Green',
		buttonBackground: '#16a34a',
		buttonText: '#ffffff',
		buttonBorder: '#16a34a',
		buttonHoverBackground: '#15803d',
		buttonHoverBorder: '#15803d',
		pageBackground: 'linear-gradient(135deg, #134e4a 0%, #14532d 100%)',
		pageText: '#d1fae5',
		headingText: '#ffffff',
		socialButtonBackground: '#ffffff15',
		socialButtonText: '#d1fae5',
	},
	monochrome: {
		name: 'Monochrome',
		buttonBackground: '#000000',
		buttonText: '#ffffff',
		buttonBorder: '#000000',
		buttonHoverBackground: '#262626',
		buttonHoverBorder: '#262626',
		pageBackground: '#ffffff',
		pageText: '#525252',
		headingText: '#000000',
	},
};

// Platform-specific brand colors that override theme colors
export const PLATFORM_COLORS: Partial<
	Record<LinkType, { background: string; text: string }>
> = {
	spotify: {
		background: '#1DB954',
		text: '#ffffff',
	},
	apple_music: {
		background: '#FC3C44',
		text: '#ffffff',
	},
	youtube: {
		background: '#FF0000',
		text: '#ffffff',
	},
	instagram: {
		background:
			'linear-gradient(45deg, #405DE6, #5B51D8, #833AB4, #C13584, #E1306C, #FD1D1D)',
		text: '#ffffff',
	},
	tiktok: {
		background: '#000000',
		text: '#ffffff',
	},
	twitter: {
		background: '#000000',
		text: '#ffffff',
	},
	facebook: {
		background: '#1877F2',
		text: '#ffffff',
	},
	soundcloud: {
		background: '#FF5500',
		text: '#ffffff',
	},
	bandcamp: {
		background: '#629AA9',
		text: '#ffffff',
	},
	patreon: {
		background: '#FF424D',
		text: '#ffffff',
	},
	discord: {
		background: '#5865F2',
		text: '#ffffff',
	},
	twitch: {
		background: '#9146FF',
		text: '#ffffff',
	},
};

/**
 * Get button styles based on theme and link type
 */
export function getButtonStyles(params: {
	theme: BioTheme;
	linkType?: LinkType;
	usePlatformColors?: boolean;
}): {
	background: string;
	text: string;
	border: string;
	hoverBackground: string;
	hoverBorder: string;
	hoverText: string;
} {
	const { theme, linkType, usePlatformColors = true } = params;
	const themeConfig = BIO_THEMES[theme];

	// If platform colors are enabled and this is a recognized platform
	if (usePlatformColors && linkType && PLATFORM_COLORS[linkType]) {
		const platformColor = PLATFORM_COLORS[linkType];
		return {
			background: platformColor.background,
			text: platformColor.text,
			border: platformColor.background,
			hoverBackground: platformColor.background,
			hoverBorder: platformColor.background,
			hoverText: platformColor.text,
		};
	}

	// For social buttons with theme overrides
	if (linkType && themeConfig.socialButtonBackground) {
		return {
			background: themeConfig.socialButtonBackground,
			text: themeConfig.socialButtonText ?? themeConfig.buttonText,
			border: themeConfig.socialButtonBackground,
			hoverBackground: themeConfig.buttonHoverBackground,
			hoverBorder: themeConfig.buttonHoverBorder,
			hoverText: themeConfig.buttonText,
		};
	}

	// Default theme styles
	return {
		background: themeConfig.buttonBackground,
		text: themeConfig.buttonText,
		border: themeConfig.buttonBorder,
		hoverBackground: themeConfig.buttonHoverBackground,
		hoverBorder: themeConfig.buttonHoverBorder,
		hoverText: theme === 'minimal' ? '#ffffff' : themeConfig.buttonText,
	};
}

/**
 * Generate CSS variables for a theme
 */
export function generateThemeCSSVariables(theme: BioTheme): string {
	const config = BIO_THEMES[theme];
	return `
		--bio-page-bg: ${config.pageBackground};
		--bio-page-text: ${config.pageText};
		--bio-heading-text: ${config.headingText};
		--bio-button-bg: ${config.buttonBackground};
		--bio-button-text: ${config.buttonText};
		--bio-button-border: ${config.buttonBorder};
		--bio-button-hover-bg: ${config.buttonHoverBackground};
		--bio-button-hover-border: ${config.buttonHoverBorder};
	`;
}

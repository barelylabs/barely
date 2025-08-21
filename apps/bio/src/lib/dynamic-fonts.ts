// Dynamic font loader for bio themes - conditionally applies font classes based on brandKit
import type { BrandKitFontPresetKey } from '@barely/const';
import {
	Alata,
	Aleo,
	Anton,
	Audiowide,
	Bowlby_One,
	Coda,
	Cutive,
	DM_Sans,
	Fascinate,
	Fredoka,
	Gothic_A1,
	Gravitas_One,
	Inter,
	Lexend_Zetta,
	Libre_Baskerville,
	Libre_Franklin,
	Miriam_Libre,
	Monofett,
	Montserrat,
	MuseoModerno,
	Noto_Serif,
	Open_Sans,
	Pacifico,
	Permanent_Marker,
	Playfair_Display,
	Playfair_Display_SC,
	Poppins,
	Rammetto_One,
	Space_Mono,
	Unica_One,
	Yellowtail,
} from 'next/font/google';
import localFont from 'next/font/local';

// Core font that's always loaded
export const inter = Inter({
	subsets: ['latin'],
	variable: '--font-inter',
	display: 'swap',
	adjustFontFallback: true,
});

// Define all fonts at module scope (required by Next.js)
// Only the CSS for actually used fonts will be included in the final bundle

const calSans = localFont({
	src: [
		{
			path: '../fonts/CalSans-SemiBold.woff2',
			weight: '600',
			style: 'normal',
		},
		{
			path: '../fonts/CalSans-SemiBold.woff',
			weight: '600',
			style: 'normal',
		},
		{
			path: '../fonts/CalSans-SemiBold.ttf',
			weight: '600',
			style: 'normal',
		},
	],
	variable: '--font-heading',
	display: 'swap',
	adjustFontFallback: 'Arial',
});

const poppins = Poppins({
	weight: ['300', '400', '500', '600', '700'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-poppins',
	adjustFontFallback: true,
});

const montserrat = Montserrat({
	weight: ['400', '500', '600', '700'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-montserrat',
	adjustFontFallback: true,
});

const bowlbyOne = Bowlby_One({
	weight: '400',
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-bowlby-one',
	adjustFontFallback: true,
});

const alata = Alata({
	weight: '400',
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-alata',
	adjustFontFallback: true,
});

const anton = Anton({
	weight: '400',
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-anton',
	adjustFontFallback: true,
});

const gothicA1 = Gothic_A1({
	weight: ['400', '500', '600', '700'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-gothic-a1',
	adjustFontFallback: true,
});

const playfairDisplay = Playfair_Display({
	weight: ['400', '500', '600', '700', '800', '900'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-playfair-display',
	adjustFontFallback: true,
});

const playfairDisplaySC = Playfair_Display_SC({
	weight: ['400', '700', '900'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-playfair-display-sc',
	adjustFontFallback: true,
});

const cutive = Cutive({
	weight: '400',
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-cutive',
	adjustFontFallback: true,
});

const aleo = Aleo({
	weight: ['300', '400', '500', '700'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-aleo',
	adjustFontFallback: true,
});

const libreBaskerville = Libre_Baskerville({
	weight: ['400', '700'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-libre-baskerville',
	adjustFontFallback: true,
});

const fredoka = Fredoka({
	weight: ['400', '500', '600', '700'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-fredoka-one',
	adjustFontFallback: true,
});

const yellowtail = Yellowtail({
	weight: '400',
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-yellowtail',
	adjustFontFallback: true,
});

const openSans = Open_Sans({
	weight: ['300', '400', '500', '600', '700'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-open-sans',
	adjustFontFallback: true,
});

const permanentMarker = Permanent_Marker({
	weight: '400',
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-permanent-marker',
	adjustFontFallback: true,
});

const pacifico = Pacifico({
	weight: '400',
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-pacifico',
	adjustFontFallback: true,
});

const notoSerif = Noto_Serif({
	weight: ['400', '500', '700'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-noto-serif',
	adjustFontFallback: true,
});

const monofett = Monofett({
	weight: '400',
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-monofett',
	adjustFontFallback: true,
});

const coda = Coda({
	weight: ['400', '800'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-coda',
	adjustFontFallback: true,
});

const fascinate = Fascinate({
	weight: '400',
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-fascinate',
	adjustFontFallback: true,
});

const miriamLibre = Miriam_Libre({
	weight: ['400', '700'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-miriam-libre',
	adjustFontFallback: true,
});

const rammettoOne = Rammetto_One({
	weight: '400',
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-rammetto-one',
	adjustFontFallback: true,
});

const gravitasOne = Gravitas_One({
	weight: '400',
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-gravitas-one',
	adjustFontFallback: true,
});

const libreFranklin = Libre_Franklin({
	weight: ['300', '400', '500', '600', '700'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-libre-franklin',
	adjustFontFallback: true,
});

const museoModerno = MuseoModerno({
	weight: ['400', '500', '600', '700'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-museo-moderno',
	adjustFontFallback: true,
});

const dmSans = DM_Sans({
	weight: ['400', '500', '700'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-dm-sans',
	adjustFontFallback: true,
});

const audiowide = Audiowide({
	weight: '400',
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-audiowide',
	adjustFontFallback: true,
});

const spaceMono = Space_Mono({
	weight: ['400', '700'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-space-mono',
	adjustFontFallback: true,
});

const lexendZetta = Lexend_Zetta({
	weight: ['400', '500', '600', '700'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-lexend-zetta',
	adjustFontFallback: true,
});

const unicaOne = Unica_One({
	weight: '400',
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-unica-one',
	adjustFontFallback: true,
});

// Map of font instances for easy access
const fontInstances = {
	calSans,
	poppins,
	montserrat,
	bowlbyOne,
	alata,
	anton,
	gothicA1,
	playfairDisplay,
	playfairDisplaySC,
	cutive,
	aleo,
	libreBaskerville,
	fredoka,
	yellowtail,
	openSans,
	permanentMarker,
	pacifico,
	notoSerif,
	monofett,
	coda,
	fascinate,
	miriamLibre,
	rammettoOne,
	gravitasOne,
	libreFranklin,
	museoModerno,
	dmSans,
	audiowide,
	spaceMono,
	lexendZetta,
	unicaOne,
};

// Map font preset to required font keys
const fontPresetMap: Record<
	BrandKitFontPresetKey,
	{ heading?: keyof typeof fontInstances; body?: keyof typeof fontInstances }
> = {
	// Modern fonts
	'modern.cal': {
		heading: 'calSans',
		body: 'poppins',
	},
	'modern.montserrat': {
		heading: 'montserrat',
		body: 'montserrat',
	},
	'modern.bowlbyOne': {
		heading: 'bowlbyOne',
		body: 'alata',
	},
	'modern.anton': {
		heading: 'anton',
		body: 'gothicA1',
	},
	// Classic fonts
	'classic.playfairDisplay': {
		heading: 'playfairDisplay',
		body: undefined, // Uses Inter which is always loaded
	},
	'classic.playfairDisplaySc': {
		heading: 'playfairDisplaySC',
		body: 'playfairDisplay',
	},
	'classic.cutive': {
		heading: 'cutive',
		body: 'aleo',
	},
	'classic.libreBaskerville': {
		heading: 'libreBaskerville',
		body: 'libreBaskerville',
	},
	// Creative fonts
	'creative.fredokaOne': {
		heading: 'fredoka',
		body: 'openSans',
	},
	'creative.yellowtail': {
		heading: 'yellowtail',
		body: 'openSans',
	},
	'creative.permanentMarker': {
		heading: 'permanentMarker',
		body: undefined, // Uses Inter which is always loaded
	},
	'creative.pacifico': {
		heading: 'pacifico',
		body: 'notoSerif',
	},
	// Logo fonts
	'logo.coda': {
		heading: 'monofett',
		body: 'coda',
	},
	'logo.miriamLibre': {
		heading: 'fascinate',
		body: 'miriamLibre',
	},
	'logo.rammettoOne': {
		heading: 'rammettoOne',
		body: 'poppins',
	},
	'logo.gravitasOne': {
		heading: 'gravitasOne',
		body: 'libreFranklin',
	},
	// Futuristic fonts
	'futuristic.museoModerno': {
		heading: 'museoModerno',
		body: 'dmSans',
	},
	'futuristic.audiowide': {
		heading: 'audiowide',
		body: 'spaceMono',
	},
	'futuristic.lexendZetta': {
		heading: 'lexendZetta',
		body: 'montserrat',
	},
	'futuristic.unicaOne': {
		heading: 'unicaOne',
		body: 'poppins',
	},
	// Custom - no fonts needed
	custom: {
		heading: undefined,
		body: undefined,
	},
};

/**
 * Get font class names for a specific font preset.
 * Only returns the CSS classes for fonts actually used by the preset.
 * Next.js will tree-shake unused font CSS at build time.
 */
export function getDynamicFontClassNames(fontPreset: BrandKitFontPresetKey): string {
	const fonts = fontPresetMap[fontPreset];

	const classes: string[] = [];

	// Add heading font class if specified
	if (fonts.heading) {
		const headingFont = fontInstances[fonts.heading];
		if (headingFont.variable) {
			classes.push(headingFont.variable);
		}
	}

	// Add body font class if specified and different from heading
	if (fonts.body && fonts.body !== fonts.heading) {
		const bodyFont = fontInstances[fonts.body];
		if (bodyFont.variable) {
			classes.push(bodyFont.variable);
		}
	}

	return classes.join(' ');
}

/**
 * Get all font class names - for use when all fonts need to be available
 * (e.g., in preview mode where users can switch between presets)
 */
export function getAllFontClassNames(): string {
	const allClasses = new Set<string>();

	Object.values(fontInstances).forEach(font => {
		if (font.variable) {
			allClasses.add(font.variable);
		}
	});

	return Array.from(allClasses).join(' ');
}

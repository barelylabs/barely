// Font loader utility for bio themes
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

// Type for font objects returned by Next.js font loaders
interface FontObject {
	variable: string;
	className: string;
	style: { fontFamily: string };
}

// Cal Sans local font
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
	display: 'swap', // swap ensures text is visible immediately
	preload: true, // Changed to true for upfront loading
	adjustFontFallback: 'Arial', // Use Arial as fallback with adjusted metrics
});

// Core fonts that are always loaded
export const inter = Inter({
	subsets: ['latin'],
	variable: '--font-inter',
	display: 'swap',
	preload: true,
	adjustFontFallback: true, // Automatically adjust metrics to match fallback
});

// All fonts loaded upfront with font-display: swap to prevent layout shift
const poppins = Poppins({
	weight: ['300', '400', '500', '600', '700'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-poppins',
	preload: true,
	adjustFontFallback: true,
});

const montserrat = Montserrat({
	weight: ['400', '500', '600', '700'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-montserrat',
	preload: true,
	adjustFontFallback: true,
});

const bowlbyOne = Bowlby_One({
	weight: '400',
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-bowlby-one',
	preload: true,
	adjustFontFallback: true,
});

const alata = Alata({
	weight: '400',
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-alata',
	preload: true,
	adjustFontFallback: true,
});

const anton = Anton({
	weight: '400',
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-anton',
	preload: true,
	adjustFontFallback: true,
});

const gothicA1 = Gothic_A1({
	weight: ['400', '500', '600', '700'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-gothic-a1',
	preload: true,
	adjustFontFallback: true,
});

const playfairDisplay = Playfair_Display({
	weight: ['400', '500', '600', '700', '800', '900'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-playfair-display',
	preload: true,
	adjustFontFallback: true,
});

const playfairDisplaySC = Playfair_Display_SC({
	weight: ['400', '700', '900'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-playfair-display-sc',
	preload: true,
	adjustFontFallback: true,
});

const cutive = Cutive({
	weight: '400',
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-cutive',
	preload: true,
	adjustFontFallback: true,
});

const aleo = Aleo({
	weight: ['300', '400', '500', '700'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-aleo',
	preload: true,
	adjustFontFallback: true,
});

const libreBaskerville = Libre_Baskerville({
	weight: ['400', '700'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-libre-baskerville',
	preload: true,
	adjustFontFallback: true,
});

const fredoka = Fredoka({
	weight: ['400', '500', '600', '700'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-fredoka-one',
	preload: true,
	adjustFontFallback: true,
});

const yellowtail = Yellowtail({
	weight: '400',
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-yellowtail',
	preload: true,
	adjustFontFallback: true,
});

const openSans = Open_Sans({
	weight: ['300', '400', '500', '600', '700'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-open-sans',
	preload: true,
	adjustFontFallback: true,
});

const permanentMarker = Permanent_Marker({
	weight: '400',
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-permanent-marker',
	preload: true,
	adjustFontFallback: true,
});

const pacifico = Pacifico({
	weight: '400',
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-pacifico',
	preload: true,
	adjustFontFallback: true,
});

const notoSerif = Noto_Serif({
	weight: ['400', '500', '700'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-noto-serif',
	preload: true,
	adjustFontFallback: true,
});

const monofett = Monofett({
	weight: '400',
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-monofett',
	preload: true,
	adjustFontFallback: true,
});

const coda = Coda({
	weight: ['400', '800'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-coda',
	preload: true,
	adjustFontFallback: true,
});

const fascinate = Fascinate({
	weight: '400',
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-fascinate',
	preload: true,
	adjustFontFallback: true,
});

const miriamLibre = Miriam_Libre({
	weight: ['400', '700'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-miriam-libre',
	preload: true,
	adjustFontFallback: true,
});

const rammettoOne = Rammetto_One({
	weight: '400',
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-rammetto-one',
	preload: true,
	adjustFontFallback: true,
});

const gravitasOne = Gravitas_One({
	weight: '400',
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-gravitas-one',
	preload: true,
	adjustFontFallback: true,
});

const libreFranklin = Libre_Franklin({
	weight: ['300', '400', '500', '600', '700'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-libre-franklin',
	preload: true,
	adjustFontFallback: true,
});

const museoModerno = MuseoModerno({
	weight: ['400', '500', '600', '700'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-museo-moderno',
	preload: true,
	adjustFontFallback: true,
});

const dmSans = DM_Sans({
	weight: ['400', '500', '700'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-dm-sans',
	preload: true,
	adjustFontFallback: true,
});

const audiowide = Audiowide({
	weight: '400',
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-audiowide',
	preload: true,
	adjustFontFallback: true,
});

const spaceMono = Space_Mono({
	weight: ['400', '700'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-space-mono',
	preload: true,
	adjustFontFallback: true,
});

const lexendZetta = Lexend_Zetta({
	weight: ['400', '500', '600', '700'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-lexend-zetta',
	preload: true,
	adjustFontFallback: true,
});

const unicaOne = Unica_One({
	weight: '400',
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-unica-one',
	preload: true,
	adjustFontFallback: true,
});

// Font preset type from @barely/const
export type BrandKitFontPresetKey =
	| 'modern.cal'
	| 'modern.montserrat'
	| 'modern.bowlbyOne'
	| 'modern.anton'
	| 'classic.playfairDisplay'
	| 'classic.playfairDisplaySc'
	| 'classic.cutive'
	| 'classic.libreBaskerville'
	| 'creative.fredokaOne'
	| 'creative.yellowtail'
	| 'creative.permanentMarker'
	| 'creative.pacifico'
	| 'logo.coda'
	| 'logo.miriamLibre'
	| 'logo.rammettoOne'
	| 'logo.gravitasOne'
	| 'futuristic.museoModerno'
	| 'futuristic.audiowide'
	| 'futuristic.lexendZetta'
	| 'futuristic.unicaOne'
	| 'custom';

// Map font preset keys to font objects
const fontPresetMap: Record<
	BrandKitFontPresetKey,
	{ heading?: FontObject; body?: FontObject }
> = {
	// Modern fonts
	'modern.cal': {
		heading: calSans,
		body: poppins,
	},
	'modern.montserrat': {
		heading: montserrat,
		body: montserrat,
	},
	'modern.bowlbyOne': {
		heading: bowlbyOne,
		body: alata,
	},
	'modern.anton': {
		heading: anton,
		body: gothicA1,
	},
	// Classic fonts
	'classic.playfairDisplay': {
		heading: playfairDisplay,
		body: inter,
	},
	'classic.playfairDisplaySc': {
		heading: playfairDisplaySC,
		body: playfairDisplay,
	},
	'classic.cutive': {
		heading: cutive,
		body: aleo,
	},
	'classic.libreBaskerville': {
		heading: libreBaskerville,
		body: libreBaskerville,
	},
	// Creative fonts
	'creative.fredokaOne': {
		heading: fredoka,
		body: openSans,
	},
	'creative.yellowtail': {
		heading: yellowtail,
		body: openSans,
	},
	'creative.permanentMarker': {
		heading: permanentMarker,
		body: inter,
	},
	'creative.pacifico': {
		heading: pacifico,
		body: notoSerif,
	},
	// Logo fonts
	'logo.coda': {
		heading: monofett,
		body: coda,
	},
	'logo.miriamLibre': {
		heading: fascinate,
		body: miriamLibre,
	},
	'logo.rammettoOne': {
		heading: rammettoOne,
		body: poppins,
	},
	'logo.gravitasOne': {
		heading: gravitasOne,
		body: libreFranklin,
	},
	// Futuristic fonts
	'futuristic.museoModerno': {
		heading: museoModerno,
		body: dmSans,
	},
	'futuristic.audiowide': {
		heading: audiowide,
		body: spaceMono,
	},
	'futuristic.lexendZetta': {
		heading: lexendZetta,
		body: montserrat,
	},
	'futuristic.unicaOne': {
		heading: unicaOne,
		body: poppins,
	},
	// Custom - no fonts needed
	custom: {
		heading: undefined,
		body: undefined,
	},
};

/**
 * Get the font class names for a specific font preset
 * Note: Since we load all fonts upfront, this is now mainly for documentation
 * and understanding which fonts map to which preset
 */
export function getFontClassNames(fontPreset: BrandKitFontPresetKey): string {
	const fonts = fontPresetMap[fontPreset];

	const classes: string[] = [];
	if (fonts.heading) {
		classes.push(fonts.heading.variable);
	}
	if (fonts.body && fonts.body !== fonts.heading) {
		classes.push(fonts.body.variable);
	}

	return classes.join(' ');
}

/**
 * Get all font class names - Now used in root layout to load all fonts upfront
 */
export function getAllFontClassNames(): string {
	const allClasses = new Set<string>();

	Object.values(fontPresetMap).forEach(fonts => {
		if (fonts.heading) {
			allClasses.add(fonts.heading.variable);
		}
		if (fonts.body) {
			allClasses.add(fonts.body.variable);
		}
	});

	return Array.from(allClasses).join(' ');
}

/**
 * Export all font instances for use in layout
 * This ensures all fonts are loaded upfront with proper optimization
 */
export const allFonts = {
	calSans,
	inter,
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

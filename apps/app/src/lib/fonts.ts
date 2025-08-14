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
	Inter as FontSans,
	Fredoka,
	Gothic_A1,
	Gravitas_One,
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

// Core fonts that are always loaded
export const fontSans = FontSans({
	subsets: ['latin'],
	variable: '--font-sans',
	display: 'swap',
	preload: true,
});

// All fonts must be initialized at module scope (Next.js requirement)
// But we only add their CSS variables when needed
const poppins = Poppins({
	weight: ['300', '400', '500', '600', '700'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-poppins',
	preload: false,
});

const montserrat = Montserrat({
	weight: ['400', '500', '600', '700'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-montserrat',
	preload: false,
});

const bowlbyOne = Bowlby_One({
	weight: '400',
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-bowlby-one',
	preload: false,
});

const alata = Alata({
	weight: '400',
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-alata',
	preload: false,
});

const anton = Anton({
	weight: '400',
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-anton',
	preload: false,
});

const gothicA1 = Gothic_A1({
	weight: ['400', '500', '600', '700'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-gothic-a1',
	preload: false,
});

const playfairDisplay = Playfair_Display({
	weight: ['400', '500', '600', '700', '800', '900'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-playfair-display',
	preload: false,
});

const playfairDisplaySC = Playfair_Display_SC({
	weight: ['400', '700', '900'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-playfair-display-sc',
	preload: false,
});

const cutive = Cutive({
	weight: '400',
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-cutive',
	preload: false,
});

const aleo = Aleo({
	weight: ['300', '400', '500', '700'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-aleo',
	preload: false,
});

const libreBaskerville = Libre_Baskerville({
	weight: ['400', '700'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-libre-baskerville',
	preload: false,
});

const fredoka = Fredoka({
	weight: ['400', '500', '600', '700'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-fredoka-one',
	preload: false,
});

const yellowtail = Yellowtail({
	weight: '400',
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-yellowtail',
	preload: false,
});

const openSans = Open_Sans({
	weight: ['300', '400', '500', '600', '700'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-open-sans',
	preload: false,
});

const permanentMarker = Permanent_Marker({
	weight: '400',
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-permanent-marker',
	preload: false,
});

const pacifico = Pacifico({
	weight: '400',
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-pacifico',
	preload: false,
});

const notoSerif = Noto_Serif({
	weight: ['400', '500', '700'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-noto-serif',
	preload: false,
});

const monofett = Monofett({
	weight: '400',
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-monofett',
	preload: false,
});

const coda = Coda({
	weight: ['400', '800'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-coda',
	preload: false,
});

const fascinate = Fascinate({
	weight: '400',
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-fascinate',
	preload: false,
});

const miriamLibre = Miriam_Libre({
	weight: ['400', '700'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-miriam-libre',
	preload: false,
});

const rammettoOne = Rammetto_One({
	weight: '400',
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-rammetto-one',
	preload: false,
});

const gravitasOne = Gravitas_One({
	weight: '400',
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-gravitas-one',
	preload: false,
});

const libreFranklin = Libre_Franklin({
	weight: ['300', '400', '500', '600', '700'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-libre-franklin',
	preload: false,
});

const museoModerno = MuseoModerno({
	weight: ['400', '500', '600', '700'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-museo-moderno',
	preload: false,
});

const dmSans = DM_Sans({
	weight: ['400', '500', '700'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-dm-sans',
	preload: false,
});

const audiowide = Audiowide({
	weight: '400',
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-audiowide',
	preload: false,
});

const spaceMono = Space_Mono({
	weight: ['400', '700'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-space-mono',
	preload: false,
});

const lexendZetta = Lexend_Zetta({
	weight: ['400', '500', '600', '700'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-lexend-zetta',
	preload: false,
});

const unicaOne = Unica_One({
	weight: '400',
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-unica-one',
	preload: false,
});

// Map of all fonts
const fonts = {
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

export type FontName = keyof typeof fonts;

// Get a specific font
export function getFont(fontName: FontName) {
	return fonts[fontName];
}

// Get multiple fonts
export function getFonts(fontNames: FontName[]) {
	return fontNames.map(name => fonts[name]).filter(Boolean);
}

// Get font className for a specific font
export function getFontClassName(fontName: FontName) {
	const font = fonts[fontName];
	return font?.variable || '';
}

// Get font classNames for multiple fonts
export function getFontClassNames(fontNames: FontName[]) {
	return fontNames
		.map(name => getFontClassName(name))
		.filter(Boolean)
		.join(' ');
}

// Font presets for bio themes
export const BIO_FONT_PRESETS = {
	modern: ['poppins', 'montserrat'] as const,
	classic: ['playfairDisplay', 'libreBaskerville'] as const,
	playful: ['fredoka', 'pacifico'] as const,
	bold: ['anton', 'bowlbyOne'] as const,
	minimal: ['openSans', 'dmSans'] as const,
	artistic: ['yellowtail', 'permanentMarker'] as const,
	tech: ['spaceMono', 'audiowide'] as const,
	elegant: ['aleo', 'notoSerif'] as const,
	vintage: ['cutive', 'playfairDisplaySC'] as const,
	funky: ['monofett', 'fascinate'] as const,
};

// Get fonts for a specific bio theme preset
export function getBioFontPreset(preset: keyof typeof BIO_FONT_PRESETS) {
	const fontNames = BIO_FONT_PRESETS[preset];
	return getFontClassNames([...fontNames]);
}

// Get all font classNames (for pages where all fonts need to be available)
export function getAllFontClassNames() {
	const allFontNames = Object.keys(fonts) as FontName[];
	return getFontClassNames(allFontNames);
}

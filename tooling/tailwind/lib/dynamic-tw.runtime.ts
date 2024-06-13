import type { Color, Oklch } from 'culori';
import {
	// @ts-expect-error Old typings for this module
	toGamut as _toGamut,
	converter,
	differenceEuclidean,
	formatHex,
	parse,
} from 'culori';

import { makeVariable, shades } from './dynamic-tw.common';

const toGamut = _toGamut as (...args: unknown[]) => (color: string) => Color;

/**
 * A map of CSS varable name to color
 */
type SingleVariable = [string, string];

export function oklchToHex(oklchString: string): string {
	const oklchColor = parse(`oklch(${oklchString})`);
	console.log('oklchColor', oklchColor);
	const hex = formatHex(oklchColor);

	console.log('oklchToHex', oklchString, hex);
	return hex ?? '';
}

export function getDynamicStyleVariables({
	baseName,
	hue,
	mode = 'consistent',
}: {
	baseName: string;
	hue: number;
	mode?: 'bright' | 'consistent';
}): { variables: SingleVariable[]; defaultHex: string } {
	const calculator = mode === 'bright' ? highestChroma : consistentChroma;

	const variables = shades.map((shade, shadeIndex) => [
		makeVariable({ name: baseName, shade }),
		calculator(shadeIndex, hue),
	]) satisfies SingleVariable[];

	// adding the default color
	variables.push([makeVariable({ name: baseName }), calculator(5, hue)] as const);

	return {
		variables,
		defaultHex: oklchToHex(calculator(5, hue)),
	};
}

export function updateVariables(variables: SingleVariable[], el?: HTMLElement) {
	const target = el ?? document.documentElement;

	for (const [varName, value] of variables) {
		target.style.setProperty(varName, value + '');
	}
}

const lightnessForShade = (shade: number) => {
	const highestL = 89;
	const lowestL = 13;
	const diffL = highestL - lowestL;

	const shadeDiff = (shades[shades.length - 1] ?? 950) - (shades[0] ?? 50);

	// Maintaining the proximity of colors with a step of 50 and 100
	const multiplier = shade / shadeDiff;

	return (lowestL + (highestL - diffL * multiplier)) / 100;
};
const lightness = shades.map(lightnessForShade);
// const lightness = [
// 	0.9778, 0.9356, 0.8811, 0.8267, 0.7422, 0.6478, 0.5733, 0.4689, 0.3944, 0.32, 0.2378,
// ];

export const highestChroma = (shadeIndex: number, hue: number) => {
	const oklch = converter('oklch');

	// Setting an obsurdly high chroma
	const color = `oklch(${lightness[shadeIndex]} 0.2 ${hue})`;

	// Clamping it to the highest chroma possible
	return serializeColor(
		oklch(toGamut('p3', 'oklch', differenceEuclidean('oklch'), 0)(color)),
	);
};

export const consistentChroma = (i: number, hue: number) => {
	const oklch = converter('oklch');

	// Using a pinned chroma
	const color = `oklch(${lightness[i]} ${chromaData[i]} ${hue})`;

	return serializeColor(
		oklch(toGamut('p3', 'oklch', differenceEuclidean('oklch'), 0)(color)),
	);
};

const chromaData_base: Record<number, number> = {
	0: 0.0114,
	1: 0.0331,
	2: 0.0774,
	3: 0.1275,
	4: 0.1547,
	5: 0.1355,
	6: 0.1164,
	7: 0.0974,
	8: 0.0782,
	9: 0.0588,
	10: 0.0491,
};

const chromaData = Object.fromEntries(
	Object.entries(chromaData_base).map(([key, value]) => [key, value * 1.5]),
);

const serializeColor = (c: Oklch): string =>
	`${c.l.toFixed(3)} ${c.c.toFixed(3)} ${c.h?.toFixed(3)}`;

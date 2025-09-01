import { formatHex, formatRgb } from 'culori';

/**
 * Convert oklch color string to rgba format
 * This is useful for Stripe Elements and other places that need alpha support
 */
export function oklchToRgba(oklchString: string): string {
	try {
		// Parse OKLCH with or without alpha
		const regex = /oklch\(\s*([\d.%]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.%]+))?\s*\)/;
		const match = regex.exec(oklchString);

		if (!match) return 'rgba(0, 0, 0, 1)';

		const lValue =
			match[1]?.endsWith('%') ? parseFloat(match[1]) / 100 : parseFloat(match[1] ?? '0');
		const color = {
			mode: 'oklch' as const,
			l: lValue,
			c: parseFloat(match[2] ?? '0'),
			h: parseFloat(match[3] ?? '0'),
		};

		// Get RGB string
		const rgbString = formatRgb(color);
		if (!rgbString) return 'rgba(0, 0, 0, 1)';

		// Extract alpha if present
		let alpha = 1;
		if (match[4]) {
			alpha = match[4].endsWith('%') ? parseFloat(match[4]) / 100 : parseFloat(match[4]);
		}

		// Convert rgb() to rgba() with alpha
		// formatRgb returns "rgb(r, g, b)" so we need to convert it
		const rgbMatch = /rgb\(([^)]+)\)/.exec(rgbString);
		if (rgbMatch?.[1]) {
			return `rgba(${rgbMatch[1]}, ${alpha})`;
		}

		return `rgba(0, 0, 0, ${alpha})`;
	} catch (e) {
		console.error('Error converting OKLCH to RGBA:', e);
		return 'rgba(0, 0, 0, 1)';
	}
}

/**
 * Convert oklch color string to hex format
 * This is needed for Stripe Elements which requires hex colors
 * Note: Alpha channel is ignored as hex colors for CSS don't support alpha
 */
export function oklchToHex(oklchString: string): string {
	try {
		// Handle CSS oklch() format with or without alpha
		// "oklch(0.5 0.1 0)" or "oklch(50% 0.1 0)" or "oklch(0.5 0.1 0 / 50%)"
		if (oklchString.startsWith('oklch(')) {
			// Updated regex to handle optional alpha channel
			const match =
				/oklch\(\s*([\d.%]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*[\d.%]+)?\s*\)/.exec(
					oklchString,
				);
			if (match?.[1] && match[2] && match[3]) {
				const lValue =
					match[1].endsWith('%') ? parseFloat(match[1]) / 100 : parseFloat(match[1]);
				const color = {
					mode: 'oklch' as const,
					l: lValue,
					c: parseFloat(match[2]),
					h: parseFloat(match[3]),
				};
				return formatHex(color) || '#000000';
			}
		}
		// Handle raw format: "0.5 0.1 0"
		const parts = oklchString.split(' ');
		if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
			const color = {
				mode: 'oklch' as const,
				l: parseFloat(parts[0]),
				c: parseFloat(parts[1]),
				h: parseFloat(parts[2]),
			};
			return formatHex(color) || '#000000';
		}
	} catch (e) {
		console.error('Error parsing OKLCH:', e);
	}
	// If it's already hex or can't parse, return as is or fallback
	return oklchString.startsWith('#') ? oklchString : '#000000';
}

/**
 * Modify OKLCH color components
 * @param oklchString - The OKLCH color string e.g. "oklch(0.7 0.1 192)" or "oklch(70% 0.1 192 / 50%)"
 * @param modifications - Object with optional lightness, chroma, hue, and alpha values to replace
 * @returns Modified OKLCH color string
 *
 * @example
 * modifyOklch("oklch(0.7 0.1 192)", { alpha: 0.5 })
 * // => "oklch(0.7 0.1 192 / 50%)"
 *
 * modifyOklch("oklch(0.7 0.1 192)", { lightness: 0.9, chroma: 0.2 })
 * // => "oklch(0.9 0.2 192)"
 *
 * modifyOklch("oklch(70% 0.1 192 / 80%)", { alpha: 0.3 })
 * // => "oklch(70% 0.1 192 / 30%)"
 */
export function modifyOklch(
	oklchString: string,
	modifications: {
		lightness?: number | string;
		chroma?: number;
		hue?: number;
		alpha?: number;
	},
): string {
	// Parse the OKLCH string - supports with or without alpha
	// oklch(L C H) or oklch(L C H / A)
	const regex = /oklch\(\s*([\d.%]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.%]+))?\s*\)/;
	const match = regex.exec(oklchString);

	if (!match) {
		console.error('Invalid OKLCH format:', oklchString);
		return oklchString;
	}

	// Extract current values
	let l = match[1] ?? '0';
	let c = match[2] ?? '0';
	let h = match[3] ?? '0';
	const a = match[4]; // May be undefined if no alpha

	// Apply modifications
	if (modifications.lightness !== undefined) {
		// Handle both decimal (0-1) and percentage formats
		if (typeof modifications.lightness === 'string') {
			l = modifications.lightness;
		} else if (modifications.lightness <= 1) {
			// If original was percentage, keep as percentage
			l =
				l.endsWith('%') ?
					`${(modifications.lightness * 100).toFixed(0)}%`
				:	modifications.lightness.toString();
		} else {
			// Value > 1, treat as percentage
			l = `${modifications.lightness}%`;
		}
	}

	if (modifications.chroma !== undefined) {
		c = modifications.chroma.toString();
	}

	if (modifications.hue !== undefined) {
		h = modifications.hue.toString();
	}

	// Build the result string
	let result = `oklch(${l} ${c} ${h}`;

	// Handle alpha
	if (modifications.alpha !== undefined) {
		// Convert to percentage format
		const alphaPercent =
			modifications.alpha <= 1 ?
				`${(modifications.alpha * 100).toFixed(0)}%`
			:	`${modifications.alpha}%`;
		result += ` / ${alphaPercent}`;
	} else if (a !== undefined) {
		// Preserve existing alpha if not modifying
		result += ` / ${a}`;
	}

	result += ')';

	return result;
}

/**
 * Convert oklch color string to hex format
 * This is needed for Stripe Elements which requires hex colors
 */
export function oklchToHex(oklchString: string): string {
	// Parse oklch values from string like "oklch(96% 0.005 260)"
	const regex = /oklch\(([^)]+)\)/;
	const match = regex.exec(oklchString);
	if (!match?.[1]) return '#000000'; // fallback to black

	const parts = match[1].split(/\s+/);
	if (parts.length < 3) return '#000000';

	// Extract L, C, H values
	const l = parseFloat(parts[0]?.replace('%', '') ?? '0') / 100; // Convert percentage to 0-1
	const c = parseFloat(parts[1] ?? '0');
	const h = parseFloat(parts[2] ?? '0');

	// Convert oklch to linear RGB using the OKLab color space math
	// First convert to OKLab
	const hRad = (h * Math.PI) / 180;
	const a = c * Math.cos(hRad);
	const b = c * Math.sin(hRad);

	// OKLab to linear RGB conversion matrix
	const lms_l = l + 0.3963377774 * a + 0.2158037573 * b;
	const lms_m = l - 0.1055613458 * a - 0.0638541728 * b;
	const lms_s = l - 0.0894841775 * a - 1.291485548 * b;

	// Cube the LMS values
	const lms_l3 = lms_l * lms_l * lms_l;
	const lms_m3 = lms_m * lms_m * lms_m;
	const lms_s3 = lms_s * lms_s * lms_s;

	// Convert to linear RGB
	let r = 4.0767416621 * lms_l3 - 3.3077115913 * lms_m3 + 0.2309699292 * lms_s3;
	let g = -1.2684380046 * lms_l3 + 2.6097574011 * lms_m3 - 0.3413193965 * lms_s3;
	let b_rgb = -0.0041960863 * lms_l3 - 0.7034186147 * lms_m3 + 1.707614701 * lms_s3;

	// Apply gamma correction (linear to sRGB)
	r = gammaCorrect(r);
	g = gammaCorrect(g);
	b_rgb = gammaCorrect(b_rgb);

	// Clamp values to 0-255 range
	r = Math.max(0, Math.min(255, Math.round(r * 255)));
	g = Math.max(0, Math.min(255, Math.round(g * 255)));
	b_rgb = Math.max(0, Math.min(255, Math.round(b_rgb * 255)));

	// Convert to hex
	const toHex = (n: number) => n.toString(16).padStart(2, '0');
	return `#${toHex(r)}${toHex(g)}${toHex(b_rgb)}`;
}

function gammaCorrect(channel: number): number {
	// sRGB gamma correction
	if (channel <= 0.0031308) {
		return 12.92 * channel;
	}
	return 1.055 * Math.pow(channel, 1 / 2.4) - 0.055;
}

'use client';

import type { AppearancePreset, ColorScheme } from '@barely/lib/functions/bio-themes-v2';
import type { BioButtonWithLink } from '@barely/validators';
import { APPEARANCE_PRESETS } from '@barely/lib/functions/bio-themes-v2';

import { BioButtonPublic } from '../../components/bio-button-public';

interface BioButtonProps {
	button: BioButtonWithLink & { lexoRank: string };
	bioId: string;
	position: number;
	theme: 'light' | 'dark' | 'app';
	defaultButtonColor?: string | null;
	defaultTextColor?: string | null;
	defaultIconColor?: string | null;
}

// Map bio page theme to color scheme
const mapThemeToColorScheme = (theme: 'light' | 'dark' | 'app'): ColorScheme => {
	switch (theme) {
		case 'light':
			return APPEARANCE_PRESETS['shuffle-random'].colorScheme;
		case 'dark':
			return APPEARANCE_PRESETS['monochrome-accent'].colorScheme;
		case 'app':
			return APPEARANCE_PRESETS['shuffle-random'].colorScheme;
		default:
			return APPEARANCE_PRESETS['shuffle-random'].colorScheme;
	}
};

export function BioButton({ button, bioId, position, theme }: BioButtonProps) {
	return (
		<BioButtonPublic
			button={button}
			bioId={bioId}
			colorScheme={mapThemeToColorScheme(theme)}
			position={position}
			usePlatformColors={true}
		/>
	);
}

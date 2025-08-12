'use client';

import type { BioTheme } from '@barely/lib/functions/bio-themes';
import type { BioButtonWithLink } from '@barely/validators';

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

// Map bio page theme to bio button theme
const mapTheme = (theme: 'light' | 'dark' | 'app'): BioTheme => {
	switch (theme) {
		case 'light':
			return 'minimal';
		case 'dark':
			return 'monochrome';
		case 'app':
			return 'default';
		default:
			return 'default';
	}
};

export function BioButton({ button, bioId, position, theme }: BioButtonProps) {
	return (
		<BioButtonPublic
			button={button}
			bioId={bioId}
			theme={mapTheme(theme)}
			position={position}
			usePlatformColors={true}
		/>
	);
}

'use client';

import type { PublicBrandKit } from '@barely/validators';
import type { ReactNode } from 'react';
import { useEffect } from 'react';

import { getDynamicFontClassNames } from '../../lib/dynamic-fonts';

interface FontProviderProps {
	children: ReactNode;
	brandKit: PublicBrandKit;
}

export function FontProvider({ children, brandKit }: FontProviderProps) {
	const fontClasses = getDynamicFontClassNames(brandKit.fontPreset);

	// Add font classes to the body element
	useEffect(() => {
		if (fontClasses) {
			// Split the font classes and add them to body
			const classes = fontClasses.split(' ').filter(Boolean);
			document.body.classList.add(...classes);

			// Cleanup function to remove classes when component unmounts or brandKit changes
			return () => {
				document.body.classList.remove(...classes);
			};
		}
	}, [fontClasses]);

	return <>{children}</>;
}

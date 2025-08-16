'use client';

import { getAllFontClassNames } from '~/lib/fonts';
import { BioPreview } from './bio-preview';

// Wrapper component that loads all fonts for bio preview
export function BioPreviewWithFonts() {
	const allFontClasses = getAllFontClassNames();

	return (
		<div className={allFontClasses}>
			<BioPreview />
		</div>
	);
}

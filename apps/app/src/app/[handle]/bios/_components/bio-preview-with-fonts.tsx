'use client';

import { AppBioRender } from '~/app/[handle]/bios/_components/app-bio-render';
import { getAllFontClassNames } from '~/lib/fonts';

// Wrapper component that loads all fonts for bio preview
export function BioPreviewWithFonts({ bioKey }: { bioKey: string }) {
	const allFontClasses = getAllFontClassNames();

	return (
		<div className={allFontClasses}>
			<AppBioRender bioKey={bioKey} />
		</div>
	);
}

import type { ReactNode } from 'react';
import { cn } from '@barely/utils';

import { getDynamicFontClassNames } from '../../lib/dynamic-fonts';
import { fetchBrandKit } from '../../trpc/server';
import Providers from './providers';

interface HandleLayoutProps {
	children: ReactNode;
	params: Promise<{ handle: string }>;
}

export default async function HandleLayout({ children, params }: HandleLayoutProps) {
	const { handle } = await params;

	// Fetch brandKit once at the layout level
	const brandKit = await fetchBrandKit(handle);

	// Get the font classes for this specific brandKit
	const fontClasses = getDynamicFontClassNames(brandKit.fontPreset);

	return (
		<Providers>
			<div className={cn(fontClasses)}>{children}</div>
		</Providers>
	);
}

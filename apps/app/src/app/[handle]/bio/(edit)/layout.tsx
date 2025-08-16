import { Suspense } from 'react';

import { BioPreview } from '~/app/[handle]/bio/_components/bio-preview';
import { getAllFontClassNames } from '~/lib/fonts';
import { prefetch, trpc } from '~/trpc/server';

// import { BioPreviewWithFonts } from '../_components/bio-preview-with-fonts';

export default async function BioEditLayout({
	params,
	children,
}: {
	params: Promise<{ handle: string }>;
	children: React.ReactElement;
}) {
	const { handle } = await params;

	// Load all fonts for bio editing pages where users can preview different fonts
	const allFontClasses = getAllFontClassNames();

	prefetch(trpc.bio.byKey.queryOptions({ handle, key: 'home' }));

	return (
		<div className={`flex h-full ${allFontClasses}`}>
			{/* Left side: Edit interface */}
			<div className='flex-1 overflow-y-auto'>{children}</div>

			{/* Right side: Preview */}
			<div className='hidden w-[400px] border-l border-gray-200 bg-gray-50 lg:block'>
				<div className='sticky top-0 flex h-full items-center justify-center p-8'>
					<Suspense fallback={<div>Loading...</div>}>
						<BioPreview />
					</Suspense>
				</div>
			</div>
		</div>
	);
}

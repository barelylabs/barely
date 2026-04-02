import type { Metadata } from 'next';
import { Fragment, Suspense } from 'react';
import { getFmPageData } from '@barely/lib/functions/fm-page.fns';

import { BackgroundImg } from '@barely/ui/background-image';
import { Img } from '@barely/ui/img';
import { Separator } from '@barely/ui/separator';
import { Text } from '@barely/ui/typography';

import { FmLinkButton } from '~/app/[handle]/[...key]/fm-link-button';
import { LogVisit } from '~/app/[handle]/[...key]/fm-log-visit';
import { FmPreSaveButton } from '~/app/[handle]/[...key]/fm-pre-save-button';
import { FmPreSaveCallback } from '~/app/[handle]/[...key]/fm-pre-save-callback';

export async function generateMetadata({
	params,
}: {
	params: Promise<{ handle: string; key: string[] }>;
}): Promise<Metadata> {
	const awaitedParams = await params;
	const data = await getFmPageData({
		handle: awaitedParams.handle,
		key: awaitedParams.key.join('/'),
	});

	return {
		title: `${data.title} ${data.workspace?.name ? `by ${data.workspace.name}` : ''}`,
	};
}

/**
 * Determine if the FM page should show pre-save instead of a regular Spotify link.
 * Pre-save is shown when:
 * 1. The FM page is linked to a track
 * 2. The track is not yet released (based on released flag or releaseDate)
 */
function shouldShowPreSave(
	track: { released: boolean; releaseDate: string | null } | null | undefined,
): boolean {
	if (!track) return false;
	if (track.released) return false;

	// If there's a release date and it's in the past, the track should be released
	if (track.releaseDate) {
		const today = new Date().toISOString().split('T')[0];
		if (today && track.releaseDate <= today) return false;
	}

	return true;
}

export default async function LandingPage({
	params,
}: {
	params: Promise<{ handle: string; key: string[] }>;
}) {
	const awaitedParams = await params;
	const key = awaitedParams.key.join('/');

	const data = await getFmPageData({
		handle: awaitedParams.handle,
		key: key,
	});

	const { links, ...fm } = data;

	if (!fm.id) {
		return <div>Not found</div>;
	}

	const showPreSave = shouldShowPreSave(fm.track);

	return (
		<>
			<LogVisit fmId={fm.id} />
			<Suspense>
				<FmPreSaveCallback fmPageId={fm.id} />
			</Suspense>
			<div className='relative flex h-full w-full flex-col items-center sm:pt-6 lg:flex-row lg:p-0'>
				<div className='fixed left-0 top-0 z-[-1] flex h-full w-full items-center justify-center overflow-hidden'>
					{fm.coverArt && (
						<BackgroundImg
							s3Key={fm.coverArt.s3Key}
							alt={''}
							className='scale-125 opacity-90 blur-lg'
							sizes='(max-width: 639px) 0vw, 100vw'
							quality={15}
							placeholder={fm.coverArt.blurDataUrl ? 'blur' : undefined}
							blurDataURL={fm.coverArt.blurDataUrl ?? undefined}
							priority
						/>
					)}
				</div>

				<div className='relative flex h-fit w-full flex-grow items-center justify-center'>
					{/* Content */}
					<div className='relative z-10 flex h-full w-full items-center justify-center overflow-hidden sm:max-w-sm lg:max-w-md'>
						{fm.coverArt && (
							<Img
								s3Key={fm.coverArt.s3Key}
								alt={''}
								width={500}
								height={500}
								className='w-full rounded-t-md border-[11px] border-background lg:rounded-b-md'
								placeholder={fm.coverArt.blurDataUrl ? 'blur' : undefined}
								blurDataURL={fm.coverArt.blurDataUrl ?? undefined}
								priority
							/>
						)}
					</div>
				</div>

				<div className='flex h-full w-full flex-col items-center sm:max-w-sm sm:pb-6 lg:p-0'>
					<div className='flex h-full w-full flex-col gap-6 bg-background p-9 sm:rounded-b-md lg:rounded-b-none'>
						<div className='flex flex-col'>
							<Text variant='3xl/black'>{fm.title}</Text>
							<Text variant='2xl/normal'>{fm.workspace?.name}</Text>
						</div>

						{/* Pre-save button (replaces Spotify link when track is unreleased) */}
						{showPreSave && (
							<>
								<Separator />
								<FmPreSaveButton
									fmPageId={fm.id}
									handle={awaitedParams.handle}
									fmKey={key}
								/>
							</>
						)}

						{/* Regular links */}
						{links?.length ?
							links.map((link, index) => {
								// Skip the Spotify link if we're showing pre-save instead
								if (showPreSave && link.platform === 'spotify') {
									return null;
								}

								return (
									<Fragment key={link.platform + index}>
										<Separator />
										<FmLinkButton link={link} />
									</Fragment>
								);
							})
						:	null}
					</div>
				</div>
			</div>
		</>
	);
}

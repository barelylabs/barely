import type { Metadata } from 'next';
import { Fragment } from 'react';
import { getFmPageData } from '@barely/lib/server/routes/fm-page/fm-page.fns';

import { BackgroundImg } from '@barely/ui/elements/background-image';
import { Img } from '@barely/ui/elements/img';
import { Separator } from '@barely/ui/elements/separator';
import { Text } from '@barely/ui/elements/typography';

import { FmLinkButton } from '~/app/[handle]/[...key]/fm-link-button';
import { LogVisit } from '~/app/[handle]/[...key]/fm-log-visit';

export async function generateMetadata({
	params,
}: {
	params: { handle: string; key: string[] };
}): Promise<Metadata> {
	const data = await getFmPageData({
		handle: params.handle,
		key: params.key.join('/'),
	});

	if (!data) {
		return {
			title: 'barely.fm',
		};
	}

	return {
		title: `${data.title} ${data.workspace?.name ? `by ${data.workspace.name}` : ''}`,
	};
}

export default async function LandingPage({
	params,
}: {
	params: { handle: string; key: string[] };
}) {
	const key = params.key.join('/');

	const data = await getFmPageData({
		handle: params.handle,
		key: key,
	});

	if (!data) {
		return <div>Not found</div>;
	}

	const { links, ...fm } = data;

	if (!fm.id) {
		return <div>Not found</div>;
	}

	return (
		<>
			<LogVisit fmId={fm.id} />
			<div className='relative flex h-full w-full flex-col items-center sm:pt-6 lg:flex-row lg:p-0'>
				<div className='fixed left-0 top-0 z-[-1] flex h-full w-full items-center justify-center overflow-hidden'>
					{fm.coverArt && (
						<BackgroundImg
							s3Key={fm.coverArt.key}
							alt={''}
							className='scale-125 opacity-90 blur-lg'
							sizes='(max-width: 639px) 0vw, 100vw'
							quality={15}
							placeholder={fm.coverArt?.blurHash ? 'blur' : undefined}
							blurDataURL={fm.coverArt?.blurHash ?? undefined}
							priority
						/>
					)}
				</div>

				<div className='relative flex h-fit w-full flex-grow items-center justify-center'>
					{/* Content */}
					<div className='relative z-10 flex h-full w-full items-center justify-center overflow-hidden sm:max-w-sm lg:max-w-md'>
						{fm.coverArt && (
							<Img
								s3Key={fm.coverArt.key}
								alt={''}
								width={500}
								height={500}
								priority
								className='w-full rounded-t-md border-[11px] border-background lg:rounded-b-md'
								placeholder={fm.coverArt?.blurHash ? 'blur' : undefined}
								blurDataURL={fm.coverArt?.blurHash ?? undefined}
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

						{links?.length ?
							links.map((link, index) => (
								<Fragment key={link.platform + index}>
									<Separator />
									<FmLinkButton link={link} />
								</Fragment>
							))
						:	null}
					</div>
				</div>
			</div>
		</>
	);
}

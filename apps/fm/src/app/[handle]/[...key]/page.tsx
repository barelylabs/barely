import type { Metadata } from 'next';
import { Fragment } from 'react';
import { getFmPageData } from '@barely/lib/server/routes/fm/fm.render.fns';

import { BackgroundImage } from '@barely/ui/elements/background-image';
import { Img } from '@barely/ui/elements/img';
import { Separator } from '@barely/ui/elements/separator';
import { Text } from '@barely/ui/elements/typography';

import { FmLinkButton } from '~/app/[handle]/[...key]/fm-link-button';

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
			title: 'barely.page',
		};
	}

	return {
		title: `barely.fm | ${data.title}`,
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

	return (
		<div className='relative flex h-full w-full flex-col items-center sm:py-6 lg:flex-row lg:p-0'>
			<div className='absolute left-0 top-0 z-[-1] flex h-full w-full items-center justify-center overflow-hidden'>
				<BackgroundImage
					src={fm.coverArt?.src ?? ''}
					alt={''}
					className='scale-125 opacity-90 blur-lg'
				/>
			</div>

			<div className='relative flex h-fit w-full flex-grow items-center justify-center'>
				{/* Content */}
				<div className='relative z-10 flex h-full w-full items-center justify-center overflow-hidden sm:max-w-sm lg:max-w-md'>
					<Img
						src={fm.coverArt?.src ?? ''}
						alt={''}
						width={500}
						height={500}
						priority={true}
						className='w-full rounded-t-md border-[11px] border-background'
					/>
				</div>
			</div>
			{/* {<pre>{JSON.stringify(fm, null, 2)}</pre>} */}
			<div className='flex h-full w-full flex-col gap-6 bg-background px-6 py-4 sm:max-w-sm sm:rounded-b-md'>
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
	);
}
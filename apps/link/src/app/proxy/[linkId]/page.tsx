import { notFound, redirect } from 'next/navigation';
import { db } from '@barely/lib/server/db';
import { getLinkById } from '@barely/lib/server/link.fns';
import { GOOGLE_FAVICON_URL } from '@barely/lib/utils/constants';
import { constructMetadata, getApexDomain } from '@barely/lib/utils/link';
import { unescape } from 'html-escaper';

export const runtime = 'edge';

export async function generateMetadata({ params }: { params: { linkId: string } }) {
	const data = await getLinkById(params.linkId, db);

	if (!data || !data.customMetaTags) {
		return;
	}

	const apexDomain = getApexDomain(data.url);

	return constructMetadata({
		title: unescape(data.title ?? ''),
		description: unescape(data.description ?? ''),
		image: unescape(data.image ?? ''),
		icons: `${GOOGLE_FAVICON_URL}${unescape(apexDomain)}`,
		noIndex: true,
	});
}

export default async function ProxyPage({ params }: { params: { linkId: string } }) {
	const data = await getLinkById(params.linkId, db);

	// if the link doesn't exist
	if (!data) {
		notFound();

		// if the link does not have proxy enabled, redirect to the original URL
	} else if (!data.customMetaTags) {
		redirect(data.url);
	}

	const apexDomain = getApexDomain(data.url);

	return (
		<main className='flex h-screen w-screen items-center justify-center'>
			<div className='mx-5 w-full max-w-lg overflow-hidden rounded-lg border border-gray-200 sm:mx-0'>
				<picture>
					<img
						src={unescape(data.image ?? '')}
						alt={unescape(data.title ?? '')}
						className='w-full object-cover'
					/>
				</picture>
				<div className='flex space-x-3 bg-gray-100 p-5'>
					<picture>
						<img
							src={`${GOOGLE_FAVICON_URL}${unescape(apexDomain)}`}
							alt={unescape(data.title ?? '')}
							className='mt-1 h-6 w-6'
						/>
					</picture>
					<div className='flex flex-col space-y-3'>
						<h1 className='font-bold text-gray-700'>{unescape(data.title ?? '')}</h1>
						<p className='text-sm text-gray-500'>{unescape(data.description ?? '')}</p>
					</div>
				</div>
			</div>
		</main>
	);
}

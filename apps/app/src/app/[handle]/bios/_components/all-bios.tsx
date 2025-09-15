'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import { useRouter } from 'next/navigation';
import { getAbsoluteUrl } from '@barely/utils';

import { GridListSkeleton } from '@barely/ui/components/grid-list-skeleton';
import { NoResultsPlaceholder } from '@barely/ui/components/no-results-placeholder';
import { GridList, GridListCard } from '@barely/ui/grid-list';

import {
	useBios,
	useBiosSearchParams,
} from '~/app/[handle]/bios/_components/bio-context';
import { CreateBioButton } from '~/app/[handle]/bios/_components/create-bio-button';

export function AllBios() {
	const { items, selection, setSelection, gridListRef, isFetching } = useBios();

	const router = useRouter();

	return (
		<>
			<GridList
				glRef={gridListRef}
				className='flex flex-col gap-2'
				aria-label='Bio Pages'
				data-grid-list='bio-pages'
				selectionMode='multiple'
				selectionBehavior='replace'
				onAction={key => {
					// Navigate to bio blocks editor
					const bio = items.find(b => b.id === key);
					if (bio) {
						router.push(`/${bio.handle}/bios/blocks?bioKey=${bio.key}`);
					}
				}}
				items={items}
				selectedKeys={selection}
				setSelectedKeys={setSelection}
				renderEmptyState={() => (
					<>
						{isFetching ?
							<GridListSkeleton />
						:	<NoResultsPlaceholder
								icon='landingPage'
								title='No Bio Pages'
								subtitle='Create your first bio page to get started.'
								button={<CreateBioButton />}
							/>
						}
					</>
				)}
			>
				{item => <BioPageCard bio={item} />}
			</GridList>
		</>
	);
}

function BioPageCard({
	bio,
}: {
	bio: AppRouterOutputs['bio']['byWorkspace']['bios'][0];
}) {
	const { setShowArchiveModal, setShowDeleteModal } = useBiosSearchParams();
	const router = useRouter();

	const href = getAbsoluteUrl(
		'bio',
		`${bio.handle}${bio.key === 'home' ? '' : `/${bio.key}`}`,
	);
	const isHomeBio = bio.key === 'home';

	return (
		<GridListCard
			id={bio.id}
			key={bio.id}
			textValue={bio.key}
			setShowUpdateModal={() =>
				router.push(`/${bio.handle}/bios/blocks?bioKey=${bio.key}`)
			}
			setShowArchiveModal={isHomeBio ? undefined : setShowArchiveModal}
			setShowDeleteModal={isHomeBio ? undefined : setShowDeleteModal}
			title={bio.key}
			subtitle={href}
			quickActions={{
				goToHref: href,
				copyText: href,
			}}
			// stats={[
			// 	{
			// 		icon: 'eye',
			// 		name: 'Views',
			// 		value: bio._count?.events ?? 0,
			// 	},
			// 	{
			// 		icon: 'click',
			// 		name: 'Clicks',
			// 		value: 0, // TODO: Add click tracking
			// 	},
			// 	{
			// 		icon: 'email',
			// 		name: 'Email Captures',
			// 		value: 0, // TODO: Add email capture count
			// 	},
			// ]}
			onAction={() => {
				router.push(`/${bio.handle}/bios/blocks?bioKey=${bio.key}`);
			}}
		/>
	);
}

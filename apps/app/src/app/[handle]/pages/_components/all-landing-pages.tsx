'use client';

import type { LandingPage } from '@barely/lib/server/routes/landing-page/landing-page.schema';
import { formatCentsToDollars } from '@barely/lib/utils/currency';
import { getAbsoluteUrl } from '@barely/lib/utils/url';

import { GridListSkeleton } from '@barely/ui/components/grid-list-skeleton';
import { NoResultsPlaceholder } from '@barely/ui/components/no-results-placeholder';
import { GridList, GridListCard } from '@barely/ui/elements/grid-list';

import { CreateLandingPageButton } from '~/app/[handle]/pages/_components/create-landing-page-button';
import { useLandingPageContext } from '~/app/[handle]/pages/_components/landing-page-context';

export function AllLandingPages() {
	const { items, selection, setSelection, gridListRef, setShowUpdateModal, isFetching } =
		useLandingPageContext();

	return (
		<>
			<GridList
				glRef={gridListRef}
				aria-label='Landing Pages'
				className='flex flex-col gap-2'
				// behavior
				selectionMode='multiple'
				selectionBehavior='replace'
				// landingPages
				items={items}
				selectedKeys={selection}
				setSelectedKeys={setSelection}
				onAction={() => {
					if (!selection) return;
					setShowUpdateModal(true);
				}}
				// empty
				renderEmptyState={() =>
					isFetching ?
						<GridListSkeleton />
					:	<NoResultsPlaceholder
							icon='landingPage'
							title='No landing pages found.'
							subtitle='Create your first landing page to get started.'
							button={<CreateLandingPageButton />}
						/>
				}
			>
				{item => <LandingPageCard landingPage={item} />}
			</GridList>
			{/* <Button look='success'>success</Button> */}
		</>
	);
}

function LandingPageCard({ landingPage }: { landingPage: LandingPage }) {
	const { setShowUpdateModal, setShowArchiveModal, setShowDeleteModal } =
		useLandingPageContext();

	const href = getAbsoluteUrl('page', `${landingPage.handle}/${landingPage.key}`);

	return (
		<GridListCard
			id={landingPage.id}
			key={landingPage.id}
			textValue={landingPage.name}
			setShowUpdateModal={setShowUpdateModal}
			setShowArchiveModal={setShowArchiveModal}
			setShowDeleteModal={setShowDeleteModal}
			title={landingPage.name}
			subtitle={landingPage.key}
			quickActions={{
				goToHref: href,
				copyText: href,
			}}
			// statsRight={
			// 	<div className='items-left flex flex-col'>
			// 		<Text variant='xs/normal'>clicks: {landingPage.clicks}</Text>
			// 	</div>
			// }
			stats={[
				{
					icon: 'view',
					name: 'views',
					value: landingPage.views,
				},
				{
					icon: 'click',
					name: 'clicks',
					value: landingPage.clicks,
				},
				{
					icon: 'value',
					name: 'value',
					value: formatCentsToDollars(landingPage.value ?? 0),
				},
			]}
		/>
	);
}

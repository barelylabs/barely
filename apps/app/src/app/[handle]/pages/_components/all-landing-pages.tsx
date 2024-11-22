'use client';

import type { LandingPage } from '@barely/lib/server/routes/landing-page/landing-page.schema';
import { formatCentsToDollars } from '@barely/lib/utils/currency';
import { getAbsoluteUrl } from '@barely/lib/utils/url';

import { NoResultsPlaceholder } from '@barely/ui/components/no-results-placeholder';
import { GridList, GridListCard } from '@barely/ui/elements/grid-list';

import { CreateLandingPageButton } from '~/app/[handle]/pages/_components/create-landing-page-button';
import { useLandingPageContext } from '~/app/[handle]/pages/_components/landing-page-context';

export function AllLandingPages() {
	const {
		landingPages,
		landingPageSelection,
		setLandingPageSelection,
		gridListRef,
		setShowUpdateLandingPageModal,
	} = useLandingPageContext();

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
				items={landingPages}
				selectedKeys={landingPageSelection}
				setSelectedKeys={setLandingPageSelection}
				onAction={() => {
					if (!landingPageSelection) return;
					setShowUpdateLandingPageModal(true);
				}}
				// empty
				renderEmptyState={() => (
					<NoResultsPlaceholder
						icon='landingPage'
						title='No landing pages found.'
						subtitle='Create your first landing page to get started.'
						button={<CreateLandingPageButton />}
					/>
				)}
			>
				{landingPage => <LandingPageCard landingPage={landingPage} />}
			</GridList>
			{/* <Button look='success'>success</Button> */}
		</>
	);
}

function LandingPageCard({ landingPage }: { landingPage: LandingPage }) {
	const {
		setShowUpdateLandingPageModal,
		setShowArchiveLandingPageModal,
		setShowDeleteLandingPageModal,
	} = useLandingPageContext();

	const href = getAbsoluteUrl('page', `${landingPage.handle}/${landingPage.key}`);

	return (
		<GridListCard
			id={landingPage.id}
			key={landingPage.id}
			textValue={landingPage.name}
			setShowUpdateModal={setShowUpdateLandingPageModal}
			setShowArchiveModal={setShowArchiveLandingPageModal}
			setShowDeleteModal={setShowDeleteLandingPageModal}
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

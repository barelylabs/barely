'use client';

import type { LandingPage } from '@barely/lib/server/routes/landing-page/landing-page.schema';

import { NoResultsPlaceholder } from '@barely/ui/components/no-results-placeholder';
import { Button } from '@barely/ui/elements/button';
import { GridList, GridListCard } from '@barely/ui/elements/grid-list';
import { Text } from '@barely/ui/elements/typography';

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
			<Button look='success'>success</Button>
		</>
	);
}

function LandingPageCard({ landingPage }: { landingPage: LandingPage }) {
	const {
		setShowUpdateLandingPageModal,
		setShowArchiveLandingPageModal,
		setShowDeleteLandingPageModal,
	} = useLandingPageContext();

	return (
		<GridListCard
			id={landingPage.id}
			key={landingPage.id}
			textValue={landingPage.name}
			setShowUpdateModal={setShowUpdateLandingPageModal}
			setShowArchiveModal={setShowArchiveLandingPageModal}
			setShowDeleteModal={setShowDeleteLandingPageModal}
		>
			<div className='flex flex-grow flex-row items-center gap-4'>
				<div className='flex flex-col gap-1'>
					<Text variant='md/medium'>{landingPage.name}</Text>
					<Text variant='sm/normal' muted>
						{landingPage.key}
					</Text>
				</div>
			</div>
		</GridListCard>
	);
}

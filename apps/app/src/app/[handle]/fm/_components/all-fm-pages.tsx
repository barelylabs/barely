'use client';

import type { AppRouterOutputs } from '@barely/lib/server/api/router';

import { NoResultsPlaceholder } from '@barely/ui/components/no-results-placeholder';
import { GridList, GridListCard } from '@barely/ui/elements/grid-list';
import { Text } from '@barely/ui/elements/typography';

import { CreateFmPageButton } from '~/app/[handle]/fm/_components/create-fm-page-button';
import { useFmContext } from '~/app/[handle]/fm/_components/fm-context';

export function ALlFmPages() {
	const {
		fmPages,
		fmPageSelection,
		lastSelectedFmPageId,
		setFmPageSelection,
		gridListRef,
		setShowUpdateFmPageModal,
	} = useFmContext();

	return (
		<>
			<GridList
				glRef={gridListRef}
				className='flex flex-col gap-2'
				aria-label='Fm Pages'
				selectionMode='multiple'
				selectionBehavior='replace'
				onAction={() => {
					if (!lastSelectedFmPageId) return;
					setShowUpdateFmPageModal(true);
				}}
				items={fmPages}
				selectedKeys={fmPageSelection}
				setSelectedKeys={setFmPageSelection}
				renderEmptyState={() => (
					<NoResultsPlaceholder
						icon='fm'
						title='No FM Pages'
						subtitle='Create a new fm page to get started.'
						button={<CreateFmPageButton />}
					/>
				)}
			>
				{fmPage => <FmPageCard fmPage={fmPage} />}
			</GridList>
		</>
	);
}

function FmPageCard({
	fmPage,
}: {
	fmPage: AppRouterOutputs['fm']['byWorkspace']['fmPages'][0];
}) {
	const {
		setShowUpdateFmPageModal,
		setShowArchiveFmPageModal,
		setShowDeleteFmPageModal,
	} = useFmContext();

	return (
		<GridListCard
			id={fmPage.id}
			key={fmPage.id}
			textValue={fmPage.title}
			setShowUpdateModal={setShowUpdateFmPageModal}
			setShowArchiveModal={setShowArchiveFmPageModal}
			setShowDeleteModal={setShowDeleteFmPageModal}
		>
			<div className='flex flex-grow flex-row items-center gap-4'>
				<div className='flex flex-col gap-1'>
					<Text variant='md/medium'>{fmPage.title}</Text>
				</div>
			</div>
		</GridListCard>
	);
}

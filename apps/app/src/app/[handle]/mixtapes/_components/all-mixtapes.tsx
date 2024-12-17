'use client';

import type { AppRouterOutputs } from '@barely/lib/server/api/router';

import { GridListSkeleton } from '@barely/ui/components/grid-list-skeleton';
import { NoResultsPlaceholder } from '@barely/ui/components/no-results-placeholder';
import { GridList, GridListCard } from '@barely/ui/elements/grid-list';

import { CreateMixtapeButton } from '~/app/[handle]/mixtapes/_components/create-mixtape-button';
import { useMixtapesContext } from '~/app/[handle]/mixtapes/_components/mixtape-context';

export function AllMixtapes() {
	const {
		items,
		selection,
		lastSelectedItemId,
		setSelection,
		gridListRef,
		setShowUpdateModal,
		isFetching,
	} = useMixtapesContext();

	return (
		<>
			<GridList
				glRef={gridListRef}
				className='flex flex-col gap-2'
				aria-label='Mixtapes'
				selectionMode='multiple'
				selectionBehavior='replace'
				onAction={() => {
					if (!lastSelectedItemId) return;
					setShowUpdateModal(true);
				}}
				items={items}
				selectedKeys={selection}
				setSelectedKeys={setSelection}
				renderEmptyState={() => (
					<>
						{isFetching ?
							<GridListSkeleton />
						:	<NoResultsPlaceholder
								icon='mixtape'
								title='No Mixtapes'
								subtitle='Create a new mixtape to get started.'
								button={<CreateMixtapeButton />}
							/>
						}
					</>
				)}
			>
				{item => <MixtapeCard mixtape={item} />}
			</GridList>
		</>
	);
}

function MixtapeCard({
	mixtape,
}: {
	mixtape: AppRouterOutputs['mixtape']['byWorkspace']['mixtapes'][0];
}) {
	const { setShowUpdateModal, setShowArchiveModal, setShowDeleteModal } =
		useMixtapesContext();

	return (
		<GridListCard
			id={mixtape.id}
			key={mixtape.id}
			textValue={mixtape.name}
			setShowUpdateModal={setShowUpdateModal}
			setShowArchiveModal={setShowArchiveModal}
			setShowDeleteModal={setShowDeleteModal}
		>
			{mixtape.name}
		</GridListCard>
	);
}

'use client';

import type { CartFunnel } from '@barely/lib/server/routes/cart-funnel/cart-funnel.schema';

import { NoResultsPlaceholder } from '@barely/ui/components/no-results-placeholder';
import { GridList, GridListCard } from '@barely/ui/elements/grid-list';
import { Text } from '@barely/ui/elements/typography';

import { useCartFunnelContext } from '~/app/[handle]/carts/_components/cart-funnel-context';
import { CreateCartFunnelButton } from '~/app/[handle]/carts/_components/create-cart-funnel-button';

export function AllFunnels() {
	const {
		funnels,
		funnelSelection,
		setFunnelSelection,
		gridListRef,
		setShowUpdateFunnelModal,
	} = useCartFunnelContext();

	return (
		<>
			<GridList
				glRef={gridListRef}
				aria-label='Funnels'
				className='flex flex-col gap-2'
				// behavior
				selectionMode='multiple'
				selectionBehavior='replace'
				// funnels
				items={funnels}
				selectedKeys={funnelSelection}
				setSelectedKeys={setFunnelSelection}
				onAction={() => {
					if (!funnelSelection) return;
					setShowUpdateFunnelModal(true);
				}}
				// empty
				renderEmptyState={() => (
					<NoResultsPlaceholder
						icon='funnel'
						title='No funnels found.'
						subtitle='Create a funnel to get started.'
						button={<CreateCartFunnelButton />}
					/>
				)}
			>
				{funnel => <FunnelCard funnel={funnel} />}
			</GridList>
		</>
	);
}

function FunnelCard({ funnel }: { funnel: CartFunnel }) {
	const {
		setShowUpdateFunnelModal,
		setShowArchiveFunnelModal,
		setShowDeleteFunnelModal,
	} = useCartFunnelContext();

	return (
		<GridListCard
			id={funnel.id}
			key={funnel.id}
			textValue={funnel.name}
			setShowUpdateModal={setShowUpdateFunnelModal}
			setShowArchiveModal={setShowArchiveFunnelModal}
			setShowDeleteModal={setShowDeleteFunnelModal}
		>
			<div className='flex flex-grow flex-row items-center gap-4'>
				<div className='flex flex-col items-start gap-1'>
					<div className='flex flex-row items-center gap-2'>
						<div className='flex flex-col gap-1'>
							<Text variant='xs/semibold'>{funnel.name}</Text>
							<div className='flex flex-row gap-1'>
								<Text variant='xs/normal' muted>
									{funnel.key.toUpperCase()}
								</Text>
							</div>
						</div>
					</div>
				</div>
			</div>
		</GridListCard>
	);
}

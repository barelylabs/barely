'use client';

import type { CartFunnel } from '@barely/lib/server/routes/cart-funnel/cart-funnel.schema';

import { NoResultsPlaceholder } from '@barely/ui/components/no-results-placeholder';
import { GridList, GridListCard } from '@barely/ui/elements/grid-list';
import { Text } from '@barely/ui/elements/typography';

import { useCartFunnelContext } from '~/app/[handle]/carts/_components/cart-funnel-context';
import { CreateCartFunnelButton } from '~/app/[handle]/carts/_components/create-cart-funnel-button';

export function AllCartFunnels() {
	const {
		cartFunnels: funnels,
		cartFunnelSelection: funnelSelection,
		setCartFunnelSelection: setFunnelSelection,
		gridListRef,
		setShowUpdateCartFunnelModal: setShowUpdateFunnelModal,
	} = useCartFunnelContext();

	return (
		<>
			<GridList
				glRef={gridListRef}
				aria-label='Carts'
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
						icon='cart'
						title='No carts found.'
						subtitle='Create a cart to get started.'
						button={<CreateCartFunnelButton />}
					/>
				)}
			>
				{funnel => <CartFunnelCard cartFunnel={funnel} />}
			</GridList>
		</>
	);
}

function CartFunnelCard({ cartFunnel }: { cartFunnel: CartFunnel }) {
	const {
		setShowUpdateCartFunnelModal: setShowUpdateFunnelModal,
		setShowArchiveCartFunnelModal: setShowArchiveFunnelModal,
		setShowDeleteCartFunnelModal: setShowDeleteFunnelModal,
	} = useCartFunnelContext();

	return (
		<GridListCard
			id={cartFunnel.id}
			key={cartFunnel.id}
			textValue={cartFunnel.name}
			setShowUpdateModal={setShowUpdateFunnelModal}
			setShowArchiveModal={setShowArchiveFunnelModal}
			setShowDeleteModal={setShowDeleteFunnelModal}
		>
			<div className='flex flex-grow flex-row items-center gap-4'>
				<div className='flex flex-col items-start gap-1'>
					<div className='flex flex-row items-center gap-2'>
						<div className='flex flex-col gap-1'>
							<Text variant='xs/semibold'>{cartFunnel.name}</Text>
							<div className='flex flex-row gap-1'>
								<Text variant='xs/normal' muted>
									{cartFunnel.key.toUpperCase()}
								</Text>
							</div>
						</div>
					</div>
				</div>
			</div>
		</GridListCard>
	);
}

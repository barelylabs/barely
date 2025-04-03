'use client';

import type { CartFunnel } from '@barely/lib/server/routes/cart-funnel/cart-funnel.schema';
import { formatCentsToDollars } from '@barely/lib/utils/currency';

import { GridListSkeleton } from '@barely/ui/components/grid-list-skeleton';
import { NoResultsPlaceholder } from '@barely/ui/components/no-results-placeholder';
import { GridList, GridListCard } from '@barely/ui/elements/grid-list';

import { useCartFunnelContext } from '~/app/[handle]/carts/_components/cartFunnel-context';
import { CreateCartFunnelButton } from '~/app/[handle]/carts/_components/create-cartFunnel-button';

export function AllCartFunnels() {
	const {
		cartFunnels,
		cartFunnelSelection,
		setCartFunnelSelection,
		gridListRef,
		setShowUpdateCartFunnelModal,

		isFetching,
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
				items={cartFunnels}
				selectedKeys={cartFunnelSelection}
				setSelectedKeys={setCartFunnelSelection}
				onAction={() => {
					if (!cartFunnelSelection) return;
					setShowUpdateCartFunnelModal(true);
				}}
				// empty
				renderEmptyState={() =>
					isFetching ?
						<GridListSkeleton />
					:	<NoResultsPlaceholder
							icon='cart'
							title='No carts found.'
							subtitle='Create a cart to get started.'
							button={<CreateCartFunnelButton />}
						/>
				}
			>
				{funnel => <CartFunnelCard cartFunnel={funnel} />}
			</GridList>
		</>
	);
}

function CartFunnelCard({ cartFunnel }: { cartFunnel: CartFunnel }) {
	const {
		setShowUpdateCartFunnelModal: setShowUpdateCartFunnelModal,
		setShowArchiveCartFunnelModal: setShowArchiveCartFunnelModal,
		setShowDeleteCartFunnelModal: setShowDeleteCartFunnelModal,
	} = useCartFunnelContext();

	const { handle, key, value } = cartFunnel;

	const href = `https://barelycart.com/${handle}/${key}`;

	return (
		<GridListCard
			id={cartFunnel.id}
			key={cartFunnel.id}
			textValue={cartFunnel.name}
			setShowUpdateModal={setShowUpdateCartFunnelModal}
			setShowArchiveModal={setShowArchiveCartFunnelModal}
			setShowDeleteModal={setShowDeleteCartFunnelModal}
			title={cartFunnel.name}
			subtitle={cartFunnel.key.toUpperCase()}
			quickActions={{
				goToHref: href,
				copyText: href,
			}}
			stats={[
				{
					icon: 'value',
					name: 'value',
					value: formatCentsToDollars(value ?? 0),
				},
			]}
			statsHref={`/${handle}/carts/stats?assetId=${cartFunnel.id}`}
		/>
	);
}

'use client';

import type { AppRouterOutputs } from '@barely/lib/server/api/router';
import type { GridListCommandItemProps } from '@barely/ui/elements/grid-list';
import { api } from '@barely/lib/server/api/react';
import { formatCentsToDollars } from '@barely/lib/utils/currency';
import { numToPaddedString } from '@barely/lib/utils/number';

import { NoResultsPlaceholder } from '@barely/ui/components/no-results-placeholder';
import { Badge } from '@barely/ui/elements/badge';
import { GridList, GridListCard } from '@barely/ui/elements/grid-list';
import { Text } from '@barely/ui/elements/typography';

import { useCartOrderContext } from '~/app/[handle]/orders/_components/cart-order-context';

export function AllCartOrders() {
	const { cartOrders, cartOrderSelection, setCartOrderSelection, gridListRef } =
		useCartOrderContext();

	const { data } = api.workspace.example.useQuery();

	return (
		<>
			<GridList
				glRef={gridListRef}
				aria-label='Orders'
				className='flex flex-col gap-2'
				selectionMode='multiple'
				selectionBehavior='replace'
				items={cartOrders}
				selectedKeys={cartOrderSelection}
				setSelectedKeys={setCartOrderSelection}
				onAction={() => {
					if (!cartOrderSelection) return;
				}}
				renderEmptyState={() => (
					<NoResultsPlaceholder icon='orders' title='No orders found.' />
				)}
			>
				{order => <CartOrderCard cartOrder={order} />}
			</GridList>
			<pre>{JSON.stringify(data, null, 2)}</pre>
		</>
	);
}

function CartOrderCard({
	cartOrder,
}: {
	cartOrder: AppRouterOutputs['cartOrder']['byWorkspace']['cartOrders'][0];
}) {
	const { setShowMarkAsFulfilledModal: setShowMarkAsFulfilledModal } =
		useCartOrderContext();

	const markAsFulfilledCommandItem: GridListCommandItemProps = {
		label: 'Mark as fulfilled',
		icon: 'check',
		shortcut: ['f'],
		action: () => setShowMarkAsFulfilledModal(true),
	};

	return (
		<GridListCard
			id={cartOrder.id}
			key={cartOrder.id}
			textValue={cartOrder.id}
			commandItems={[
				...(cartOrder.fulfillmentStatus !== 'fulfilled' ?
					[markAsFulfilledCommandItem]
				:	[]),
			]}
		>
			<div className='flex flex-col gap-1'>
				<Text variant='md/bold'>{numToPaddedString(cartOrder.orderId ?? 0)}</Text>
				{cartOrder.products.map(product => (
					<div className='flex flex-row gap-1' key={product.id}>
						<Text variant='sm/normal'>{product.name}</Text>
						{product.apparelSize && (
							<Text variant='sm/normal'> (size: {product.apparelSize})</Text>
						)}
					</div>
				))}
				<Text variant='sm/normal'>
					Total: {formatCentsToDollars(cartOrder.orderAmount)}
				</Text>
			</div>
			<div className='flex flex-col gap-1'>
				<Text variant='sm/normal'>
					{cartOrder.firstName} {cartOrder.fullName}
				</Text>
				<Text variant='sm/normal'>{cartOrder.shippingAddressLine1}</Text>
				<Text variant='sm/normal'>{cartOrder.shippingAddressLine2}</Text>
				<Text variant='sm/normal'>
					{cartOrder.shippingAddressCity}, {cartOrder.shippingAddressState}{' '}
					{cartOrder.shippingAddressPostalCode}
				</Text>
			</div>
			<Badge>{cartOrder.fulfillmentStatus}</Badge>
		</GridListCard>
	);
}

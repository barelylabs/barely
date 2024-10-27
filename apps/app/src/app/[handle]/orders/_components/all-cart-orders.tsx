'use client';

import type { AppRouterOutputs } from '@barely/lib/server/api/router';
import type { GridListCommandItemProps } from '@barely/ui/elements/grid-list';
import { useCopy } from '@barely/lib/hooks/use-copy';
import { useWorkspace } from '@barely/lib/hooks/use-workspace';
import { api } from '@barely/lib/server/api/react';
import { getTrackingLink } from '@barely/lib/server/shipping/shipping.utils';
import { formatCentsToDollars } from '@barely/lib/utils/currency';
import { numToPaddedString } from '@barely/lib/utils/number';

import { NoResultsPlaceholder } from '@barely/ui/components/no-results-placeholder';
import { Badge } from '@barely/ui/elements/badge';
import { Button } from '@barely/ui/elements/button';
import { GridList, GridListCard } from '@barely/ui/elements/grid-list';
import { Separator } from '@barely/ui/elements/separator';
import { Text } from '@barely/ui/elements/typography';

import { useCartOrderContext } from '~/app/[handle]/orders/_components/cart-order-context';

export function AllCartOrders() {
	const { cartOrders, cartOrderSelection, setCartOrderSelection, gridListRef } =
		useCartOrderContext();

	return (
		<div className='flex flex-col gap-4'>
			<GridList
				glRef={gridListRef}
				aria-label='Orders'
				className='flex flex-col gap-4'
				selectionMode='multiple'
				selectionBehavior='replace'
				items={cartOrders}
				selectedKeys={cartOrderSelection}
				setSelectedKeys={setCartOrderSelection}
				onAction={() => {
					if (!cartOrderSelection) return;
				}}
				renderEmptyState={() => (
					<NoResultsPlaceholder icon='order' title='No orders found.' />
				)}
			>
				{order => <CartOrderCard cartOrder={order} />}
			</GridList>
			<LoadMoreButton />
		</div>
	);
}

function LoadMoreButton() {
	const { hasNextPage, fetchNextPage, isFetchingNextPage } = useCartOrderContext();
	if (!hasNextPage)
		return (
			<div className='flex w-full justify-center'>
				<Text variant='sm/normal'>No more orders to load.</Text>
			</div>
		);
	return (
		<Button
			look='primary'
			// size='sm'
			onClick={() => fetchNextPage()}
			loading={isFetchingNextPage}
			fullWidth
		>
			Load more orders
		</Button>
	);
}

function CartOrderCard({
	cartOrder,
}: {
	cartOrder: AppRouterOutputs['cartOrder']['byWorkspace']['cartOrders'][0];
}) {
	const { setShowMarkAsFulfilledModal, setCartOrderSelection, cartOrderSelection } =
		useCartOrderContext();

	const { handle } = useWorkspace();

	const markAsFulfilledCommandItem: GridListCommandItemProps = {
		label: 'Mark as fulfilled',
		icon: 'check',
		shortcut: ['f'],
		action: () => {
			setCartOrderSelection(new Set([cartOrder.id]));
			setShowMarkAsFulfilledModal(true);
		},
	};

	const { data: fulfillments } = api.cartOrder.fulfillmentsByCartId.useQuery({
		handle,
		cartId: cartOrder.id,
	});

	const { copyToClipboard } = useCopy();

	const fullShippingAddressWithLineBreaks = `${cartOrder.fullName}\n${cartOrder.shippingAddressLine1}\n${cartOrder.shippingAddressLine2 ? `${cartOrder.shippingAddressLine2}\n` : ''}${cartOrder.shippingAddressCity}, ${cartOrder.shippingAddressState} ${cartOrder.shippingAddressPostalCode}`;

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
			actionOnCommandMenuOpen={() => {
				if (cartOrderSelection === 'all' || cartOrderSelection.has(cartOrder.id)) {
					return;
				}
				setCartOrderSelection(new Set([cartOrder.id]));
			}}
		>
			<div className='flex w-full flex-col gap-4'>
				<div className='flex w-full flex-row gap-2'>
					<div className='flex flex-col gap-2'>
						<div className='flex flex-row items-center gap-2'>
							<Text variant='lg/bold'>{numToPaddedString(cartOrder.orderId ?? 0)}</Text>
							<Badge size='xs'>{cartOrder.fulfillmentStatus}</Badge>
						</div>
						{/* <Text>{cartOrder.id}</Text> */}
						<div className='flex flex-row gap-10'>
							<div className='flex flex-col gap-2'>
								{cartOrder.products.map(product => (
									<div className='flex flex-row gap-1' key={product.id}>
										<Text variant='sm/normal'>{product.name}</Text>
										{product.apparelSize && (
											<Text variant='sm/normal'> (size: {product.apparelSize})</Text>
										)}

										{cartOrder.fulfillmentStatus === 'partially_fulfilled' &&
											product.fulfilled === false && <Badge size='2xs'>pending</Badge>}
									</div>
								))}
								<Text variant='sm/medium'>
									Total: {formatCentsToDollars(cartOrder.orderAmount)}
								</Text>
							</div>
							<div className='flex flex-col'>
								<div className='group/shippingAddress flex flex-row items-center gap-1'>
									<Text variant='sm/bold'>Shipping Address</Text>
									<Button
										variant='icon'
										look='ghost'
										size='2xs'
										startIcon='copy'
										className='opacity-0 transition-opacity duration-200 group-hover/shippingAddress:opacity-100'
										onClick={e => {
											e.stopPropagation();
											copyToClipboard(fullShippingAddressWithLineBreaks ?? '', {
												successMessage: 'Copied shipping address to clipboard!',
											});
										}}
									/>
								</div>
								<div className='group/name flex flex-row items-center gap-1'>
									<Text variant='sm/normal'>{cartOrder.fullName}</Text>
									<Button
										variant='icon'
										look='ghost'
										size='2xs'
										startIcon='copy'
										className='opacity-0 transition-opacity duration-200 group-hover/name:opacity-100'
										onClick={e => {
											e.stopPropagation();
											copyToClipboard(cartOrder.fullName ?? '', {
												successMessage: 'Copied full name to clipboard!',
											});
										}}
									/>
								</div>

								<div className='group/shippingAddressLine1 flex flex-row items-center gap-1'>
									<Text variant='sm/normal'>{cartOrder.shippingAddressLine1}</Text>
									<Button
										variant='icon'
										look='ghost'
										size='2xs'
										startIcon='copy'
										className='opacity-0 transition-opacity duration-200 group-hover/shippingAddressLine1:opacity-100'
										onClick={() =>
											copyToClipboard(cartOrder.shippingAddressLine1 ?? '', {
												successMessage: 'Copied shipping address line 1 to clipboard!',
											})
										}
									/>
								</div>

								{cartOrder.shippingAddressLine2 && (
									<div className='group/shippingAddressLine2 flex flex-row items-center gap-1'>
										<Text variant='sm/normal'>{cartOrder.shippingAddressLine2}</Text>
										<Button
											variant='icon'
											look='ghost'
											size='2xs'
											startIcon='copy'
											className='opacity-0 transition-opacity duration-200 group-hover/shippingAddressLine2:opacity-100'
											onClick={() =>
												copyToClipboard(cartOrder.shippingAddressLine2 ?? '', {
													successMessage: 'Copied shipping address line 2 to clipboard!',
												})
											}
										/>
									</div>
								)}

								<div className='group/shippingAddressZipCityState flex flex-row items-center gap-1'>
									<Text variant='sm/normal'>
										{cartOrder.shippingAddressCity}, {cartOrder.shippingAddressState}{' '}
										{cartOrder.shippingAddressPostalCode}
									</Text>
									<Button
										variant='icon'
										look='ghost'
										size='2xs'
										startIcon='copy'
										className='opacity-0 transition-opacity duration-200 group-hover/shippingAddressZipCityState:opacity-100'
										onClick={() =>
											copyToClipboard(
												`${cartOrder.shippingAddressCity}, ${cartOrder.shippingAddressState} ${cartOrder.shippingAddressPostalCode}`,
												{
													successMessage: 'Copied shipping address to clipboard!',
												},
											)
										}
									/>
								</div>
								<div className='group/email flex flex-row items-center gap-1'>
									<Text variant='sm/normal'>{cartOrder.email}</Text>
									<Button
										variant='icon'
										look='ghost'
										size='2xs'
										startIcon='copy'
										className='opacity-0 transition-opacity duration-200 group-hover/email:opacity-100'
										onClick={() =>
											copyToClipboard(cartOrder.email ?? '', {
												successMessage: 'Copied email to clipboard!',
											})
										}
									/>
								</div>
							</div>
						</div>
					</div>
				</div>

				<Separator />

				<div className='group/tracking flex flex-col gap-1'>
					{(fulfillments ?? []).map(fulfillment => {
						const carrier = fulfillment.shippingCarrier;
						const trackingNumber = fulfillment.shippingTrackingNumber;
						if (!carrier || !trackingNumber) return null;
						const trackingUrl = getTrackingLink({
							carrier: carrier,
							trackingNumber: trackingNumber,
						});
						return (
							<div className='flex flex-row items-center gap-2' key={fulfillment.id}>
								<Text variant='sm/normal'>
									{carrier} :: {trackingNumber}
								</Text>
								<div className='group/tracking-buttons flex flex-row gap-1 opacity-0 transition-opacity duration-200 group-hover/tracking:opacity-100'>
									<Button
										variant='icon'
										look='ghost'
										size='xs'
										startIcon='externalLink'
										href={trackingUrl}
										target='_blank'
										rel='noopener noreferrer'
									/>
									<Button
										variant='icon'
										look='ghost'
										size='xs'
										startIcon='link'
										onClick={() =>
											copyToClipboard(trackingUrl, {
												successMessage: 'Copied tracking url to clipboard!',
											})
										}
									/>
									<Button
										variant='icon'
										look='ghost'
										size='xs'
										startIcon='copy'
										onClick={() =>
											copyToClipboard(trackingNumber, {
												successMessage: 'Copied tracking number to clipboard!',
											})
										}
									/>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</GridListCard>
	);
}

'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import type { GridListCommandItemProps } from '@barely/ui/grid-list';
import { Suspense } from 'react';
import { useCopy, useWorkspace } from '@barely/hooks';
import {
	formatMinorToMajorCurrency,
	getTrackingLink,
	numToPaddedString,
} from '@barely/utils';
import { useSuspenseQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Badge } from '@barely/ui/badge';
import { Button } from '@barely/ui/button';
import { GridListSkeleton } from '@barely/ui/components/grid-list-skeleton';
import { NoResultsPlaceholder } from '@barely/ui/components/no-results-placeholder';
import { GridList, GridListCard } from '@barely/ui/grid-list';
import { Separator } from '@barely/ui/separator';
import { Skeleton } from '@barely/ui/skeleton';
import { Text } from '@barely/ui/typography';

import { useCartOrder } from '~/app/[handle]/merch/orders/_components/cart-order-context';

export function AllCartOrders() {
	const { items, isFetching, selection, setSelection } = useCartOrder();

	return (
		<div className='flex flex-col gap-4'>
			<GridList
				aria-label='Orders'
				data-grid-list='cart-orders'
				className='flex flex-col gap-4'
				selectionMode='multiple'
				selectionBehavior='replace'
				items={items}
				selectedKeys={selection}
				setSelectedKeys={setSelection}
				onAction={() => {
					if (selection === 'all' || !selection.size) return;
				}}
				renderEmptyState={() => (
					<>
						{isFetching ?
							<GridListSkeleton />
						:	<NoResultsPlaceholder icon='order' title='No orders found.' />}
					</>
				)}
			>
				{item => <CartOrderCard cartOrder={item} />}
			</GridList>
			<LoadMoreButton />
		</div>
	);
}

function LoadMoreButton() {
	const { hasNextPage, fetchNextPage, isFetchingNextPage } = useCartOrder();
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
	const {
		setSelection,
		setShowMarkAsFulfilledModal,
		setShowCancelCartOrderModal,
		setShowShipOrderModal,
	} = useCartOrder();

	const { handle, workspace } = useWorkspace();

	const shipCommandItem: GridListCommandItemProps = {
		label: 'Ship',
		icon: 'package',
		shortcut: ['s'],
		action: () => {
			void setSelection(new Set([cartOrder.id]));
			void setShowShipOrderModal(true);
		},
	};

	const markAsFulfilledCommandItem: GridListCommandItemProps = {
		label: 'Mark as fulfilled',
		icon: 'fulfillment',
		shortcut: ['f'],
		action: () => {
			void setSelection(new Set([cartOrder.id]));
			void setShowMarkAsFulfilledModal(true);
		},
	};

	const cancelCommandItem: GridListCommandItemProps = {
		label: 'Cancel',
		icon: 'x',
		shortcut: ['x'],
		action: () => {
			void setSelection(new Set([cartOrder.id]));
			void setShowCancelCartOrderModal(true);
		},
	};

	const { copyToClipboard } = useCopy();

	const fullShippingAddressWithLineBreaks = `${cartOrder.fullName}\n${cartOrder.shippingAddressLine1}\n${cartOrder.shippingAddressLine2 ? `${cartOrder.shippingAddressLine2}\n` : ''}${cartOrder.shippingAddressCity}, ${cartOrder.shippingAddressState} ${cartOrder.shippingAddressPostalCode}`;

	const commandItems = [
		!cartOrder.canceledAt && cartOrder.fulfillmentStatus === 'pending' && shipCommandItem,
		cartOrder.fulfillmentStatus !== 'fulfilled' && markAsFulfilledCommandItem,
		!cartOrder.canceledAt &&
			cartOrder.fulfillmentStatus === 'pending' &&
			cancelCommandItem,
	].filter((item): item is GridListCommandItemProps => Boolean(item));

	return (
		<GridListCard
			id={cartOrder.id}
			key={cartOrder.id}
			textValue={cartOrder.id}
			commandItems={commandItems}
		>
			<div className='flex w-full flex-col gap-4'>
				<div className='flex w-full flex-row gap-2'>
					<div className='flex flex-col gap-2'>
						<div className='flex flex-row items-center gap-2'>
							<Text variant='lg/bold'>{numToPaddedString(cartOrder.orderId ?? 0)}</Text>
							<Badge size='xs'>
								{cartOrder.canceledAt ? 'canceled' : cartOrder.fulfillmentStatus}
							</Badge>
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
									Total:{' '}
									{formatMinorToMajorCurrency(cartOrder.orderAmount, workspace.currency)}
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
											copyToClipboard(fullShippingAddressWithLineBreaks, {
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

				<Suspense fallback={<CartOrderFulfillmentsSkeleton />}>
					<CartOrderFulfillments cartOrderId={cartOrder.id} handle={handle} />
				</Suspense>
			</div>
		</GridListCard>
	);
}

function CartOrderFulfillments({
	cartOrderId,
	handle,
}: {
	cartOrderId: string;
	handle: string;
}) {
	const trpc = useTRPC();
	const { data: fulfillments } = useSuspenseQuery(
		trpc.cartOrder.fulfillmentsByCartId.queryOptions({
			handle,
			cartId: cartOrderId,
		}),
	);

	const { copyToClipboard } = useCopy();

	if (fulfillments.length === 0) return null;

	return (
		<>
			<Separator />

			<div className='group/tracking flex flex-col gap-1'>
				{fulfillments.map(fulfillment => {
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
		</>
	);
}

function CartOrderFulfillmentsSkeleton() {
	return (
		<>
			<Separator />
			<div className='flex flex-col gap-1'>
				<Skeleton className='h-5 w-48' />
			</div>
		</>
	);
}

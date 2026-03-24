'use client';

import type { z } from 'zod/v4';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { MERCH_DIMENSIONS } from '@barely/const';
import { focusGridList, useWorkspace, useZodForm } from '@barely/hooks';
import { shipCartOrderSchema } from '@barely/validators';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Alert } from '@barely/ui/alert';
import { Badge } from '@barely/ui/badge';
import { Button } from '@barely/ui/button';
import { Form, SubmitButton } from '@barely/ui/forms/form';
import { Icon } from '@barely/ui/icon';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@barely/ui/modal';
import { Separator } from '@barely/ui/separator';
import { Text } from '@barely/ui/typography';

import { useCartOrder } from '~/app/[handle]/merch/orders/_components/cart-order-context';

function openLabelForPrint(handle: string, labelUrl: string) {
	const printPageUrl = `/${handle}/print-label?url=${encodeURIComponent(labelUrl)}`;
	window.open(printPageUrl, '_blank');
}

export function ShipOrderModal() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const { workspace } = useWorkspace();
	const params = useParams<{ handle: string }>();

	const {
		lastSelectedItem: selectedCartOrder,
		filters: { showShipOrderModal },
		setShowShipOrderModal,
	} = useCartOrder();

	const [labelUrl, setLabelUrl] = useState<string | null>(null);
	const [trackingNumber, setTrackingNumber] = useState<string | null>(null);
	// Track which cart ID the current label state belongs to, to prevent stale state
	const labelForCartIdRef = useRef<string | null>(null);

	// Reset local label state when the selected order changes
	useEffect(() => {
		if (selectedCartOrder?.id !== labelForCartIdRef.current) {
			setLabelUrl(null);
			setTrackingNumber(null);
			labelForCartIdRef.current = null;
		}
	}, [selectedCartOrder?.id]);

	// Check if the selected order already has a fulfillment with a label URL
	const existingFulfillment = useMemo(() => {
		if (!selectedCartOrder?.fulfillments.length) return null;
		// Find the most recent fulfillment that has a valid label
		const validFulfillment = [...selectedCartOrder.fulfillments]
			.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
			.find(
				f =>
					f.labelDownloadUrl &&
					f.labelStatus !== 'voided' &&
					(!f.labelExpiresAt || new Date() < new Date(f.labelExpiresAt)),
			);
		return validFulfillment ?? null;
	}, [selectedCartOrder?.fulfillments]);

	// The effective label URL: either from a just-created label or from the persisted fulfillment
	const effectiveLabelUrl = labelUrl ?? existingFulfillment?.labelDownloadUrl ?? null;
	const effectiveTrackingNumber =
		trackingNumber ?? existingFulfillment?.shippingTrackingNumber ?? null;

	// Whether we're showing post-ship state (either just shipped or previously shipped)
	const isPostShipState = !!effectiveLabelUrl;
	const isFromExistingFulfillment = !labelUrl && !!existingFulfillment;

	// All products in the order (for showing in post-ship state)
	const allProducts = useMemo(
		() => selectedCartOrder?.products ?? [],
		[selectedCartOrder],
	);

	// Get products that need to be shipped
	const unshippedProducts = useMemo(
		() => selectedCartOrder?.products.filter(p => !p.fulfilled) ?? [],
		[selectedCartOrder],
	);

	// Calculate package dimensions based on products using MERCH_DIMENSIONS
	const packageDimensions = useMemo(() => {
		if (!unshippedProducts.length) {
			return { weightOz: 8, lengthIn: 12, widthIn: 10, heightIn: 3 };
		}

		let totalWeightInOunces = 0;
		let totalVolume = 0;
		let minWidth = 0;
		let minLength = 0;
		let minHeight = 0;

		unshippedProducts.forEach(product => {
			const dimensions = MERCH_DIMENSIONS[product.merchType];
			totalWeightInOunces += dimensions.weight;
			totalVolume += dimensions.width * dimensions.length * dimensions.height;
			minWidth = Math.max(minWidth, dimensions.width);
			minLength = Math.max(minLength, dimensions.length);
			minHeight = Math.max(minHeight, dimensions.height);
		});

		// Get the smallest box that can fit all the products
		const boxWidth = Math.ceil(minWidth);
		const boxLength = Math.ceil(minLength);
		const boxHeight = Math.ceil(
			Math.max(totalVolume / (boxWidth * boxLength), minHeight),
		);

		return {
			weightOz: totalWeightInOunces,
			lengthIn: boxLength,
			widthIn: boxWidth,
			heightIn: boxHeight,
		};
	}, [unshippedProducts]);

	// Mutation for creating shipping label
	const { mutateAsync: shipOrder, isPending } = useMutation(
		trpc.cartOrder.shipOrder.mutationOptions({
			onSuccess: async data => {
				setLabelUrl(data.labelDownloadUrl);
				setTrackingNumber(data.trackingNumber);
				labelForCartIdRef.current = selectedCartOrder?.id ?? null;
				// Auto-open label in new window with print dialog
				openLabelForPrint(params.handle, data.labelDownloadUrl);

				await queryClient.invalidateQueries({
					queryKey: trpc.cartOrder.byWorkspace.queryKey(),
				});
			},
			onError: error => {
				console.error('Failed to create shipping label:', error);
			},
		}),
	);

	// Form
	const form = useZodForm({
		schema: shipCartOrderSchema,
		values: {
			cartId: selectedCartOrder?.id ?? '',
			products: unshippedProducts.map(p => ({
				id: p.id,
				fulfilled: true,
				apparelSize: p.apparelSize ?? undefined,
			})),
			package: packageDimensions,
			deliveryConfirmation: 'none' as const,
		},
	});

	const handleSubmit = async (data: z.infer<typeof shipCartOrderSchema>) => {
		await shipOrder({
			...data,
			handle: workspace.handle,
		});
	};

	const handleCloseModal = useCallback(async () => {
		setLabelUrl(null);
		setTrackingNumber(null);
		labelForCartIdRef.current = null;
		form.reset();

		await queryClient.invalidateQueries({
			queryKey: trpc.cartOrder.byWorkspace.queryKey(),
		});

		void setShowShipOrderModal(false);
		focusGridList('cart-orders');
	}, [setShowShipOrderModal, form, queryClient, trpc]);

	const showModal = showShipOrderModal && !!selectedCartOrder;

	if (!selectedCartOrder) return null;

	// Determine carrier: Barely-fulfilled orders always use USPS (US warehouse)
	const isBarelyFulfilled = selectedCartOrder.fulfilledBy === 'barely';
	const isUK =
		!isBarelyFulfilled &&
		(workspace.shippingAddressCountry?.toUpperCase() === 'GB' ||
			workspace.shippingAddressCountry?.toUpperCase() === 'UK');
	const carrier = isUK ? 'evri' : 'usps';
	const CarrierIcon = Icon[carrier];

	return (
		<Modal
			showModal={showModal}
			setShowModal={setShowShipOrderModal}
			onClose={handleCloseModal}
			preventDefaultClose={isPending}
		>
			<ModalHeader icon='package' title={`Ship Order #${selectedCartOrder.orderId}`} />

			{
				isPostShipState ?
					// Success state - label created (or previously shipped)
					<ModalBody>
						<Alert
							title={
								isFromExistingFulfillment ?
									'This order has already been shipped.'
								:	'Shipping label created!'
							}
							description={
								isFromExistingFulfillment ?
									'You can reopen the label below to reprint it.'
								:	"The label has been opened in a new window for printing. If it didn't open, check your pop-up blocker settings."
							}
							variant='success'
						/>

						<div className='flex flex-col gap-2 rounded-md border p-4'>
							<Text variant='sm/medium'>Tracking Number:</Text>
							<Text variant='md/normal' className='font-mono'>
								{effectiveTrackingNumber}
							</Text>
						</div>

						{/* Products in this order */}
						<div className='flex flex-col gap-2'>
							<Text variant='sm/medium'>Products in This Order:</Text>
							{allProducts.map(product => (
								<div key={product.id} className='flex items-center gap-2'>
									<Icon.package className='h-4 w-4 text-muted-foreground' />
									<Text variant='sm/normal'>
										{product.name}
										{product.apparelSize && ` (${product.apparelSize})`}
									</Text>
								</div>
							))}
						</div>

						<div className='flex flex-col gap-3'>
							{!isFromExistingFulfillment && (
								<Text variant='sm/normal' className='text-muted-foreground'>
									A shipping confirmation email has been sent to the customer.
								</Text>
							)}

							<Button
								look='secondary'
								size='sm'
								onClick={() =>
									effectiveLabelUrl &&
									openLabelForPrint(params.handle, effectiveLabelUrl)
								}
								startIcon='externalLink'
							>
								{isFromExistingFulfillment ?
									'Reprint Label'
								:	'Reopen Label for Printing'}
							</Button>

							{!isFromExistingFulfillment && (
								<Text variant='xs/normal' className='text-muted-foreground'>
									If the label didn&apos;t open automatically, your browser may be
									blocking pop-ups. Check your pop-up blocker settings and try the button
									above.
								</Text>
							)}
						</div>
					</ModalBody>
					// Form state - create label
				:	<Form form={form} onSubmit={handleSubmit}>
						<ModalBody>
							<div className='flex flex-col gap-4'>
								{/* Order Summary */}
								<div className='flex flex-col gap-2'>
									<Text variant='sm/medium'>Shipping To:</Text>
									<div className='rounded-md border p-3'>
										<Text variant='sm/normal'>{selectedCartOrder.fullName}</Text>
										<Text variant='sm/normal'>
											{selectedCartOrder.shippingAddressLine1}
										</Text>
										{selectedCartOrder.shippingAddressLine2 && (
											<Text variant='sm/normal'>
												{selectedCartOrder.shippingAddressLine2}
											</Text>
										)}
										<Text variant='sm/normal'>
											{selectedCartOrder.shippingAddressCity},{' '}
											{selectedCartOrder.shippingAddressState}{' '}
											{selectedCartOrder.shippingAddressPostalCode}
										</Text>
									</div>
								</div>

								<Separator />

								{/* Products to ship */}
								<div className='flex flex-col gap-2'>
									<Text variant='sm/medium'>Products in This Shipment:</Text>
									{unshippedProducts.map(product => (
										<div key={product.id} className='flex items-center gap-2'>
											<Icon.package className='h-4 w-4 text-muted-foreground' />
											<Text variant='sm/normal'>
												{product.name}
												{product.apparelSize && ` (${product.apparelSize})`}
											</Text>
										</div>
									))}
								</div>

								<Separator />

								{/* Shipping Method */}
								<div className='flex flex-col gap-2'>
									<Text variant='sm/medium'>Shipping Method:</Text>
									<div className='flex items-center gap-2 rounded-md bg-muted p-3'>
										<CarrierIcon className='h-5 w-5' />
										<div className='flex flex-col'>
											<Text variant='sm/medium'>{carrier.toUpperCase()}</Text>
											<Text variant='xs/normal' className='text-muted-foreground'>
												{isUK ? 'Standard Delivery (UK)' : 'Ground Shipping (US)'}
											</Text>
										</div>
										<Badge variant='secondary' size='sm' className='ml-auto'>
											Cheapest
										</Badge>
									</div>
								</div>

								{/* Package Info */}
								<div className='flex flex-col gap-2'>
									<Text variant='sm/medium'>Package Details:</Text>
									<div className='grid grid-cols-2 gap-2 rounded-md bg-muted p-3 text-sm'>
										<div>
											<Text variant='xs/normal' className='text-muted-foreground'>
												Weight
											</Text>
											<Text variant='sm/medium'>{packageDimensions.weightOz} oz</Text>
										</div>
										<div>
											<Text variant='xs/normal' className='text-muted-foreground'>
												Dimensions
											</Text>
											<Text variant='sm/medium'>
												{packageDimensions.lengthIn}" × {packageDimensions.widthIn}" ×{' '}
												{packageDimensions.heightIn}"
											</Text>
										</div>
									</div>
								</div>

								{/* Warning about label purchase */}
								<Alert
									title={
										'Clicking "Purchase & Print" will charge Barely\'s ShipStation account and create a shipping label. The label will open in a new window for printing.'
									}
									variant='info'
								/>
							</div>
						</ModalBody>

						<ModalFooter>
							<SubmitButton loading={isPending} fullWidth>
								<Icon.print className='mr-2 h-4 w-4' />
								Purchase & Print Label
							</SubmitButton>
						</ModalFooter>
					</Form>

			}
		</Modal>
	);
}

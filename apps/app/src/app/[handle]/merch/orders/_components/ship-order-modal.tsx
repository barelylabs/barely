'use client';

import type { z } from 'zod/v4';
import { useCallback, useMemo, useState } from 'react';
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

export function ShipOrderModal() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const { workspace } = useWorkspace();

	const {
		lastSelectedItem: selectedCartOrder,
		filters: { showShipOrderModal },
		setShowShipOrderModal,
	} = useCartOrder();

	const [labelUrl, setLabelUrl] = useState<string | null>(null);
	const [trackingNumber, setTrackingNumber] = useState<string | null>(null);

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
			onSuccess: data => {
				setLabelUrl(data.labelDownloadUrl);
				setTrackingNumber(data.trackingNumber);
				// Auto-open label in new window for printing
				window.open(data.labelDownloadUrl, '_blank');
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
		form.reset();

		await queryClient.invalidateQueries({
			queryKey: trpc.cartOrder.byWorkspace.queryKey(),
		});

		void setShowShipOrderModal(false);
		focusGridList('cart-orders');
	}, [setShowShipOrderModal, form, queryClient, trpc]);

	const showModal = showShipOrderModal && !!selectedCartOrder;

	if (!selectedCartOrder) return null;

	// Determine carrier based on workspace country
	const workspaceCountry = workspace.shippingAddressCountry?.toUpperCase();
	const isUK = workspaceCountry === 'GB' || workspaceCountry === 'UK';
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
				labelUrl ?
					// Success state - label created
					<ModalBody>
						<Alert
							title='Shipping label created!'
							description='The label has been opened in a new window for printing.'
							variant='success'
						/>

						<div className='flex flex-col gap-2 rounded-md border p-4'>
							<Text variant='sm/medium'>Tracking Number:</Text>
							<Text variant='md/normal' className='font-mono'>
								{trackingNumber}
							</Text>
						</div>

						<div className='flex flex-col gap-3'>
							<Text variant='sm/normal' className='text-muted-foreground'>
								A shipping confirmation email has been sent to the customer.
							</Text>

							<Button
								look='secondary'
								size='sm'
								onClick={() => window.open(labelUrl, '_blank')}
								startIcon='externalLink'
							>
								Reopen Label for Printing
							</Button>
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

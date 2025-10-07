'use client';

import type { z } from 'zod/v4';
import { useCallback, useEffect, useMemo } from 'react';
import { SHIPPING_CARRIERS } from '@barely/const';
import { focusGridList, useWorkspace, useZodForm } from '@barely/hooks';
import { getAvailableCarriers } from '@barely/utils';
import { markCartOrderAsFulfilledSchema } from '@barely/validators';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useFieldArray } from 'react-hook-form';

import { useTRPC } from '@barely/api/app/trpc.react';

import { CheckboxField } from '@barely/ui/forms/checkbox-field';
import { Form, SubmitButton } from '@barely/ui/forms/form';
import { SelectField } from '@barely/ui/forms/select-field';
import { TextField } from '@barely/ui/forms/text-field';
import { Icon } from '@barely/ui/icon';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@barely/ui/modal';
import { Text } from '@barely/ui/typography';

import { useCartOrder } from '~/app/[handle]/merch/orders/_components/cart-order-context';

const shippingCarrierOptions = SHIPPING_CARRIERS.map(carrier => ({
	label: (
		<div className='flex flex-row items-center gap-2'>
			{(() => {
				const CarrierIcon = Icon[carrier];
				return (
					<div className='flex flex-row items-center gap-2'>
						<CarrierIcon className='h-5 w-5' />
						<Text>{carrier}</Text>
					</div>
				);
			})()}
		</div>
	),
	value: carrier,
}));

export function MarkCartOrderFulfilledModal() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const { handle, workspace } = useWorkspace();

	/* cart order hooks */
	const {
		lastSelectedItem: selectedCartOrder,
		filters: { showMarkAsFulfilledModal },
		setShowMarkAsFulfilledModal,
	} = useCartOrder();

	/* filter carriers based on workspace shipping country */
	const availableCarriers = useMemo(
		() => getAvailableCarriers(workspace.shippingAddressCountry),
		[workspace.shippingAddressCountry],
	);

	const filteredCarrierOptions = useMemo(
		() =>
			shippingCarrierOptions.filter(option => availableCarriers.includes(option.value)),
		[availableCarriers],
	);

	const defaultCarrier = useMemo(() => {
		const country = workspace.shippingAddressCountry?.toUpperCase();
		if (country === 'GB' || country === 'UK') {
			return 'evri';
		}
		return 'usps';
	}, [workspace.shippingAddressCountry]);

	/* mutations */
	const { mutateAsync: markAsFulfilled } = useMutation(
		trpc.cartOrder.markAsFulfilled.mutationOptions({
			onSuccess: async () => {
				await handleCloseModal();
			},
		}),
	);

	const unfulfilledProducts = useMemo(
		() => selectedCartOrder?.products.filter(product => !product.fulfilled) ?? [],
		[selectedCartOrder],
	);

	/* form */
	const form = useZodForm({
		schema: markCartOrderAsFulfilledSchema,
		values: {
			cartId: selectedCartOrder?.id ?? '',
			products: unfulfilledProducts.map(product => ({
				id: product.id,
				fulfilled: true,
				apparelSize: product.apparelSize ?? undefined,
			})),
			shippingCarrier: defaultCarrier,
			shippingTrackingNumber: '',
		},
		resetOptions: {
			keepDirtyValues: true,
		},
	});

	const productsFieldArray = useFieldArray({
		control: form.control,
		name: 'products',
	});

	const { remove: removeProducts, replace: replaceProducts } = productsFieldArray;

	const handleSubmit = async (data: z.infer<typeof markCartOrderAsFulfilledSchema>) => {
		console.log('marking as fulfilled ', data.products);
		await markAsFulfilled({
			...data,
			handle,
		});
	};

	/* modal */
	const showModal = showMarkAsFulfilledModal && !!selectedCartOrder;

	const handleCloseModal = useCallback(async () => {
		focusGridList('cart-orders');
		await setShowMarkAsFulfilledModal(false);
		removeProducts();
		form.reset();

		await queryClient.invalidateQueries({
			queryKey: trpc.cartOrder.byWorkspace.queryKey(),
		});
	}, [queryClient, trpc, setShowMarkAsFulfilledModal, form, removeProducts]);

	useEffect(() => {
		// fixme- i don't like updating the products like this, but it seems to work for now
		replaceProducts(
			unfulfilledProducts.map(product => ({
				id: product.id,
				fulfilled: true,
				apparelSize: product.apparelSize ?? undefined,
			})),
		);
	}, [unfulfilledProducts, replaceProducts]);

	return (
		<Modal
			showModal={showModal}
			setShowModal={setShowMarkAsFulfilledModal}
			preventDefaultClose={form.formState.isDirty}
			onClose={handleCloseModal}
		>
			<ModalHeader
				icon='cart'
				title={`Mark Order #${selectedCartOrder?.orderId} as Fulfilled`}
			/>
			<Form form={form} onSubmit={handleSubmit}>
				<ModalBody>
					<SelectField
						control={form.control}
						name='shippingCarrier'
						label='Shipping Carrier'
						placeholder='Select shipping carrier'
						options={filteredCarrierOptions}
					/>

					<TextField
						control={form.control}
						name='shippingTrackingNumber'
						label='Tracking Number'
						placeholder='Enter tracking number'
						onPaste={e => {
							e.preventDefault();
							return form.setValue(
								'shippingTrackingNumber',
								e.clipboardData.getData('text/plain').replace(/\s/g, ''),
								{ shouldValidate: true },
							);
						}}
					/>
					{productsFieldArray.fields.map((p, index) => {
						const product = unfulfilledProducts[index];

						if (!product) return null;

						return (
							<div key={index} className='flex flex-col gap-2'>
								<CheckboxField
									control={form.control}
									name={`products.${index}.fulfilled`}
									label={`${product.name} ${product.apparelSize ? `(size: ${product.apparelSize})` : ''}`}
								/>
							</div>
						);
					})}
				</ModalBody>

				<ModalFooter>
					<SubmitButton fullWidth>Mark as Fulfilled</SubmitButton>
				</ModalFooter>
			</Form>
		</Modal>
	);
}

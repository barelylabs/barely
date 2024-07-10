'use client';

import type { z } from 'zod';
import { useCallback, useEffect, useMemo } from 'react';
import { useZodForm } from '@barely/lib/hooks/use-zod-form';
import { api } from '@barely/lib/server/api/react';
import { markCartOrderAsFulfilledSchema } from '@barely/lib/server/routes/cart-order/cart-order.schema';
import { SHIPPING_CARRIERS } from '@barely/lib/server/shipping/shipping.constants';
import { useFieldArray } from 'react-hook-form';

import { Modal, ModalBody, ModalFooter, ModalHeader } from '@barely/ui/elements/modal';
import { Form, SubmitButton } from '@barely/ui/forms';
import { CheckboxField } from '@barely/ui/forms/checkbox-field';
import { SelectField } from '@barely/ui/forms/select-field';
import { TextField } from '@barely/ui/forms/text-field';

import { useCartOrderContext } from '~/app/[handle]/orders/_components/cart-order-context';

export function MarkCartOrderFulfilledModal() {
	const apiUtils = api.useUtils();

	/* cart order context */
	const {
		lastSelectedCartOrder: selectedCartOrder,
		showMarkAsFulfilledModal,
		setShowMarkAsFulfilledModal: setShowModal,
		focusGridList,
	} = useCartOrderContext();

	/* mutations */
	const { mutateAsync: markAsFulfilled } = api.cartOrder.markAsFullfilled.useMutation({
		onSuccess: async () => {
			await handleCloseModal();
		},
	});

	const unfulfilledProducts = useMemo(
		() => selectedCartOrder?.products.filter(product => !product.fulfilled) ?? [],
		[selectedCartOrder],
	);

	/* form */

	const defaultValues = useMemo(() => {
		return {
			cartId: selectedCartOrder?.id ?? '',
			products: unfulfilledProducts.map(product => ({
				id: product.id,
				fulfilled: true,
			})),
			shippingCarrier: '',
			shippingTrackingNumber: '',
		};
	}, [selectedCartOrder, unfulfilledProducts]);

	const form = useZodForm({
		schema: markCartOrderAsFulfilledSchema,
		defaultValues,
		// resetOptions: {
		// 	keepValues: true,
		// },
	});

	const productsFieldArray = useFieldArray({
		control: form.control,
		name: 'products',
	});

	const { remove: removeProducts, replace: replaceProducts } = productsFieldArray;

	const handleSubmit = async (data: z.infer<typeof markCartOrderAsFulfilledSchema>) => {
		console.log('marking as fulfilled ', data);
		await markAsFulfilled(data);
	};

	/* modal */
	const showModal = showMarkAsFulfilledModal && !!selectedCartOrder;

	const handleCloseModal = useCallback(async () => {
		focusGridList();
		setShowModal(false);
		removeProducts();
		form.reset();

		await apiUtils.cartOrder.invalidate();
	}, [apiUtils, focusGridList, setShowModal, form, removeProducts]);

	useEffect(() => {
		// fixme- i don't like updating the products like this, but it seems to work for now
		replaceProducts(
			unfulfilledProducts.map(product => ({
				id: product.id,
				fulfilled: true,
			})),
		);
	}, [unfulfilledProducts, replaceProducts]);

	return (
		<Modal
			showModal={showModal}
			setShowModal={setShowModal}
			preventDefaultClose={form.formState.isDirty}
			// onOpen={handleOpenModal}
			// onOpen={() => {
			// 	console.log('onOpen fulfilment modal >> ', defaultValues);
			// 	form.reset();
			// }}
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
						options={SHIPPING_CARRIERS.map(carrier => ({
							label: carrier,
							value: carrier,
						}))}
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

						return (
							<div key={index} className='flex flex-col gap-2'>
								<CheckboxField
									control={form.control}
									name={`products.${index}.fulfilled`}
									label={product?.name ?? 'Product name should be here 🌀'}
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

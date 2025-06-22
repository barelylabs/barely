'use client';

import type { z } from 'zod/v4';
import { useCallback } from 'react';
import { useZodForm } from '@barely/lib/hooks/use-zod-form';
import { api } from '@barely/lib/server/api/react';
import { cancelCartOrderSchema } from '@barely/lib/server/routes/cart-order/cart-order.schema';
import { formatCentsToDollars } from '@barely/lib/utils/currency';

import { Modal, ModalBody, ModalFooter, ModalHeader } from '@barely/ui/elements/modal';
import { Form, SubmitButton } from '@barely/ui/forms';

import { useCartOrderContext } from '~/app/[handle]/orders/_components/cart-order-context';

export function CancelCartOrderModal() {
	const apiUtils = api.useUtils();

	// cart order context
	const {
		lastSelectedItem: selectedCartOrder,
		showCancelCartOrderModal,
		setShowCancelCartOrderModal,
		focusGridList,
	} = useCartOrderContext();

	// mutations
	const { mutateAsync: cancelCartOrder } = api.cartOrder.cancel.useMutation({
		onSuccess: async () => {
			await handleCloseModal();
		},
	});

	// form
	const form = useZodForm({
		schema: cancelCartOrderSchema,
		values: {
			cartId: selectedCartOrder?.id ?? '',
			reason: 'requested_by_customer',
		},
		resetOptions: {
			keepDirtyValues: true,
		},
	});

	const handleSubmit = async (data: z.infer<typeof cancelCartOrderSchema>) => {
		if (!selectedCartOrder) return;

		if (
			!window.confirm(
				`Are you sure you want to cancel order #${selectedCartOrder.orderId}? ${selectedCartOrder.fullName} will be refunded ${formatCentsToDollars(selectedCartOrder?.orderAmount)}`,
			)
		)
			return;

		console.log('cancelling order', data);
		await cancelCartOrder(data);
	};

	// modal
	const showModal = showCancelCartOrderModal && !!selectedCartOrder;

	const handleCloseModal = useCallback(async () => {
		focusGridList();
		setShowCancelCartOrderModal(false);
		form.reset();

		await apiUtils.cartOrder.invalidate();
	}, [focusGridList, setShowCancelCartOrderModal, form, apiUtils]);

	return (
		<Modal
			showModal={showModal}
			setShowModal={setShowCancelCartOrderModal}
			preventDefaultClose={form.formState.isDirty}
			onClose={handleCloseModal}
		>
			<ModalHeader icon='cart' title={`Cancel Order #${selectedCartOrder?.orderId}`} />
			<Form form={form} onSubmit={handleSubmit}>
				<ModalBody></ModalBody>

				<ModalFooter>
					<SubmitButton fullWidth>Cancel Order</SubmitButton>
				</ModalFooter>
			</Form>
		</Modal>
	);
}

'use client';

import type { z } from 'zod/v4';
import { useCallback } from 'react';
import { focusGridList, useWorkspace, useZodForm } from '@barely/hooks';
import { formatMinorToMajorCurrency } from '@barely/utils';
import { cancelCartOrderSchema } from '@barely/validators';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Form, SubmitButton } from '@barely/ui/forms/form';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@barely/ui/modal';

import { useCartOrder } from '~/app/[handle]/merch/orders/_components/cart-order-context';

export function CancelCartOrderModal() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const { handle, workspace } = useWorkspace();

	// cart order hooks
	const {
		lastSelectedItem: selectedCartOrder,
		filters: { showCancelCartOrderModal },
		setShowCancelCartOrderModal,
	} = useCartOrder();

	// mutations
	const { mutateAsync: cancelCartOrder } = useMutation(
		trpc.cartOrder.cancel.mutationOptions({
			onSuccess: async () => {
				await handleCloseModal();
			},
		}),
	);

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
				`Are you sure you want to cancel order #${selectedCartOrder.orderId}? ${selectedCartOrder.fullName} will be refunded ${formatMinorToMajorCurrency(selectedCartOrder.orderAmount, workspace.currency)}`,
			)
		)
			return;

		console.log('cancelling order', data);
		await cancelCartOrder({
			...data,
			handle,
		});
	};

	// modal
	const showModal = showCancelCartOrderModal && !!selectedCartOrder;

	const handleCloseModal = useCallback(async () => {
		focusGridList('cart-orders');
		await setShowCancelCartOrderModal(false);
		form.reset();

		await queryClient.invalidateQueries({
			queryKey: trpc.cartOrder.byWorkspace.queryKey(),
		});
	}, [setShowCancelCartOrderModal, form, queryClient, trpc]);

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

'use client';

import type { z } from 'zod/v4';
import { useCallback } from 'react';
import { useWorkspace, useZodForm } from '@barely/hooks';
import { useTRPC } from '@barely/api/app/trpc.react';
import { formatCentsToDollars } from '@barely/utils';
import { cancelCartOrderSchema } from '@barely/validators';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Form, SubmitButton } from '@barely/ui/forms/form';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@barely/ui/modal';

import { useCartOrderContext } from '~/app/[handle]/orders/_components/cart-order-context';

export function CancelCartOrderModal() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const { handle } = useWorkspace();

	// cart order context
	const {
		lastSelectedItem: selectedCartOrder,
		showCancelCartOrderModal,
		setShowCancelCartOrderModal,
		focusGridList,
	} = useCartOrderContext();

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
				`Are you sure you want to cancel order #${selectedCartOrder.orderId}? ${selectedCartOrder.fullName} will be refunded ${formatCentsToDollars(selectedCartOrder.orderAmount)}`,
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
		focusGridList();
		setShowCancelCartOrderModal(false);
		form.reset();

		await queryClient.invalidateQueries({
			queryKey: trpc.cartOrder.byWorkspace.queryKey(),
		});
	}, [focusGridList, setShowCancelCartOrderModal, form, queryClient, trpc]);

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

'use client';

import type { Control, UseFormWatch } from 'react-hook-form';
import type { z } from 'zod/v4';
import { useCallback } from 'react';
import { FAN_GROUP_CONDITIONS } from '@barely/const';
import { useCreateOrUpdateForm, useWorkspace } from '@barely/hooks';
import { useTRPC } from '@barely/api/app/trpc.react';
import { upsertFanGroupSchema } from '@barely/validators';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useFieldArray } from 'react-hook-form';

import { Button } from '@barely/ui/button';
import { CurrencyField } from '@barely/ui/forms/currency-field';
import { Form, SubmitButton } from '@barely/ui/forms/form';
import { SelectField } from '@barely/ui/forms/select-field';
import { TextField } from '@barely/ui/forms/text-field';
import { Icon } from '@barely/ui/icon';
import { Label } from '@barely/ui/label';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@barely/ui/modal';

import { useFanGroupContext } from '~/app/[handle]/fan-groups/_components/fan-group-context';

const conditionTypeOptions = FAN_GROUP_CONDITIONS.map(c => ({
	label: (() => {
		switch (c) {
			case 'hasOrderedCart':
				return '🛒 Ordered cart';
			case 'hasOrderedProduct':
				return '📦 Ordered product';
			case 'hasOrderedAmount':
				return '💰 Total order amount';
			default:
				return c;
		}
	})(),
	value: c,
}));

export function CreateOrUpdateFanGroupModal({ mode }: { mode: 'create' | 'update' }) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const { handle } = useWorkspace();

	/* fan group context */
	const {
		lastSelectedItemId,
		showCreateModal,
		showUpdateModal,
		setShowCreateModal,
		setShowUpdateModal,
		focusGridList,
	} = useFanGroupContext();

	const { data: selectedFanGroup } = useSuspenseQuery(
		trpc.fanGroup.byId.queryOptions(
			{ id: lastSelectedItemId ?? '', handle },
			{
				select: data => (mode === 'update' && lastSelectedItemId ? data : undefined),
			},
		),
	);

	/* mutations */
	const { mutateAsync: createFanGroup } = useMutation({
		...trpc.fanGroup.create.mutationOptions(),
		onSuccess: async () => {
			await handleCloseModal();
		},
	});

	const { mutateAsync: updateFanGroup } = useMutation({
		...trpc.fanGroup.update.mutationOptions(),
		onSuccess: async () => {
			await handleCloseModal();
		},
	});

	/* form */
	const { form, onSubmit } = useCreateOrUpdateForm({
		updateItem: mode === 'create' ? null : (selectedFanGroup ?? null),
		upsertSchema: upsertFanGroupSchema,
		defaultValues: {
			name: mode === 'update' ? (selectedFanGroup?.name ?? '') : '',
			description: mode === 'update' ? (selectedFanGroup?.description ?? '') : '',
			conditions: mode === 'update' ? (selectedFanGroup?.conditions ?? []) : [],
		},
		handleCreateItem: async d => {
			await createFanGroup({
				...d,
				handle,
			});
		},
		handleUpdateItem: async d => {
			await updateFanGroup({
				...d,
				handle,
			});
		},
	});

	const { control } = form;
	// conditions array
	const {
		fields: conditionFields,
		append: appendCondition,
		remove: removeCondition,
	} = useFieldArray({
		control,
		name: 'conditions',
	});

	/* modal */
	const showModal = mode === 'create' ? showCreateModal : showUpdateModal;
	const setShowModal = mode === 'create' ? setShowCreateModal : setShowUpdateModal;

	const handleCloseModal = useCallback(async () => {
		focusGridList();
		await queryClient.invalidateQueries({
			queryKey: trpc.fanGroup.byWorkspace.queryKey(),
		});
		form.reset();
		setShowModal(false);
	}, [form, focusGridList, queryClient, trpc, setShowModal]);

	/* form submit */
	const handleSubmit = useCallback(
		async (data: z.infer<typeof upsertFanGroupSchema>) => {
			console.log('data', data);
			await onSubmit({ ...data, conditions: data.conditions ?? [] });
		},
		[onSubmit],
	);

	const submitDisabled = mode === 'update' && !form.formState.isDirty;

	return (
		<Modal
			showModal={showModal}
			setShowModal={setShowModal}
			preventDefaultClose={form.formState.isDirty}
			onClose={handleCloseModal}
			className='max-w-2xl'
		>
			<ModalHeader
				icon='fanGroup'
				title={
					mode === 'update' ?
						`Update ${selectedFanGroup?.name ?? ''}`
					:	'Create Fan Group'
				}
			>
				<pre>{JSON.stringify(selectedFanGroup?.count, null, 2)}</pre>
				{/* <pre>{JSON.stringify(selectedFanGroup?.matchingFans, null, 2)}</pre> */}
			</ModalHeader>

			<Form form={form} onSubmit={handleSubmit}>
				<ModalBody>
					<TextField label='Name' control={form.control} name='name' />
					<TextField label='Description' control={form.control} name='description' />

					<div className='flex flex-col items-start gap-4'>
						<div className='flex w-full flex-col items-start gap-2 rounded-md border border-b bg-background p-4'>
							<div className='flex flex-row items-center gap-2'>
								<Icon.includeFan className='h-4 w-4' />
								<Label>Include fans who:</Label>
							</div>
							{/* INCLUDE CONDITION FIELDS */}
							{conditionFields.map((field, index) => {
								if (field.exclude) return null;

								return (
									<ConditionField
										key={field.id + index}
										index={index}
										control={form.control}
										watch={form.watch}
										remove={removeCondition}
									/>
								);
							})}
							<Button
								variant='icon'
								startIcon='add'
								look='ghost'
								size='sm'
								onClick={() =>
									appendCondition({
										type: 'hasOrderedCart',
										exclude: false,
										cartFunnelId: '',
									})
								}
							/>
						</div>

						{/* EXCLUDE CONDITION FIELDS */}
						<div className='flex w-full flex-col items-start gap-2 rounded-md border border-b bg-background p-4'>
							<div className='flex flex-row items-center gap-2'>
								<Icon.excludeFan className='h-4 w-4' />
								<Label>Exclude fans who:</Label>
							</div>
							{conditionFields.map((c, index) => {
								if (!c.exclude) return null;

								return (
									<ConditionField
										key={c.id}
										index={index}
										watch={form.watch}
										control={form.control}
										remove={removeCondition}
									/>
								);
							})}
							<Button
								variant='icon'
								startIcon='add'
								look='ghost'
								size='sm'
								onClick={() =>
									appendCondition({
										type: 'hasOrderedCart',
										exclude: true,
										cartFunnelId: 'any',
										productId: 'any',
										totalOrderAmount: 0,
									})
								}
							/>
						</div>
					</div>
				</ModalBody>

				<ModalFooter>
					<SubmitButton disabled={submitDisabled} fullWidth>
						{mode === 'update' ? 'Update' : 'Create'}
					</SubmitButton>
				</ModalFooter>
			</Form>
		</Modal>
	);
}

function ConditionField({
	key,
	index,
	control,
	watch,
	remove,
}: {
	key: string;
	index: number;
	control: Control<z.infer<typeof upsertFanGroupSchema>>;
	watch: UseFormWatch<z.infer<typeof upsertFanGroupSchema>>;
	remove: (index: number) => void;
}) {
	const trpc = useTRPC();
	const { handle } = useWorkspace();
	const { data: cartFunnelOptions } = useSuspenseQuery(
		trpc.cartFunnel.byWorkspace.queryOptions(
			{ handle },
			{
				select: data =>
					data.cartFunnels.map(c => ({
						label: '🛒 ' + c.name,
						value: c.id,
					})),
			},
		),
	);

	const { data: productOptions } = useSuspenseQuery(
		trpc.product.byWorkspace.queryOptions(
			{ handle },
			{
				select: data =>
					data.products.map(p => ({
						label: '📦 ' + p.name,
						value: p.id,
					})),
			},
		),
	);

	const selectedCartFunnels = watch('conditions')
		?.filter(c => c.type === 'hasOrderedCart')
		.map(c => c.cartFunnelId);
	const notSelectedCartFunnelOptions = cartFunnelOptions.filter(
		c => !selectedCartFunnels?.includes(c.value),
	);
	const thisSelectedCartFunnelOption = cartFunnelOptions.find(
		c => c.value === watch(`conditions.${index}.cartFunnelId`),
	);
	const availableCartFunnelOptions = [
		{ label: '🛒 Any', value: 'any' },
		...notSelectedCartFunnelOptions,
		...(thisSelectedCartFunnelOption ? [thisSelectedCartFunnelOption] : []),
	];

	const selectedProducts = watch('conditions')
		?.filter(c => c.type === 'hasOrderedProduct')
		.map(c => c.productId);
	const notSelectedProductOptions = productOptions.filter(
		p => !selectedProducts?.includes(p.value),
	);
	const thisSelectedProductOption = productOptions.find(
		p => p.value === watch(`conditions.${index}.productId`),
	);
	const availableProductOptions = [
		{ label: '📦 Any', value: 'any' },
		...notSelectedProductOptions,
		...(thisSelectedProductOption ? [thisSelectedProductOption] : []),
	];

	return (
		<div
			key={key}
			className='flex w-full flex-row items-center justify-between gap-2 rounded-md border border-border bg-muted p-3'
		>
			<div className='flex flex-row items-center gap-2'>
				<SelectField
					control={control}
					name={`conditions.${index}.type`}
					// @ts-expect-error the SelectField options type currently is only inferred for non-nested properties
					options={conditionTypeOptions}
				/>
				{watch(`conditions.${index}.type`) === 'hasOrderedCart' ?
					<SelectField
						control={control}
						name={`conditions.${index}.cartFunnelId`}
						// @ts-expect-error the SelectField options type currently is only inferred for non-nested properties
						options={availableCartFunnelOptions}
					/>
				: watch(`conditions.${index}.type`) === 'hasOrderedProduct' ?
					<SelectField
						control={control}
						name={`conditions.${index}.productId`}
						// label='Product'
						// @ts-expect-error the SelectField options type currently is only inferred for non-nested properties
						options={availableProductOptions}
					/>
				: watch(`conditions.${index}.type`) === 'hasOrderedAmount' ?
					<CurrencyField
						control={control}
						name={`conditions.${index}.totalOrderAmount`}
						// label='Total Order Amount'
						outputUnits='cents'
					/>
				:	null}
			</div>
			<Button
				variant='icon'
				startIcon='x'
				look='ghost'
				size='sm'
				onClick={() => remove(index)}
			/>
		</div>
	);
}

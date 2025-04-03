'use client';

import type { z } from 'zod';
import { useCallback } from 'react';
import { useCreateOrUpdateForm } from '@barely/lib/hooks/use-create-or-update-form';
import { useWorkspace } from '@barely/lib/hooks/use-workspace';
import { api } from '@barely/lib/server/api/react';
import {
	defaultWorkflow,
	upsertWorkflowSchema,
} from '@barely/lib/server/routes/workflow/workflow.schema';
import { useFieldArray } from 'react-hook-form';

import { Icon } from '@barely/ui/elements/icon';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@barely/ui/elements/modal';
import { Separator } from '@barely/ui/elements/separator';
import { H, Text } from '@barely/ui/elements/typography';
import { Form, SubmitButton } from '@barely/ui/forms';
import { SelectField } from '@barely/ui/forms/select-field';
import { TextField } from '@barely/ui/forms/text-field';

import { useWorkflowContext } from '~/app/[handle]/workflows/_components/workflow-context';

export function CreateOrUpdateWorkflowModal({ mode }: { mode: 'create' | 'update' }) {
	const apiUtils = api.useUtils();
	const { workspace } = useWorkspace();

	/* workflow context */
	const {
		lastSelectedWorkflow: selectedWorkflow,
		showCreateWorkflowModal,
		setShowCreateWorkflowModal,
		showUpdateWorkflowModal,
		setShowUpdateWorkflowModal,
		focusGridList,
	} = useWorkflowContext();

	/* cart funnels */
	const { data: cartFunnelsInfinite } = api.cartFunnel.byWorkspace.useInfiniteQuery(
		{
			handle: workspace.handle,
		},
		{
			getNextPageParam: lastPage => lastPage.nextCursor,
		},
	);

	const cartFunnels = cartFunnelsInfinite?.pages.flatMap(page => page.cartFunnels) ?? [];

	const cartFunnelOptions =
		cartFunnels.map(cartFunnel => ({
			label: cartFunnel.name,
			value: cartFunnel.id,
		})) ?? [];

	/* mutations */
	const { mutateAsync: createWorkflow } = api.workflow.create.useMutation({
		onSuccess: async () => {
			await handleCloseModal();
		},
	});

	const { mutateAsync: updateWorkflow } = api.workflow.update.useMutation({
		onSuccess: async () => {
			await handleCloseModal();
		},
	});

	/* form */
	const { form, onSubmit: onSubmitWorkflow } = useCreateOrUpdateForm({
		updateItem: mode === 'create' ? null : (selectedWorkflow ?? null),
		upsertSchema: upsertWorkflowSchema,
		defaultValues: defaultWorkflow,
		handleCreateItem: async d => {
			await createWorkflow(d);
		},
		handleUpdateItem: async d => {
			await updateWorkflow(d);
		},
	});

	const { control } = form;

	const handleSubmit = useCallback(
		async (data: z.infer<typeof upsertWorkflowSchema>) => {
			await onSubmitWorkflow(data);
		},
		[onSubmitWorkflow],
	);

	const triggersFieldArray = useFieldArray({
		control,
		name: 'triggers',
	});

	const actionsFieldArray = useFieldArray({
		control,
		name: 'actions',
	});

	/* modal */
	const showModal = mode === 'create' ? showCreateWorkflowModal : showUpdateWorkflowModal;
	const setShowModal =
		mode === 'create' ? setShowCreateWorkflowModal : setShowUpdateWorkflowModal;

	const handleCloseModal = useCallback(async () => {
		focusGridList();
		setShowModal(false);

		await apiUtils.workflow.invalidate();
	}, [apiUtils.workflow, setShowModal, focusGridList]);

	return (
		<Modal
			showModal={showModal}
			setShowModal={setShowModal}
			className='w-full'
			preventDefaultClose={form.formState.isDirty}
			onAutoFocus={() => form.setFocus('name')}
			onClose={handleCloseModal}
		>
			<ModalHeader
				icon='workflow'
				title={
					mode === 'create' ? 'Create Workflow' : (
						`Update ${selectedWorkflow?.name ?? 'Workflow'}`
					)
				}
			/>
			<Form form={form} onSubmit={handleSubmit}>
				<ModalBody>
					<TextField
						name='name'
						label='Name'
						placeholder='Enter workflow name'
						control={form.control}
						data-1p-ignore
						data-bwignore
						data-lpignore='true'
					/>
					<TextField
						name='description'
						label='Description'
						placeholder='Enter workflow description'
						control={form.control}
					/>

					{/* TRIGGERS */}
					<div className='flex flex-col gap-2 rounded-md border border-border bg-background p-4'>
						<div className='flex flex-row items-center gap-1'>
							<Icon.zap className='h-4 w-4' />
							<H size='5'>Triggers</H>
						</div>

						<Text variant='sm/normal'>When something happens</Text>
						<Separator />
						{triggersFieldArray.fields.map((trigger, index) => (
							<div key={trigger.id} className='flex flex-col gap-2'>
								<SelectField
									label='Trigger'
									name={`triggers.${index}.trigger`}
									options={[
										{ label: 'New Fan', value: 'NEW_FAN' },
										{ label: 'New Order', value: 'NEW_CART_ORDER' },
									]}
								/>
								{form.watch(`triggers.${index}.trigger`) === 'NEW_CART_ORDER' && (
									<SelectField
										label='Cart'
										name={`triggers.${index}.cartFunnelId`}
										options={cartFunnelOptions}
									/>
								)}
							</div>
						))}
					</div>
					<Icon.arrowDown className='mx-auto' />

					{/* ACTIONS */}
					{actionsFieldArray.fields.map((action, index) => (
						<div
							key={action.id}
							className='flex flex-col gap-2 rounded-md border border-border bg-background p-4'
						>
							<div className='flex flex-row items-center gap-1'>
								<Icon.zap className='h-4 w-4' />
								<H size='5'>Action</H>
							</div>

							<Text variant='sm/normal'>An action is performed</Text>
							<Separator />
							<SelectField
								label='Do this'
								name={`actions.${index}.action`}
								options={[
									{
										label: 'Add to Mailchimp Audience',
										value: 'ADD_TO_MAILCHIMP_AUDIENCE',
									},
								]}
							/>
							{form.watch(`actions.${index}.action`) === 'ADD_TO_MAILCHIMP_AUDIENCE' && (
								<SelectMailchimpAudience index={index} />
							)}
						</div>
					))}
					<pre>{JSON.stringify(form.watch(), null, 2)}</pre>
				</ModalBody>
				<ModalFooter>
					<SubmitButton fullWidth>
						{mode === 'create' ? 'Create Workflow' : 'Update Workflow'}
					</SubmitButton>
				</ModalFooter>
			</Form>
		</Modal>
	);
}

function SelectMailchimpAudience({ index }: { index: number }) {
	const { workspace } = useWorkspace();
	const { data: mailchimpAudiences } = api.mailchimp.audiencesByWorkspace.useQuery({
		handle: workspace.handle,
	});

	const mailchimpAudienceOptions =
		mailchimpAudiences?.map(audience => ({
			label: audience.name,
			value: audience.id,
		})) ?? [];
	return (
		<SelectField
			label='Mailchimp Audience'
			name={`actions.${index}.mailchimpAudienceId`}
			options={mailchimpAudienceOptions}
		/>
	);
}

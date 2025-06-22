'use client';

import type { z } from 'zod/v4';
import { useCallback } from 'react';
import { useCreateOrUpdateForm } from '@barely/lib/hooks/use-create-or-update-form';
import { useWorkspace } from '@barely/lib/hooks/use-workspace';
import { api } from '@barely/lib/server/api/react';
import { upsertEmailBroadcastSchema } from '@barely/lib/server/routes/email-broadcast/email-broadcast-schema';

import { Button } from '@barely/ui/elements/button';
import { Icon } from '@barely/ui/elements/icon';
import { Label } from '@barely/ui/elements/label';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@barely/ui/elements/modal';
import { Switch } from '@barely/ui/elements/switch';
import { Text } from '@barely/ui/elements/typography';
import { Form } from '@barely/ui/forms';
import { DatetimeField } from '@barely/ui/forms/datetime-field-new';
import { SelectField } from '@barely/ui/forms/select-field';

import { useEmailBroadcastsContext } from './email-broadcasts-context';

export function CreateOrUpdateEmailBroadcastModal({
	mode,
}: {
	mode: 'create' | 'update';
}) {
	const apiUtils = api.useUtils();

	const {
		lastSelectedItem,
		showCreateModal,
		showUpdateModal,
		setShowCreateModal,
		setShowUpdateModal,
		focusGridList,
	} = useEmailBroadcastsContext();

	const { handle } = useWorkspace();

	const { data: emailTemplates } = api.emailTemplate.byWorkspace.useQuery(
		{ handle },
		{
			select: data => data.emailTemplates,
		},
	);

	const emailTemplateOptions =
		emailTemplates?.map(emailTemplate => ({
			label: emailTemplate.name,
			value: emailTemplate.id,
		})) ?? [];

	const { data: fanGroups } = api.fanGroup.byWorkspace.useQuery(
		{ handle },
		{
			select: data => data.fanGroups,
		},
	);

	const allFanGroupOption = {
		label: 'All Fans',
		value: 'all',
	};

	const fanGroupOptions = [
		allFanGroupOption,
		...(fanGroups?.map(fanGroup => ({
			label: fanGroup.name,
			value: fanGroup.id,
		})) ?? [allFanGroupOption]),
	];

	const { mutateAsync: createEmailBroadcast } = api.emailBroadcast.create.useMutation({
		onSuccess: async () => {
			await handleCloseModal();
		},
	});

	const { mutateAsync: updateEmailBroadcast } = api.emailBroadcast.update.useMutation({
		onSuccess: async () => {
			await handleCloseModal();
		},
	});

	const { form, onSubmit } = useCreateOrUpdateForm({
		updateItem: mode === 'create' ? null : (lastSelectedItem ?? null),
		upsertSchema: upsertEmailBroadcastSchema,
		defaultValues: {
			emailTemplateId: mode === 'update' ? (lastSelectedItem?.emailTemplateId ?? '') : '',
			fanGroupId: null,
			status: 'draft',
			scheduledAt: null,
			// scheduledAt: mode === 'update' ? selectedEmailBroadcast?.scheduledAt ?? null : null,
		},
		handleCreateItem: async d => {
			await createEmailBroadcast(d);
		},
		handleUpdateItem: async d => {
			await updateEmailBroadcast(d);
		},
	});

	const { handleSubmit } = form;

	/* we have 2 types of submit, which are triggered by which button is clicked
    1. save draft (status set to draft)
    2. schedule or send (status set to scheduled)
    */

	const handleSaveDraft = (data: z.infer<typeof upsertEmailBroadcastSchema>) => {
		const d = {
			...data,
			fanGroupId: data.fanGroupId === 'all' ? null : data.fanGroupId,
			status: 'draft' as const,
		};
		// return console.log('handleSaveDraft', d);
		return onSubmit(d);
	};

	const handleSchedule = (data: z.infer<typeof upsertEmailBroadcastSchema>) => {
		const d = {
			...data,
			fanGroupId: data.fanGroupId === 'all' ? null : data.fanGroupId,
			status: 'scheduled' as const,
		};

		// Show confirmation dialog before sending
		if (
			!window.confirm(
				data.scheduledAt ?
					`Schedule this email broadcast for ${new Date(data.scheduledAt).toLocaleString()}?`
				:	'Send this email broadcast now?',
			)
		) {
			return;
		}

		// console.log('scheduling');
		return onSubmit(d);
	};

	const showEmailBroadcastModal = mode === 'create' ? showCreateModal : showUpdateModal;
	const setShowEmailBroadcastModal =
		mode === 'create' ? setShowCreateModal : setShowUpdateModal;

	const handleCloseModal = useCallback(async () => {
		focusGridList();
		await apiUtils.emailBroadcast.invalidate();
		form.reset();
		setShowEmailBroadcastModal(false);
	}, [form, focusGridList, apiUtils.emailBroadcast, setShowEmailBroadcastModal]);

	const canEdit =
		mode === 'create' || (mode === 'update' && form.watch('status') !== 'sent');

	const submitDisabled = !canEdit || (mode === 'update' && !form.formState.isDirty);

	return (
		<Modal
			showModal={showEmailBroadcastModal}
			setShowModal={setShowEmailBroadcastModal}
			preventDefaultClose={canEdit && form.formState.isDirty}
			onClose={handleCloseModal}
		>
			<ModalHeader
				icon='email'
				title={
					mode === 'update' ?
						canEdit ?
							'Update Email Broadcast'
						:	'Email Broadcast Sent'
					:	'Create Email Broadcast'
				}
			/>

			<Form form={form} onSubmit={onSubmit}>
				<ModalBody>
					{/* <pre>{JSON.stringify(!canEdit, null, 2)}</pre> */}
					{!canEdit && (
						<div className='flex flex-col items-center justify-center gap-2'>
							<Text variant='md/semibold'>{lastSelectedItem?.emailTemplate.name}</Text>
							<div className='flex flex-row items-center justify-center gap-2'>
								<Icon.send className='h-4 w-4' />
								<span>Sent @{lastSelectedItem?.sentAt?.toLocaleString()}</span>
							</div>
						</div>
					)}

					{canEdit && (
						<>
							<SelectField
								label='To'
								name='fanGroupId'
								control={form.control}
								options={fanGroupOptions ?? []}
							/>

							<SelectField
								label='Email Template'
								name='emailTemplateId'
								control={form.control}
								options={emailTemplateOptions ?? []}
							/>

							<Label>Schedule</Label>
							<Switch
								checked={!!form.watch('scheduledAt')}
								onCheckedChange={c => {
									if (c) return form.setValue('scheduledAt', new Date());
									return form.setValue('scheduledAt', null);
								}}
							/>

							{form.watch('scheduledAt') && (
								<DatetimeField
									name='scheduledAt'
									granularity='minute'
									hourCycle={12}
									control={form.control}
								/>
							)}
						</>
					)}
				</ModalBody>

				{canEdit && (
					<ModalFooter>
						<div className='flex flex-row items-center justify-end gap-3'>
							<Button
								disabled={submitDisabled}
								look='secondary'
								onClick={handleSubmit(() => handleSaveDraft(form.getValues()))}
							>
								Save Draft
							</Button>

							<Button
								// disabled={submitDisabled && }
								onClick={handleSubmit(() => handleSchedule(form.getValues()))}
								endIcon={form.watch('scheduledAt') ? 'calendar' : 'send'}
							>
								{form.watch('scheduledAt') ? 'Schedule' : 'Send'}
							</Button>
						</div>
					</ModalFooter>
				)}
			</Form>
		</Modal>
	);
}

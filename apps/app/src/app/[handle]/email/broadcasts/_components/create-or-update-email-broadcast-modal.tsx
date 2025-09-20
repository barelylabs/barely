'use client';

import type { z } from 'zod/v4';
import { useCallback, useState } from 'react';
import { useCreateOrUpdateForm, useWorkspace, useZodForm } from '@barely/hooks';
import { getEmailAddressFromEmailAddress } from '@barely/utils';
import {
	createEmailBroadcastWithTemplateSchema,
	upsertEmailBroadcastSchema,
} from '@barely/validators';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Button } from '@barely/ui/button';
import { DatetimeField } from '@barely/ui/forms/datetime-field';
import { Form } from '@barely/ui/forms/form';
import { SelectField } from '@barely/ui/forms/select-field';
import { TextField } from '@barely/ui/forms/text-field';
import { Icon } from '@barely/ui/icon';
import { Label } from '@barely/ui/label';
import { MDXEditor } from '@barely/ui/mdx-editor';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@barely/ui/modal';
import { Switch } from '@barely/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@barely/ui/tabs';
import { Text } from '@barely/ui/typography';

import { SendTestEmail } from '~/app/[handle]/_components/send-test-email';
import {
	useEmailBroadcast,
	useEmailBroadcastSearchParams,
} from './email-broadcasts-context';

const EMAIL_TEMPLATE_VARIABLES = [
	{ name: 'firstName', description: 'First name of the fan' },
	{ name: 'lastName', description: 'Last name of the fan' },
	{ name: 'email', description: 'Email address of the fan' },
];

export function CreateOrUpdateEmailBroadcastModal({
	mode,
}: {
	mode: 'create' | 'update';
}) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const [activeTab, setActiveTab] = useState<'create-new' | 'use-template'>('create-new');

	const { showCreateModal, showUpdateModal, setShowCreateModal, setShowUpdateModal } =
		useEmailBroadcastSearchParams();

	const { lastSelectedItem, focusGridList } = useEmailBroadcast();

	const { handle } = useWorkspace();

	// Get email addresses for from field
	const { data: emailAddresses } = useSuspenseQuery(
		trpc.emailAddress.byWorkspace.queryOptions(
			{ handle },
			{
				select: data => data.emailAddresses,
			},
		),
	);

	const emailAddressOptions = emailAddresses.map(address => ({
		label: getEmailAddressFromEmailAddress(address),
		value: address.id,
	}));

	// Get email templates for "use template" tab
	const { data: emailTemplates } = useSuspenseQuery(
		trpc.emailTemplate.byWorkspace.queryOptions(
			{ handle },
			{
				select: data => data.emailTemplates,
			},
		),
	);

	const emailTemplateOptions = emailTemplates.map(emailTemplate => ({
		label: emailTemplate.name,
		value: emailTemplate.id,
	}));

	// Get fan groups for recipient selection
	const { data: fanGroups } = useSuspenseQuery(
		trpc.fanGroup.byWorkspace.queryOptions(
			{ handle },
			{
				select: data => data.fanGroups,
			},
		),
	);

	const allFanGroupOption = {
		label: 'All Fans',
		value: 'all',
	};

	const fanGroupOptions = [
		allFanGroupOption,
		...fanGroups.map(fanGroup => ({
			label: fanGroup.name,
			value: fanGroup.id,
		})),
	];

	// Mutations
	const { mutateAsync: createEmailBroadcast } = useMutation(
		trpc.emailBroadcast.create.mutationOptions({
			onSuccess: async () => {
				await handleCloseModal();
			},
		}),
	);

	const { mutateAsync: updateEmailBroadcast } = useMutation(
		trpc.emailBroadcast.update.mutationOptions({
			onSuccess: async () => {
				await handleCloseModal();
			},
		}),
	);

	const { mutateAsync: createEmailBroadcastWithTemplate } = useMutation(
		trpc.emailBroadcast.createWithTemplate.mutationOptions({
			onSuccess: async () => {
				await handleCloseModal();
			},
		}),
	);

	// Form for existing template selection (original functionality)
	const { form: existingTemplateForm, onSubmit: onSubmitExisting } =
		useCreateOrUpdateForm({
			updateItem: mode === 'create' ? null : (lastSelectedItem ?? null),
			upsertSchema: upsertEmailBroadcastSchema,
			defaultValues: {
				emailTemplateId:
					mode === 'update' ? (lastSelectedItem?.emailTemplateId ?? '') : '',
				fanGroupId: null,
				status: 'draft',
				scheduledAt: null,
			},
			handleCreateItem: async d => {
				await createEmailBroadcast({
					...d,
					handle,
				});
			},
			handleUpdateItem: async d => {
				await updateEmailBroadcast({
					...d,
					handle,
				});
			},
		});

	// Form for creating new template inline
	const createNewForm = useZodForm({
		schema: createEmailBroadcastWithTemplateSchema,
		defaultValues: {
			name: '',
			fromId: emailAddressOptions[0]?.value ?? '',
			subject: '',
			previewText: '',
			body: '',
			type: 'marketing',
			replyTo: '',
			fanGroupId: null,
			status: 'draft',
			scheduledAt: null,
			broadcastOnly: false,
		},
	});

	// Handlers for existing template form
	const handleSaveDraftExisting = (data: z.infer<typeof upsertEmailBroadcastSchema>) => {
		const d = {
			...data,
			fanGroupId: data.fanGroupId === 'all' ? null : data.fanGroupId,
			status: 'draft' as const,
		};

		return onSubmitExisting(d);
	};

	const handleScheduleExisting = (data: z.infer<typeof upsertEmailBroadcastSchema>) => {
		const d = {
			...data,
			fanGroupId: data.fanGroupId === 'all' ? null : data.fanGroupId,
			status: 'scheduled' as const,
		};

		if (
			!window.confirm(
				data.scheduledAt ?
					`Schedule this email broadcast for ${new Date(data.scheduledAt).toLocaleString()}?`
				:	'Send this email broadcast now?',
			)
		) {
			return;
		}

		return onSubmitExisting(d);
	};

	// Handlers for create new form
	const handleSaveDraftNew = async (
		data: z.infer<typeof createEmailBroadcastWithTemplateSchema>,
	) => {
		await createEmailBroadcastWithTemplate({
			...data,
			fanGroupId: data.fanGroupId === 'all' ? null : data.fanGroupId,
			status: 'draft',
			handle,
		});
	};

	const handleScheduleNew = async (
		data: z.infer<typeof createEmailBroadcastWithTemplateSchema>,
	) => {
		const confirmMessage =
			data.scheduledAt ?
				`Schedule this email broadcast for ${new Date(data.scheduledAt).toLocaleString()}?`
			:	'Send this email broadcast now?';

		if (!window.confirm(confirmMessage)) {
			return;
		}

		await createEmailBroadcastWithTemplate({
			...data,
			fanGroupId: data.fanGroupId === 'all' ? null : data.fanGroupId,
			status: 'scheduled',
			handle,
		});
	};

	const showEmailBroadcastModal = mode === 'create' ? showCreateModal : showUpdateModal;
	const setShowEmailBroadcastModal =
		mode === 'create' ? setShowCreateModal : setShowUpdateModal;

	const handleCloseModal = useCallback(async () => {
		focusGridList();
		await queryClient.invalidateQueries(
			trpc.emailBroadcast.byWorkspace.queryFilter({ handle }),
		);
		existingTemplateForm.reset();
		createNewForm.reset();
		setActiveTab('create-new');
		await setShowEmailBroadcastModal(false);
	}, [
		existingTemplateForm,
		createNewForm,
		focusGridList,
		queryClient,
		trpc.emailBroadcast.byWorkspace,
		handle,
		setShowEmailBroadcastModal,
	]);

	const canEditExisting =
		mode === 'create' || existingTemplateForm.watch('status') !== 'sent';
	const submitDisabledExisting =
		!canEditExisting || (mode === 'update' && !existingTemplateForm.formState.isDirty);

	// For update mode, we only show the existing template tab
	if (mode === 'update') {
		return (
			<Modal
				showModal={showEmailBroadcastModal}
				setShowModal={setShowEmailBroadcastModal}
				preventDefaultClose={canEditExisting && existingTemplateForm.formState.isDirty}
				onClose={handleCloseModal}
			>
				<ModalHeader
					icon='email'
					title={canEditExisting ? 'Update Email Broadcast' : 'Email Broadcast Sent'}
				/>

				<Form form={existingTemplateForm} onSubmit={onSubmitExisting}>
					<ModalBody>
						{!canEditExisting && (
							<div className='flex flex-col items-center justify-center gap-2'>
								<Text variant='md/semibold'>{lastSelectedItem?.emailTemplate.name}</Text>
								<div className='flex flex-row items-center justify-center gap-2'>
									<Icon.send className='h-4 w-4' />
									<span>Sent @{lastSelectedItem?.sentAt?.toLocaleString()}</span>
								</div>
							</div>
						)}

						{canEditExisting && (
							<>
								<div className='mb-4 flex flex-row justify-end'>
									<SendTestEmail
										values={{
											...existingTemplateForm.getValues(),
											fromId:
												lastSelectedItem?.emailTemplate.fromId ??
												emailAddressOptions[0]?.value ??
												'',
											subject: lastSelectedItem?.emailTemplate.subject ?? '',
											previewText: lastSelectedItem?.emailTemplate.previewText ?? '',
											body: lastSelectedItem?.emailTemplate.body ?? '',
											replyTo: lastSelectedItem?.emailTemplate.replyTo ?? '',
											sendTestEmailTo: '',
										}}
									/>
								</div>

								<SelectField
									label='Email Template'
									name='emailTemplateId'
									control={existingTemplateForm.control}
									options={emailTemplateOptions}
								/>

								<SelectField
									label='From'
									value={lastSelectedItem?.emailTemplate.fromId ?? ''}
									disabled
									name='fromId'
									// control={existingTemplateForm.control}
									options={emailAddressOptions}
								/>

								<SelectField
									label='To'
									name='fanGroupId'
									control={existingTemplateForm.control}
									options={fanGroupOptions}
								/>

								<Label>Schedule</Label>
								<Switch
									checked={!!existingTemplateForm.watch('scheduledAt')}
									onCheckedChange={c => {
										if (c)
											return existingTemplateForm.setValue('scheduledAt', new Date());
										return existingTemplateForm.setValue('scheduledAt', null);
									}}
								/>

								{existingTemplateForm.watch('scheduledAt') && (
									<DatetimeField
										name='scheduledAt'
										granularity='minute'
										hourCycle={12}
										control={existingTemplateForm.control}
									/>
								)}
							</>
						)}
					</ModalBody>

					{canEditExisting && (
						<ModalFooter>
							<div className='flex flex-row items-center justify-end gap-3'>
								<Button
									disabled={submitDisabledExisting}
									look='secondary'
									onClick={existingTemplateForm.handleSubmit(() =>
										handleSaveDraftExisting(existingTemplateForm.getValues()),
									)}
								>
									Save Draft
								</Button>

								<Button
									onClick={existingTemplateForm.handleSubmit(() =>
										handleScheduleExisting(existingTemplateForm.getValues()),
									)}
									endIcon={
										existingTemplateForm.watch('scheduledAt') ? 'calendar' : 'send'
									}
								>
									{existingTemplateForm.watch('scheduledAt') ? 'Schedule' : 'Send'}
								</Button>
							</div>
						</ModalFooter>
					)}
				</Form>
			</Modal>
		);
	}

	// For create mode, show tabs
	return (
		<Modal
			showModal={showEmailBroadcastModal}
			setShowModal={setShowEmailBroadcastModal}
			preventDefaultClose={
				(activeTab === 'use-template' && existingTemplateForm.formState.isDirty) ||
				(activeTab === 'create-new' && createNewForm.formState.isDirty)
			}
			onClose={handleCloseModal}
		>
			<ModalHeader icon='email' title='Create Email Broadcast' />

			<ModalBody>
				<Tabs value={activeTab} onValueChange={v => setActiveTab(v as typeof activeTab)}>
					<TabsList className='grid w-full grid-cols-2'>
						<TabsTrigger value='create-new'>Create New</TabsTrigger>
						<TabsTrigger value='use-template'>Use Template</TabsTrigger>
					</TabsList>

					<TabsContent value='create-new'>
						<Form form={createNewForm} onSubmit={handleScheduleNew} className='space-y-4'>
							<div className='my-4 flex flex-row justify-end'>
								<SendTestEmail
									values={{
										...createNewForm.getValues(),
										sendTestEmailTo: '',
									}}
								/>
							</div>

							<TextField
								label='Template Name'
								name='name'
								control={createNewForm.control}
								infoTooltip='The name of the email template. This is for your reference.'
							/>

							<div className='flex flex-row items-center gap-3'>
								<Label>Type</Label>
								<Switch
									size='sm'
									checked={createNewForm.watch('type') === 'marketing'}
									onCheckedChange={c => {
										if (c) return createNewForm.setValue('type', 'marketing');
										return createNewForm.setValue('type', 'transactional');
									}}
								/>
								<Text>
									{createNewForm.watch('type') === 'marketing' ?
										<div className='flex flex-row items-center gap-2'>
											<Icon.marketing className='h-4 w-4' />
											Marketing
										</div>
									:	<div className='flex flex-row items-center gap-1'>
											<Icon.transactional className='h-4 w-4' />
											Transactional
										</div>
									}
								</Text>
							</div>

							<SelectField
								label='From'
								name='fromId'
								control={createNewForm.control}
								options={emailAddressOptions}
							/>

							<SelectField
								label='To'
								name='fanGroupId'
								control={createNewForm.control}
								options={fanGroupOptions}
							/>

							<TextField label='Subject' name='subject' control={createNewForm.control} />

							<TextField
								label='Preview Text'
								name='previewText'
								control={createNewForm.control}
							/>

							<Label>Body</Label>
							<MDXEditor
								variables={EMAIL_TEMPLATE_VARIABLES}
								markdown={createNewForm.getValues('body')}
								onChange={markdown => {
									if (typeof markdown === 'string') {
										createNewForm.setValue('body', markdown, { shouldDirty: true });
									}
								}}
							/>

							<div className='flex flex-row items-center gap-3'>
								<Label>Show in Templates</Label>
								<Switch
									size='sm'
									checked={!createNewForm.watch('broadcastOnly')}
									onCheckedChange={c => {
										createNewForm.setValue('broadcastOnly', !c);
									}}
								/>
								<Text variant='sm/normal'>
									{createNewForm.watch('broadcastOnly') ?
										'Hidden from templates list'
									:	'Visible in templates list'}
								</Text>
							</div>

							<Label>Schedule</Label>
							<Switch
								checked={!!createNewForm.watch('scheduledAt')}
								onCheckedChange={c => {
									if (c) return createNewForm.setValue('scheduledAt', new Date());
									return createNewForm.setValue('scheduledAt', null);
								}}
							/>

							{createNewForm.watch('scheduledAt') && (
								<DatetimeField
									name='scheduledAt'
									granularity='minute'
									hourCycle={12}
									control={createNewForm.control}
								/>
							)}

							{/* <ModalFooter>
								<div className='flex flex-row items-center justify-end gap-3'>
									<Button
										type='button'
										look='secondary'
										onClick={createNewForm.handleSubmit(handleSaveDraftNew)}
									>
										Save Draft
									</Button>

									<SubmitButton
										endIcon={createNewForm.watch('scheduledAt') ? 'calendar' : 'send'}
									>
										{createNewForm.watch('scheduledAt') ? 'Schedule' : 'Send Now'}
									</SubmitButton>
								</div>
							</ModalFooter> */}
						</Form>
					</TabsContent>

					<TabsContent value='use-template'>
						<Form form={existingTemplateForm} onSubmit={onSubmitExisting}>
							<div className='mb-4 flex flex-row justify-end'>
								<SendTestEmail
									values={{
										...existingTemplateForm.getValues(),
										fromId:
											emailTemplates.find(
												t => t.id === existingTemplateForm.watch('emailTemplateId'),
											)?.fromId ??
											emailAddressOptions[0]?.value ??
											'',
										subject:
											emailTemplates.find(
												t => t.id === existingTemplateForm.watch('emailTemplateId'),
											)?.subject ?? '',
										previewText:
											emailTemplates.find(
												t => t.id === existingTemplateForm.watch('emailTemplateId'),
											)?.previewText ?? '',
										body:
											emailTemplates.find(
												t => t.id === existingTemplateForm.watch('emailTemplateId'),
											)?.body ?? '',
										replyTo:
											emailTemplates.find(
												t => t.id === existingTemplateForm.watch('emailTemplateId'),
											)?.replyTo ?? '',
										sendTestEmailTo: '',
									}}
								/>
							</div>

							<SelectField
								label='Email Template'
								name='emailTemplateId'
								control={existingTemplateForm.control}
								options={emailTemplateOptions}
							/>

							<SelectField
								label='To'
								name='fanGroupId'
								control={existingTemplateForm.control}
								options={fanGroupOptions}
							/>

							<Label>Schedule</Label>
							<Switch
								checked={!!existingTemplateForm.watch('scheduledAt')}
								onCheckedChange={c => {
									if (c) return existingTemplateForm.setValue('scheduledAt', new Date());
									return existingTemplateForm.setValue('scheduledAt', null);
								}}
							/>

							{existingTemplateForm.watch('scheduledAt') && (
								<DatetimeField
									name='scheduledAt'
									granularity='minute'
									hourCycle={12}
									control={existingTemplateForm.control}
								/>
							)}

							{/* <ModalFooter>
								<div className='flex flex-row items-center justify-end gap-3'>
									<Button
										disabled={submitDisabledExisting}
										look='secondary'
										onClick={existingTemplateForm.handleSubmit(() =>
											handleSaveDraftExisting(existingTemplateForm.getValues()),
										)}
									>
										Save Draft
									</Button>

									<Button
										disabled={!existingTemplateForm.watch('emailTemplateId')}
										onClick={existingTemplateForm.handleSubmit(() =>
											handleScheduleExisting(existingTemplateForm.getValues()),
										)}
										endIcon={
											existingTemplateForm.watch('scheduledAt') ? 'calendar' : 'send'
										}
									>
										{existingTemplateForm.watch('scheduledAt') ? 'Schedule' : 'Send Now'}
									</Button>
								</div>
							</ModalFooter> */}
						</Form>
					</TabsContent>
				</Tabs>
			</ModalBody>
			<ModalFooter>
				<div className='flex flex-row items-center justify-end gap-3'>
					<Button
						disabled={submitDisabledExisting}
						look='secondary'
						onClick={
							activeTab === 'create-new' ?
								createNewForm.handleSubmit(handleSaveDraftNew)
							:	existingTemplateForm.handleSubmit(() =>
									handleSaveDraftExisting(existingTemplateForm.getValues()),
								)
						}
					>
						Save Draft
					</Button>

					<Button
						disabled={!existingTemplateForm.watch('emailTemplateId')}
						onClick={
							activeTab === 'create-new' ?
								createNewForm.handleSubmit(handleScheduleNew)
							:	existingTemplateForm.handleSubmit(() =>
									handleScheduleExisting(existingTemplateForm.getValues()),
								)
						}
						endIcon={existingTemplateForm.watch('scheduledAt') ? 'calendar' : 'send'}
					>
						{existingTemplateForm.watch('scheduledAt') ? 'Schedule' : 'Send Now'}
					</Button>
				</div>
			</ModalFooter>
		</Modal>
	);
}

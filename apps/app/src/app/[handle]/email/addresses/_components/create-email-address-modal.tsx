'use client';

import type { z } from 'zod/v4';
import { Suspense, useCallback } from 'react';
import { useEmailDomains, useWorkspace, useZodForm } from '@barely/hooks';
import { createEmailAddressSchema } from '@barely/validators';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Alert } from '@barely/ui/alert';
import { Form, SubmitButton } from '@barely/ui/forms/form';
import { SelectField } from '@barely/ui/forms/select-field';
import { SwitchField } from '@barely/ui/forms/switch-field';
import { TextField } from '@barely/ui/forms/text-field';
import { Icon } from '@barely/ui/icon';
import { Skeleton } from '@barely/ui/skeleton';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@barely/ui/modal';

import { useEmailAddressSearchParams } from './email-address-context';

function CreateEmailAddressForm({
	onSubmit,
}: {
	onSubmit: (data: z.infer<typeof createEmailAddressSchema>) => Promise<void>;
}) {
	const trpc = useTRPC();
	const { handle, workspace } = useWorkspace();
	const { domains } = useEmailDomains();

	// Get existing email addresses to check for default
	const { data: emailData } = useSuspenseQuery(
		trpc.emailAddress.byWorkspace.queryOptions({ handle }),
	);

	const domainOptions = domains.map(domain => ({
		label: domain.name,
		value: domain.id,
	}));

	const form = useZodForm({
		schema: createEmailAddressSchema,
		defaultValues: {
			username: '',
			domainId: domains[0]?.id ?? '',
			defaultFriendlyName: workspace.name,
			replyTo: '',
			default: !emailData.hasDefaultEmailAddress,
		},
	});

	const { control } = form;
	const hasNoDefault = !emailData.hasDefaultEmailAddress;
	const hasNoDomains = domains.length === 0;

	return (
		<Form form={form} onSubmit={onSubmit}>
			<ModalBody>
				{hasNoDomains && (
					<Alert
						variant='info'
						title='No email domains'
						description='You need to add an email domain before creating email addresses.'
						actionLabel='Add a domain'
						actionHref={`/${handle}/email/domains`}
					/>
				)}
				<div className='flex flex-row items-center gap-1.5'>
					<div className='w-full flex-grow'>
						<TextField
							control={control}
							name='username'
							label='Username'
							placeholder='user'
							autoFocus
						/>
					</div>
					<Icon.at className='mt-[31px] h-8 w-8 text-muted-foreground' />
					<div className='min-w-1/2 w-full flex-grow'>
						<SelectField
							control={control}
							name='domainId'
							label='Domain'
							options={domainOptions}
							className='flex-grow'
							disabled={domainOptions.length === 0}
						/>
					</div>
				</div>

				<TextField
					control={control}
					name='defaultFriendlyName'
					label='Friendly Name (optional)'
					placeholder='Paul // The Beatles'
				/>

				<TextField
					control={control}
					name='replyTo'
					label='Reply to (optional)'
					placeholder='paul@thebeatles.com'
				/>
				<SwitchField
					control={control}
					name='default'
					label='Default'
					disabled={hasNoDefault}
					disabledTooltip={hasNoDefault ? 'You must have one default email address' : undefined}
				/>
			</ModalBody>
			<ModalFooter>
				<SubmitButton
					loadingText='Adding Email Address'
					fullWidth
					disabled={hasNoDomains}
				>
					Add Email Address
				</SubmitButton>
			</ModalFooter>
		</Form>
	);
}

export function CreateEmailAddressModal() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const { handle } = useWorkspace();
	const { showCreateModal, setShowCreateModal } = useEmailAddressSearchParams();

	const { mutateAsync: createEmailAddress } = useMutation(
		trpc.emailAddress.create.mutationOptions({
			onSuccess: async () => {
				await handleCloseModal();
			},
			onSettled: async () => {
				await queryClient.invalidateQueries({
					queryKey: trpc.emailAddress.byWorkspace.queryKey({ handle }),
				});
			},
		}),
	);

	const handleCloseModal = useCallback(async () => {
		await setShowCreateModal(false);
	}, [setShowCreateModal]);

	const handleSubmit = useCallback(
		async (data: z.infer<typeof createEmailAddressSchema>) => {
			await createEmailAddress({
				...data,
				handle,
			});
		},
		[createEmailAddress, handle],
	);

	return (
		<Modal
			showModal={showCreateModal}
			setShowModal={show => {
				void setShowCreateModal(show);
			}}
			preventDefaultClose={false}
			onClose={handleCloseModal}
			className='max-h-fit max-w-md'
		>
			<ModalHeader icon='email' title='Add Email Address' />
			<Suspense fallback={
				<>
					<ModalBody>
						<div className='flex flex-row items-center gap-1.5'>
							<div className='w-full flex-grow'>
								<div className='space-y-2'>
									<Skeleton className='h-4 w-20' />
									<Skeleton className='h-10 w-full' />
								</div>
							</div>
							<div className='mt-[31px] h-8 w-8' />
							<div className='min-w-1/2 w-full flex-grow'>
								<div className='space-y-2'>
									<Skeleton className='h-4 w-16' />
									<Skeleton className='h-10 w-full' />
								</div>
							</div>
						</div>
						<div className='space-y-2'>
							<Skeleton className='h-4 w-32' />
							<Skeleton className='h-10 w-full' />
						</div>
						<div className='space-y-2'>
							<Skeleton className='h-4 w-24' />
							<Skeleton className='h-10 w-full' />
						</div>
						<div className='flex items-center justify-between'>
							<Skeleton className='h-4 w-16' />
							<Skeleton className='h-6 w-11 rounded-full' />
						</div>
					</ModalBody>
					<ModalFooter>
						<Skeleton className='h-10 w-full' />
					</ModalFooter>
				</>
			}>
				<CreateEmailAddressForm onSubmit={handleSubmit} />
			</Suspense>
		</Modal>
	);
}
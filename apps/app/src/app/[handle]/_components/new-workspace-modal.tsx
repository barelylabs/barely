'use client';

import type { SelectFieldOption } from '@barely/ui/forms/select-field';
import type { z } from 'zod/v4';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useZodForm } from '@barely/hooks';
import { createWorkspaceSchema } from '@barely/validators';
import { useMutation, useQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Form, SubmitButton } from '@barely/ui/forms/form';
import { SelectField } from '@barely/ui/forms/select-field';
import { TextField } from '@barely/ui/forms/text-field';
import { Modal, ModalBody, ModalHeader } from '@barely/ui/modal';

import { useWorkspaceModalState } from './workspace-context';

const handleTakenMessage = 'That handle is already taken';

export function NewWorkspaceModal() {
	const trpc = useTRPC();
	const { showNewWorkspaceModal, setShowNewWorkspaceModal } = useWorkspaceModalState();
	const router = useRouter();
	const [handleToCheck, setHandleToCheck] = useState('');
	const [showValidating, setShowValidating] = useState(false);

	// Query for checking handle availability
	const { data: handleExists, isFetching: isCheckingHandle } = useQuery({
		...trpc.workspace.handleExists.queryOptions({ handle: handleToCheck }),
		enabled: handleToCheck.length >= 3,
	});

	const form = useZodForm({
		schema: createWorkspaceSchema,
		defaultValues: {
			name: '',
			handle: '',
			type: 'creator',
		},
	});

	// Update form errors based on handle availability
	useEffect(() => {
		if (handleToCheck.length >= 3 && handleExists && !isCheckingHandle) {
			if (handleExists.handleTaken) {
				form.setError('handle', {
					type: 'manual',
					message: handleTakenMessage,
				});
			} else {
				// Clear the "taken" error if handle is available
				if (form.formState.errors.handle?.message === handleTakenMessage) {
					form.clearErrors('handle');
				}
			}
			setShowValidating(false);
		}
	}, [handleExists, handleToCheck, isCheckingHandle, form]);

	const typeOptions: SelectFieldOption<
		Exclude<z.infer<typeof createWorkspaceSchema.shape.type>, undefined | 'personal'>
	>[] = [
		{ label: 'Creator', value: 'creator' },
		{ label: 'Band', value: 'band' },
		{ label: 'Solo Artist', value: 'solo_artist' },
		{ label: 'Product', value: 'product' },
	];

	const { mutateAsync: createWorkspace } = useMutation(
		trpc.workspace.create.mutationOptions({
			onSuccess: async data => {
				await setShowNewWorkspaceModal(false);
				router.push(`/${data.handle}/settings`);
			},
		}),
	);

	const onSubmit = async (data: z.infer<typeof createWorkspaceSchema>) => {
		// Double-check handle availability before submitting
		if (handleToCheck === data.handle && handleExists?.handleTaken) {
			form.setError('handle', {
				type: 'manual',
				message: handleTakenMessage,
			});
			return;
		}

		// If we haven't checked this handle yet, check it now
		// if (data.handle !== handleToCheck && data.handle.length >= 3) {
		// 	const result = await trpc.workspace.handleExists.fetch({ handle: data.handle });
		// 	if (result.handleTaken) {
		// 		form.setError('handle', {
		// 			type: 'manual',
		// 			message: handleTakenMessage,
		// 		});
		// 		return;
		// 	}
		// }

		await createWorkspace(data);
	};

	return (
		<Modal
			showModal={showNewWorkspaceModal}
			setShowModal={setShowNewWorkspaceModal}
			className='max-w-md'
		>
			<ModalHeader icon='logo' title='Create a new workspace' />

			<ModalBody>
				<Form form={form} onSubmit={onSubmit}>
					<div className='space-y-4'>
						<TextField
							control={form.control}
							name='name'
							label='Workspace Name'
							infoTooltip='This is your workspace name on Barely'
							autoFocus
						/>
						<TextField
							control={form.control}
							name='handle'
							label='Workspace Handle'
							infoTooltip={`This is your workspace handle on Barely. It'll be used for your transparent links and bio.`}
							onChange={e => {
								// Clear the "taken" error when user starts typing
								if (form.formState.errors.handle?.message === handleTakenMessage) {
									form.clearErrors('handle');
								}
								// Show validating immediately when user types (if valid length)
								if (e.target.value.length >= 3) {
									setShowValidating(true);
								}
							}}
							onChangeDebounced={async e => {
								const handle = e.target.value;
								// First validate the format
								const isValid = await form.trigger('handle');
								if (isValid && handle.length >= 3) {
									// Then check availability
									setHandleToCheck(handle);
								} else {
									// Clear the handle to check if invalid
									setHandleToCheck('');
									setShowValidating(false);
								}
							}}
							isValidating={showValidating || isCheckingHandle}
						/>
						<SelectField
							control={form.control}
							name='type'
							label='Workspace Type'
							infoTooltip={`What type of workspace is this?`}
							options={typeOptions}
						/>
						<div className='pt-2'>
							<SubmitButton fullWidth>Create Workspace</SubmitButton>
						</div>
					</div>
				</Form>
			</ModalBody>
		</Modal>
	);
}

// Special version for onboarding that can't be closed
export function NewWorkspaceModalForOnboarding() {
	const trpc = useTRPC();
	const router = useRouter();
	const { showNewWorkspaceModal } = useWorkspaceModalState();
	const [handleToCheck, setHandleToCheck] = useState('');

	const [showValidating, setShowValidating] = useState(false);

	// Query for checking handle availability
	const { data: handleExists, isFetching: isCheckingHandle } = useQuery({
		...trpc.workspace.handleExists.queryOptions({ handle: handleToCheck }),
		enabled: handleToCheck.length >= 3,
	});

	const form = useZodForm({
		schema: createWorkspaceSchema,
		defaultValues: {
			name: '',
			handle: '',
			type: 'creator',
		},
	});

	// Update form errors based on handle availability
	useEffect(() => {
		if (handleToCheck.length >= 3 && handleExists && !isCheckingHandle) {
			if (handleExists.handleTaken) {
				form.setError('handle', {
					type: 'manual',
					message: handleTakenMessage,
				});
			} else {
				// Clear the "taken" error if handle is available
				if (form.formState.errors.handle?.message === handleTakenMessage) {
					form.clearErrors('handle');
				}
			}
			setShowValidating(false);
		}
	}, [handleExists, handleToCheck, isCheckingHandle, form]);

	const typeOptions: SelectFieldOption<
		Exclude<z.infer<typeof createWorkspaceSchema.shape.type>, undefined | 'personal'>
	>[] = [
		{ label: 'Creator', value: 'creator' },
		{ label: 'Band', value: 'band' },
		{ label: 'Solo Artist', value: 'solo_artist' },
		{ label: 'Product', value: 'product' },
	];

	const { mutateAsync: createWorkspace } = useMutation(
		trpc.workspace.create.mutationOptions({
			onSuccess: data => {
				// Replace the current history entry to prevent going back to onboarding
				router.replace(`/${data.handle}/settings`);
			},
		}),
	);

	const onSubmit = async (data: z.infer<typeof createWorkspaceSchema>) => {
		// Double-check handle availability before submitting
		if (handleToCheck === data.handle && handleExists?.handleTaken) {
			form.setError('handle', {
				type: 'manual',
				message: handleTakenMessage,
			});
			return;
		}

		// If we haven't checked this handle yet, check it now
		// if (data.handle !== handleToCheck && data.handle.length >= 3) {
		// 	const result = await trpc.workspace.handleExists.fetch({ handle: data.handle });
		// 	if (result.handleTaken) {
		// 		form.setError('handle', {
		// 			type: 'manual',
		// 			message: handleTakenMessage,
		// 		});
		// 		return;
		// 	}
		// }

		await createWorkspace(data);
	};

	return (
		<Modal
			showModal={showNewWorkspaceModal}
			setShowModal={() => void 0} // Prevent manual closing
			preventDefaultClose={true}
			className='max-w-md'
		>
			<ModalHeader icon='logo' title='Create a new workspace' />

			<ModalBody>
				<Form form={form} onSubmit={onSubmit}>
					<div className='space-y-4'>
						<TextField
							control={form.control}
							name='name'
							label='Workspace Name'
							infoTooltip='This is your workspace name on Barely'
							autoFocus
						/>
						<TextField
							control={form.control}
							name='handle'
							label='Workspace Handle'
							infoTooltip={`This is your workspace handle on Barely. It'll be used for your transparent links and bio.`}
							onChange={e => {
								// Clear the "taken" error when user starts typing
								if (form.formState.errors.handle?.message === handleTakenMessage) {
									form.clearErrors('handle');
								}
								// Show validating immediately when user types (if valid length)
								if (e.target.value.length >= 3) {
									setShowValidating(true);
								}
							}}
							onChangeDebounced={async e => {
								const handle = e.target.value;
								// First validate the format
								const isValid = await form.trigger('handle');
								if (isValid && handle.length >= 3) {
									// Then check availability
									setHandleToCheck(handle);
								} else {
									// Clear the handle to check if invalid
									setHandleToCheck('');
									setShowValidating(false);
								}
							}}
							isValidating={showValidating || isCheckingHandle}
						/>
						<SelectField
							control={form.control}
							name='type'
							label='Workspace Type'
							infoTooltip={`What type of workspace is this?`}
							options={typeOptions}
						/>
						<div className='pt-2'>
							<SubmitButton fullWidth>Create Workspace</SubmitButton>
						</div>
					</div>
				</Form>
			</ModalBody>
		</Modal>
	);
}

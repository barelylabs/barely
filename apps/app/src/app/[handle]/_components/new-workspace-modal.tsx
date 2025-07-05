'use client';

import type { SelectFieldOption } from '@barely/ui/forms/select-field';
import type { z } from 'zod/v4';
import { useRouter } from 'next/navigation';
import { atomWithToggle } from '@barely/atoms';
import { useZodForm } from '@barely/hooks';
import { createWorkspaceSchema } from '@barely/validators';
import { useMutation } from '@tanstack/react-query';
import { useAtom } from 'jotai';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Form, SubmitButton } from '@barely/ui/forms/form';
import { SelectField } from '@barely/ui/forms/select-field';
import { TextField } from '@barely/ui/forms/text-field';
import { Modal, ModalBody, ModalHeader } from '@barely/ui/modal';

export const showNewWorkspaceModalAtom = atomWithToggle(false);

export function NewWorkspaceModal() {
	const trpc = useTRPC();

	const [newWorkspaceModalOpen, setNewWorkspaceModalOpen] = useAtom(
		showNewWorkspaceModalAtom,
	);
	const router = useRouter();

	const form = useZodForm({
		schema: createWorkspaceSchema,
		defaultValues: {
			name: '',
			handle: '',
			type: 'creator',
		},
	});

	// const formZ4 = useForm({
	// 	schema: createWorkspaceSchema,
	// 	defaultValues: {
	// 		name: '',
	// 		handle: '',
	// 		type: 'creator',
	// 	},
	// });

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
				router.push(`/${data.handle}/settings`);
				setNewWorkspaceModalOpen(false);
			},
		}),
	);

	const onSubmit = async (data: z.infer<typeof createWorkspaceSchema>) => {
		await createWorkspace(data);
	};

	return (
		<Modal
			showModal={newWorkspaceModalOpen}
			setShowModal={setNewWorkspaceModalOpen}
			className='max-w-md'
		>
			<ModalHeader icon='logo' title='Create a new workspace' />

			<ModalBody>
				{/* <FormZ4 {...formZ4}>test</FormZ4> */}

				<Form form={form} onSubmit={onSubmit}>
					<TextField
						control={form.control}
						name='name'
						label='Workspace Name'
						infoTooltip='This is your workspace name on Barely'
					/>
					<TextField
						control={form.control}
						name='handle'
						label='Workspace Handle'
						infoTooltip={`This is your workspace handle on Barely. It'll be used for your transparent links and bio.`}
					/>
					<SelectField
						control={form.control}
						name='type'
						label='Workspace Type'
						infoTooltip={`What type of workspace is this?`}
						options={typeOptions}
					/>
					<SubmitButton fullWidth>Create Workspace</SubmitButton>
				</Form>
			</ModalBody>
		</Modal>
	);
}

'use client';

import type { z } from 'zod/v4';
import { useCallback } from 'react';
import { useCreateOrUpdateForm, useWorkspace } from '@barely/hooks';
import { sanitizeKey } from '@barely/utils';
import { defaultLandingPage, upsertLandingPageSchema } from '@barely/validators';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// import { useWorkspace } from '@barely/hooks';
import { useTRPC } from '@barely/api/app/trpc.react';

import { Form, SubmitButton } from '@barely/ui/forms/form';
import { TextField } from '@barely/ui/forms/text-field';
import { Label } from '@barely/ui/label';
import { MDXEditor } from '@barely/ui/mdx-editor';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@barely/ui/modal';

import { useFocusGridList } from '@barely/hooks';

import {
	useLandingPage,
	useLandingPageSearchParams,
} from '~/app/[handle]/pages/_components/landing-page-context';

export function CreateOrUpdateLandingPageModal({ mode }: { mode: 'create' | 'update' }) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const { handle } = useWorkspace();

	/* landing page context */
	const {
		showCreateModal,
		setShowCreateModal,
		showUpdateModal,
		setShowUpdateModal,
	} = useLandingPageSearchParams();

	const { lastSelectedItem: selectedLandingPage } = useLandingPage();
	const focusGridList = useFocusGridList('landing-pages');

	/* mutations */
	const { mutateAsync: createLandingPage } = useMutation(
		trpc.landingPage.create.mutationOptions({
			onSuccess: async () => {
				await handleCloseModal();
			},
		}),
	);

	const { mutateAsync: updateLandingPage } = useMutation(
		trpc.landingPage.update.mutationOptions({
			onSuccess: async () => {
				await handleCloseModal();
			},
		}),
	);

	/* form */
	const { form, onSubmit: onSubmitLandingPage } = useCreateOrUpdateForm({
		updateItem: mode === 'create' ? null : (selectedLandingPage ?? null),
		upsertSchema: upsertLandingPageSchema,
		defaultValues: defaultLandingPage,
		handleCreateItem: async d => {
			await createLandingPage({
				...d,
				handle,
			});
		},
		handleUpdateItem: async d => {
			await updateLandingPage({
				...d,
				handle,
			});
		},
	});

	const { reset, setError } = form;

	const handleSubmit = useCallback(
		async (data: z.infer<typeof upsertLandingPageSchema>) => {
			await onSubmitLandingPage(data).catch(e => {
				if (
					e instanceof Error &&
					e.message.includes('duplicate key value violates unique constraint')
				) {
					setError('key', { message: 'That key is already taken.' });
				}
			});
		},
		[onSubmitLandingPage, setError],
	);

	/* modal */
	const showModal = mode === 'create' ? showCreateModal : showUpdateModal;
	const setShowModal = mode === 'create' ? setShowCreateModal : setShowUpdateModal;

	const handleCloseModal = useCallback(async () => {
		focusGridList();
		setShowModal(false);
		reset();

		await queryClient.invalidateQueries({
			queryKey: trpc.landingPage.byWorkspace.queryKey(),
		});
	}, [queryClient, trpc, focusGridList, setShowModal, reset]);

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
				icon='landingPage'
				title={
					mode === 'create' ? 'New Landing page' : `Update ${selectedLandingPage?.name}`
				}
			/>
			<Form form={form} onSubmit={handleSubmit}>
				<ModalBody>
					<TextField
						name='name'
						label='Name'
						placeholder='Enter a name for the landing page'
						control={form.control}
						data-1p-ignore
						data-bwignore
						data-lpignore='true'
					/>
					<TextField
						name='key'
						label='Key'
						placeholder='Enter a key for the landing page'
						control={form.control}
						data-1p-ignore
						data-bwignore
						data-lpignore='true'
						onChange={e => {
							form.setValue('key', sanitizeKey(e.target.value), { shouldDirty: true });
						}}
					/>
					<TextField
						name='metaTitle'
						label='Meta Title'
						placeholder='Enter a meta title for the landing page'
						control={form.control}
						data-1p-ignore
						data-bwignore
						data-lpignore='true'
					/>

					<Label>Content</Label>
					{/* <div className='rounded-lg border border-border bg-background p-4'> */}
					<MDXEditor
						markdown={mode === 'update' ? (selectedLandingPage?.content ?? '') : ''}
						onChange={content => {
							form.setValue('content', content, { shouldDirty: true });
						}}
					/>
					{/* </div> */}
				</ModalBody>
				<ModalFooter>
					<SubmitButton fullWidth>{mode === 'create' ? 'Create' : 'Update'}</SubmitButton>
				</ModalFooter>
			</Form>
		</Modal>
	);
}

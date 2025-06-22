'use client';

import type { z } from 'zod/v4';
import { useCallback } from 'react';
import { useCreateOrUpdateForm } from '@barely/lib/hooks/use-create-or-update-form';
// import { useWorkspace } from '@barely/lib/hooks/use-workspace';
import { api } from '@barely/lib/server/api/react';
import {
	defaultLandingPage,
	upsertLandingPageSchema,
} from '@barely/lib/server/routes/landing-page/landing-page.schema';
import { sanitizeKey } from '@barely/lib/utils/key';

import { Label } from '@barely/ui/elements/label';
import { MDXEditor } from '@barely/ui/elements/mdx-editor';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@barely/ui/elements/modal';
import { Form, SubmitButton } from '@barely/ui/forms';
import { TextField } from '@barely/ui/forms/text-field';

import { useLandingPageContext } from '~/app/[handle]/pages/_components/landing-page-context';

export function CreateOrUpdateLandingPageModal({ mode }: { mode: 'create' | 'update' }) {
	const apiUtils = api.useUtils();

	/* landing page context */
	const {
		lastSelectedItem: selectedLandingPage,
		showCreateModal,
		setShowCreateModal,
		showUpdateModal,
		setShowUpdateModal,
		focusGridList,
	} = useLandingPageContext();

	/* mutations */
	const { mutateAsync: createLandingPage } = api.landingPage.create.useMutation({
		onSuccess: async () => {
			await handleCloseModal();
		},
	});

	const { mutateAsync: updateLandingPage } = api.landingPage.update.useMutation({
		onSuccess: async () => {
			await handleCloseModal();
		},
	});

	/* form */
	const { form, onSubmit: onSubmitLandingPage } = useCreateOrUpdateForm({
		updateItem: mode === 'create' ? null : (selectedLandingPage ?? null),
		upsertSchema: upsertLandingPageSchema,
		defaultValues: defaultLandingPage,
		handleCreateItem: async d => {
			await createLandingPage(d);
		},
		handleUpdateItem: async d => {
			await updateLandingPage(d);
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

		await apiUtils.landingPage.invalidate();
	}, [apiUtils.landingPage, focusGridList, setShowModal, reset]);

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

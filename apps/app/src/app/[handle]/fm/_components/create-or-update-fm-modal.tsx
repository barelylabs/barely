'use client';

import type { UploadQueueItem } from '@barely/lib/hooks/use-upload';
import type { UpsertFmPage } from '@barely/lib/server/routes/fm/fm.schema';
import type { z } from 'zod';
import { useCallback } from 'react';
import { useCreateOrUpdateForm } from '@barely/lib/hooks/use-create-or-update-form';
import { useUpload } from '@barely/lib/hooks/use-upload';
import { api } from '@barely/lib/server/api/react';
import { availableFmLinkPlatforms } from '@barely/lib/server/routes/fm/fm.constants';
import { upsertFmPageSchema } from '@barely/lib/server/routes/fm/fm.schema';
import { atom } from 'jotai';
import { useFieldArray } from 'react-hook-form';

import { Button } from '@barely/ui/elements/button';
import { Label } from '@barely/ui/elements/label';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@barely/ui/elements/modal';
import { UploadDropzone } from '@barely/ui/elements/upload';
import { Form, SubmitButton } from '@barely/ui/forms';
import { TextField } from '@barely/ui/forms/text-field';

import { useFmContext } from '~/app/[handle]/fm/_components/fm-context';

const artworkUploadQueueAtom = atom<UploadQueueItem[]>([]);

export function CreateOrUpdateFmModal({ mode }: { mode: 'create' | 'update' }) {
	const apiUtils = api.useUtils();

	/* fm context */
	const {
		lastSelectedFmPage: selectedFmPage,
		showCreateFmPageModal,
		showUpdateFmPageModal,
		setShowCreateFmPageModal,
		setShowUpdateFmPageModal,
		focusGridList,
	} = useFmContext();

	/* mutations */
	const { mutateAsync: createFm } = api.fm.create.useMutation({
		onSuccess: async () => {
			await handleCloseModal();
		},
	});

	const { mutateAsync: updateFm } = api.fm.update.useMutation({
		onSuccess: async () => {
			await handleCloseModal();
		},
	});

	/* form */
	const { form, onSubmit } = useCreateOrUpdateForm({
		updateItem: mode === 'create' ? null : selectedFmPage ?? null,
		upsertSchema: upsertFmPageSchema,
		defaultValues: {
			title: selectedFmPage?.title ?? '',
			key: '',
			sourceUrl: '',
			scheme: 'light',
			links: selectedFmPage?.links ?? [],
		},
		handleCreateItem: async d => {
			await createFm(d);
		},
		handleUpdateItem: async d => {
			await updateFm(d);
		},
	});

	// link array
	const {
		fields: linkFields,
		append: appendLink,
		remove: removeLink,
		move: moveLink,
	} = useFieldArray({
		control: form.control,
		name: 'links',
	});

	const activeLinks = form.watch('links');
	const availableLinks = availableFmLinkPlatforms.filter(
		platform => !activeLinks.some(link => link.platform === platform),
	);

	/* artwork upload */
	const artworkUploadState = useUpload({
		allowedFileTypes: ['image'],
		uploadQueueAtom: artworkUploadQueueAtom,
		maxFiles: 1,
	});

	const {
		isPendingPresigns: isPendingPresignsArtwork,
		uploading: uploadingArtwork,
		handleSubmit: handleArtworkUpload,
		uploadQueue: artworkUploadQueue,
		setUploadQueue: setArtworkUploadQueue,
	} = artworkUploadState;

	const uploadPreviewImage = artworkUploadQueue[0]?.previewImage;

	const artworkImagePreview =
		uploadPreviewImage ?? (mode === 'update' ? selectedFmPage?.coverArt?.src ?? '' : '');

	const handleSubmit = useCallback(
		async (data: z.infer<typeof upsertFmPageSchema>) => {
			const upsertFmPageData: UpsertFmPage = {
				...data,
				coverArtId: artworkUploadQueue[0]?.presigned?.fileRecord.id ?? undefined,
			};

			await handleArtworkUpload();
			await onSubmit(upsertFmPageData);
		},
		[artworkUploadQueue, handleArtworkUpload, onSubmit],
	);

	const submitDisabled =
		isPendingPresignsArtwork ||
		uploadingArtwork ||
		(mode === 'update' && !form.formState.isDirty && !artworkUploadQueue.length);

	/* modal */
	const showFmModal = mode === 'create' ? showCreateFmPageModal : showUpdateFmPageModal;
	const setShowFmModal =
		mode === 'create' ? setShowCreateFmPageModal : setShowUpdateFmPageModal;

	const handleCloseModal = useCallback(async () => {
		form.reset();
		focusGridList();
		setArtworkUploadQueue([]);
		await apiUtils.fm.invalidate();
		setShowFmModal(false);
	}, [form, focusGridList, apiUtils.fm, setShowFmModal, setArtworkUploadQueue]);

	return (
		<Modal
			showModal={showFmModal}
			setShowModal={setShowFmModal}
			preventDefaultClose={form.formState.isDirty}
			onClose={handleCloseModal}
		>
			<ModalHeader
				icon='fm'
				title={
					mode === 'update' ? `Update ${selectedFmPage?.title ?? ''}` : 'Create FM Page'
				}
			/>

			<Form form={form} onSubmit={handleSubmit}>
				<ModalBody>
					<TextField label='Source URL' control={form.control} name='sourceUrl' />
					<TextField label='Title' control={form.control} name='title' />
					<TextField label='Key' control={form.control} name='key' />

					<div className='flex flex-col items-start gap-1'>
						<Label>Artwork</Label>
						<UploadDropzone
							{...artworkUploadState}
							title='Upload cover art'
							imagePreview={artworkImagePreview}
						/>
					</div>

					<div className='flex w-full flex-col items-start gap-1'>
						<Label>Links</Label>
						<div className='flex w-full flex-col gap-4'>
							{linkFields.map((field, index) => {
								return (
									<div
										key={field.id}
										className='flex flex-col space-y-2 border border-border p-4'
									>
										<TextField
											label={form.getValues(`links.${index}.platform`)}
											control={form.control}
											name={`links.${index}.url`}
											labelButton={
												<div className='flex flex-row space-x-2'>
													<Button
														variant='icon'
														startIcon='chevronUp'
														look='ghost'
														size='sm'
														onClick={() => moveLink(index, index - 1)}
													/>
													<Button
														variant='icon'
														startIcon='chevronDown'
														look='ghost'
														size='sm'
														onClick={() => moveLink(index, index + 1)}
													/>
													<Button
														variant='icon'
														startIcon='delete'
														look='ghost'
														size='sm'
														onClick={() => removeLink(index)}
													/>
												</div>
											}
										/>
									</div>
								);
							})}
						</div>
					</div>

					<div className='grid grid-cols-2 gap-4'>
						{availableLinks.map(platform => {
							return (
								<Button
									key={platform}
									className='justify-between space-x-4'
									look='outline'
									endIcon='plus'
									fullWidth
									onClick={() => {
										appendLink({ platform, url: '' });
									}}
								>
									<span>{platform}</span>
								</Button>
							);
						})}
					</div>
				</ModalBody>
				<ModalFooter>
					<SubmitButton disabled={submitDisabled} fullWidth>
						{mode === 'update' ? 'Save FM Page' : 'Create FM Page'}
					</SubmitButton>
				</ModalFooter>
			</Form>
		</Modal>
	);
}

'use client';

import type { UploadQueueItem } from '@barely/lib/hooks/use-upload';
import type { UpsertFmPage } from '@barely/lib/server/routes/fm/fm.schema';
import type { z } from 'zod';
import { useCallback, useEffect, useMemo } from 'react';
import { useCreateOrUpdateForm } from '@barely/lib/hooks/use-create-or-update-form';
import { useDebounce } from '@barely/lib/hooks/use-debounce';
import { useUpload } from '@barely/lib/hooks/use-upload';
import { api } from '@barely/lib/server/api/react';
import { FM_LINK_PLATFORMS } from '@barely/lib/server/routes/fm/fm.constants';
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
			title: mode === 'update' ? selectedFmPage?.title ?? '' : '',
			key: '',
			sourceUrl: '',
			scheme: 'light',
			links: mode === 'update' ? selectedFmPage?.links ?? [] : [],
		},
		handleCreateItem: async d => {
			await createFm(d);
			d;
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
	const availableLinks = FM_LINK_PLATFORMS.filter(
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

	/* modal */
	const showFmModal = mode === 'create' ? showCreateFmPageModal : showUpdateFmPageModal;
	const setShowFmModal =
		mode === 'create' ? setShowCreateFmPageModal : setShowUpdateFmPageModal;

	const handleCloseModal = useCallback(async () => {
		focusGridList();
		setArtworkUploadQueue([]);
		await apiUtils.fm.invalidate();
		form.reset();
		setShowFmModal(false);
	}, [form, focusGridList, apiUtils.fm, setShowFmModal, setArtworkUploadQueue]);

	/* state */
	const sourceUrl = form.watch('sourceUrl');
	const spotifyLinkUrl = form
		.watch('links')
		.find(link => link.platform === 'spotify')?.url;

	const isSpotifyPlaylistUrl = useMemo(() => {
		// we need to check if source url is a playlist and/or the spotify link in linkFields is a playlist
		return (
			sourceUrl.includes('spotify.com/playlist/') ||
			spotifyLinkUrl?.includes('spotify.com/playlist')
		);
	}, [sourceUrl, spotifyLinkUrl]);

	useEffect(() => {
		if (
			sourceUrl.includes('open.spotify.com') &&
			!linkFields.some(link => link.platform === 'spotify')
		) {
			appendLink({ platform: 'spotify', url: sourceUrl, spotifyTrackUrl: sourceUrl.includes('open.spotify.com/track') ? sourceUrl : '' });
		}
	}, [sourceUrl, appendLink, linkFields]);

	/* spotify image */
	const [debouncedSourceUrl] = useDebounce(sourceUrl, 500);
	const { data: spotifyImageUrl } = api.spotify.getImageUrl.useQuery(
		{
			query: debouncedSourceUrl,
		},
		{
			enabled: !!sourceUrl,
		},
	);

	const artworkImagePreview =
		uploadPreviewImage ??
		(mode === 'update' ?
			selectedFmPage?.coverArt?.src ?? spotifyImageUrl
		:	spotifyImageUrl ?? '');

	// form submit
	const handleSubmit = useCallback(
		async (data: z.infer<typeof upsertFmPageSchema>) => {
			// const coverArtUrl = artworkUploadQueue[0]?.presigned?.fileRecord.url ?

			let coverArtUrl: string | undefined = undefined;
			if (!artworkUploadQueue.length && !selectedFmPage?.coverArt?.src) {
				coverArtUrl = spotifyImageUrl ?? undefined;
			}

			const upsertFmPageData: UpsertFmPage = {
				...data,
				coverArtUrl,
				coverArtId: artworkUploadQueue[0]?.presigned?.fileRecord.id ?? undefined,
			};

			await handleArtworkUpload();

			console.log('upsertFmPageData', upsertFmPageData);

			await onSubmit(upsertFmPageData);
		},
		[artworkUploadQueue, handleArtworkUpload, onSubmit, spotifyImageUrl, selectedFmPage],
	);

	const submitDisabled =
		isPendingPresignsArtwork ||
		uploadingArtwork ||
		(mode === 'update' && !form.formState.isDirty && !artworkUploadQueue.length);

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
										{isSpotifyPlaylistUrl &&
											form.getValues(`links.${index}.platform`) === 'spotify' && (
												<TextField
													label='spotify track url (optional)'
													infoTooltip='If you provide a link to a track included the playlist, we can link directly to the track within the playlist'
													control={form.control}
													name={`links.${index}.spotifyTrackUrl`}
												/>
											)}
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
										appendLink({ platform, url: '', spotifyTrackUrl: '' });
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

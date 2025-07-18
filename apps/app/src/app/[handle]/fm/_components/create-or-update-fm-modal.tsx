'use client';

import type { UploadQueueItem } from '@barely/hooks';
import type { UpsertFmPage } from '@barely/validators';
import type { z } from 'zod/v4';
import { useCallback, useEffect, useMemo } from 'react';
import { FM_LINK_PLATFORMS } from '@barely/const';
import {
	useCreateOrUpdateForm,
	useDebounce,
	useUpload,
	useWorkspace,
} from '@barely/hooks';
import { sanitizeKey } from '@barely/utils';
import { upsertFmPageSchema } from '@barely/validators';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { atom } from 'jotai';
import { useFieldArray } from 'react-hook-form';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Button } from '@barely/ui/button';
import { Form, SubmitButton } from '@barely/ui/forms/form';
import { TextField } from '@barely/ui/forms/text-field';
import { Label } from '@barely/ui/label';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@barely/ui/modal';
import { UploadDropzone } from '@barely/ui/upload';

import { useFm, useFmSearchParams } from '~/app/[handle]/fm/_components/fm-context';

const artworkUploadQueueAtom = atom<UploadQueueItem[]>([]);

export function CreateOrUpdateFmModal({ mode }: { mode: 'create' | 'update' }) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const { handle } = useWorkspace();
	/* fm context */
	const { lastSelectedItem: selectedFmPage, focusGridList } = useFm();
	const { showCreateModal, showUpdateModal, setShowCreateModal, setShowUpdateModal } =
		useFmSearchParams();

	/* mutations */
	const { mutateAsync: createFm } = useMutation(
		trpc.fm.create.mutationOptions({
			onSuccess: async () => {
				await handleCloseModal();
			},
		}),
	);

	const { mutateAsync: updateFm } = useMutation(
		trpc.fm.update.mutationOptions({
			onSuccess: async () => {
				await handleCloseModal();
			},
		}),
	);

	/* form */
	const { form, onSubmit } = useCreateOrUpdateForm({
		updateItem: mode === 'create' ? null : (selectedFmPage ?? null),
		upsertSchema: upsertFmPageSchema,
		defaultValues: {
			title: mode === 'update' ? (selectedFmPage?.title ?? '') : '',
			key: '',
			sourceUrl: '',
			scheme: 'light',
			links: mode === 'update' ? (selectedFmPage?.links ?? []) : [],
		},
		handleCreateItem: async d => {
			await createFm({
				...d,
				handle,
			});
		},
		handleUpdateItem: async d => {
			await updateFm({
				...d,
				handle,
			});
		},
	});

	const { setValue } = form;

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

	/* modal */
	const showFmModal = mode === 'create' ? showCreateModal : showUpdateModal;
	const setShowFmModal = mode === 'create' ? setShowCreateModal : setShowUpdateModal;

	const handleCloseModal = useCallback(async () => {
		focusGridList();
		setArtworkUploadQueue([]);
		await queryClient.invalidateQueries(trpc.fm.byWorkspace.queryFilter());
		form.reset();
		await setShowFmModal(false);
	}, [form, focusGridList, queryClient, trpc.fm, setShowFmModal, setArtworkUploadQueue]);

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
			appendLink({
				platform: 'spotify',
				url: sourceUrl,
				spotifyTrackUrl: sourceUrl.includes('open.spotify.com/track') ? sourceUrl : '',
			});
		}
	}, [sourceUrl, appendLink, linkFields]);

	/* spotify metadata */
	const [debouncedSourceUrl] = useDebounce(sourceUrl, 500);
	const { data: sourceUrlSpotifyMetadata } = useQuery(
		trpc.spotify.getMetadata.queryOptions(
			{
				query: debouncedSourceUrl,
			},
			{
				enabled: !!sourceUrl && sourceUrl.includes('open.spotify.com'),
			},
		),
	);

	const spotifyImageUrl = useMemo(() => {
		return sourceUrlSpotifyMetadata?.imageUrl ?? undefined;
	}, [sourceUrlSpotifyMetadata]);

	const spotifyTitle = useMemo(() => {
		return sourceUrlSpotifyMetadata?.title ?? undefined;
	}, [sourceUrlSpotifyMetadata]);

	const currentTitle = form.watch('title');
	const currentKey = form.watch('key');

	useEffect(() => {
		if (!spotifyTitle) return;
		if (currentTitle === '') {
			setValue('title', spotifyTitle);
		}
		if (currentKey === '') {
			const key = spotifyTitle
				.toLowerCase()
				.replace(/\s+/g, '-')
				.replace(/[^a-z0-9-]/g, '');
			setValue('key', key);
		}
	}, [spotifyTitle, currentTitle, currentKey, setValue]);

	const artworkImagePreviewS3Key = selectedFmPage?.coverArt?.s3Key;
	const artworkImagePreviewBlurDataUrl = selectedFmPage?.coverArt?.blurDataUrl;

	const artworkImagePreview =
		artworkUploadQueue[0]?.previewImage ??
		(mode === 'update' ?
			(selectedFmPage?.coverArt?.src ?? spotifyImageUrl ?? '')
		:	(spotifyImageUrl ?? ''));

	// form submit
	const handleSubmit = useCallback(
		async (data: z.infer<typeof upsertFmPageSchema>) => {
			let coverArtUrl: string | undefined = undefined;
			if (
				!artworkUploadQueue.length &&
				(mode === 'create' || !selectedFmPage?.coverArt?.src)
			) {
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
		[
			artworkUploadQueue,
			handleArtworkUpload,
			onSubmit,
			spotifyImageUrl,
			selectedFmPage,
			mode,
		],
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
					<TextField
						label='Key'
						control={form.control}
						name='key'
						onChange={e => {
							form.setValue('key', sanitizeKey(e.target.value), { shouldDirty: true });
						}}
					/>

					<div className='flex flex-col items-start gap-1'>
						<Label>Artwork</Label>
						<UploadDropzone
							{...artworkUploadState}
							title='Upload cover art'
							imagePreviewSrc={artworkImagePreview}
							existingImageS3Key={artworkImagePreviewS3Key}
							existingImageBlurDataUrl={artworkImagePreviewBlurDataUrl}
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

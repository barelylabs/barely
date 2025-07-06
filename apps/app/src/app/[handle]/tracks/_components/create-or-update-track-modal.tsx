'use client';

import type { UploadQueueItem } from '@barely/hooks';
import type { InsertTrackAudioFile, UpsertTrack } from '@barely/validators';
import type { z } from 'zod/v4';
import { useCallback } from 'react';
import { useCreateOrUpdateForm, useUpload, useWorkspace } from '@barely/hooks';
import { parseSpotifyUrl } from '@barely/utils';
import {
	defaultTrack,
	formatWorkspaceTrackToUpsertTrackForm,
	upsertTrackSchema,
} from '@barely/validators';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { atom } from 'jotai';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Badge } from '@barely/ui/badge';
import { Form, SubmitButton } from '@barely/ui/forms/form';
import { TextField } from '@barely/ui/forms/text-field';
import { Label } from '@barely/ui/label';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@barely/ui/modal';
import { Text } from '@barely/ui/typography';
import { UploadDropzone, UploadQueueList } from '@barely/ui/upload';

import { useTrack } from '~/app/[handle]/tracks/_components/track-context';

const trackArtworkUploadQueueAtom = atom<UploadQueueItem[]>([]);
const trackAudioUploadQueueAtom = atom<UploadQueueItem[]>([]);

export function CreateOrUpdateTrackModal(props: { mode: 'create' | 'update' }) {
	const { mode } = props;
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const { handle } = useWorkspace();
	/* track context */
	const {
		lastSelectedItem: selectedTrack,
		focusGridList,
		showCreateModal,
		setShowCreateModal,
		showUpdateModal,
		setShowUpdateModal,
	} = useTrack();

	/* api */
	const { mutateAsync: createTrack } = useMutation({
		...trpc.track.create.mutationOptions(),
		onSuccess: async () => {
			await handleCloseModal();
		},
	});

	const { mutateAsync: updateTrack } = useMutation({
		...trpc.track.update.mutationOptions(),
		onSuccess: async () => {
			await handleCloseModal();
		},
	});

	/* form */
	const { form, onSubmit: onSubmitTrack } = useCreateOrUpdateForm({
		updateItem:
			mode === 'update' && selectedTrack ?
				formatWorkspaceTrackToUpsertTrackForm(selectedTrack)
			:	null,
		upsertSchema: upsertTrackSchema,
		defaultValues: defaultTrack,
		handleCreateItem: async d => {
			await createTrack({
				...d,
				handle,
			});
		},
		handleUpdateItem: async d => {
			await updateTrack({
				...d,
				handle,
			});
		},
	});

	/* Artwork upload */
	const artworkUploadState = useUpload({
		uploadQueueAtom: trackArtworkUploadQueueAtom,
		allowedFileTypes: ['image'],
		maxFiles: 1,
	});

	const {
		isPendingPresigns: isPendingPresignsArtwork,
		uploading: uploadingArtwork,
		handleSubmit: handleArtworkUpload,
		uploadQueue: artworkUploadQueue,
		setUploadQueue: setArtworkUploadQueue,
	} = artworkUploadState;

	const artworkImagePreview =
		artworkUploadQueue[0]?.previewImage ??
		(mode === 'update' ?
			(selectedTrack?.artworkFiles.find(f => f.current)?.src ?? '')
		:	'');

	/* Audio upload */
	const audioUploadState = useUpload({
		uploadQueueAtom: trackAudioUploadQueueAtom,
		allowedFileTypes: ['audio'],
		maxFiles: 2,
		maxSize: 100 * 1024 * 1024, // 100MB
	});

	const {
		isPendingPresigns: isPendingPresignsAudio,
		uploading: uploadingAudio,
		handleSubmit: handleAudioUpload,
		uploadQueue: audioUploadQueue,
		setUploadQueue: setAudioUploadQueue,
	} = audioUploadState;

	const handleSubmit = useCallback(
		async (data: z.infer<typeof upsertTrackSchema>) => {
			const upsertTrackData: UpsertTrack = {
				...data,
				_artworkFiles: artworkUploadQueue.map(f => {
					return {
						fileId: f.presigned?.fileRecord.id ?? '',
						current: true,
					};
				}),
				_audioFiles: audioUploadQueue
					.map(item => {
						const af: InsertTrackAudioFile = {
							fileId: item.presigned?.fileRecord.id ?? '',
							masterCompressed:
								(
									item.file.type === 'audio/mpeg' ||
									item.file.type === 'audio/m4a' ||
									item.file.type === 'audio/x-m4a'
								) ?
									true
								:	undefined,
							masterWav: item.file.type === 'audio/wav' ? true : undefined,
						};
						return af;
					})
					.filter(f => f.fileId.length > 0),
			};

			await Promise.all([handleArtworkUpload(), handleAudioUpload()]);
			await onSubmitTrack(upsertTrackData);
		},
		[
			artworkUploadQueue,
			audioUploadQueue,
			onSubmitTrack,
			handleArtworkUpload,
			handleAudioUpload,
		],
	);

	const submitDisabled =
		isPendingPresignsArtwork ||
		isPendingPresignsAudio ||
		uploadingArtwork ||
		uploadingAudio;

	// MASTERS
	const masterCompressed =
		mode === 'update' ?
			selectedTrack?.audioFiles.find(f => f.masterCompressed)
		:	undefined;
	const masterWav =
		mode === 'update' ? selectedTrack?.audioFiles.find(f => f.masterWav) : undefined;

	/* modal */
	const showModal = mode === 'create' ? showCreateModal : showUpdateModal;
	const setShowModal = mode === 'create' ? setShowCreateModal : setShowUpdateModal;

	const handleCloseModal = useCallback(async () => {
		form.reset();
		focusGridList();
		setArtworkUploadQueue([]);
		setAudioUploadQueue([]);
		await queryClient.invalidateQueries(trpc.track.byWorkspace.queryFilter());
		await setShowModal(false);
	}, [
		form,
		queryClient,
		focusGridList,
		setShowModal,
		setArtworkUploadQueue,
		setAudioUploadQueue,
		trpc.track.byWorkspace,
	]);

	return (
		<Modal
			showModal={showModal}
			setShowModal={setShowModal}
			className='w-full'
			preventDefaultClose={
				form.formState.isDirty ||
				artworkUploadQueue.length > 0 ||
				audioUploadQueue.length > 0
			}
			onClose={handleCloseModal}
			onAutoFocus={() => {
				if (mode === 'update') {
					form.setFocus('isrc');
				} else {
					form.setFocus('name');
				}
			}}
		>
			<ModalHeader
				icon='music'
				title={selectedTrack ? `Update ${selectedTrack.name}` : 'New track'}
			/>
			<Form form={form} onSubmit={handleSubmit}>
				<ModalBody>
					<TextField
						name='name'
						control={form.control}
						label='Track name'
						disabled={!!selectedTrack}
						allowEnable
					/>
					<TextField control={form.control} name='isrc' label='ISRC' />
					<TextField
						control={form.control}
						name='spotifyId'
						label='Spotify ID'
						onPaste={e => {
							const input = e.clipboardData.getData('text');
							const parsed = parseSpotifyUrl(input);
							if (parsed?.type !== 'track') return;
							e.preventDefault();
							form.setValue('spotifyId', parsed.id ?? null);
						}}
					/>

					<div className='flex flex-col items-start gap-1'>
						<Label>Artwork</Label>
						<UploadDropzone
							{...artworkUploadState}
							title='Upload album art'
							imagePreviewSrc={artworkImagePreview}
						/>
						<UploadQueueList uploadQueue={artworkUploadState.uploadQueue} />
					</div>

					<div className='flex flex-col items-start gap-1'>
						<Label>Masters</Label>
						{!!masterCompressed && (
							<div className='flex flex-row items-center gap-2'>
								<Text variant='xs/normal'>Compressed: </Text>
								<a href={masterCompressed.src} target='_blank' rel='noreferrer'>
									<Badge icon='music' variant='info' size='xs'>
										{masterCompressed.name}
									</Badge>
								</a>
							</div>
						)}

						{!!masterWav && (
							<div className='flex flex-row items-center gap-2'>
								<Text variant='xs/normal'>Wav: </Text>
								<a href={masterWav.src} target='_blank' rel='noreferrer'>
									<Badge icon='music' variant='info' size='xs'>
										{masterWav.name}
									</Badge>
								</a>
							</div>
						)}

						<UploadDropzone
							{...audioUploadState}
							title={audioUploadQueue[0]?.file.name ?? 'Upload audio'}
							className='h-28 w-96'
						/>
						<UploadQueueList uploadQueue={audioUploadState.uploadQueue} />
					</div>
				</ModalBody>
				<ModalFooter>
					<SubmitButton fullWidth disabled={submitDisabled}>
						{mode === 'create' ? 'Create Track' : 'Update Track'}
					</SubmitButton>
				</ModalFooter>
			</Form>
		</Modal>
	);
}

'use client';

import type { UploadQueueItem } from '@barely/lib/hooks/use-upload';
import type { InsertTrackAudioFile, UpsertTrack } from '@barely/lib/server/track.schema';
import type { z } from 'zod';
import { useCallback } from 'react';
import { useCreateOrUpdateForm } from '@barely/lib/hooks/use-create-or-update-form';
import { useUpload } from '@barely/lib/hooks/use-upload';
import { api } from '@barely/lib/server/api/react';
import {
	defaultTrack,
	formatWorkspaceTrackToUpsertTrackForm,
	upsertTrackSchema,
} from '@barely/lib/server/track.schema';
import { parseSpotifyLink } from '@barely/lib/utils/link';
import { atom } from 'jotai';

import { Badge } from '@barely/ui/elements/badge';
import { Label } from '@barely/ui/elements/label';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@barely/ui/elements/modal';
import { Text } from '@barely/ui/elements/typography';
import { UploadDropzone, UploadQueueList } from '@barely/ui/elements/upload';
import { Form, SubmitButton } from '@barely/ui/forms';
import { TextField } from '@barely/ui/forms/text-field';

import { useTrackContext } from '~/app/[handle]/tracks/_components/track-context';

const trackArtworkUploadQueueAtom = atom<UploadQueueItem[]>([]);
const trackAudioUploadQueueAtom = atom<UploadQueueItem[]>([]);

export function CreateOrUpdateTrackModal(props: { mode: 'create' | 'update' }) {
	const { mode } = props;
	const apiUtils = api.useUtils();

	/* track context */
	const {
		lastSelectedTrack: selectedTrack,
		showCreateTrackModal,
		setShowCreateTrackModal,
		showEditTrackModal,
		setShowEditTrackModal,
		focusGridList,
	} = useTrackContext();

	/* api */
	const { mutateAsync: createTrack } = api.track.create.useMutation({
		onSuccess: async () => {
			await handleCloseModal();
		},
	});

	const { mutateAsync: updateTrack } = api.track.update.useMutation({
		onSuccess: async () => {
			await handleCloseModal();
		},
	});

	/* form */
	const { form, onSubmit: onSubmitTrack } = useCreateOrUpdateForm({
		updateItem: selectedTrack
			? formatWorkspaceTrackToUpsertTrackForm(selectedTrack)
			: null,
		upsertSchema: upsertTrackSchema,
		defaultValues: defaultTrack,
		handleCreateItem: async d => {
			await createTrack(d);
		},
		handleUpdateItem: async d => {
			await updateTrack(d);
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
		selectedTrack?.artworkFiles?.find(f => f.current)?.src ??
		'';

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
								item.file.type === 'audio/mpeg' || item.file.type === 'audio/m4a',
							masterWav: item.file.type === 'audio/wav',
						};
						return af;
					})
					.filter(f => f.fileId.length > 0),
			};

			await Promise.all([handleArtworkUpload(), handleAudioUpload()]);
			await onSubmitTrack(upsertTrackData);

			setArtworkUploadQueue([]);
			setAudioUploadQueue([]);
		},
		[
			artworkUploadQueue,
			setArtworkUploadQueue,
			audioUploadQueue,
			setAudioUploadQueue,
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
	const masterCompressed = selectedTrack?.audioFiles?.find(f => f.masterCompressed);
	const masterWav = selectedTrack?.audioFiles?.find(f => f.masterWav);

	/* modal */
	const showModal = mode === 'create' ? showCreateTrackModal : showEditTrackModal;
	const setShowModal =
		mode === 'create' ? setShowCreateTrackModal : setShowEditTrackModal;

	const handleCloseModal = useCallback(async () => {
		form.reset();
		focusGridList();
		await apiUtils.track.invalidate();
	}, [form, apiUtils.track, focusGridList]);

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
							const parsed = parseSpotifyLink(input);
							if (!input ?? parsed?.type !== 'track') return;
							e.preventDefault();
							form.setValue('spotifyId', parsed.id);
						}}
					/>

					<div className='flex flex-col items-start gap-1'>
						<Label>Artwork</Label>
						<UploadDropzone
							{...artworkUploadState}
							title='Upload album art'
							imagePreview={artworkImagePreview}
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

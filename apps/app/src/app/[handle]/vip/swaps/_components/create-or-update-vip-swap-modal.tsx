'use client';

import type { UploadQueueItem } from '@barely/hooks';
import type { UpsertVipSwap } from '@barely/validators';
import { useCallback } from 'react';
import { useCreateOrUpdateForm, useUpload, useWorkspace } from '@barely/hooks';
import { sanitizeKey } from '@barely/utils';
import { upsertVipSwapSchema } from '@barely/validators';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { atom } from 'jotai';
import { toast } from 'sonner';
import { z } from 'zod/v4';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Form, SubmitButton } from '@barely/ui/forms/form';
import { NumberField } from '@barely/ui/forms/number-field';
import { SwitchField } from '@barely/ui/forms/switch-field';
import { TextAreaField } from '@barely/ui/forms/text-area-field';
import { TextField } from '@barely/ui/forms/text-field';
import { Label } from '@barely/ui/label';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@barely/ui/modal';
import { UploadDropzone, UploadQueueList } from '@barely/ui/upload';

import { useVipSwaps, useVipSwapsSearchParams } from './use-vip-swaps';

const audioUploadQueueAtom = atom<UploadQueueItem[]>([]);
const coverUploadQueueAtom = atom<UploadQueueItem[]>([]);

export function CreateOrUpdateVipSwapModal({ mode }: { mode: 'create' | 'update' }) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const { handle } = useWorkspace();

	/* vip context */
	const { lastSelectedItem: selectedVipSwap, focusGridList } = useVipSwaps();
	const { showCreateModal, showUpdateModal, setShowCreateModal, setShowUpdateModal } =
		useVipSwapsSearchParams();

	/* mutations */
	const { mutateAsync: createVipSwap } = useMutation(
		trpc.vipSwap.create.mutationOptions({
			onSuccess: async () => {
				await handleCloseModal();
			},
			onError: error => {
				toast.error('Failed to create VIP swap: ' + error.message);
			},
		}),
	);

	const { mutateAsync: updateVipSwap } = useMutation(
		trpc.vipSwap.update.mutationOptions({
			onSuccess: async () => {
				await handleCloseModal();
			},
			onError: error => {
				toast.error('Failed to update VIP swap: ' + error.message);
			},
		}),
	);

	/* form */
	const { form, onSubmit } = useCreateOrUpdateForm({
		updateItem: mode === 'create' ? null : (selectedVipSwap ?? null),
		upsertSchema: upsertVipSwapSchema.extend({
			limitDownloads: z.boolean().optional(),
		}),
		defaultValues: {
			id: mode === 'update' ? selectedVipSwap?.id : undefined,
			handle,

			fileId: mode === 'update' ? (selectedVipSwap?.fileId ?? '') : '',
			coverImageId: mode === 'update' ? (selectedVipSwap?.coverImageId ?? null) : null,
			name: mode === 'update' ? (selectedVipSwap?.name ?? '') : '',
			key: mode === 'update' ? (selectedVipSwap?.key ?? '') : '',
			downloadTitle: mode === 'update' ? (selectedVipSwap?.downloadTitle ?? '') : '',
			emailCaptureTitle:
				mode === 'update' ? (selectedVipSwap?.emailCaptureTitle ?? '') : '',
			emailCaptureDescription:
				mode === 'update' ? (selectedVipSwap?.emailCaptureDescription ?? '') : '',
			emailCaptureLabel:
				mode === 'update' ? (selectedVipSwap?.emailCaptureLabel ?? '') : '',
			emailFromName: mode === 'update' ? (selectedVipSwap?.emailFromName ?? '') : '',
			emailSubject: mode === 'update' ? (selectedVipSwap?.emailSubject ?? '') : '',
			emailBody: mode === 'update' ? (selectedVipSwap?.emailBody ?? '') : '',
			limitDownloads: mode === 'update' ? !!selectedVipSwap?.downloadLimit : false,
			downloadLimit: mode === 'update' ? (selectedVipSwap?.downloadLimit ?? 1) : 1,
			passwordProtected:
				mode === 'update' ? (selectedVipSwap?.passwordProtected ?? false) : false,
			password: '',
			isActive: mode === 'update' ? (selectedVipSwap?.isActive ?? true) : true,
		},
		handleCreateItem: async d => {
			await createVipSwap(d);
		},
		handleUpdateItem: async d => {
			await updateVipSwap(d);
		},
	});

	/* audio upload */
	const audioUploadState = useUpload({
		allowedFileTypes: ['audio'],
		uploadQueueAtom: audioUploadQueueAtom,
		maxFiles: 1,
		maxSize: 500 * 1024 * 1024, // 500MB
		folder: 'vip',
	});

	const {
		isPendingPresigns: isPendingPresignsAudio,
		uploading: uploadingAudio,
		handleSubmit: handleAudioUpload,
		uploadQueue: audioUploadQueue,
		setUploadQueue: setAudioUploadQueue,
	} = audioUploadState;

	/* cover image upload */
	const coverUploadState = useUpload({
		allowedFileTypes: ['image'],
		uploadQueueAtom: coverUploadQueueAtom,
		maxFiles: 1,
		maxSize: 10 * 1024 * 1024, // 10MB
		folder: 'vip-covers',
	});

	const {
		isPendingPresigns: isPendingPresignsCover,
		uploading: uploadingCover,
		handleSubmit: handleCoverUpload,
		uploadQueue: coverUploadQueue,
		setUploadQueue: setCoverUploadQueue,
	} = coverUploadState;

	/* modal */
	const showVipModal = mode === 'create' ? showCreateModal : showUpdateModal;
	const setShowVipModal = mode === 'create' ? setShowCreateModal : setShowUpdateModal;

	const handleCloseModal = useCallback(async () => {
		focusGridList();
		setAudioUploadQueue([]);
		setCoverUploadQueue([]);
		await queryClient.invalidateQueries(trpc.vipSwap.byWorkspace.pathFilter());
		form.reset();
		await setShowVipModal(false);
	}, [
		form,
		focusGridList,
		queryClient,
		trpc.vipSwap,
		setShowVipModal,
		setAudioUploadQueue,
		setCoverUploadQueue,
	]);

	/* form submit */
	const handleSubmit = useCallback(
		async (data: z.infer<typeof upsertVipSwapSchema>) => {
			const newFileId = audioUploadQueue[0]?.presigned?.fileRecord.id;

			// For create mode, a new file is required
			if (mode === 'create' && !newFileId) {
				return;
			}

			const newCoverImageId = coverUploadQueue[0]?.presigned?.fileRecord.id;

			// Handle downloadLimit - set to null if limitDownloads is false
			const limitDownloads = form.watch('limitDownloads');
			const downloadLimit = limitDownloads ? data.downloadLimit : null;

			const upsertVipSwapData: UpsertVipSwap = {
				...data,
				fileId: newFileId ?? data.fileId,
				coverImageId: newCoverImageId ?? data.coverImageId ?? null,
				downloadLimit,
			};

			// Upload both files in parallel
			await Promise.all([
				handleAudioUpload(),
				coverUploadQueue.length ? handleCoverUpload() : Promise.resolve(),
			]);
			await onSubmit(upsertVipSwapData);
		},
		[
			audioUploadQueue,
			coverUploadQueue,
			handleAudioUpload,
			handleCoverUpload,
			onSubmit,
			form,
			mode,
		],
	);

	const submitDisabled =
		isPendingPresignsAudio ||
		uploadingAudio ||
		isPendingPresignsCover ||
		uploadingCover ||
		(mode === 'create' && !audioUploadQueue.length) ||
		(mode === 'update' &&
			!form.formState.isDirty &&
			!audioUploadQueue.length &&
			!coverUploadQueue.length);

	// Check if we have existing files
	const existingFileName = selectedVipSwap?.file.name;

	// Cover image preview
	const coverImagePreviewS3Key = selectedVipSwap?.coverImage?.s3Key;
	const coverImagePreviewBlurDataUrl = selectedVipSwap?.coverImage?.blurDataUrl;
	const coverImagePreview =
		coverUploadQueue[0]?.previewImage ??
		(mode === 'update' && selectedVipSwap?.coverImage?.src ?
			selectedVipSwap.coverImage.src
		:	'');

	return (
		<Modal
			showModal={showVipModal}
			setShowModal={setShowVipModal}
			preventDefaultClose={form.formState.isDirty}
			onClose={handleCloseModal}
		>
			<ModalHeader
				icon='vipSwap'
				title={
					mode === 'update' ? `Update ${selectedVipSwap?.name ?? ''}` : 'Create VIP Swap'
				}
			/>

			<Form form={form} onSubmit={handleSubmit}>
				<ModalBody>
					<TextField label='Name' control={form.control} name='name' />
					<TextField
						label='Key'
						control={form.control}
						name='key'
						onChange={e => {
							form.setValue('key', sanitizeKey(e.target.value), { shouldDirty: true });
						}}
					/>

					<div className='flex flex-col items-start gap-1'>
						<Label>Cover Image</Label>
						<UploadDropzone
							{...coverUploadState}
							title='Upload cover image'
							imagePreviewSrc={coverImagePreview}
							existingImageS3Key={coverImagePreviewS3Key}
							existingImageBlurDataUrl={coverImagePreviewBlurDataUrl}
						/>
					</div>

					<div className='flex flex-col items-start gap-1'>
						<Label>Audio File {mode === 'create' && '*'}</Label>
						{existingFileName && mode === 'update' && !audioUploadQueue.length && (
							<div className='mb-2 text-sm text-muted-foreground'>
								Current file: {existingFileName}
							</div>
						)}
						<UploadDropzone
							{...audioUploadState}
							title={
								audioUploadQueue.length > 0 ? 'Audio file selected' : 'Upload audio file'
							}
							subtitle={
								audioUploadQueue.length > 0 ?
									'Replace file by dropping a new one'
								:	undefined
							}
							className='h-28 w-full'
						/>
						{audioUploadQueue.length > 0 && (
							<div className='mt-2 w-full'>
								<UploadQueueList uploadQueue={audioUploadState.uploadQueue} />
							</div>
						)}
					</div>

					<div className='space-y-4 border-t pt-4'>
						<Label>Email Capture Settings</Label>
						<TextField
							label='Email Capture Title'
							control={form.control}
							name='emailCaptureTitle'
							placeholder='Get exclusive access'
						/>
						<TextField
							label='Email Capture Description'
							control={form.control}
							name='emailCaptureDescription'
							placeholder='Enter your email to download'
						/>
						<TextField
							label='Email Field Label'
							control={form.control}
							name='emailCaptureLabel'
							placeholder='Email address'
						/>
					</div>

					<div className='space-y-4 border-t pt-4'>
						<Label>Download Email Settings</Label>
						<TextField
							label='Download Title'
							control={form.control}
							name='downloadTitle'
							placeholder='Your download is ready!'
						/>
						<TextField
							label='Email From Name'
							control={form.control}
							name='emailFromName'
							placeholder='Artist Name'
						/>
						<TextField
							label='Email Subject'
							control={form.control}
							name='emailSubject'
							placeholder="Here's your exclusive download"
						/>
						<TextAreaField
							label='Email Body'
							control={form.control}
							name='emailBody'
							placeholder='Thanks for your interest! Click the link below to download.'
							rows={4}
						/>
					</div>

					<div className='space-y-4 border-t pt-4'>
						<Label>Security Settings</Label>
						<SwitchField
							control={form.control}
							name='limitDownloads'
							label='Limit Downloads'
						/>
						{form.watch('limitDownloads') && (
							<NumberField
								label='Maximum downloads per email'
								control={form.control}
								name='downloadLimit'
								min={1}
								placeholder='1'
							/>
						)}
						<SwitchField
							control={form.control}
							name='passwordProtected'
							label='Password Protected'
						/>
						{form.watch('passwordProtected') && (
							<TextField
								label='Password'
								control={form.control}
								name='password'
								type='password'
							/>
						)}
						<SwitchField control={form.control} name='isActive' label='Active' />
					</div>
				</ModalBody>
				<ModalFooter>
					<SubmitButton disabled={submitDisabled} fullWidth>
						{mode === 'update' ? 'Save VIP Swap' : 'Create VIP Swap'}
					</SubmitButton>
				</ModalFooter>
			</Form>
		</Modal>
	);
}

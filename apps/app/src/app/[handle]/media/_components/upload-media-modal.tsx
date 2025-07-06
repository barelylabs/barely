'use client';

import type { UploadQueueItem } from '@barely/hooks';
import { useUpload } from '@barely/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { atom } from 'jotai';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Button } from '@barely/ui/button';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@barely/ui/modal';
import { UploadDropzone, UploadQueue } from '@barely/ui/upload';

import { useMediaSearchParams } from '~/app/[handle]/media/_components/media-context';

const mediaUploadQueueAtom = atom<UploadQueueItem[]>([]);

export function UploadMediaModal() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const { showCreateModal, setShowCreateModal } = useMediaSearchParams();

	const mediaUploadState = useUpload({
		uploadQueueAtom: mediaUploadQueueAtom,
		allowedFileTypes: ['image', 'audio', 'video'],
		maxFiles: 50,
		onUploadComplete: async () => {
			await queryClient.invalidateQueries(trpc.file.byWorkspace.queryFilter());
			await setShowCreateModal(false);
		},
	});

	const { isPendingPresigns, uploadQueue, uploading, handleSubmit } = mediaUploadState;

	return (
		<Modal
			showModal={showCreateModal}
			setShowModal={show => {
				void setShowCreateModal(show);
			}}
			className='w-full'
		>
			<ModalHeader title='Upload Media' icon='media' />
			<ModalBody>
				{!mediaUploadState.uploadQueue.length ?
					<UploadDropzone
						{...mediaUploadState}
						title='Drop files here, or click to select files'
						className='h-[430px] w-full'
					/>
				:	<UploadQueue className='h-[430px]' uploadState={mediaUploadState} />}
			</ModalBody>

			<ModalFooter>
				<Button
					onClick={() => handleSubmit()}
					disabled={uploadQueue.length === 0 || isPendingPresigns || uploading}
					fullWidth
				>
					Upload
				</Button>
			</ModalFooter>
		</Modal>
	);
}

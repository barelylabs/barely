'use client';

import type { UploadQueueItem } from '@barely/lib/hooks/use-upload';
import { useUpload } from '@barely/lib/hooks/use-upload';
import { api } from '@barely/lib/server/api/react';
import { atom } from 'jotai';

import { Button } from '@barely/ui/elements/button';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@barely/ui/elements/modal';
import { UploadDropzone, UploadQueue } from '@barely/ui/elements/upload';

import { useMediaContext } from '~/app/[handle]/media/_components/media-context';

const mediaUploadQueueAtom = atom<UploadQueueItem[]>([]);

export function UploadMediaModal() {
	const apiUtils = api.useUtils();

	const { showCreateModal, setShowCreateModal } = useMediaContext();

	const mediaUploadState = useUpload({
		uploadQueueAtom: mediaUploadQueueAtom,
		allowedFileTypes: ['image', 'audio', 'video'],
		maxFiles: 50,
		onUploadComplete: async () => {
			await apiUtils.file.invalidate();
			setShowCreateModal(false);
		},
	});

	const { isPendingPresigns, uploadQueue, uploading, handleSubmit } = mediaUploadState;

	return (
		<Modal
			showModal={showCreateModal}
			setShowModal={setShowCreateModal}
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

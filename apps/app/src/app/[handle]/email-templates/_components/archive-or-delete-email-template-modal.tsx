'use client';

import { useCallback } from 'react';
import { api } from '@barely/lib/server/api/react';

import { ArchiveOrDeleteModal } from '~/app/[handle]/_components/archive-or-delete-modal';
import { useEmailTemplateContext } from './email-template-context';

export function ArchiveOrDeleteEmailTemplateModal({
	mode,
}: {
	mode: 'archive' | 'delete';
}) {
	const {
		selection,
		lastSelectedItem,
		showArchiveModal,
		showDeleteModal,
		setShowArchiveModal,
		setShowDeleteModal,
	} = useEmailTemplateContext();

	const apiUtils = api.useUtils();

	const showModal = mode === 'archive' ? showArchiveModal : showDeleteModal;

	const setShowModal = mode === 'archive' ? setShowArchiveModal : setShowDeleteModal;

	const onSuccess = useCallback(async () => {
		await apiUtils.emailTemplate.invalidate();
		setShowModal(false);
	}, [apiUtils.emailTemplate, setShowModal]);

	const { mutate: archiveEmailTemplates, isPending: isPendingArchive } =
		api.emailTemplate.archive.useMutation({ onSuccess });

	const { mutate: deleteEmailTemplates, isPending: isPendingDelete } =
		api.emailTemplate.delete.useMutation({
			onSuccess,
		});

	if (!lastSelectedItem) return null;

	return (
		<ArchiveOrDeleteModal
			mode={mode}
			selection={selection}
			lastSelected={{
				...lastSelectedItem,
				name: lastSelectedItem.name,
			}}
			showModal={showModal}
			setShowModal={setShowModal}
			archiveItems={archiveEmailTemplates}
			deleteItems={deleteEmailTemplates}
			isPendingArchive={isPendingArchive}
			isPendingDelete={isPendingDelete}
			itemName='emailTemplate'
		/>
	);
}

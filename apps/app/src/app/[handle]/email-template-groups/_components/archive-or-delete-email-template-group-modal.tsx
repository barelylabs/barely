'use client';

import { useCallback } from 'react';
import { api } from '@barely/lib/server/api/react';

import { ArchiveOrDeleteModal } from '~/app/[handle]/_components/archive-or-delete-modal';
import { useEmailTemplateGroupContext } from './email-template-group-context';

export function ArchiveOrDeleteEmailTemplateGroupModal({
	mode,
}: {
	mode: 'archive' | 'delete';
}) {
	const {
		emailTemplateGroupSelection,
		lastSelectedEmailTemplateGroup,
		showArchiveEmailTemplateGroupModal,
		showDeleteEmailTemplateGroupModal,
		setShowArchiveEmailTemplateGroupModal,
		setShowDeleteEmailTemplateGroupModal,
	} = useEmailTemplateGroupContext();

	const apiUtils = api.useUtils();

	const showModal =
		mode === 'archive' ?
			showArchiveEmailTemplateGroupModal
		:	showDeleteEmailTemplateGroupModal;

	const setShowModal =
		mode === 'archive' ?
			setShowArchiveEmailTemplateGroupModal
		:	setShowDeleteEmailTemplateGroupModal;

	const onSuccess = useCallback(async () => {
		await apiUtils.emailTemplateGroup.invalidate();
		setShowModal(false);
	}, [apiUtils.emailTemplateGroup, setShowModal]);

	const { mutate: archiveEmailTemplateGroups, isPending: isPendingArchive } =
		api.emailTemplateGroup.archive.useMutation({ onSuccess });

	const { mutate: deleteEmailTemplateGroups, isPending: isPendingDelete } =
		api.emailTemplateGroup.delete.useMutation({
			onSuccess,
		});

	if (!lastSelectedEmailTemplateGroup) return null;

	return (
		<ArchiveOrDeleteModal
			mode={mode}
			selection={emailTemplateGroupSelection}
			lastSelected={{
				...lastSelectedEmailTemplateGroup,
				name: lastSelectedEmailTemplateGroup.name,
			}}
			showModal={showModal}
			setShowModal={setShowModal}
			archiveItems={archiveEmailTemplateGroups}
			deleteItems={deleteEmailTemplateGroups}
			isPendingArchive={isPendingArchive}
			isPendingDelete={isPendingDelete}
			itemName='emailTemplateGroup'
		/>
	);
}

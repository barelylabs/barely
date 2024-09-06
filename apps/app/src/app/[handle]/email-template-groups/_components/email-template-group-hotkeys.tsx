'use client';

import { useModalHotKeys } from '@barely/lib/hooks/use-modal-hot-keys';

import { useEmailTemplateGroupContext } from './email-template-group-context';

export function EmailTemplateGroupHotkeys() {
	const {
		emailTemplateGroupSelection,
		setShowCreateEmailTemplateGroupModal,
		setShowUpdateEmailTemplateGroupModal,
		setShowArchiveEmailTemplateGroupModal,
		setShowDeleteEmailTemplateGroupModal,
	} = useEmailTemplateGroupContext();

	useModalHotKeys({
		setShowCreateModal: setShowCreateEmailTemplateGroupModal,
		setShowUpdateModal: setShowUpdateEmailTemplateGroupModal,
		setShowArchiveModal: setShowArchiveEmailTemplateGroupModal,
		setShowDeleteModal: setShowDeleteEmailTemplateGroupModal,
		itemSelected:
			emailTemplateGroupSelection !== 'all' && !!emailTemplateGroupSelection.size,
	});

	return null;
}

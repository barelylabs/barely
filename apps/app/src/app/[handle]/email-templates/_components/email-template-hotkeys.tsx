'use client';

import { useModalHotKeys } from '@barely/lib/hooks/use-modal-hot-keys';

import { useEmailTemplateContext } from './email-template-context';

export function EmailTemplateHotkeys() {
	const {
		emailTemplateSelection,
		setShowCreateEmailTemplateModal,
		setShowUpdateEmailTemplateModal,
		setShowArchiveEmailTemplateModal,
		setShowDeleteEmailTemplateModal,
	} = useEmailTemplateContext();

	useModalHotKeys({
		setShowCreateModal: setShowCreateEmailTemplateModal,
		setShowUpdateModal: setShowUpdateEmailTemplateModal,
		setShowArchiveModal: setShowArchiveEmailTemplateModal,
		setShowDeleteModal: setShowDeleteEmailTemplateModal,
		itemSelected: emailTemplateSelection !== 'all' && !!emailTemplateSelection.size,
	});

	return null;
}

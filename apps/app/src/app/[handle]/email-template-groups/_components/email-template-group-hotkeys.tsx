'use client';

import { useModalHotKeys } from '@barely/hooks';

import { useEmailTemplateGroupContext } from './email-template-group-context';

export function EmailTemplateGroupHotkeys() {
	const {
		selection,
		setShowCreateModal,
		setShowUpdateModal,
		setShowArchiveModal,
		setShowDeleteModal,
	} = useEmailTemplateGroupContext();

	useModalHotKeys({
		setShowCreateModal,
		setShowUpdateModal,
		setShowArchiveModal,
		setShowDeleteModal,
		itemSelected: selection !== 'all' && !!selection.size,
	});

	return null;
}

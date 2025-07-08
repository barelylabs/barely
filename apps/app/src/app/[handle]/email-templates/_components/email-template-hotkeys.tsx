'use client';

import { useModalHotKeys } from '@barely/hooks';

import { useEmailTemplate, useEmailTemplateSearchParams } from './email-template-context';

export function EmailTemplateHotkeys() {
	const { selection } = useEmailTemplate();
	const {
		setShowCreateModal,
		setShowUpdateModal,
		setShowArchiveModal,
		setShowDeleteModal,
	} = useEmailTemplateSearchParams();

	useModalHotKeys({
		setShowCreateModal,
		setShowUpdateModal,
		setShowArchiveModal,
		setShowDeleteModal,
		itemSelected: selection !== 'all' && !!selection.size,
	});

	return null;
}

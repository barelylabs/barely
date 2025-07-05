'use client';

import { useModalHotKeys } from '@barely/hooks';

import { useEmailTemplateContext } from './email-template-context';

export function EmailTemplateHotkeys() {
	const {
		selection,
		setShowCreateModal,
		setShowUpdateModal,
		setShowArchiveModal,
		setShowDeleteModal,
	} = useEmailTemplateContext();

	useModalHotKeys({
		setShowCreateModal,
		setShowUpdateModal,
		setShowArchiveModal,
		setShowDeleteModal,
		itemSelected: selection !== 'all' && !!selection.size,
	});

	return null;
}

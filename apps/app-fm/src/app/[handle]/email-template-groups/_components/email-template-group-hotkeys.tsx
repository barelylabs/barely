'use client';

import { useModalHotKeys } from '@barely/hooks';

import {
	useEmailTemplateGroup,
	useEmailTemplateGroupSearchParams,
} from './email-template-group-context';

export function EmailTemplateGroupHotkeys() {
	const { selection } = useEmailTemplateGroup();
	const {
		setShowCreateModal,
		setShowUpdateModal,
		setShowArchiveModal,
		setShowDeleteModal,
	} = useEmailTemplateGroupSearchParams();

	useModalHotKeys({
		setShowCreateModal,
		setShowUpdateModal,
		setShowArchiveModal,
		setShowDeleteModal,
		itemSelected: selection !== 'all' && !!selection.size,
	});

	return null;
}

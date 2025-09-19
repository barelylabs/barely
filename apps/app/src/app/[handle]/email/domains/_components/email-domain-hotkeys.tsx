'use client';

import { useModalHotKeys } from '@barely/hooks';

import { useEmailDomainSearchParams } from './email-domain-context';

export function EmailDomainHotkeys() {
	const { selection } = useEmailDomainSearchParams();
	const {
		setShowArchiveModal,
		setShowDeleteModal,
		setShowCreateModal,
		setShowUpdateModal,
	} = useEmailDomainSearchParams();

	useModalHotKeys({
		setShowCreateModal,
		setShowUpdateModal,
		setShowArchiveModal,
		setShowDeleteModal,
		itemSelected: selection !== 'all' && !!selection.size,
	});

	return null;
}

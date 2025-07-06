'use client';

import { useModalHotKeys } from '@barely/hooks';

import { useEmailAddress, useEmailAddressSearchParams } from './email-address-context';

export function EmailAddressHotkeys() {
	const { selection } = useEmailAddress();
	const { setShowCreateModal, setShowUpdateModal, setShowDeleteModal } =
		useEmailAddressSearchParams();

	useModalHotKeys({
		setShowCreateModal,
		setShowUpdateModal,
		setShowDeleteModal,
		itemSelected: selection !== 'all' && !!selection.size,
	});

	return null;
}

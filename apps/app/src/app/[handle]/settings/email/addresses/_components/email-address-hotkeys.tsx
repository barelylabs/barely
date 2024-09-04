'use client';

import { useModalHotKeys } from '@barely/lib/hooks/use-modal-hot-keys';

import { useEmailAddressContext } from './email-address-context';

export function EmailAddressHotkeys() {
	const {
		emailAddressSelection,
		setShowCreateEmailAddressModal,
		setShowUpdateEmailAddressModal,
		setShowDeleteEmailAddressModal,
	} = useEmailAddressContext();

	useModalHotKeys({
		setShowCreateModal: setShowCreateEmailAddressModal,
		setShowUpdateModal: setShowUpdateEmailAddressModal,
		setShowDeleteModal: setShowDeleteEmailAddressModal,
		itemSelected: emailAddressSelection !== 'all' && !!emailAddressSelection.size,
	});

	return null;
}

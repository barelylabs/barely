'use client';

import { useModalHotKeys } from '@barely/lib/hooks/use-modal-hot-keys';

import { useEmailDomainContext } from './email-domain-context';

export function EmailDomainHotkeys() {
	const {
		emailDomainSelection,
		setShowCreateEmailDomainModal,
		setShowUpdateEmailDomainModal,
		setShowDeleteEmailDomainModal,
	} = useEmailDomainContext();

	useModalHotKeys({
		setShowCreateModal: setShowCreateEmailDomainModal,
		setShowUpdateModal: setShowUpdateEmailDomainModal,
		setShowDeleteModal: setShowDeleteEmailDomainModal,
		itemSelected: emailDomainSelection !== 'all' && !!emailDomainSelection.size,
	});

	return null;
}

'use client';

import { useModalHotKeys } from '@barely/hooks';

import {
	useLandingPage,
	useLandingPageSearchParams,
} from '~/app/[handle]/pages/_components/landing-page-context';

export function LandingPageHotkeys() {
	const { selection } = useLandingPage();
	const {
		setShowCreateModal,
		// setShowUpdateModal,
		setShowArchiveModal,
		setShowDeleteModal,
	} = useLandingPageSearchParams();

	useModalHotKeys({
		setShowCreateModal: setShowCreateModal,
		// setShowUpdateModal: setShowUpdateModal,
		setShowArchiveModal: setShowArchiveModal,
		setShowDeleteModal: setShowDeleteModal,
		itemSelected: selection !== 'all' && !!selection.size,
	});

	return null;
}

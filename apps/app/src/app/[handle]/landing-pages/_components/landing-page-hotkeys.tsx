'use client';

import { useModalHotKeys } from '@barely/lib/hooks/use-modal-hot-keys';

import { useLandingPageContext } from '~/app/[handle]/landing-pages/_components/landing-page-context';

export function LandingPageHotkeys() {
	const {
		landingPageSelection,
		setShowCreateLandingPageModal,
		setShowUpdateLandingPageModal,
		setShowArchiveLandingPageModal,
		setShowDeleteLandingPageModal,
	} = useLandingPageContext();

	useModalHotKeys({
		setShowCreateModal: setShowCreateLandingPageModal,
		setShowUpdateModal: setShowUpdateLandingPageModal,
		setShowArchiveModal: setShowArchiveLandingPageModal,
		setShowDeleteModal: setShowDeleteLandingPageModal,
		itemSelected: landingPageSelection !== 'all' && !!landingPageSelection.size,
	});

	return null;
}

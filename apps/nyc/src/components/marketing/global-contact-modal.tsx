'use client';

import { useContactModal } from '../../contexts/contact-modal-context';
import { useFormData } from '../../contexts/form-data-context';
import { ContactModal } from './contact-modal';

export function GlobalContactModal() {
	const { isOpen, close } = useContactModal();
	const { formData } = useFormData();

	return (
		<ContactModal
			showModal={isOpen}
			setShowModal={close}
			prefillData={{
				name: formData.name,
				email: formData.email,
				artistName: formData.artistName ?? formData.bandName,
				monthlyListeners: formData.monthlyListeners,
				instagramHandle: formData.instagramHandle,
				spotifyTrackUrl: formData.spotifyTrackUrl,
				budgetRange: formData.budgetRange,
				goals: formData.goals,
			}}
		/>
	);
}

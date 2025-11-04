'use client';

import { useContactModal } from '../../contexts/contact-modal-context';
import { useFormData } from '../../contexts/form-data-context';
import { ContactModal } from './contact-modal';

export function GlobalContactModal() {
	const { isOpen, close } = useContactModal();
	const { formData, clearFormData } = useFormData();

	// Custom close handler that also clears form data
	const handleClose = (shouldClose: boolean) => {
		if (!shouldClose) {
			close();
			// Clear the stored form data after successful use
			clearFormData();
		}
	};

	return (
		<ContactModal
			showModal={isOpen}
			setShowModal={handleClose}
			prefillData={{
				name: formData.name,
				email: formData.email,
				artistName: formData.artistName ?? formData.bandName,
				monthlyListeners: formData.monthlyListeners,
				instagramHandle: formData.instagramHandle,
				spotifyTrackUrl: formData.spotifyTrackUrl,
				budgetRange: formData.budgetRange,
			}}
		/>
	);
}

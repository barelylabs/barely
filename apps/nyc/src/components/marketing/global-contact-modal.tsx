'use client';

import { useContactModal } from '../../contexts/contact-modal-context';
import { ContactModal } from './contact-modal';

export function GlobalContactModal() {
	const { isOpen, close } = useContactModal();

	return <ContactModal showModal={isOpen} setShowModal={close} />;
}

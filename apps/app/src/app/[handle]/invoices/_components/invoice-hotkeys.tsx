'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export function InvoiceHotkeys() {
	const router = useRouter();
	const params = useParams();
	const handle = params.handle as string;

	useEffect(() => {
		const handleKeyPress = (event: KeyboardEvent) => {
			// Check if user is typing in an input field
			if (
				event.target instanceof HTMLInputElement ||
				event.target instanceof HTMLTextAreaElement
			) {
				return;
			}

			// Cmd/Ctrl + N to create new invoice
			if ((event.metaKey || event.ctrlKey) && event.key === 'n') {
				event.preventDefault();
				router.push(`/${handle}/invoices/new`);
			}

			// Cmd/Ctrl + Shift + C to go to clients
			if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'c') {
				event.preventDefault();
				router.push(`/${handle}/invoices/clients`);
			}
		};

		window.addEventListener('keydown', handleKeyPress);
		return () => window.removeEventListener('keydown', handleKeyPress);
	}, [handle, router]);

	return null;
}

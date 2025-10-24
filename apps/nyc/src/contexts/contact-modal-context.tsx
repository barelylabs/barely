'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';

interface ContactModalContextType {
	isOpen: boolean;
	open: () => void;
	close: () => void;
	toggle: () => void;
}

const ContactModalContext = createContext<ContactModalContextType | undefined>(undefined);

export function ContactModalProvider({ children }: { children: ReactNode }) {
	const [isOpen, setIsOpen] = useState(false);

	const open = () => setIsOpen(true);
	const close = () => setIsOpen(false);
	const toggle = () => setIsOpen(prev => !prev);

	return (
		<ContactModalContext.Provider value={{ isOpen, open, close, toggle }}>
			{children}
		</ContactModalContext.Provider>
	);
}

export function useContactModal() {
	const context = useContext(ContactModalContext);
	if (context === undefined) {
		throw new Error('useContactModal must be used within a ContactModalProvider');
	}
	return context;
}

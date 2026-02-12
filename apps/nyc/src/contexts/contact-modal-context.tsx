'use client';

import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useState } from 'react';

export type ServiceInterest = 'bedroom' | 'rising' | 'breakout' | 'stan' | '';

interface OpenOptions {
	service?: ServiceInterest;
	stanAddon?: boolean;
}

interface ContactModalContextType {
	isOpen: boolean;
	selectedService: ServiceInterest;
	stanAddon: boolean;
	open: (options?: OpenOptions) => void;
	close: () => void;
	toggle: () => void;
}

const ContactModalContext = createContext<ContactModalContextType | undefined>(undefined);

export function ContactModalProvider({ children }: { children: ReactNode }) {
	const [isOpen, setIsOpen] = useState(false);
	const [selectedService, setSelectedService] = useState<ServiceInterest>('');
	const [stanAddon, setStanAddon] = useState(false);

	const open = useCallback((options?: OpenOptions) => {
		setSelectedService(options?.service ?? '');
		setStanAddon(options?.stanAddon ?? false);
		setIsOpen(true);
	}, []);

	const close = useCallback(() => {
		setIsOpen(false);
		// Reset state after modal closes
		setSelectedService('');
		setStanAddon(false);
	}, []);

	const toggle = useCallback(() => setIsOpen(prev => !prev), []);

	return (
		<ContactModalContext.Provider
			value={{ isOpen, selectedService, stanAddon, open, close, toggle }}
		>
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

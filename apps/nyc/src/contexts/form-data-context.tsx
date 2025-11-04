'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';

interface FormData {
	// Basic info
	artistName?: string;
	bandName?: string;
	email?: string;

	// Social/platform info
	spotifyTrackUrl?: string;
	instagramHandle?: string;

	// Business info
	monthlyListeners?: string;
	budgetRange?: '<$500/mo' | '$500-1k' | '$1k-2.5k' | '$2.5k+' | 'Not sure yet';
	goals?: string;

	// Additional info from contact form
	name?: string;
	service?: 'bedroom' | 'rising' | 'breakout' | '';
	message?: string;
}

interface FormDataContextType {
	formData: FormData;
	updateFormData: (data: Partial<FormData>) => void;
	clearFormData: () => void;
}

const FormDataContext = createContext<FormDataContextType | undefined>(undefined);

export function FormDataProvider({ children }: { children: ReactNode }) {
	const [formData, setFormData] = useState<FormData>({});

	const updateFormData = (data: Partial<FormData>) => {
		setFormData(prev => ({ ...prev, ...data }));
	};

	const clearFormData = () => {
		setFormData({});
	};

	return (
		<FormDataContext.Provider value={{ formData, updateFormData, clearFormData }}>
			{children}
		</FormDataContext.Provider>
	);
}

export function useFormData() {
	const context = useContext(FormDataContext);
	if (context === undefined) {
		throw new Error('useFormData must be used within a FormDataProvider');
	}
	return context;
}

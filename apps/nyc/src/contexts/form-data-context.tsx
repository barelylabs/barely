'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

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

const STORAGE_KEY = 'barelynyc_form_data';

export function FormDataProvider({ children }: { children: ReactNode }) {
	const [formData, setFormData] = useState<FormData>(() => {
		// Initialize from localStorage if available
		if (typeof window !== 'undefined') {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				try {
					return JSON.parse(stored) as FormData;
				} catch {
					return {};
				}
			}
		}
		return {};
	});

	// Persist to localStorage whenever formData changes
	useEffect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
		}
	}, [formData]);

	const updateFormData = (data: Partial<FormData>) => {
		setFormData(prev => ({ ...prev, ...data }));
	};

	const clearFormData = () => {
		setFormData({});
		if (typeof window !== 'undefined') {
			localStorage.removeItem(STORAGE_KEY);
		}
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

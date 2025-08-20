'use client';

import type { Bio, BioLink } from '@barely/validators';
import React, { createContext, useContext } from 'react';

export type BioOnLinkClick = (
	link: BioLink & { blockId: string; lexoRank: string },
) => void | Promise<void>;
export type BioOnEmailCapture = (
	email: string,
	marketingConsent: boolean,
) => Promise<{ success: boolean; message: string }>;
export type BioOnPageView = () => void | Promise<void>;

interface BioContextValue {
	bio: Bio;
	isPreview?: boolean;
	onLinkClick: null | BioOnLinkClick;
	onEmailCapture: null | BioOnEmailCapture;
	onPageView: null | BioOnPageView;
}

const BioContext = createContext<BioContextValue | undefined>(undefined);

export function BioProvider(v: {
	bio: Bio;
	children: React.ReactNode;
	isPreview: boolean;
	onLinkClick: null | BioOnLinkClick;
	onEmailCapture: null | BioOnEmailCapture;
	onPageView: null | BioOnPageView;
}) {
	const { children, ...value } = v;
	return <BioContext.Provider value={value}>{children}</BioContext.Provider>;
}

export function useBioContext() {
	const context = useContext(BioContext);
	if (!context) {
		throw new Error('useBio must be used within a BioProvider');
	}
	return context;
}

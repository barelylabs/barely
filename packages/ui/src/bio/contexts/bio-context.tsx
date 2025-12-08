'use client';

import type { BioBlockType } from '@barely/const';
import type {
	Bio,
	BioLink,
	BioTrackingData,
	CartFunnel,
	FmPage,
	Link,
} from '@barely/validators';
import React, { createContext, useContext } from 'react';

export interface BioBlockContext {
	blockId: string;
	blockType: BioBlockType;
	blockIndex: number;
	linkIndex: number;
	// targets
	targetLinkId?: string;
	targetCartFunnelId?: string;
	targetFmId?: string;
	targetUrl?: string;
	targetBioId?: string;
}

export type BioOnLinkClick = (
	link: BioLink,
	context?: BioBlockContext,
) => void | Promise<void>;

export type BioOnContactCapture = (data: {
	bioId: string;
	blockId?: string; // Optional for backwards compatibility with legacy forms
	email?: string;
	phone?: string;
	marketingConsent: boolean;
	smsMarketingConsent: boolean;
}) => Promise<{ success: boolean; message: string }>;

// Legacy alias for backwards compatibility
export type BioOnEmailCapture = BioOnContactCapture;

export type BioOnPageView = () => void | Promise<void>;

export type BioOnTargetCartFunnelClick = (
	cartFunnel: CartFunnel,
	context?: BioBlockContext,
) => void | Promise<void>;

export type BioOnTargetFmClick = (
	fm: FmPage,
	context?: BioBlockContext,
) => void | Promise<void>;

export type BioOnTargetLinkClick = (
	link: Link,
	context?: BioBlockContext,
) => void | Promise<void>;

export type BioOnTargetBioClick = (
	bio: Bio,
	context?: BioBlockContext,
) => void | Promise<void>;

export type BioOnTargetUrlClick = (
	url: string,
	context?: BioBlockContext,
) => void | Promise<void>;

interface BioContextValue {
	bio: Bio;
	isPreview?: boolean;
	tracking?: BioTrackingData;
	onLinkClick: null | BioOnLinkClick;
	onTargetBioClick: null | BioOnTargetBioClick;
	onTargetLinkClick: null | BioOnTargetLinkClick;
	onTargetCartFunnelClick: null | BioOnTargetCartFunnelClick;
	onTargetFmClick: null | BioOnTargetFmClick;
	onTargetUrlClick: null | BioOnTargetUrlClick;
	onEmailCapture: null | BioOnEmailCapture;
}

const BioContext = createContext<BioContextValue | undefined>(undefined);

export function BioProvider(v: BioContextValue & { children: React.ReactNode }) {
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

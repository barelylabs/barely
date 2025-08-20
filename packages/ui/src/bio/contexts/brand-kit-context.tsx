'use client';

import type { PublicBrandKit } from '@barely/validators';
import React, { createContext, useContext } from 'react';

type BrandKitContextValue = PublicBrandKit;

const BrandKitContext = createContext<BrandKitContextValue | undefined>(undefined);

export function BrandKitProvider({
	brandKit,
	children,
}: {
	brandKit: PublicBrandKit;
	children: React.ReactNode;
}) {
	return <BrandKitContext.Provider value={brandKit}>{children}</BrandKitContext.Provider>;
}

export function useBrandKit() {
	const context = useContext(BrandKitContext);
	if (!context) {
		throw new Error('useBrandKit must be used within a BrandKitProvider');
	}
	return context;
}

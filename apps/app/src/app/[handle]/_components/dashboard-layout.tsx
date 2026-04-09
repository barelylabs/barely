'use client';

import type { Dispatch, PropsWithChildren, SetStateAction } from 'react';
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useCurrentApp, useMediaQuery, useWorkspace } from '@barely/hooks';
import { cn, getAvailableProducts } from '@barely/utils';

import { ContextSidebar } from './context-sidebar';
import { ProductSidebar } from './product-sidebar';

const SIDEBAR_COOKIE_NAME = 'sidebar-expanded';
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

interface SideNavContext {
	isOpen: boolean;
	setIsOpen: Dispatch<SetStateAction<boolean>>;
	sidebarExpanded: boolean;
	toggleSidebar: () => void;
}

export const SideNavContext = createContext<SideNavContext>({
	isOpen: false,
	setIsOpen: () => void 0,
	sidebarExpanded: true,
	toggleSidebar: () => void 0,
});

interface DashboardLayoutProps extends PropsWithChildren {
	initialSidebarExpanded?: boolean;
}

export function DashboardLayout({
	children,
	initialSidebarExpanded = true,
}: DashboardLayoutProps) {
	const pathname = usePathname();
	const { handle } = useWorkspace();
	const { features } = useCurrentApp();
	const { isMobile } = useMediaQuery();
	const [isOpen, setIsOpen] = useState(false);
	const [sidebarExpanded, setSidebarExpanded] = useState(initialSidebarExpanded);

	const toggleSidebar = useCallback(() => {
		setSidebarExpanded(prev => {
			const next = !prev;
			document.cookie = `${SIDEBAR_COOKIE_NAME}=${String(next)}; path=/; max-age=${String(SIDEBAR_COOKIE_MAX_AGE)}; SameSite=Lax`;
			return next;
		});
	}, []);

	// Get available products
	const { core, meta } = useMemo(() => getAvailableProducts(features), [features]);

	// Determine active product based on current pathname
	const activeProductId = useMemo(() => {
		const path = pathname.replace(`/${handle}`, '');

		// Check if we're in settings
		if (path.startsWith('/settings')) {
			return 'settings';
		}

		// Check each product's routes
		const allProducts = [...core, ...meta];
		for (const product of allProducts) {
			if (product.routes.some(route => path.startsWith(route.path))) {
				return product.id;
			}
		}

		// Default to first available product
		return core[0]?.id ?? 'fm';
	}, [pathname, handle, core, meta]);

	// Prevent body scroll when side nav is open on mobile
	useEffect(() => {
		if (typeof document !== 'undefined') {
			document.body.style.overflow = isOpen && isMobile ? 'hidden' : 'auto';
		}
	}, [isOpen, isMobile]);

	// Close side nav when pathname changes
	useEffect(() => {
		setIsOpen(false);
	}, [pathname]);

	return (
		<SideNavContext.Provider value={{ isOpen, setIsOpen, sidebarExpanded, toggleSidebar }}>
			{/* Mobile backdrop for drawer */}
			<div
				className={cn(
					'fixed left-0 top-0 z-50 h-dvh w-screen transition-[background-color,backdrop-filter] md:hidden',
					isOpen ? 'bg-black/20 backdrop-blur-sm' : 'pointer-events-none bg-transparent',
				)}
				onClick={e => {
					if (e.target === e.currentTarget) {
						e.stopPropagation();
						setIsOpen(false);
					}
				}}
			/>

			{/* Sidebars - shared for mobile drawer and desktop, positioned differently with breakpoints */}
			<div
				className={cn(
					// Mobile: inside drawer, can slide - always 300px
					'fixed left-0 top-0 z-50 flex h-full w-[300px] max-w-full transition-transform md:transition-none',
					!isOpen && '-translate-x-full',
					// Desktop: always visible, no translation, width transitions for collapse
					'md:translate-x-0 md:transition-[width] md:duration-200 md:ease-in-out',
					sidebarExpanded ? 'md:w-[300px]' : 'md:w-16',
				)}
			>
				<ProductSidebar />
				<ContextSidebar productId={activeProductId} />
			</div>

			{/* Main layout - responsive with breakpoints */}
			<div
				className={cn(
					'flex min-h-screen w-full flex-col bg-accent transition-[margin-left] duration-200 ease-in-out',
					sidebarExpanded ?
						'md:ml-[300px] md:w-[calc(100vw-300px)]'
					:	'md:ml-16 md:w-[calc(100vw-4rem)]',
				)}
			>
				{/* Main content area - responsive styling */}
				<div className='flex h-screen flex-col bg-accent md:p-0 md:pt-2'>
					<div className='flex flex-1 flex-col overflow-x-hidden rounded-tl-xl md:rounded-tl-2xl md:border-l md:border-t md:border-subtle-foreground/70 md:bg-background'>
						{children}
					</div>
				</div>
			</div>
		</SideNavContext.Provider>
	);
}

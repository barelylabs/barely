'use client';

import React, { useRef } from 'react';
import { cn } from '@barely/utils';

import { ScrollArea } from '@barely/ui/scroll-area';

export const PressScrollAreaViewportContext =
	React.createContext<React.RefObject<HTMLDivElement | null> | null>(null);

export function PressScrollArea({ children }: { children: React.ReactNode }) {
	const scrollAreaRef = useRef<HTMLDivElement>(null);

	return (
		<ScrollArea
			ref={scrollAreaRef}
			className={cn(
				`relative mx-auto h-[500px] max-h-full w-full flex-1 sm:rounded-xl sm:p-4 sm:pb-0 lg:p-6 lg:pb-0`,
			)}
			style={{ height: 'calc(100vh - 72px)' }}
			hideScrollbar
		>
			<PressScrollAreaViewportContext.Provider value={scrollAreaRef}>
				{children}
			</PressScrollAreaViewportContext.Provider>
		</ScrollArea>
	);
}

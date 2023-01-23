'use client';
// import * as HeadlessTooltip from '@radix-ui/react-tooltip';

import { HeadlessTooltipProvider } from '@barely/ui/src/Tooltip';
import { ReactNode } from 'react';
export const TooltipProvider = ({ children }: { children: ReactNode }) => (
	<HeadlessTooltipProvider>{children}</HeadlessTooltipProvider>
	// <HeadlessTooltip.Provider delayDuration={10}>{children}</HeadlessTooltip.Provider>
);

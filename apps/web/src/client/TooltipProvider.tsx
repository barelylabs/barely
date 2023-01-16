'use client';

import { TooltipProvider as TtProvider } from '@barely/ui';
import { ReactNode } from 'react';
export const TooltipProvider = ({ children }: { children: ReactNode }) => (
	<TtProvider>{children}</TtProvider>
);

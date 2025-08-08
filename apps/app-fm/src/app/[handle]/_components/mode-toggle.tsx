'use client';

import * as React from 'react';
import { cn } from '@barely/utils';

import { buttonVariants } from '@barely/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@barely/ui/dropdown-menu';
import { Icon } from '@barely/ui/icon';
import { useTheme } from '@barely/ui/next-theme-provider';

export function ModeToggle() {
	const { setTheme } = useTheme();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					className={cn(
						buttonVariants({ variant: 'icon', look: 'ghost', size: 'md' }),
						'focus-visible:ring-transparent',
					)}
				>
					<Icon.sun className='rotate-0 scale-100 transition-all hover:text-slate-900 dark:-rotate-90 dark:scale-0 dark:text-slate-400 dark:hover:text-slate-100' />
					<Icon.moon className='absolute rotate-90 scale-0 transition-all hover:text-slate-900 dark:rotate-0 dark:scale-100 dark:text-slate-400 dark:hover:text-slate-100' />
					<span className='sr-only'>Toggle theme</span>
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align='end'>
				<DropdownMenuItem onClick={() => setTheme('light')}>
					<Icon.sun className='mr-2 h-4 w-4' />
					<span>Light</span>
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme('dark')}>
					<Icon.moon className='mr-2 h-4 w-4' />
					<span>Dark</span>
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme('system')}>
					<Icon.laptop className='mr-2 h-4 w-4' />
					<span>System</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

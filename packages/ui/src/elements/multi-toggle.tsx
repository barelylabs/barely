'use client';

import * as React from 'react';
import { cn } from '@barely/utils';

import { Icon } from './icon';

export interface MultiToggleOption<T extends string> {
	value: T;
	icon: keyof typeof Icon;
	label?: string;
}

interface MultiToggleProps<T extends string>
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	options: MultiToggleOption<T>[];
	value: T;
	onValueChange: (value: T) => void;
	className?: string;
}

export function MultiToggle<T extends string>({
	options,
	value,
	onValueChange,
	className,
	...props
}: MultiToggleProps<T>) {
	if (!options.length) {
		return null;
	}

	const currentIndex = options.findIndex(option => option.value === value);
	const currentOption = options[currentIndex] ?? options[0]!;
	const IconComponent = Icon[currentOption.icon];

	const handleClick = () => {
		const nextIndex = (currentIndex + 1) % options.length;
		onValueChange(options[nextIndex]!.value);
	};

	return (
		<button
			type='button'
			role='switch'
			aria-checked={true}
			className={cn(
				'inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
				className,
			)}
			onClick={handleClick}
			{...props}
		>
			<IconComponent className='h-4 w-4' />
			<span>{currentOption.label}</span>
		</button>
	);
}

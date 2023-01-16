import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export * from './Button';
export * from './Heading';
export * from './Icon';
export * from './Modal';

export * from './Cards';
export * from './Tooltip';
export * from './Timelines';

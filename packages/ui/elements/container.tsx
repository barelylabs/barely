import type { ReactNode } from 'react';
import { cn } from '@barely/lib/utils/cn';

interface Props {
	title?: string;
	action?: ReactNode;
	children: ReactNode;
	className?: string;
}

const Container = ({ children, className }: Props) => {
	return (
		<div
			className={cn(
				'container flex min-h-full w-full flex-col  justify-center p-6',
				className,
			)}
		>
			{children}
		</div>
	);
};

export { Container };

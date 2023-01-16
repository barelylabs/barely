'use client';
import * as Tt from '@radix-ui/react-tooltip';
import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
const Tooltip = ({
	children,
	content,
	className,
}: {
	children: ReactNode;
	content: ReactNode;
	className?: string;
}) => {
	const defaultClass = 'text-md rounded-md bg-white p-3 text-gray-800 shadow-md';

	return (
		<Tt.Root>
			<Tt.Trigger asChild>{children}</Tt.Trigger>
			<Tt.Portal className='m-3'>
				<Tt.Content
					className={twMerge(defaultClass, className)}
					sideOffset={5}
					side='top'
				>
					{content}
					<Tt.Arrow />
				</Tt.Content>
			</Tt.Portal>
		</Tt.Root>
	);
};

export const TooltipProvider = ({ children }: { children: ReactNode }) => (
	<Tt.Provider delayDuration={10}>{children}</Tt.Provider>
);

export default Tooltip;

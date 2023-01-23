import { ReactNode } from 'react';
import { cn } from '@barely/utils/edge';

import * as HeadlessTooltip from '@radix-ui/react-tooltip';

export interface TooltipProps {
	children: ReactNode;
	content: ReactNode;
	className?: string;
}

export function Tooltip(props: TooltipProps) {
	return (
		<>
			<HeadlessTooltip.Root>
				<HeadlessTooltip.Trigger asChild>{props.children}</HeadlessTooltip.Trigger>
				<HeadlessTooltip.Portal className='m-3'>
					<HeadlessTooltip.Content
						className={cn(
							'text-md rounded-md bg-white p-3 text-gray-800 shadow-md',
							props.className,
						)}
						sideOffset={5}
						side='top'
					>
						{props.content}

						<HeadlessTooltip.Arrow />
					</HeadlessTooltip.Content>
				</HeadlessTooltip.Portal>
			</HeadlessTooltip.Root>
		</>
	);
}

export const HeadlessTooltipProvider = ({ children }: { children: ReactNode }) => (
	<HeadlessTooltip.Provider delayDuration={10}>{children}</HeadlessTooltip.Provider>
);

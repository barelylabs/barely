import { ReactNode } from 'react';
import { cn } from '.';

import * as Tt from '@radix-ui/react-tooltip';

export interface TooltipProps {
	children: ReactNode;
	content: ReactNode;
	className?: string;
}

export function Tooltip(props: TooltipProps) {
	return (
		<>
			<Tt.Root>
				<Tt.Trigger asChild>{props.children}</Tt.Trigger>
				<Tt.Portal className='m-3'>
					<Tt.Content
						className={cn(
							'text-md rounded-md bg-white p-3 text-gray-800 shadow-md',
							props.className,
						)}
						sideOffset={5}
						side='top'
					>
						{/* {props.content} */}
						fuckall
						<Tt.Arrow />
					</Tt.Content>
				</Tt.Portal>
			</Tt.Root>
		</>
	);
}

export const TooltipProvider = ({ children }: { children: ReactNode }) => (
	<Tt.Provider delayDuration={10}>{children}</Tt.Provider>
);

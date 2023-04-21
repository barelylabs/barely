import { ReactNode } from 'react';

import { IconType } from 'react-icons';

import { cn } from '@barely/lib/utils/edge/cn';

interface FeatureCardProps {
	Icon?: IconType;
	iconColor?: string;
	headline?: string;
	children?: ReactNode;
	className?: string;
}

export function FeatureCard(props: FeatureCardProps) {
	return (
		<div
			className={cn(
				'flex flex-row items-center space-x-5 rounded-lg bg-white p-6 shadow-md',
				props.className,
			)}
		>
			{props.Icon && (
				<div className={`p-1 text-5xl font-light text-${props.iconColor ?? ''}`}>
					<props.Icon />
				</div>
			)}
			<div className='flex flex-col space-y-1'>
				<h1 className='text-2xl'>{props.headline}</h1>
				{props.children}
			</div>
		</div>
	);
}

import { ReactNode } from 'react';
import Image from 'next/image';
import { cn } from '@barely/lib/utils/cn';

import { AspectRatio } from './aspect-ratio';
import { type BadgeProps } from './badge';
import { IconType } from './icon';
import { Text } from './typography';

const Card = ({ className, children }: { className?: string; children: ReactNode }) => {
	return (
		<div
			className={cn(
				'flex w-full flex-col gap-3 rounded-md border-2 bg-card p-4 sm:p-5',
				className,
			)}
		>
			{children}
		</div>
	);
};

const CardFooter = ({ children }: { children: ReactNode }) => {
	return <div className='bg-gray-50 px-4 py-3 dark:bg-slate-800 sm:px-6'>{children}</div>;
};

//* OPINIONATED CARDS *//

interface InfoCardProps {
	// left
	title?: ReactNode;
	subtitle?: ReactNode;
	description?: ReactNode;
	stats?: ReactNode;
	imageUrl?: string | null;
	imageAlt?: string;
	imageAspectRatio?: number;
	// right
	badges?: ReactNode;
	badgeVariant?: BadgeProps['variant'];
	badgeSize?: BadgeProps['size'];
	buttons?: ReactNode;
	// below
	children?: ReactNode;
}

const InfoCard = ({ children, ...props }: InfoCardProps) => {
	return (
		<Card>
			<div className='flex flex-row justify-between space-x-4'>
				<div className='flex flex-row space-x-4'>
					<div className='block h-[100px] w-[100px] flex-shrink-0 overflow-hidden rounded-md'>
						<AspectRatio
							ratio={props.imageAspectRatio}
							className='bg-slate-50 dark:bg-slate-800'
						>
							<Image
								src={props.imageUrl ?? ''}
								alt={props.imageAlt ?? ''}
								width={100}
								height={100}
								className='w-full object-cover'
							/>
						</AspectRatio>
					</div>
					<div className='flex flex-col justify-between'>
						<div>
							<Text variant='md/medium'>{props.title}</Text>
							<Text variant='sm/normal' subtle>
								{props.subtitle}
							</Text>
							{props.description && <div className='pt-2'>{props.description}</div>}
						</div>
						<div className='flex flex-row items-center space-x-1 text-xs font-light'>
							{props.stats}
						</div>
					</div>
				</div>

				<div
					className={cn(
						'flex h-full flex-col items-end space-y-2',
						props.badges ? 'justify-between' : 'justify-end',
					)}
				>
					{props.badges && props.badges}

					{props.buttons && props.buttons}
				</div>
			</div>
			{children}
		</Card>
	);
};

interface FeatureCardProps {
	Icon?: IconType;
	iconColor?: string;
	headline?: string;
	children?: ReactNode;
	className?: string;
}

const FeatureCard = (props: FeatureCardProps) => {
	return (
		<Card
			className={cn(
				'flex flex-row items-center space-x-5 rounded-lg p-6 shadow-md',
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
		</Card>
	);
};

export { Card, CardFooter, InfoCard, FeatureCard };

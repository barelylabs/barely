import { ReactNode } from 'react';

import Image from 'next/image';

import { cn } from '@barely/lib/utils/edge/cn';

import { AspectRatio } from './aspect-ratio';
import { type BadgeProps } from './badge';
import { Text } from './typography';

const Card = ({ className, children }: { className?: string; children: ReactNode }) => {
	return (
		<div
			className={cn(
				'w-full mt-2 bg-white dark:bg-slate-900 rounded-md border-2 border-slate-200 dark:border-slate-700 px-4 py-4 sm:px-5 grid gap-3',
				className,
			)}
		>
			{children}
		</div>
	);
};

const CardFooter = ({ children }: { children: ReactNode }) => {
	return <div className='px-4 py-3 bg-gray-50 sm:px-6 dark:bg-slate-800'>{children}</div>;
};

//* OPINIONATED CARD *//

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
					<div className='block w-[100px] h-[100px] overflow-hidden rounded-md flex-shrink-0'>
						<AspectRatio
							ratio={props.imageAspectRatio}
							className='bg-slate-50 dark:bg-slate-800'
						>
							<Image
								src={props.imageUrl ?? ''}
								alt={props.imageAlt ?? ''}
								width={100}
								height={100}
								className='object-cover w-full'
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
						<div className='flex text-xs font-light flex-row space-x-1 items-center'>
							{props.stats}
						</div>
					</div>
				</div>
				<div
					className={cn(
						'flex flex-col space-y-2 items-end h-full',
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

export { Card, CardFooter, InfoCard };

'use client';

import type { IconKey } from '@barely/ui/icon';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

import { Badge } from '@barely/ui/badge';
import { Icon } from '@barely/ui/icon';

import { Subheading } from './text';

export function BentoCard({
	dark = false,
	icon,
	comingSoon = false,
	className = '',
	eyebrow,
	title,
	description,
	graphic,
	fade = [],
}: {
	dark?: boolean;
	className?: string;
	icon?: IconKey;
	comingSoon?: boolean;
	eyebrow: React.ReactNode;
	title: React.ReactNode;
	description: React.ReactNode;
	graphic: React.ReactNode;
	fade?: ('top' | 'bottom')[];
}) {
	const BentoIcon = icon ? Icon[icon] : null;

	return (
		<motion.div
			initial='idle'
			whileHover='active'
			variants={{ idle: {}, active: {} }}
			data-dark={dark ? 'true' : undefined}
			className={clsx(
				className,
				'group relative flex flex-col overflow-hidden rounded-lg',
				'bg-white shadow-sm ring-1 ring-black/5',
				'data-[dark]:bg-card data-[dark]:ring-white/10',
			)}
		>
			<div className='relative h-80 shrink-0'>
				{graphic}
				{fade.includes('top') && (
					<div className='absolute inset-0 bg-gradient-to-b from-white to-50% group-data-[dark]:from-card group-data-[dark]:from-[-25%]' />
				)}
				{fade.includes('bottom') && (
					<div className='absolute inset-0 bg-gradient-to-t from-white to-50% group-data-[dark]:from-card group-data-[dark]:from-[-25%]' />
				)}
			</div>
			<div className='relative p-10'>
				<Subheading as='h3' dark={dark}>
					{BentoIcon && <BentoIcon className='-inset-y-2 h-3 w-3' />}
					{eyebrow}
					{comingSoon && (
						<Badge variant='muted' size='2xs'>
							Coming Soon
						</Badge>
					)}
				</Subheading>
				<p className='mt-1 text-2xl/8 font-medium tracking-tight text-gray-950 group-data-[dark]:text-white'>
					{title}
				</p>
				<p className='mt-2 max-w-[600px] text-sm/6 text-gray-600 group-data-[dark]:text-gray-400'>
					{description}
				</p>
			</div>
		</motion.div>
	);
}

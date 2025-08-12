import Link from 'next/link';

import { Icon } from '@barely/ui/icon';
import { H, Text } from '@barely/ui/typography';

import { NavButton } from '~/app/[handle]/_components/nav-button';

interface DashContentHeaderProps {
	title: string;
	subtitle?: string;
	button?: React.ReactNode;
	settingsHref?: string;
}

const DashContentHeader = (props: DashContentHeaderProps) => {
	return (
		<div className='flex flex-row items-center justify-between border-b border-subtle-foreground/70 bg-accent p-3 md:border-0 md:bg-transparent md:p-6 md:pb-0 lg:pt-8'>
			<div className='flex flex-col space-y-2'>
				<div className='group flex flex-row items-center gap-2 md:items-baseline md:gap-3'>
					<div className='md:hidden'>
						<NavButton />
					</div>

					<H size='5'>{props.title}</H>
					{props.settingsHref && (
						<Link
							href={props.settingsHref}
							className='text-primary opacity-0 transition-opacity duration-200 ease-in-out group-hover:opacity-100'
						>
							<Icon.settings className='h-4 w-4' />
						</Link>
					)}
				</div>
				{props.subtitle && (
					<Text variant='sm/normal' muted>
						{props.subtitle}
					</Text>
				)}
			</div>
			{props.button && (
				<div className='flex flex-row items-center justify-end space-x-2'>
					{props.button}
				</div>
			)}
		</div>
	);
};

export { DashContentHeader };

import Link from 'next/link';

import { Icon } from '@barely/ui/elements/icon';
import { H, Text } from '@barely/ui/elements/typography';

interface DashContentHeaderProps {
	title: string;
	subtitle?: string;
	button?: React.ReactNode;
	settingsHref?: string;
}

const DashContentHeader = (props: DashContentHeaderProps) => {
	return (
		<div className='flex flex-row items-center justify-between'>
			<div className='flex flex-col space-y-2'>
				<div className='group flex flex-row items-baseline gap-3'>
					<H size='4'>{props.title}</H>
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

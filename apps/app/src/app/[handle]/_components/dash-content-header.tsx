import { H, Text } from '@barely/ui/elements/typography';

interface DashContentHeaderProps {
	title: string;
	subtitle?: string;
	button?: React.ReactNode;
}

const DashContentHeader = (props: DashContentHeaderProps) => {
	return (
		<div className='flex flex-row items-center justify-between'>
			<div className='flex flex-col space-y-2'>
				<H size='3'>{props.title}</H>
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

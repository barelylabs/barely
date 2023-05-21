import { H1, Text } from '@barely/ui/elements/typography';

interface DashContentHeaderProps {
	title: string;
	subtitle?: string;
}

const DashContentHeader = (props: DashContentHeaderProps) => {
	return (
		<>
			<H1>{props.title}</H1>
			{props.subtitle && (
				<Text variant='md/medium' subtle>
					{props.subtitle}
				</Text>
			)}
		</>
	);
};

export { DashContentHeader };

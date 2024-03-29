import { cn } from '@barely/lib/utils/cn';

import { Card } from '../elements/card';
import { H, Text } from '../elements/typography';

interface FeatureCardProps {
	title: string;
	description: string;
	children?: React.ReactNode;
	className?: string;
}

const FeatureCard = (props: FeatureCardProps) => {
	return (
		<Card className={cn('text-left', props.className)}>
			<div className='flex flex-row items-center space-x-5'>{props.children}</div>
			<H size='3'>{props.title}</H>
			<Text className='mb-auto' variant='lg/light' muted>
				{props.description}
			</Text>
		</Card>
	);
};

export { FeatureCard };

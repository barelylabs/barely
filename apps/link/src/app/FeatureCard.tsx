import { ReactNode } from 'react';
import { IconType } from 'react-icons';

const FeatureCard = ({
	Icon,
	iconColor,
	headline,
	children,
}: {
	Icon?: IconType;
	iconColor?: string;
	headline?: string;
	children?: ReactNode;
}) => {
	return (
		<div className='flex flex-row items-center space-x-5 rounded-lg bg-white p-6 shadow-md'>
			{Icon && (
				<div className={`p-1 text-5xl font-light text-${iconColor}`}>
					<Icon />
				</div>
			)}
			<div className='flex flex-col space-y-1'>
				<h1 className='text-2xl'>{headline}</h1>
				{children}
			</div>
		</div>
	);
};

export default FeatureCard;

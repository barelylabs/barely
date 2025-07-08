import { initials } from '@barely/utils';

import { Avatar } from './avatar';
import { RatingDisplay } from './rating';

const Review = (props: {
	rating: number;
	review?: string;
	reviewer?: {
		imageUrl?: string;
		displayName: string;
	};
	key?: string;
	children?: React.ReactNode;
}) => {
	return (
		<div className='flex flex-row items-start gap-5 pb-3'>
			<Avatar
				imageUrl={props.reviewer?.imageUrl}
				// imageS3Key={props.reviewer?.imageS3Key}
				initials={initials(props.reviewer?.displayName ?? 'U')}
				imageWidth={50}
				imageHeight={50}
			/>
			<div className='flex flex-col space-y-2'>
				<RatingDisplay rating={props.rating} by={props.reviewer?.displayName} />
				<div>{props.review}</div>
				{props.children}
			</div>
		</div>
	);
};

export { Review };

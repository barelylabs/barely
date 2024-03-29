import { initials } from '@barely/lib/utils/name';

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
				initials={initials(props.reviewer?.displayName ?? 'U')}
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

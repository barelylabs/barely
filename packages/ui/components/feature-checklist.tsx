import type { ReactNode } from 'react';

import { Icon } from '../elements/icon';
import { Text } from '../elements/typography';

export function FeatureChecklist({ items }: { items: (string | ReactNode)[] }) {
	return (
		<div className='flex flex-col space-y-2'>
			{items.map((item, i) => (
				<div key={i} className='flex flex-row items-center space-x-2'>
					<Icon.checkCircleFilled className='h-5 w-5 text-green' />
					<Text variant='sm/normal' muted>
						{item}
					</Text>
				</div>
			))}
		</div>
	);
}

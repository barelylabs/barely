import * as React from 'react';

import { Link } from '@react-email/link';
import { Text } from '@react-email/text';

export function EmailFooter() {
	return (
		<div className='flex flex-col space-y-2'>
			<Text
				style={{
					marginTop: '0.5rem',
					marginBottom: '0.5rem',
					fontSize: '0.875rem',
					lineHeight: '1.25rem',
				}}
			>
				<Link
					href='https://barely.io'
					target='_blank'
					style={{
						color: '#3182ce',
						textDecoration: 'underline',
					}}
				>
					barely.io
				</Link>
				, marketing tools for creators.
			</Text>
		</div>
	);
}

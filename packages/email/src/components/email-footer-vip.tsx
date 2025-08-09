import * as React from 'react';
import { Link, Text } from '@react-email/components';

export function EmailFooterVip() {
	return (
		<div className='flex flex-col space-y-2'>
			<Text
				style={{
					marginTop: '0.5rem',
					marginBottom: '0.5rem',
					fontSize: '0.875rem',
					lineHeight: '1.25rem',
					textAlign: 'center',
					color: '#666666',
				}}
			>
				<Link
					href='https://barely.vip'
					target='_blank'
					style={{
						color: '#3182ce',
						textDecoration: 'underline',
					}}
				>
					barely.vip
				</Link>
				{' · '}
				exclusive drops for true fans
			</Text>
		</div>
	);
}

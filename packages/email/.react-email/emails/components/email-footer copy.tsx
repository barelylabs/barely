import * as React from 'react';

import { Img, Link, Text } from '@react-email/components';

import env from '../../../lib/env';

const EmailFooter = () => {
	const baseUrl = env.NEXT_PUBLIC_APP_BASE_URL;
	const logoUrl = `${baseUrl}/static/logo.png`;
	return (
		<div className='flex flex-col space-y-2'>
			{/* <Img src={logoUrl} className='w-8 h-8' /> */}
			<Text className='text-sm text-slate-400 my-2'>
				<Link
					href='https://barely.io'
					target='_blank'
					className='text-slate-600 underline'
					// style={{ ...link, color: '#898989' }}
				>
					barely.io
				</Link>
				, marketing tools for creators.
				{/* <br />
				for your notes, tasks, wikis, and databases. */}
			</Text>
		</div>
	);
};

export { EmailFooter };

import * as React from 'react';

import { Link, Text } from '@react-email/components';

const EmailFooter = () => {
	return (
		<div className='flex flex-col space-y-2'>
			{/* <Img src={logoUrl} className='w-8 h-8' /> */}
			<Text className='text-sm text-slate-400 my-2'>
				<Link
					href='https://barely.io'
					target='_blank'
					className='text-slate-600 underline'
				>
					barely.io
				</Link>
				, marketing tools for creators.
			</Text>
		</div>
	);
};

export { EmailFooter };

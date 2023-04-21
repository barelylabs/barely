import * as React from 'react';

import { Img } from '@react-email/components';

import env from '../../../lib/env';

const EmailHeaderLogo = () => {
	const baseUrl = env.NEXT_PUBLIC_APP_BASE_URL;
	const logoUrl = `${baseUrl}/static/logo.png`;
	return (
		<div className='flex flex-col space-y-2'>
			<Img src={logoUrl} className='w-8 h-8' />
		</div>
	);
};

export { EmailHeaderLogo };

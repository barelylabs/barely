import * as React from 'react';

import { Img } from '@react-email/components';

import env from '../../../lib/env';

const EmailHeaderLogo = () => {
	const baseUrl = env.NEXT_PUBLIC_APP_BASE_URL;
	const logoUrl = `${baseUrl}/static/logo.png`;
	return (
		<div className='flex flex-col'>
			<Img src={logoUrl} alt='barely.io logo' className='w-[42px] h-[42px] py-2' />
		</div>
	);
};

export { EmailHeaderLogo };

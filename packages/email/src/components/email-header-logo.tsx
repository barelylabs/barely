import * as React from 'react';
import { Img } from '@react-email/components';

// export function getBaseUrl(devPort?: string) {
// 	if (typeof window !== 'undefined') {
// 		return ''; // browser should use relative url
// 	}

// 	if (process.env.VERCEL_ENV === 'production' || process.env.VERCEL_ENV === 'preview') {
// 		if (!process.env.VERCEL_URL) throw new Error('VERCEL_URL not found');
// 		return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
// 	}

// 	if (!devPort) console.error('devPort not found for base url');

// 	return `http://localhost:${devPort ?? ''}`; // dev SSR should use localhost
// }

const EmailHeaderLogo = () => {
	return (
		<div className='flex flex-col'>
			<Img
				src={'https://app.barely.ai/_static/logo.png'}
				alt='barely.ai logo'
				style={{
					paddingTop: '0.5rem',
					paddingBottom: '0.5rem',
					width: '42px',
					height: '42px',
				}}
			/>
		</div>
	);
};

export { EmailHeaderLogo };

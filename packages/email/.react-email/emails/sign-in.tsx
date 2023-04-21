import * as React from 'react';

import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Link,
	Preview,
	Tailwind,
	Text,
} from '@react-email/components';

import { EmailFooter } from './components/email-footer';
import { EmailHeaderLogo } from './components/email-header-logo';

const SignInEmailTemplate = (props: { firstName?: string; loginLink: string }) => {
	const previewText = `Sign in to your barely.io account`;

	return (
		<Html>
			<Head />
			<Preview>{previewText}</Preview>
			<Tailwind>
				<Body className='bg-white flex flex-col my-auto font-sans text-slate-900 w-full'>
					<Container className='flex flex-col space-y-5 w-full max-w-xl px-5'>
						<EmailHeaderLogo />
						<Heading className='my-6 text-semibold text-3xl text-slate-800'>
							Your login link
						</Heading>
						{props.firstName && <p>Hi {props.firstName}</p>}
						<Text className='text-md'>
							Please click the button below to sign in to your{' '}
							<span>
								<Link href='https://barely.io' target='_blank' className='text-slate-900'>
									barely.io
								</Link>
							</span>{' '}
							account.
						</Text>
						<Button
							className=' bg-slate-500 hover:bg-slate-700 text-white font-semibold py-3 px-6 rounded-md '
							href={props.loginLink}
						>
							Login to barely.io
						</Button>
						{/* <Text className='text-md'>
							Note: your quick login link will expire in 24 hours.
							<br />
							Please do not forward this email to anyone or reply to it since the link in
							this email gives access to your account.
						</Text>
						<Text className='text-md'>
							Best,
							<br />
							The barely.io team
						</Text> */}
						<Hr className='border border-slate-200 my-5 w-full' />
						<EmailFooter />
					</Container>
				</Body>
			</Tailwind>
		</Html>
	);
};

export { SignInEmailTemplate };
export default SignInEmailTemplate;

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

const PlaylistPitchToScreenEmailTemplate = (props: {
	firstName?: string;
	loginLink: string;
}) => {
	const previewText = `A new playlist.pitch submission to screen...`;

	return (
		<Html>
			<Head />
			<Preview>{previewText}</Preview>
			<Tailwind>
				<Body className='bg-white flex flex-col my-auto font-sans text-slate-900 w-full'>
					<Container className='flex flex-col space-y-5 w-full max-w-xl px-5'>
						<EmailHeaderLogo />
						<Heading className='my-6 text-semibold text-3xl text-slate-800'>
							A new track to screen for you.
						</Heading>
						{props.firstName && <Text>Hi {props.firstName},</Text>}
						<Text className='text-md'>
							Please screen the track below and let us know if it's a go or no go.
						</Text>
						<Button
							className=' bg-slate-500 hover:bg-slate-700 text-white font-semibold py-3 px-6 rounded-md '
							href={props.loginLink}
						>
							Screen the track
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

export { PlaylistPitchToScreenEmailTemplate };

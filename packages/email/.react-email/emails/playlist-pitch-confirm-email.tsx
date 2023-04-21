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

const PlaylistPitchConfirmEmailTemplate = (props: {
	firstName?: string;
	loginLink: string;
	trackName: string;
}) => {
	const previewText = `Please confirm your playlist.pitch campaign`;

	return (
		<Html>
			<Head />
			<Preview>{previewText}</Preview>
			<Tailwind>
				<Body className='bg-white flex flex-col my-auto font-sans text-slate-900 w-full'>
					<Container className='flex flex-col space-y-5 w-full max-w-xl px-5'>
						<EmailHeaderLogo />
						<Heading className='my-6 text-semibold text-3xl text-slate-800'>
							Please confirm your playlist.pitch campaign submission
						</Heading>
						{props.firstName && <Text>Hi {props.firstName},</Text>}
						<Text className='text-md'>
							Our A&R team is currently reviewing{' '}
							<span className='font-bold'>"{props.trackName}"</span>.
						</Text>
						<Text className='text-md'>
							In the meantime, please confirm your playlist.pitch campaign submission by
							clicking the button below.
						</Text>
						<Button
							className=' bg-slate-500 hover:bg-slate-700 text-white font-semibold py-3 px-6 rounded-md '
							href={props.loginLink}
						>
							Confirm my campaign 🏄‍♀️
						</Button>
						<Hr className='border border-slate-200 my-5 w-full' />
						<EmailFooter />
					</Container>
				</Body>
			</Tailwind>
		</Html>
	);
};

export { PlaylistPitchConfirmEmailTemplate };

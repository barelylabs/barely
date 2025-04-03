import * as React from 'react';
import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Preview,
	Text,
} from '@react-email/components';

import { EmailFooter } from '../../components/email-footer';
import { EmailHeaderLogo } from '../../components/email-header-logo';

const PlaylistPitchToScreenEmailTemplate = (props: {
	firstName?: string;
	loginLink: string;
}) => {
	const previewText = `A new playlist.pitch submission to screen...`;

	return (
		<Html>
			<Head />
			<Preview>{previewText}</Preview>
			{/* <Tailwind> */}
			<Body className='my-auto flex w-full flex-col bg-white font-sans text-slate-900'>
				<Container className='flex w-full max-w-xl flex-col space-y-5 px-5'>
					<EmailHeaderLogo />
					<Heading className='text-semibold my-6 text-3xl text-slate-800'>
						A new track to screen for you.
					</Heading>
					{props.firstName && <Text>Hi {props.firstName},</Text>}
					<Text className='text-md'>
						Please screen the track below and let us know if it's a go or no go.
					</Text>
					<Button
						className='rounded-md bg-slate-500 px-6 py-3 font-semibold text-white hover:bg-slate-700'
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
					<Hr className='my-5 w-full border border-slate-200' />
					<EmailFooter />
				</Container>
			</Body>
			{/* </Tailwind> */}
		</Html>
	);
};

export { PlaylistPitchToScreenEmailTemplate };

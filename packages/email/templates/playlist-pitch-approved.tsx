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
	Tailwind,
	Text,
} from '@react-email/components';

import { EmailFooter } from './components/email-footer';
import { EmailHeaderLogo } from './components/email-header-logo';

const PlaylistPitchApprovedEmailTemplate = (props: {
	firstName?: string;
	loginLink: string;
	trackName: string;
	screeningMessage: string;
}) => {
	const previewText = `Launch your playlist.pitch campaign!`;

	return (
		<Html>
			<Head />
			<Preview>{previewText}</Preview>
			<Tailwind>
				<Body className='bg-white flex flex-col my-auto font-sans text-slate-900 w-full'>
					<Container className='flex flex-col space-y-5 w-full max-w-xl px-5'>
						<EmailHeaderLogo />
						<Heading className='my-6 text-semibold text-3xl text-slate-800'>
							Your track is accepted!
						</Heading>
						{props.firstName && <Text>Hi {props.firstName},</Text>}
						<Text className='text-md'>
							Our A&R team has reviewed{' '}
							<span className='font-bold'>"{props.trackName}"</span> and it sounds good to
							proceed!
						</Text>
						<Container className='px-4 bg-slate-200 rounded-md'>
							<Text className='text-md'>
								{props.screeningMessage}
							</Text>
						</Container>
						<Text className='text-md'>
							Click the button below to go to your account, set up budget, and launch your
							playlist.pitch campaign.
						</Text>
						<Button
							className=' bg-slate-500 hover:bg-slate-700 text-white font-semibold py-3 px-6 rounded-md '
							href={props.loginLink}
						>
							Start my campaign 🚀
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

export { PlaylistPitchApprovedEmailTemplate };

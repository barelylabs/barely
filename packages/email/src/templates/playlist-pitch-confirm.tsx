import * as React from 'react';
import { Body } from '@react-email/body';
import { Button } from '@react-email/button';
import { Container } from '@react-email/container';
import { Head } from '@react-email/head';
import { Heading } from '@react-email/heading';
import { Hr } from '@react-email/hr';
import { Html } from '@react-email/html';
import { Preview } from '@react-email/preview';
import { Text } from '@react-email/text';

import { EmailFooter } from '../components/email-footer';
import { EmailHeaderLogo } from '../components/email-header-logo';

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
			{/* <Tailwind> */}
			<Body className='my-auto flex w-full flex-col bg-white font-sans text-slate-900'>
				<Container className='flex w-full max-w-xl flex-col space-y-5 px-5'>
					<EmailHeaderLogo />
					<Heading className='text-semibold my-6 text-3xl text-slate-800'>
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
						className=' hover:bg-slate-7000 rounded-md bg-slate-500 px-6 py-3 font-semibold text-white '
						href={props.loginLink}
					>
						Confirm my campaign 🏄‍♀️
					</Button>
					<Hr className='my-5 w-full border border-slate-200' />
					<EmailFooter />
				</Container>
			</Body>
			{/* </Tailwind> */}
		</Html>
	);
};

export { PlaylistPitchConfirmEmailTemplate };

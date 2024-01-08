import * as React from 'react';

import { EmailFooter } from '../components/email-footer';
import { EmailHeaderLogo } from '../components/email-header-logo';
import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Html,
	Preview,
	Quote,
	Separator,
	Text,
} from '../primitives';

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

			<Body>
				<Container>
					<EmailHeaderLogo />
					<Heading>Your track is accepted!</Heading>
					{props.firstName && <Text>Hi {props.firstName},</Text>}
					<Text>
						Our A&R team has reviewed{' '}
						<span className='font-bold'>"{props.trackName}"</span> and it sounds good to
						proceed!
					</Text>

					<Quote>{props.screeningMessage}</Quote>

					<Text className='text-md'>
						Click the button below to go to your account, set up budget, and launch your
						playlist.pitch campaign.
					</Text>
					<Button href={props.loginLink}>Start my campaign 🚀</Button>

					<Separator />

					<EmailFooter />
				</Container>
			</Body>
		</Html>
	);
};

export { PlaylistPitchApprovedEmailTemplate };

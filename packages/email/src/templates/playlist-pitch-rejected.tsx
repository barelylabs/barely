import * as React from 'react';

import { EmailFooter } from '../components/email-footer';
import { EmailHeaderLogo } from '../components/email-header-logo';
import {
	Body,
	Container,
	Head,
	Heading,
	Html,
	Preview,
	Quote,
	Separator,
	Text,
} from '../primitives';

export const PlaylistPitchRejectedEmailTemplate = (props: {
	firstName?: string;
	// loginLink: string;
	trackName: string;
	screeningMessage: string;
}) => {
	const previewText = `Your playlist.pitch submission wasn't approved 😔`;

	return (
		<Html>
			<Head />
			<Preview>{previewText}</Preview>

			<Body>
				<Container>
					<EmailHeaderLogo />
					<Heading>Your track wasn't approved 😔</Heading>
					{props.firstName && <Text>Hi {props.firstName},</Text>}
					<Text className='text-md'>
						Our A&R team has reviewed{' '}
						<span className='font-bold'>"{props.trackName}"</span> and unfortunately it
						doesn't sound like a good fit for our current roster of playlists. We hope
						you'll try again with a different track!
					</Text>
					<Quote>{props.screeningMessage}</Quote>

					<Separator />
					<EmailFooter />
				</Container>
			</Body>
		</Html>
	);
};

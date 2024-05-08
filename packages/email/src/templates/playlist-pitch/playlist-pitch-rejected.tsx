import * as React from 'react';
import { Head, Html, Preview, Text } from '@react-email/components';

import { EmailFooter } from '../../components/email-footer';
import { EmailHeaderLogo } from '../../components/email-header-logo';
import { Body, EmailContainer, EmailHeading } from '../../primitives';

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
				<EmailContainer>
					<EmailHeaderLogo />
					<EmailHeading>Your track wasn't approved 😔</EmailHeading>
					{props.firstName && <Text>Hi {props.firstName},</Text>}
					<Text className='text-md'>
						Our A&R team has reviewed{' '}
						<span className='font-bold'>"{props.trackName}"</span> and unfortunately it
						doesn't sound like a good fit for our current roster of playlists. We hope
						you'll try again with a different track!
					</Text>
					<Text>{props.screeningMessage}</Text>

					<Text />
					<EmailFooter />
				</EmailContainer>
			</Body>
		</Html>
	);
};
